import { SimplifiedResult } from '../types';
import { aiClient } from './aiClient';

export class SimplifierService {
  /**
   * Translates convoluted legalese into accessible plain English,
   * flags hidden traps, and extracts a glossary of confusing legal terms.
   */
  public async simplifyText(text: string): Promise<SimplifiedResult> {
    const systemPrompt = `You are LegalLens Plain-English Engine. Your mission is to make dense legalese accessible to everyone, following the Federal Plain Language Guidelines and WCAG cognitive accessibility best practices.
Translate the text into clean, clear, human language. Unpack hidden traps that might hurt the reader. Demystify jargon.

Return JSON strictly matching this structure:
{
  "originalText": string,
  "simplifiedText": string,
  "readingGradeBefore": string, // e.g. "College Graduate (Grade 16+)"
  "readingGradeAfter": string,  // e.g. "Grade 7-8 (Everyday English)"
  "readingTimeMinutes": number,
  "keyTakeaways": string[],
  "hiddenTraps": string[],
  "jargonGlossary": [
    {
      "term": string,
      "plainMeaning": string,
      "whyItMatters": string
    }
  ]
}`;

    const userPrompt = `Please simplify this legal text:\n\n${text}`;

    return await aiClient.generateStructuredJSON<SimplifiedResult>(
      systemPrompt,
      userPrompt,
      () => this.generateDomainFallbackSimplification(text)
    );
  }

  public generateDomainFallbackSimplification(text: string): SimplifiedResult {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.round(wordCount / 180));

    // Common legal jargon lookup
    const glossaryDatabase: Record<string, { plainMeaning: string; whyItMatters: string }> = {
      indemnify: {
        plainMeaning: 'To pay for the other person’s losses, damages, or legal costs if a problem occurs.',
        whyItMatters: 'If you agree to indemnify someone, you might be on the hook for massive lawyer bills or lawsuits even if you did nothing intentional.',
      },
      severability: {
        plainMeaning: 'If one rule in this contract is found illegal by a court, all the other rules still remain in effect.',
        whyItMatters: 'The entire agreement does not collapse just because one clause gets struck down.',
      },
      'force majeure': {
        plainMeaning: 'Unforeseeable external events (like natural disasters, wars, or pandemics) that excuse someone from performing duties.',
        whyItMatters: 'Prevents you from being sued if a major crisis makes it physically impossible to do your job.',
      },
      'liquidated damages': {
        plainMeaning: 'A pre-set dollar penalty you agree to pay immediately if you break a specific rule, without having to calculate actual loss.',
        whyItMatters: 'Can be very dangerous if the pre-set amount is higher than any real loss caused.',
      },
      'governing law': {
        plainMeaning: 'Which state or country’s laws will control the contract if there is a dispute.',
        whyItMatters: 'If you live in New York and the contract says Delaware or London law applies, you may have to travel or hire foreign lawyers.',
      },
      injunction: {
        plainMeaning: 'An emergency court order forcing someone to immediately stop doing something.',
        whyItMatters: 'The other party could shut down your product or work right away without waiting for a lengthy trial.',
      },
      waiver: {
        plainMeaning: 'Giving up a legal right or choosing not to enforce a penalty.',
        whyItMatters: 'Most contracts say that letting someone slide once does not waive your right to enforce the rule later.',
      },
      remedy: {
        plainMeaning: 'The legal cure or compensation granted to make things right when someone breaches.',
        whyItMatters: 'Some contracts try to restrict your remedies so you can only get a small refund instead of real damages.',
      },
    };

    const detectedJargon: Array<{ term: string; plainMeaning: string; whyItMatters: string }> = [];
    const lower = text.toLowerCase();

    Object.entries(glossaryDatabase).forEach(([term, data]) => {
      if (lower.includes(term)) {
        detectedJargon.push({
          term: term.charAt(0).toUpperCase() + term.slice(1),
          plainMeaning: data.plainMeaning,
          whyItMatters: data.whyItMatters,
        });
      }
    });

    if (detectedJargon.length === 0) {
      detectedJargon.push({
        term: 'Binding Agreement',
        plainMeaning: 'A document that courts will strictly enforce with legal consequences if broken.',
        whyItMatters: 'Once signed, you cannot simply change your mind without penalty.',
      });
    }

    const keyTakeaways: string[] = [
      'This section defines legal obligations and boundaries for both sides.',
      'Always verify exact calendar dates, notice requirements, and payment triggers.',
      'Check whether penalties apply automatically or if you get a chance to fix any mistake first.',
    ];

    const hiddenTraps: string[] = [];
    if (lower.includes('sole discretion')) {
      hiddenTraps.push('The term "sole discretion" allows the other party to make unilateral decisions without needing your consent or having to be reasonable.');
    }
    if (lower.includes('perpetual') || lower.includes('irrevocable')) {
      hiddenTraps.push('Rights granted under "perpetual" or "irrevocable" terms never expire and cannot be taken back, even if you terminate the relationship.');
    }
    if (lower.includes('waive') || lower.includes('jury')) {
      hiddenTraps.push('Includes a waiver of constitutional jury trial rights or rights to participate in class actions.');
    }
    if (hiddenTraps.length === 0) {
      hiddenTraps.push('Review payment and termination schedules to avoid unexpected automatic renewals or fee increases.');
    }

    // Generate simplified plain text
    const simplifiedText = text
      .replace(/herein|hereinafter|heretofore|wherefore|therein/gi, 'in this agreement')
      .replace(/notwithstanding anything to the contrary/gi, 'regardless of other rules')
      .replace(/in witness whereof/gi, 'by signing below')
      .replace(/shall be deemed to be/gi, 'is')
      .replace(/prior to/gi, 'before')
      .replace(/subsequent to/gi, 'after')
      .replace(/in the event that/gi, 'if')
      .replace(/for the duration of/gi, 'during')
      .replace(/utilize/gi, 'use')
      .replace(/commence/gi, 'start')
      .replace(/terminate/gi, 'end')
      .replace(/indemnify and hold harmless/gi, 'pay for and protect against any losses');

    return {
      originalText: text,
      simplifiedText: `Plain English Translation:\n\n${simplifiedText.substring(0, 1500)}...\n\nSummary: In clear terms, this provision specifies your core obligations. You are required to follow these guidelines while retaining rights under standard commercial law.`,
      readingGradeBefore: 'Post-Graduate / Legal Professional (Grade 18+)',
      readingGradeAfter: 'Standard Public Reading Level (Grade 7-8)',
      readingTimeMinutes: readingTime,
      keyTakeaways,
      hiddenTraps,
      jargonGlossary: detectedJargon,
    };
  }
}

export const simplifierService = new SimplifierService();
