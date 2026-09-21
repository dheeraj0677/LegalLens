import { DocumentComparisonResult, MatchedClause, Clause } from '../types';
import { aiClient } from './aiClient';
import { documentAnalyzer } from './documentAnalyzer';

export class DocumentComparerService {
  /**
   * Compares two documents (e.g. Original vs Counter-proposal, or Provider A vs Provider B)
   * highlighting risks, unilateral shifts, omitted terms, and redlines.
   */
  public async compareDocuments(
    docA: string,
    docB: string,
    titleA: string = 'Document A (Original)',
    titleB: string = 'Document B (Revised / Counter)'
  ): Promise<DocumentComparisonResult> {
    const analysisA = documentAnalyzer.generateDomainFallbackAnalysis(docA, titleA);
    const analysisB = documentAnalyzer.generateDomainFallbackAnalysis(docB, titleB);

    // Identify mutual categories vs omitted categories
    const categoriesA = new Set(analysisA.clauses.map(c => c.category));
    const categoriesB = new Set(analysisB.clauses.map(c => c.category));

    const onlyInA = analysisA.clauses.filter(cA => !categoriesB.has(cA.category));
    const onlyInB = analysisB.clauses.filter(cB => !categoriesA.has(cB.category));

    const systemPrompt = `You are LegalLens Comparison Engine, an expert at contract diffing, redline analysis, and identifying covert risk shifts in counter-proposals.
Compare Document A against Document B.
Only compare clauses that exist in both documents.
Assess which party the revisions favor, detail clause-by-clause changes, and generate practical negotiation recommendations.

Return JSON strictly matching this shape:
{
  "titleA": string,
  "titleB": string,
  "overallSummary": string,
  "favorability": "FAVORS_PARTY_A" | "FAVORS_PARTY_B" | "BALANCED" | "NEEDS_LEGAL_INTERVENTION",
  "favorabilityExplanation": string,
  "keyDifferences": string[],
  "matchedClauses": [
    {
      "id": string,
      "clauseCategory": string,
      "title": string,
      "textA": string,
      "textB": string,
      "similarityPercentage": number,
      "changeType": "IDENTICAL" | "MODIFIED_MINOR" | "MODIFIED_MAJOR" | "CONTRADICTORY",
      "changeSummary": string,
      "riskImpact": "FAVORS_PARTY_A" | "FAVORS_PARTY_B" | "NEUTRAL" | "MUTUAL_INCREASED_RISK",
      "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "recommendation": string
    }
  ],
  "recommendations": string[]
}`;

    const userPrompt = `Document A (${titleA}):\n${docA}\n\n====================\n\nDocument B (${titleB}):\n${docB}`;

    const result = await aiClient.generateStructuredJSON<Omit<DocumentComparisonResult, 'onlyInA' | 'onlyInB' | 'comparisonTimestamp'>>(
      systemPrompt,
      userPrompt,
      () => this.generateDomainFallbackComparison(analysisA.clauses, analysisB.clauses, titleA, titleB)
    );

    // Ensure matched clauses only contain genuine pairs
    const filteredMatched = (result.matchedClauses && result.matchedClauses.length > 0)
      ? result.matchedClauses.filter(m => m.textA && m.textB && m.textA.trim() !== '' && m.textB.trim() !== '')
      : this.generateDomainFallbackComparison(analysisA.clauses, analysisB.clauses, titleA, titleB).matchedClauses;

    return {
      titleA: result.titleA || titleA,
      titleB: result.titleB || titleB,
      overallSummary: result.overallSummary,
      favorability: result.favorability,
      favorabilityExplanation: result.favorabilityExplanation,
      keyDifferences: result.keyDifferences || [],
      matchedClauses: filteredMatched,
      onlyInA,
      onlyInB,
      recommendations: result.recommendations || [],
      comparisonTimestamp: new Date().toISOString(),
    };
  }

  private generateDomainFallbackComparison(
    clausesA: Clause[],
    clausesB: Clause[],
    titleA: string,
    titleB: string
  ): Omit<DocumentComparisonResult, 'onlyInA' | 'onlyInB' | 'comparisonTimestamp'> {
    const matchedClauses: MatchedClause[] = [];
    const usedB = new Set<string>();

    clausesA.forEach((cA, idx) => {
      // Find closest matching clause in B by category
      const matchB = clausesB.find(cB => !usedB.has(cB.id) && cB.category === cA.category);

      if (matchB) {
        usedB.add(matchB.id);
        const isExact = cA.originalText.trim() === matchB.originalText.trim();
        const sim = isExact ? 100 : this.calculateSimilarity(cA.originalText, matchB.originalText);

        let changeType: MatchedClause['changeType'] = 'IDENTICAL';
        let riskImpact: MatchedClause['riskImpact'] = 'NEUTRAL';
        let changeSummary = 'Clause language is identical across both documents.';
        let recommendation = 'No amendment required; terms remain consistent.';

        if (sim < 100) {
          if (sim > 75) {
            changeType = 'MODIFIED_MINOR';
            changeSummary = `Minor stylistic or phrasing adjustment in ${cA.category}. Core duties remain largely aligned.`;
            recommendation = 'Verify that terminology edits do not alter operational commitments.';
          } else if (sim > 40) {
            changeType = 'MODIFIED_MAJOR';
            changeSummary = `Significant contractual shift in ${cA.category}. Specific obligations or thresholds have been reallocated.`;
            recommendation = `Scrutinize ${matchB.heading} to confirm the terms remain balanced.`;
          } else {
            changeType = 'CONTRADICTORY';
            changeSummary = `Substantive departure from Document A terms in ${cA.category}. Risk profile has materially changed.`;
            recommendation = 'Flag this clause for direct negotiation or legal counsel redlining.';
          }

          if (matchB.riskScore > cA.riskScore) {
            riskImpact = 'FAVORS_PARTY_A'; // Original was safer, new B increased risk
          } else if (matchB.riskScore < cA.riskScore) {
            riskImpact = 'FAVORS_PARTY_B'; // Document B softened or improved terms
          }
        }

        matchedClauses.push({
          id: `match-${idx + 1}`,
          clauseCategory: cA.category,
          title: cA.heading || matchB.heading,
          textA: cA.originalText,
          textB: matchB.originalText,
          similarityPercentage: Math.round(sim),
          changeType,
          changeSummary,
          riskImpact,
          riskLevel: matchB.riskLevel,
          recommendation,
        });
      }
    });

    const majorChanges = matchedClauses.filter(m => m.changeType === 'MODIFIED_MAJOR' || m.changeType === 'CONTRADICTORY');
    const favorA = matchedClauses.filter(m => m.riskImpact === 'FAVORS_PARTY_A').length;
    const favorB = matchedClauses.filter(m => m.riskImpact === 'FAVORS_PARTY_B').length;

    let favorability: DocumentComparisonResult['favorability'] = 'BALANCED';
    let favorabilityExplanation = 'Both documents maintain equivalent allocations of liability and operational obligations.';

    if (favorA > favorB) {
      favorability = 'FAVORS_PARTY_A';
      favorabilityExplanation = `${titleA} maintains stronger risk safeguards and liability limits than ${titleB}.`;
    } else if (favorB > favorA) {
      favorability = 'FAVORS_PARTY_B';
      favorabilityExplanation = `${titleB} has renegotiated terms with more flexible or advantageous obligations.`;
    } else if (majorChanges.length > 2) {
      favorability = 'NEEDS_LEGAL_INTERVENTION';
      favorabilityExplanation = 'Multiple major clause discrepancies create significant risk divergence requiring attorney review.';
    }

    const keyDifferences = [
      `${matchedClauses.length} common clause sections evaluated across both versions.`,
      majorChanges.length > 0 
        ? `${majorChanges.length} sections contain substantive language modifications (${majorChanges.map(m => m.clauseCategory).join(', ')}).`
        : 'Contractual terminology and obligations closely match across both drafts.',
      `${clausesB.length - usedB.size} clauses are newly introduced in ${titleB}.`,
      `${clausesA.length - matchedClauses.length} clauses present in ${titleA} were omitted in ${titleB}.`,
    ];

    const recommendations = [
      'Reject unilateral indemnity shifts and require reciprocal liability caps.',
      'Ensure that cure periods for termination match the original 30-day timeline.',
      'Cross-check defined terms to prevent unintentional expansion of confidential disclosures.',
      'Request redlined tracking for all subsequent counter-proposals before signing.',
    ];

    return {
      titleA,
      titleB,
      overallSummary: `Comparison analysis between "${titleA}" and "${titleB}" shows ${matchedClauses.length} correlated clauses with a net outcome that is ${favorability.replace(/_/g, ' ')}. ${majorChanges.length} sections have material divergences that affect liability and governance.`,
      favorability,
      favorabilityExplanation,
      keyDifferences,
      matchedClauses,
      recommendations,
    };
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = new Set(str1.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    const s2 = new Set(str2.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    if (s1.size === 0 || s2.size === 0) return 0;

    let intersection = 0;
    s1.forEach(w => {
      if (s2.has(w)) intersection++;
    });

    const union = new Set([...s1, ...s2]).size;
    return (intersection / union) * 100;
  }
}

export const documentComparer = new DocumentComparerService();
