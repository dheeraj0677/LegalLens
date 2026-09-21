export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ClauseCategory = 
  | 'Liability & Indemnification'
  | 'Termination & Cancellation'
  | 'Intellectual Property'
  | 'Payment & Fees'
  | 'Confidentiality & Non-Disclosure'
  | 'Warranties & Disclaimers'
  | 'Dispute Resolution & Jurisdiction'
  | 'Data Privacy & Security'
  | 'General & Boilerplate';

export interface Clause {
  id: string;
  number?: string;
  heading: string;
  originalText: string;
  plainExplanation: string;
  category: ClauseCategory;
  riskLevel: RiskLevel;
  riskScore: number;
  riskReason: string;
  suggestedAction: string;
  lawyerQuestions: string[];
}

export interface DocumentAnalysisResult {
  documentTitle: string;
  documentType: string;
  executiveSummary: string;
  overallRiskScore: number;
  overallRiskLevel: RiskLevel;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  clauses: Clause[];
  actionChecklist: Array<{
    id: string;
    task: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    relatedClauseId?: string;
  }>;
  suggestedQuestionsForLawyer: string[];
  analyzedAt: string;
  charCount: number;
}

export interface MatchedClause {
  id: string;
  clauseCategory: ClauseCategory;
  title: string;
  textA: string;
  textB: string;
  similarityPercentage: number;
  changeType: 'IDENTICAL' | 'MODIFIED_MINOR' | 'MODIFIED_MAJOR' | 'CONTRADICTORY';
  changeSummary: string;
  riskImpact: 'FAVORS_PARTY_A' | 'FAVORS_PARTY_B' | 'NEUTRAL' | 'MUTUAL_INCREASED_RISK';
  riskLevel: RiskLevel;
  recommendation: string;
}

export interface DocumentComparisonResult {
  titleA: string;
  titleB: string;
  overallSummary: string;
  favorability: 'FAVORS_PARTY_A' | 'FAVORS_PARTY_B' | 'BALANCED' | 'NEEDS_LEGAL_INTERVENTION';
  favorabilityExplanation: string;
  keyDifferences: string[];
  matchedClauses: MatchedClause[];
  onlyInA: Clause[];
  onlyInB: Clause[];
  recommendations: string[];
  comparisonTimestamp: string;
}

export interface SimplifiedResult {
  originalText: string;
  simplifiedText: string;
  readingGradeBefore: string;
  readingGradeAfter: string;
  readingTimeMinutes: number;
  keyTakeaways: string[];
  hiddenTraps: string[];
  jargonGlossary: Array<{
    term: string;
    plainMeaning: string;
    whyItMatters: string;
  }>;
}

export interface QAResult {
  question: string;
  answer: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  citations: Array<{
    clauseReference: string;
    exactQuote: string;
    explanation: string;
  }>;
  suggestedFollowUpQuestions: string[];
  disclaimer: string;
}

export interface SampleDocumentPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  documentA: {
    title: string;
    text: string;
  };
  documentB?: {
    title: string;
    text: string;
  };
  suggestedQuestions: string[];
}
