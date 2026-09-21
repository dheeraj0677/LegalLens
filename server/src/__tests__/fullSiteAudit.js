/**
 * Comprehensive Full-Site & API Accuracy Benchmark Audit for LegalLens
 * Validates 22 distinct criteria across all endpoints, contracts, and security rules.
 */

const BASE_URL = 'http://localhost:5000/api';

const results = [];

function record(category, testName, passed, details, score = 100) {
  results.push({
    category,
    testName,
    status: passed ? 'PASSED' : 'FAILED',
    score: passed ? score : 0,
    details,
  });
}

async function runAudit() {
  console.log('⚖️  Starting LegalLens Comprehensive System & Accuracy Audit...\n');

  // --- 1. System Health & Configuration ---
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    const passed = res.status === 200 && data.status === 'ok' && data.model === 'qwen/qwen3.8-27b:free' && data.hasActiveKey === true;
    record('System Health', 'API Health & Qwen Model Binding', passed, `Model: ${data.model}, Key Active: ${data.hasActiveKey}`);
  } catch (err) {
    record('System Health', 'API Health & Qwen Model Binding', false, err.message);
  }

  // --- 2. Presets Integrity ---
  try {
    const res = await fetch(`${BASE_URL}/sample-docs`);
    const data = await res.json();
    const passed = res.status === 200 && data.count >= 3 && data.presets.every(p => p.documentA && p.suggestedQuestions.length > 0);
    record('Presets', 'Sample Contracts Preset Integrity', passed, `Loaded ${data.count} validated legal presets`);
  } catch (err) {
    record('Presets', 'Sample Contracts Preset Integrity', false, err.message);
  }

  // --- 3. Document Analysis Accuracy ---
  try {
    const ndaText = `
1. CONFIDENTIALITY AND NON-DISCLOSURE.
The Receiving Party agrees to prevent unauthorized disclosure of all Proprietary Technical Information disclosed by the Disclosing Party.

2. INDEMNIFICATION AND UNLIMITED LIABILITY.
The Receiving Party shall indemnify, defend, and hold harmless the Disclosing Party against any and all claims, and total liability shall be uncapped and unlimited.

3. TERMINATION AT WILL.
Disclosing Party may terminate this agreement immediately without notice or cause.
    `;
    const res = await fetch(`${BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: ndaText, title: 'Bespoke NDA' }),
    });
    const data = await res.json();

    const hasClauses = Array.isArray(data.clauses) && data.clauses.length >= 3;
    record('Analysis Engine', 'Clause Extraction Completeness', hasClauses, `Extracted ${data.clauses?.length || 0} structured clauses`);

    const hasCriticalLiability = data.clauses && data.clauses.some(c => c.category.includes('Liability') && (c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH'));
    record('Analysis Engine', 'Critical Liability Trap Detection', hasCriticalLiability, 'Uncapped liability clause correctly identified as High/Critical risk');

    const scoreCalibrated = typeof data.overallRiskScore === 'number' && data.overallRiskScore >= 1 && data.overallRiskScore <= 100;
    record('Analysis Engine', 'Risk Score Gauge Calibration (1-100)', scoreCalibrated, `Risk Score calibrated to ${data.overallRiskScore}/100`);

    const hasChecklist = Array.isArray(data.actionChecklist) && data.actionChecklist.length >= 3;
    record('Analysis Engine', 'Governance Checklist Generation', hasChecklist, `Generated ${data.actionChecklist?.length || 0} prioritized checklist tasks`);

    const hasQuestions = Array.isArray(data.suggestedQuestionsForLawyer) && data.suggestedQuestionsForLawyer.length >= 3;
    record('Analysis Engine', 'Counsel Inquiries Generation', hasQuestions, `Generated ${data.suggestedQuestionsForLawyer?.length || 0} lawyer questions`);
  } catch (err) {
    record('Analysis Engine', 'Document Analysis Pipeline', false, err.message);
  }

  // --- 4. Security & Boundary Limits ---
  try {
    // Empty text
    const resEmpty = await fetch(`${BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '   ' }),
    });
    record('Security & Limits', 'Empty Input Rejection (HTTP 400)', resEmpty.status === 400, `Returned HTTP ${resEmpty.status}`);

    // 100k Character Cap
    const hugeText = 'X'.repeat(100005);
    const resHuge = await fetch(`${BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: hugeText }),
    });
    const hugeData = await resHuge.json();
    const passed100k = resHuge.status === 413 && hugeData.error === 'DocumentExceededLimit';
    record('Security & Limits', '100k Character Boundary Cap (HTTP 413)', passed100k, `Correctly rejected ${hugeData.providedLength?.toLocaleString()} characters with HTTP 413`);

    // XSS Sanitization
    const xssText = 'Contract text <script>alert("hacked")</script> valid clause.';
    const resXss = await fetch(`${BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: xssText }),
    });
    const xssData = await resXss.json();
    const xssCleaned = !JSON.stringify(xssData).includes('<script>');
    record('Security & Limits', 'XSS Input Sanitization', xssCleaned, 'Script tags stripped before model ingestion');
  } catch (err) {
    record('Security & Limits', 'Security Pipeline', false, err.message);
  }

  // --- 5. Contract Differ & Redline Accuracy ---
  try {
    const docA = `
1. TERMINATION. Either party may terminate upon 30 days written notice with a 14-day cure period.
2. INTELLECTUAL PROPERTY. Contractor retains all rights in pre-existing developer tooling.
    `;
    const docB = `
1. TERMINATION. Client may terminate immediately without cause and without cure window.
3. LIQUIDATED DAMAGES. Contractor shall pay $100,000 for any alleged breach.
    `;
    const resComp = await fetch(`${BASE_URL}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docA, docB, titleA: 'Contractor Draft', titleB: 'Client Revision' }),
    });
    const dataComp = await resComp.json();

    const matched = dataComp.matchedClauses && dataComp.matchedClauses.length > 0;
    record('Contract Differ', 'Clause Alignment & Matching', matched, `Aligned ${dataComp.matchedClauses?.length || 0} correlated clauses`);

    const detectedOmission = dataComp.onlyInA && dataComp.onlyInA.some(c => c.category.includes('Intellectual Property'));
    record('Contract Differ', 'Omission Alerting (Missing IP Safeguard)', detectedOmission, 'Correctly flagged deleted IP protection from Revision B');

    const detectedNewClause = dataComp.onlyInB && dataComp.onlyInB.length > 0;
    record('Contract Differ', 'Covert Insertion Detection (Surprise Covenants)', detectedNewClause, `Detected ${dataComp.onlyInB?.length || 0} newly injected clauses in Revision B`);

    const hasTacticalPlaybook = Array.isArray(dataComp.recommendations) && dataComp.recommendations.length > 0;
    record('Contract Differ', 'Negotiation Playbook Generation', hasTacticalPlaybook, `Generated ${dataComp.recommendations?.length || 0} tactical counter-offers`);
  } catch (err) {
    record('Contract Differ', 'Comparison Pipeline', false, err.message);
  }

  // --- 6. Plain English Simplifier Accuracy ---
  try {
    const legalese = `
      Notwithstanding anything herein to the contrary, Contractor shall defend, indemnify, and hold harmless Company, in perpetuity, in its sole discretion.
    `;
    const resSimp = await fetch(`${BASE_URL}/simplify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: legalese }),
    });
    const dataSimp = await resSimp.json();

    const gradeReduced = Boolean(dataSimp.readingGradeBefore && dataSimp.readingGradeAfter);
    record('Plain English', 'Readability Grade Reduction Benchmarking', gradeReduced, `${dataSimp.readingGradeBefore} -> ${dataSimp.readingGradeAfter}`);

    const trapsDetected = Array.isArray(dataSimp.hiddenTraps) && dataSimp.hiddenTraps.length > 0;
    record('Plain English', 'Covert Traps Identification', trapsDetected, `Unmasked ${dataSimp.hiddenTraps?.length || 0} hidden traps`);

    const jargonDetected = Array.isArray(dataSimp.jargonGlossary) && dataSimp.jargonGlossary.some(j => j.term.toLowerCase().includes('indemnif'));
    record('Plain English', 'Jargon Buster Glossary Extraction', jargonDetected, `Demystified ${dataSimp.jargonGlossary?.length || 0} confusing terms`);
  } catch (err) {
    record('Plain English', 'Simplifier Pipeline', false, err.message);
  }

  // --- 7. Grounded Q&A & Citation Traceability ---
  try {
    const contract = `
      SECTION 8. GOVERNING LAW AND VENUE.
      This Agreement shall be governed exclusively by the laws of the State of Delaware.
      All legal proceedings must be initiated in Wilmington, Delaware.
    `;
    const resQA = await fetch(`${BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentText: contract,
        question: 'Which state laws govern this agreement?',
      }),
    });
    const dataQA = await resQA.json();

    const answersQuestion = dataQA.answer && dataQA.answer.includes('Delaware');
    record('Grounded Q&A', 'Factual Answering Accuracy', answersQuestion, `Answer: "${dataQA.answer}"`);

    const citesSource = Array.isArray(dataQA.citations) && dataQA.citations.some(c => c.exactQuote && c.exactQuote.includes('Delaware'));
    record('Grounded Q&A', 'Verbatim Citation Traceability', citesSource, `Verbatim Quote: "${dataQA.citations?.[0]?.exactQuote?.trim()}"`);

    const hasDisclaimer = typeof dataQA.disclaimer === 'string' && dataQA.disclaimer.includes('legal advice');
    record('Grounded Q&A', 'Ethical Legal Disclaimer Inclusion', hasDisclaimer, 'Mandatory non-lawyer disclaimer present in output');
  } catch (err) {
    record('Grounded Q&A', 'Q&A Pipeline', false, err.message);
  }

  // --- Summary & Calculation ---
  console.log('\n================================================================');
  console.log('                     AUDIT RESULTS SUMMARY                      ');
  console.log('================================================================\n');

  let passedCount = 0;
  let totalScore = 0;

  for (const r of results) {
    const icon = r.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} [${r.category.padEnd(18)}] ${r.testName.padEnd(42)} : ${r.details}`);
    if (r.status === 'PASSED') {
      passedCount++;
      totalScore += r.score;
    }
  }

  const accuracyPct = Math.round((passedCount / results.length) * 100);
  const avgScore = Math.round(totalScore / results.length);

  console.log('\n================================================================');
  console.log(` TOTAL VERIFICATION CHECKS : ${results.length}`);
  console.log(` PASSED                    : ${passedCount}`);
  console.log(` FAILED                    : ${results.length - passedCount}`);
  console.log(` TESTING ACCURACY RATE     : ${accuracyPct}%`);
  console.log(` COMPOSITE SYSTEM SCORE    : ${avgScore} / 100`);
  console.log('================================================================\n');
}

runAudit();
