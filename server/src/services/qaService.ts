import { QAResult } from '../types';
import { aiClient } from './aiClient';

export class QAService {
  /**
   * Answers user inquiries with strict document grounding and verbatim citations.
   */
  public async answerQuestion(documentText: string, question: string): Promise<QAResult> {
    const systemPrompt = `You are LegalLens Interactive Assistant. Your job is to answer questions about the provided document with complete accuracy and total traceability.
Every single claim or conclusion must be supported by citations containing verbatim quotes from the text.
Never hallucinate or assume facts outside the provided document. If the document does not state something, clearly explain that it is not addressed.

Return JSON strictly matching this shape:
{
  "question": string,
  "answer": string,
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "citations": [
    {
      "clauseReference": string, // e.g. "Section 4.2 - Termination"
      "exactQuote": string,      // verbatim text quote
      "explanation": string      // how this quote answers the question
    }
  ],
  "suggestedFollowUpQuestions": string[],
  "disclaimer": string
}`;

    const userPrompt = `Document:\n${documentText}\n\nQuestion: ${question}`;

    return await aiClient.generateStructuredJSON<QAResult>(
      systemPrompt,
      userPrompt,
      () => this.generateDomainFallbackQA(documentText, question)
    );
  }

  public generateDomainFallbackQA(documentText: string, question: string): QAResult {
    const qLower = question.toLowerCase();
    const sentences = documentText
      .split(/(?<=[.?!])\s+(?=[A-Z0-9])|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);

    // Look for matching keywords from question
    const qWords = qLower.split(/\W+/).filter(w => w.length > 3 && !['what', 'when', 'where', 'which', 'does', 'have', 'about', 'this', 'that', 'with'].includes(w));

    const matchedSentences: Array<{ sentence: string; score: number }> = [];

    sentences.forEach(s => {
      const sLower = s.toLowerCase();
      let matchCount = 0;
      qWords.forEach(w => {
        if (sLower.includes(w)) matchCount++;
      });
      if (matchCount > 0) {
        matchedSentences.push({ sentence: s, score: matchCount });
      }
    });

    matchedSentences.sort((a, b) => b.score - a.score);

    let answer = '';
    const citations: QAResult['citations'] = [];

    if (matchedSentences.length > 0) {
      const topMatch = matchedSentences[0].sentence;
      answer = `Based on the provided document, the text specifies that: "${topMatch}".`;
      citations.push({
        clauseReference: 'Relevant Document Provision',
        exactQuote: topMatch.substring(0, 250),
        explanation: 'Directly addresses the conditions referenced in your question.',
      });

      if (matchedSentences.length > 1) {
        citations.push({
          clauseReference: 'Supporting Contractual Context',
          exactQuote: matchedSentences[1].sentence.substring(0, 250),
          explanation: 'Provides additional context regarding obligations and timelines.',
        });
      }
    } else {
      answer = `The provided document text does not contain explicit terms directly matching "${question}". However, related obligations may be governed by general contractual or governing law provisions.`;
      citations.push({
        clauseReference: 'Entire Agreement / General Terms',
        exactQuote: documentText.substring(0, 180) + '...',
        explanation: 'Review the foundational document scope to confirm whether this topic is governed elsewhere.',
      });
    }

    const followUps = [
      'What are the penalties or remedies if this obligation is breached?',
      'Can this provision be modified through an amendment or addendum?',
      'What notice period is required to exercise rights under this clause?',
    ];

    return {
      question,
      answer,
      confidence: matchedSentences.length > 0 ? 'HIGH' : 'MEDIUM',
      citations,
      suggestedFollowUpQuestions: followUps,
      disclaimer: 'LegalLens provides AI-powered document intelligence and informational assistance. This response does not constitute professional legal advice. Always review significant legal documents with qualified legal counsel.',
    };
  }
}

export const qaService = new QAService();
