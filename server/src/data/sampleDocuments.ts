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

export const SAMPLE_DOCUMENTS: SampleDocumentPreset[] = [
  {
    id: 'preset-nda-comparison',
    title: 'Mutual NDA vs. One-Sided Counter Proposal',
    category: 'Non-Disclosure Agreements',
    description: 'Compare a balanced mutual NDA against a counter-proposal that quietly shifted confidentiality into a perpetual one-way obligation.',
    documentA: {
      title: 'Mutual Non-Disclosure Agreement (Standard Draft)',
      text: `MUTUAL NON-DISCLOSURE AGREEMENT

1. PURPOSE AND DEFINITION.
The Disclosing Party desires to disclose certain confidential and proprietary business information ("Confidential Information") to the Receiving Party for the purpose of evaluating a potential commercial collaboration. Confidential Information shall mean non-public technical, business, and financial data marked as "Confidential" or which reasonably should be understood to be confidential.

2. MUTUAL OBLIGATIONS.
Both parties agree to hold each other's Confidential Information in strict confidence and use at least the same degree of care as they use to protect their own confidential materials of similar nature, but in no event less than reasonable care.

3. TERM AND SUNSET PERIOD.
This Agreement shall remain in effect for a period of one (1) year from the Effective Date. The confidentiality obligations herein shall survive the termination or expiration of this Agreement for a period of two (2) years following receipt of disclosure.

4. EXCLUSIONS FROM CONFIDENTIALITY.
Confidential Information does not include information that: (a) is or becomes publicly known through no breach of Receiving Party; (b) was already in Receiving Party's lawful possession prior to disclosure; (c) is independently developed without reference to the Disclosing Party's Confidential Information.

5. REMEDIES AND JURISDICTION.
The parties acknowledge that unauthorized disclosure may cause irreparable harm for which monetary damages alone would be inadequate. This Agreement shall be governed by the laws of the State of Delaware without regard to conflict of law principles.`,
    },
    documentB: {
      title: 'Counter-Proposal NDA (Vendor Revised)',
      text: `ONE-WAY PROPRIETARY NON-DISCLOSURE AGREEMENT

1. DEFINITION OF PROPRIETARY ASSETS.
The Company desires to disclose certain proprietary business information to Recipient. Confidential Information shall include all information, whether oral, visual, or written, regardless of whether marked confidential, disclosed by the Company to Recipient.

2. UNILATERAL RECIPIENT OBLIGATIONS.
Recipient agrees to hold all Company Confidential Information in utmost strict confidence and shall not disclose or use such information for any purpose without prior express written consent of Company. Recipient agrees to defend, indemnify, and hold Company harmless from any third-party claims arising from Recipient's unauthorized disclosure.

3. PERPETUAL SURVIVAL OF OBLIGATIONS.
This Agreement shall continue indefinitely in full force and effect. The confidentiality, non-use, and indemnity obligations of Recipient under this Agreement shall survive in perpetuity.

4. EXCLUSIONS FROM CONFIDENTIALITY.
Recipient shall have the heavy burden of proof to demonstrate by clear and convincing evidence that any information qualifies for standard common-law disclosure exceptions.

5. DISPUTE VENUE AND LIQUIDATED DAMAGES.
Recipient agrees that any breach shall entitle Company to immediate injunctive relief and liquidated damages of not less than $250,000 per violation. This Agreement shall be governed exclusively by the laws of England and Wales.`,
    },
    suggestedQuestions: [
      'What are the key risks of perpetual confidentiality survival?',
      'Who pays legal fees if a dispute arises?',
      'Is there an indemnity clause in this agreement?',
      'Does this counter-proposal protect my confidential disclosures?',
    ],
  },
  {
    id: 'preset-contractor-agreement',
    title: 'Software Developer Independent Contractor Agreement',
    category: 'Consulting & IP',
    description: 'Examine an independent contractor agreement with aggressive IP assignment, non-solicitation, and unlimited liability terms.',
    documentA: {
      title: 'Independent Contractor Agreement',
      text: `INDEPENDENT CONTRACTOR SERVICES AGREEMENT

1. SERVICES AND SCOPE OF WORK.
Contractor agrees to perform software development services as specified in Statements of Work executed by the parties from time to time. Contractor shall determine the method, details, and means of performing the services.

2. COMPENSATION AND EXPENSES.
Client shall pay Contractor the fee specified in the applicable Statement of Work within thirty (30) days of receipt of Contractor's itemized invoice. Undisputed late balances shall accrue interest at 1.0% per month.

3. INTELLECTUAL PROPERTY AND WORK PRODUCT.
Contractor hereby irrevocably assigns to Client all right, title, and interest worldwide in and to all Work Product created specifically for Client under this Agreement. Contractor reserves all rights, title, and ownership in Contractor's pre-existing software libraries, developer tooling, reusable utility modules, and general knowledge.

4. INDEPENDENT CONTRACTOR STATUS.
Contractor is an independent contractor, not an employee or agent of Client. Contractor is solely responsible for all taxes, withholdings, and statutory benefits.

5. TERMINATION AND CURE PERIOD.
Either party may terminate this Agreement without cause upon giving thirty (30) days prior written notice. Either party may terminate immediately for material breach if such breach remains uncured after fourteen (14) days written notice.

6. LIMITATION OF LIABILITY.
To the maximum extent permitted by applicable law, neither party shall be liable for indirect, incidental, or consequential damages. Each party's total aggregate liability arising under this Agreement shall be limited to the total fees paid or payable by Client in the preceding twelve (12) months.`,
    },
    suggestedQuestions: [
      'Do I retain ownership of my pre-existing coding libraries and tools?',
      'Can the client terminate the contract without paying for work already completed?',
      'Is the liability capped at fees paid, or is it unlimited?',
      'What happens if an invoice is not paid on time?',
    ],
  },
  {
    id: 'preset-saas-agreement',
    title: 'Enterprise Cloud SaaS Terms of Service',
    category: 'SaaS & Cloud',
    description: 'Review standard enterprise software-as-a-service terms covering uptime guarantees, data privacy, and service suspension triggers.',
    documentA: {
      title: 'Enterprise Cloud Service Agreement',
      text: `ENTERPRISE CLOUD SERVICE AGREEMENT

1. SUBSCRIPTION GRANT AND ACCESS.
Subject to the terms of this Agreement, Provider grants Customer a non-exclusive, non-transferable right to access and use the Cloud Service during the Subscription Term solely for Customer's internal business operations.

2. SERVICE LEVEL AGREEMENT (SLA).
Provider warrants that the Cloud Service will achieve 99.9% Monthly Uptime. In the event Provider fails to meet this commitment, Customer's sole and exclusive remedy shall be service credits as set forth in the SLA Schedule.

3. CUSTOMER DATA AND SECURITY.
Customer retains all ownership of Customer Data. Provider shall maintain administrative, physical, and technical safeguards designed to protect the security and confidentiality of Customer Data in compliance with SOC 2 Type II and GDPR standards.

4. SUSPENSION OF SERVICE.
Provider reserves the right to suspend Customer's access to the Service immediately upon written notice if Customer's usage threatens the security or operational stability of the platform, or if fees remain unpaid forty-five (45) days after formal notice.

5. INDEMNIFICATION AND WARRANTIES.
Provider shall defend and indemnify Customer against any third-party claim alleging that the Cloud Service infringes any valid patent, copyright, or trademark. Provider disclaims all implied warranties of merchantability and fitness for a particular purpose.`,
    },
    suggestedQuestions: [
      'What happens if the service goes down during critical business hours?',
      'Who owns the customer data uploaded to the platform?',
      'Under what circumstances can the provider suspend our access?',
      'Does the provider indemnify us against copyright or patent infringement?',
    ],
  },
];
