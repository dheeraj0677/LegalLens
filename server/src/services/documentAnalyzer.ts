import { Clause, ClauseCategory, DocumentAnalysisResult, RiskLevel } from '../types';
import { aiClient } from './aiClient';

export class DocumentAnalyzerService {
  /**
   * Analyzes a single legal document, extracting structured clauses, risk scoring,
   * executive summary, action checklist, and questions for a lawyer.
   */
  public async analyzeDocument(text: string, title?: string): Promise<DocumentAnalysisResult> {
    const docTitle = title?.trim() || this.inferTitle(text);
    const charCount = text.length;

    const systemPrompt = `You are LegalLens, an elite legal intelligence assistant specializing in contract analysis, risk mitigation, and plain-English translation for non-lawyers and professionals.
Analyze the provided legal document thoroughly.
Extract the structured clauses, identify hidden traps, assign realistic risk levels (LOW, MEDIUM, HIGH, CRITICAL), write an executive summary, formulate an action checklist, and suggest high-value questions for a legal professional.

Return a JSON object with this exact shape:
{
  "documentTitle": string,
  "documentType": string,
  "executiveSummary": string,
  "overallRiskScore": number (1-100),
  "overallRiskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "riskDistribution": { "low": number, "medium": number, "high": number, "critical": number },
  "clauses": [
    {
      "id": string (e.g., "clause-1"),
      "number": string,
      "heading": string,
      "originalText": string,
      "plainExplanation": string,
      "category": "Liability & Indemnification" | "Termination & Cancellation" | "Intellectual Property" | "Payment & Fees" | "Confidentiality & Non-Disclosure" | "Warranties & Disclaimers" | "Dispute Resolution & Jurisdiction" | "Data Privacy & Security" | "General & Boilerplate",
      "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "riskScore": number (1-10),
      "riskReason": string,
      "suggestedAction": string,
      "lawyerQuestions": string[]
    }
  ],
  "actionChecklist": [
    {
      "id": string,
      "task": string,
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "relatedClauseId": string
    }
  ],
  "suggestedQuestionsForLawyer": string[]
}`;

    const userPrompt = `Document Title: ${docTitle}\n\nDocument Text:\n${text}`;

    return await aiClient.generateStructuredJSON<DocumentAnalysisResult>(
      systemPrompt,
      userPrompt,
      () => this.generateDomainFallbackAnalysis(text, docTitle)
    );
  }

  private inferTitle(text: string): string {
    const firstLines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (firstLines.length > 0) {
      const candidate = firstLines[0].replace(/^[#\s*_-]+/, '');
      if (candidate.length > 3 && candidate.length < 80) {
        return candidate;
      }
    }
    return 'Legal Document / Agreement';
  }

  /**
   * Deterministic, high-fidelity domain fallback analyzer.
   * Extracts real paragraphs/sections and applies legal heuristics.
   */
  public generateDomainFallbackAnalysis(text: string, title: string): DocumentAnalysisResult {
    // Linear O(n) single-pass paragraph extraction avoiding regular expression backtracking
    const rawParagraphs: string[] = [];
    const lines = text.split(/\r?\n/);
    let currentParagraph: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      const isHeader = /^[0-9]+(\.[0-9]+)*\.\s+[A-Z]|^[A-Z\s]{4,}:?$/.test(trimmed);

      if ((trimmed.length === 0 || isHeader) && currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ').trim();
        if (paragraphText.length > 25) {
          rawParagraphs.push(paragraphText);
        }
        currentParagraph = [];
      }
      if (trimmed.length > 0) {
        currentParagraph.push(trimmed);
      }
    }
    if (currentParagraph.length > 0) {
      const remaining = currentParagraph.join(' ').trim();
      if (remaining.length > 25) {
        rawParagraphs.push(remaining);
      }
    }

    const clauses: Clause[] = [];
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    let totalRisk = 0;

    const sections = rawParagraphs.length > 0 ? rawParagraphs : [text];

    sections.forEach((p, idx) => {
      const id = `clause-${idx + 1}`;
      const firstLine = p.split('\n')[0].trim();
      const numMatch = firstLine.match(/^([0-9]+(\.[0-9]+)*|[A-Z]\.|\([a-z0-9]+\))\s*/i);
      const number = numMatch ? numMatch[1] : `${idx + 1}`;
      const headingCandidate = firstLine.replace(/^[0-9\W]+/, '').substring(0, 50);
      const heading = headingCandidate.length > 4 ? headingCandidate : `Section ${number}`;

      const lower = p.toLowerCase();
      let category: ClauseCategory = 'General & Boilerplate';
      let riskLevel: RiskLevel = 'LOW';
      let riskScore = 3;
      let riskReason = 'Standard contractual provision with customary provisions.';
      let suggestedAction = 'Review terms to confirm alignment with your operational scope.';
      let lawyerQuestions = ['Does this provision reflect standard market practice for this transaction type?'];

      if (lower.includes('indemnif') || lower.includes('hold harmless') || lower.includes('liabilit') || lower.includes('damages')) {
        category = 'Liability & Indemnification';
        if (lower.includes('unlimited') || lower.includes('consequential damages') || lower.includes('sole discretion')) {
          riskLevel = 'CRITICAL';
          riskScore = 9;
          riskReason = 'Broad or uncapped indemnification/liability shifts disproportionate financial exposure.';
          suggestedAction = 'Demand a reciprocal liability cap (e.g. 12 months fees paid) and exclude consequential/punitive damages.';
          lawyerQuestions = ['Can we insert an aggregate monetary liability cap?', 'Is the indemnification mutual or strictly one-sided?'];
        } else {
          riskLevel = 'HIGH';
          riskScore = 7;
          riskReason = 'Contains obligations to defend or compensate damages that require clear monetary boundaries.';
          suggestedAction = 'Ensure liability is expressly limited and clearly specifies covered claims.';
          lawyerQuestions = ['What specific exclusions should be carved out from this liability clause?'];
        }
      } else if (lower.includes('terminat') || lower.includes('cancel') || lower.includes('renewal') || lower.includes('breach')) {
        category = 'Termination & Cancellation';
        if (lower.includes('without cause') || lower.includes('immediate') || lower.includes('at will')) {
          riskLevel = 'HIGH';
          riskScore = 8;
          riskReason = 'Unilateral or immediate termination without cure period leaves you vulnerable to sudden disruption.';
          suggestedAction = 'Negotiate a mandatory 30-day written notice and cure period before termination.';
          lawyerQuestions = ['What notice period is legally required or customary before termination can take effect?'];
        } else {
          riskLevel = 'MEDIUM';
          riskScore = 5;
          riskReason = 'Defines contract expiration, renewal, or termination triggers.';
          suggestedAction = 'Set calendar alerts for renewal/notice deadlines 60 days in advance.';
          lawyerQuestions = ['Are there automatic auto-renewal traps or rollover penalties?'];
        }
      } else if (lower.includes('intellectual property') || lower.includes('patent') || lower.includes('copyright') || lower.includes('work for hire') || lower.includes('ownership')) {
        category = 'Intellectual Property';
        if (lower.includes('irrevocably assign') || lower.includes('all rights') || lower.includes('work made for hire')) {
          riskLevel = 'HIGH';
          riskScore = 8;
          riskReason = 'Comprehensive assignment of IP may surrender pre-existing assets or future toolsets.';
          suggestedAction = 'Explicitly carve out pre-existing background IP, tooling, and general knowledge.';
          lawyerQuestions = ['Does this wording inadvertently transfer ownership of our proprietary baseline materials?'];
        } else {
          riskLevel = 'MEDIUM';
          riskScore = 5;
          riskReason = 'Regulates licensing and usage rights of technology or materials.';
          suggestedAction = 'Confirm that license grant is non-exclusive and limited to project scope.';
          lawyerQuestions = ['Is the license grant properly bounded by geography, time, and purpose?'];
        }
      } else if (lower.includes('payment') || lower.includes('fee') || lower.includes('price') || lower.includes('invoice') || lower.includes('late fee') || lower.includes('interest')) {
        category = 'Payment & Fees';
        if (lower.includes('non-refundable') || lower.includes('penalty') || lower.includes('unilateral price increase')) {
          riskLevel = 'HIGH';
          riskScore = 7;
          riskReason = 'Strict payment penalties or non-refundable clauses limit cash flow flexibility.';
          suggestedAction = 'Incorporate standard 30-day net terms and a dispute mechanism for contested invoices.';
          lawyerQuestions = ['Can we withhold disputed amounts in good faith without triggering breach?'];
        } else {
          riskLevel = 'MEDIUM';
          riskScore = 4;
          riskReason = 'Standard payment timetable and billing stipulations.';
          suggestedAction = 'Confirm billing milestones and payment currency details.';
          lawyerQuestions = ['What are the grace periods before late interest accrues?'];
        }
      } else if (lower.includes('confidential') || lower.includes('non-disclosure') || lower.includes('proprietary information')) {
        category = 'Confidentiality & Non-Disclosure';
        riskLevel = lower.includes('perpetual') ? 'MEDIUM' : 'LOW';
        riskScore = lower.includes('perpetual') ? 5 : 2;
        riskReason = lower.includes('perpetual')
          ? 'Perpetual confidentiality without sunset clause may impose prolonged monitoring burdens.'
          : 'Standard protection for business disclosures with standard exceptions.';
        suggestedAction = 'Limit confidentiality survival to 2-3 years following agreement expiration.';
        lawyerQuestions = ['Are trade secrets properly distinguished from general confidential info with a sunset period?'];
      } else if (lower.includes('arbitrat') || lower.includes('court') || lower.includes('jurisdiction') || lower.includes('governing law')) {
        category = 'Dispute Resolution & Jurisdiction';
        riskLevel = lower.includes('mandatory binding arbitration') || lower.includes('waives jury') ? 'HIGH' : 'MEDIUM';
        riskScore = riskLevel === 'HIGH' ? 6 : 4;
        riskReason = 'Designates mandatory venue, choice of law, and potentially restricts class action or jury rights.';
        suggestedAction = 'Ensure designated jurisdiction is legally convenient or neutral.';
        lawyerQuestions = ['Is the designated forum commercially advantageous or cost-prohibitive in a dispute?'];
      } else if (lower.includes('data') || lower.includes('gdpr') || lower.includes('privacy') || lower.includes('security breach')) {
        category = 'Data Privacy & Security';
        riskLevel = 'HIGH';
        riskScore = 7;
        riskReason = 'Imposes statutory data compliance, breach notification, and possible regulatory fines.';
        suggestedAction = 'Attach a compliant Data Processing Addendum (DPA) specifying audit rights.';
        lawyerQuestions = ['Are security breach notification timelines (e.g. 72 hours) practically achievable?'];
      }

      counts[riskLevel.toLowerCase() as keyof typeof counts]++;
      totalRisk += riskScore;

      clauses.push({
        id,
        number,
        heading,
        originalText: p,
        plainExplanation: this.generatePlainSummaryForText(p, category),
        category,
        riskLevel,
        riskScore,
        riskReason,
        suggestedAction,
        lawyerQuestions,
      });
    });

    const totalClauses = clauses.length || 1;
    const avgRisk = Math.round((totalRisk / (totalClauses * 10)) * 100);
    const overallRiskLevel: RiskLevel =
      avgRisk > 70 || counts.critical > 0 ? 'CRITICAL' :
      avgRisk > 50 || counts.high > 1 ? 'HIGH' :
      avgRisk > 30 ? 'MEDIUM' : 'LOW';

    const checklist = [
      {
        id: 'chk-1',
        task: 'Confirm liability is mutually capped to fees paid over the preceding 12-month period.',
        priority: 'HIGH' as const,
        relatedClauseId: clauses.find(c => c.category === 'Liability & Indemnification')?.id,
      },
      {
        id: 'chk-2',
        task: 'Verify presence of a 30-day notice and cure window prior to any termination for cause.',
        priority: 'HIGH' as const,
        relatedClauseId: clauses.find(c => c.category === 'Termination & Cancellation')?.id,
      },
      {
        id: 'chk-3',
        task: 'Ensure pre-existing intellectual property and proprietary tools are explicitly carved out.',
        priority: 'MEDIUM' as const,
        relatedClauseId: clauses.find(c => c.category === 'Intellectual Property')?.id,
      },
      {
        id: 'chk-4',
        task: 'Confirm governing law and dispute venue are within a commercially fair jurisdiction.',
        priority: 'LOW' as const,
        relatedClauseId: clauses.find(c => c.category === 'Dispute Resolution & Jurisdiction')?.id,
      },
    ];

    const lawyerQuestions = [
      'Does the indemnification clause leave our business vulnerable to third-party claims beyond our direct control?',
      'Are the liability limits mutual, and do they adequately cover potential operational risks?',
      'Is there an exit mechanism if performance or service level targets are consistently missed?',
      'Are there any non-compete or restrictive covenants that limit future commercial operations?',
    ];

    return {
      documentTitle: title,
      documentType: this.inferDocumentType(text),
      executiveSummary: `This agreement establishes formal legal commitments across ${totalClauses} primary sections. The document exhibits an overall risk posture of ${overallRiskLevel} (Risk Index: ${avgRisk}/100), with key areas requiring attention in ${clauses.filter(c => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').map(c => c.category).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'standard provisions'}. Non-lawyer signatories should review flagged clauses before execution.`,
      overallRiskScore: avgRisk,
      overallRiskLevel,
      riskDistribution: counts,
      clauses,
      actionChecklist: checklist,
      suggestedQuestionsForLawyer: lawyerQuestions,
      analyzedAt: new Date().toISOString(),
      charCount: text.length,
    };
  }

  private inferDocumentType(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('non-disclosure') || lower.includes('confidentiality agreement') || lower.includes('nda')) return 'Non-Disclosure Agreement (NDA)';
    if (lower.includes('master services agreement') || lower.includes('msa')) return 'Master Services Agreement (MSA)';
    if (lower.includes('software as a service') || lower.includes('saas') || lower.includes('subscription agreement')) return 'SaaS Subscription Agreement';
    if (lower.includes('employment') || lower.includes('offer letter')) return 'Employment Contract';
    if (lower.includes('privacy policy')) return 'Privacy Policy';
    if (lower.includes('terms of service') || lower.includes('terms and conditions')) return 'Terms of Service';
    if (lower.includes('lease') || lower.includes('tenancy')) return 'Lease / Tenancy Agreement';
    return 'Commercial Contract';
  }

  private generatePlainSummaryForText(text: string, category: ClauseCategory): string {
    const lower = text.toLowerCase();
    if (category === 'Liability & Indemnification') {
      return 'In simple terms: This section governs who pays if something goes wrong, gets damaged, or results in a legal dispute. Pay close attention to who assumes financial responsibility.';
    }
    if (category === 'Termination & Cancellation') {
      return 'In simple terms: Explains how either party can cancel or end this contract, how much advance warning is required, and what happens to pending work/fees upon ending.';
    }
    if (category === 'Intellectual Property') {
      return 'In simple terms: Defines who owns the work, designs, software, or ideas created under this agreement, and whether you retain rights to your pre-existing tools.';
    }
    if (category === 'Payment & Fees') {
      return 'In simple terms: Details when payments are due, how invoices must be delivered, and whether interest or penalties apply if payments are delayed.';
    }
    if (category === 'Confidentiality & Non-Disclosure') {
      return 'In simple terms: Requires keeping sensitive business materials private, and sets rules on how long secrets must be protected from third parties.';
    }
    if (category === 'Dispute Resolution & Jurisdiction') {
      return 'In simple terms: Determines which state/court will handle legal arguments if a disagreement arises, and whether you must use private arbitration instead of a court.';
    }
    return 'In simple terms: Outlines standard binding contractual terms and conditions that govern how the parties work together.';
  }
}

export const documentAnalyzer = new DocumentAnalyzerService();
