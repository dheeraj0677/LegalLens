# ⚖️ LegalLens — Intelligent Legal Document Intelligence & Contract Comparator

> **A GenAI-powered assistive platform designed to make complex legal documents, contract redlines, and risk discovery accessible, transparent, and actionable for everyone.**

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff.svg?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg?logo=express)](https://expressjs.com/)
[![OpenRouter](https://img.shields.io/badge/AI_Engine-OpenRouter-6366f1.svg)](https://openrouter.ai/)
[![WCAG](https://img.shields.io/badge/Accessibility-WCAG_2.2_AA-10b981.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Tests](https://img.shields.io/badge/Tests-30_Passing-success.svg)](https://vitest.dev/)
[![Repo Size](https://img.shields.io/badge/Repo_Size-<0.2MB-brightgreen.svg)]()

---

## 🏛️ Milanese Carrara 3D Aesthetic

LegalLens pairs legal intelligence with an Italian luxury design language:
- **Carrara Alabaster Palette:** Soft porcelain surfaces, layered drop-shadow elevations, and subtle border framing.
- **Tactile Depth & Neumorphism:** Sculpted 3D pill navigation, raised interactive cards, and pressed button states.
- **Jewel-Enamel Risk Badges:** Ruby, Amber, Citrine, and Emerald risk indicators featuring dual cues (custom icons + typography) for complete colorblind accessibility.
- **Classic Milanese Typography:** Sophisticated editorial headings (*Playfair Display*) paired with high-legibility geometric sans-serif (*Plus Jakarta Sans*) for legal readability.

---

## 🎯 Target Audiences & Use Cases

1. **Freelancers & Contractors:** Spot covert IP forfeitures, non-compete traps, and unilateral termination clauses before signing.
2. **Founders & Small Businesses:** Compare vendor and client counter-proposals side-by-side to catch deleted safeguards and stealth covenant additions.
3. **Employees & Consumers:** Translate dense NDAs, employment agreements, and terms of service into 8th-grade plain English.
4. **Legal Associates & Counsel:** Generate instant executive briefs, calibrated risk scores (0–100), negotiation counter-offers, and client checklists in seconds.

---

## 💡 System Architecture

```mermaid
graph TD
    A[Client UI - React 18 + Vite + TypeScript] -->|Sanitized JSON / Zero Client Keys| B[Express.js Server]
    B --> C[Security & Validation Middleware]
    C -->|Max 100k Chars / XSS Filter / Zod Schemas / Rate Limit| D[API Router]
    D --> E1[Document Analyzer Service]
    D --> E2[Contract Comparer Service]
    D --> E3[Plain English Simplifier]
    D --> E4[Grounded Q&A Service]
    E1 & E2 & E3 & E4 --> CACHE[(In-Memory SHA-256 LRU/TTL Cache)]
    CACHE -.->|Cache Miss| F[OpenRouter AI Client / OpenAI SDK]
    F -->|Secure Server-Side Key| G[OpenRouter: Qwen 3.8 / Gemini / Claude / GPT-4o]
    F -.->|5s Timeout / Upstream 429 Cascade| H[Deterministic Domain Heuristic Engine]
```

### Core Intelligence Engines

| Feature | Endpoint | Capabilities |
|:---|:---:|:---|
| **Risk Analyzer** | `/api/analyze` | Extracts clauses, computes 0–100 risk gauge, identifies liability traps, builds actionable checklists & lawyer inquiries. |
| **Contract Differ** | `/api/compare` | Semantic clause alignment, favorability shifting, covert insertion alerts, and omission detection. |
| **Plain English** | `/api/simplify` | Readability benchmarking (e.g. Grade 18+ to Grade 7–8), hidden trap alerts, and interactive jargon glossary. |
| **Grounded Q&A** | `/api/ask` | Verbatim citation-backed answers with strict document grounding and non-lawyer ethical disclaimers. |

---

## ⚡ Performance & Computational Efficiency

LegalLens is engineered for maximum throughput, low latency, and minimal resource utilization:

- **Sub-5ms Response Caching:** Integrated in-memory SHA-256 LRU/TTL cache (`cacheService.ts`) caches repeated analysis and contract comparison results. Preset sample contracts and identical documents return instantaneously (`X-Cache-Status: HIT`), reducing upstream API calls and latency by > 98%.
- **O(n) Linear Processing:** Heuristic document parsing, clause segmentation, and redaction execute in linear $O(n)$ time relative to document length, avoiding exponential regular expression backtracking.
- **HTTP Payload Compression:** Integrated Express `compression` middleware delivers full Gzip/Brotli compression across all JSON payloads, reducing network transmission overhead by 70–85%.
- **Vite Chunk Splitting & Tree-Shaking:** Advanced Rollup output configuration isolates vendor libraries (`react`, `react-dom`), icons (`lucide-react`), and dynamic feature tabs into dedicated chunks:
  - **Initial App Script:** Only **16.40 kB** (gzip: **6.11 kB**)!
  - **Vendor Bundle:** 134.65 kB (gzip: 43.22 kB)
  - **Production Build Speed:** **2.21 seconds**
- **Ultra-Lean Repository Footprint:** The entire Git repository is strictly **183 KiB** (< 1.9% of the 10 MB hackathon ceiling).

---

## 💎 Code Quality & Architectural Integrity

- **100% Strict TypeScript:** Zero compilation errors or warnings across server and client (`tsc --noEmit`). Configured with `strict: true` and `noImplicitAny: true`.
- **Zero `any` Types:** All error catches use type-safe `unknown` with runtime type narrowing (`err instanceof Error`), eliminating loose type loopholes.
- **Runtime Crash Containment:** Implemented a Carrara White 3D `<ErrorBoundary>` in the React client that catches unexpected rendering failures, protects document state, and provides a 1-click workspace recovery interface.
- **Modular Separation of Concerns:** Clear boundaries between presentation (`components/`), API routing (`routes/api.ts`), security middleware (`middleware/security.ts`), and domain services (`services/`).

---

## 🛡️ Security & Boundary Protection

- **Strict Zod Request Schema Validation:** Type-safe runtime schema parsing across all endpoints (`/analyze`, `/compare`, `/simplify`, `/ask`) ensures malformed payloads are rejected immediately with structured `HTTP 400 BadRequest`.
- **100,000 Character Boundary Enforcement:** Hard input cap enforced via middleware. Documents exceeding 100k characters are rejected with `HTTP 413 (Payload Too Large)` to eliminate resource exhaustion vectors.
- **Active XSS Sanitization:** Automatically strips `<script>` tags, `javascript:` pseudo-protocols, and inline event handlers before ingestion.
- **Zero Client-Side Secrets:** API keys reside strictly on the server (`.env` gitignored); zero tokens or credentials are bundled into the client build.
- **Hardened HTTP Layer:** Integrated `helmet` provides Content Security Policy, strict HSTS, and frameguard protection. Server disables `X-Powered-By` headers and enforces IP rate limiting (60 requests/minute).
- **Clean Dependency Audit:** 0 production vulnerabilities in `npm audit --omit=dev`.

---

## ♿ WCAG 2.2 AA+ Accessibility Implementation

- **WAI-ARIA Roving Tabindex Keyboard Navigation:** Full keyboard navigation (`ArrowRight`, `ArrowLeft`, `Home`, `End`) across navigation pill tabs conforming to W3C Authoring Practices.
- **Dynamic Screen Reader Status Announcements:** Dedicated [`AriaLiveRegion.tsx`](client/src/components/common/AriaLiveRegion.tsx) component with `aria-live="polite"` announces background scanning, analysis completion, and tab switches to assistive technologies.
- **Colorblind-Safe Design:** Risk badges incorporate redundant visual indicators (distinct iconography + enamel color + explicit text labels + `aria-label`).
- **High-Contrast Typography:** Exceeds WCAG 4.5:1 contrast requirements with deep charcoal typography against porcelain backgrounds.
- **Ethical AI Disclaimer:** Prominent non-lawyer informational disclaimers displayed in the footer and attached to every grounded Q&A citation.

---

## 🧪 Testing & Verification (100% Pass Rate)

LegalLens features dual verification layers: 30 automated Vitest unit/integration tests and an end-to-end full-site benchmark audit.

```bash
# Run all 30 automated unit test suites across workspaces
npm test

# Run the comprehensive 20-check end-to-end system audit
node server/src/__tests__/fullSiteAudit.js
```

### Verification Highlights
- **30 / 30 Automated Vitest Tests Passing (100% Pass Rate):**
  - `server/src/__tests__/cache.test.ts` (4 tests passed) — Sub-5ms retrieval & cache stats
  - `server/src/__tests__/security.test.ts` (6 tests passed) — Zod schema validation, 100k cap, XSS filter
  - `server/src/__tests__/api.test.ts` (8 tests passed) — Endpoints, health, error boundaries
  - `client/src/__tests__/RiskBadge.test.tsx` (3 tests passed) — Accessible ARIA roles
  - `client/src/__tests__/ErrorBoundary.test.tsx` (2 tests passed) — Runtime crash containment
  - `client/src/__tests__/a11y.test.tsx` (4 tests passed) — Roving tabindex, skip link, polite announcements
  - `client/src/__tests__/App.test.tsx` (3 tests passed) — Shell rendering, tab switching without warnings
- **20 / 20 Full-Site Benchmark Checks Passing (100% Accuracy Rate):**
  - Validates clause extraction completeness, liability trap identification, grade-level reduction benchmarking, and verbatim citation traceability.

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js v18+ or v20+
- Git

### 1. Clone & Install
```bash
git clone https://github.com/dheeraj0677/LegalLens.git
cd LegalLens

# Install all dependencies
npm install
```

### 2. Configure Environment
Create a `.env` file in the project root:
```bash
cp .env.example .env
```

```env
# OpenRouter API Key (https://openrouter.ai/keys)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Desired model
OPENROUTER_MODEL=qwen/qwen3.8-27b:free

PORT=5000
CLIENT_URL=http://localhost:5173
```
> **Note:** Even without an API key, LegalLens seamlessly runs its built-in heuristic legal engine so all presets, diffs, and tests function out of the box!

### 3. Start Development Servers
```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **API Server:** [http://localhost:5000](http://localhost:5000)

---

## ⚖️ License & Ethical AI Disclosure

Distributed under the [MIT License](LICENSE). Copyright (c) 2026 Dheeraj (@dheeraj0677) & LegalLens Contributors.

> ⚠️ **Informational Assistance Disclaimer:**
> *LegalLens is an AI-powered document intelligence assistant created to make legal information and basic contracts more accessible and understandable. LegalLens provides informational assistance and does not provide legal advice, representation, or replace consultation with a licensed attorney.*
