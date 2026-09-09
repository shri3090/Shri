# GenericMed Project Rules & AI Assistant Guidelines

> **CRITICAL DIRECTIVE FOR ALL AI ASSISTANTS:**
> **Never break, remove, or regress existing functionality unless the user explicitly commands it.** Always inspect existing components, types, and state handlers before refactoring or introducing new code.

---

## 1. Prime Directives & Invariants

1. **Non-Destructive Evolution:**
   - Always preserve working business logic, state variables, and callbacks.
   - When introducing a new feature, seamlessly integrate with the existing 5 user roles (`customer`, `pharmacist`, `partner`, `admin`, `auth`).
   - Maintain full backwards compatibility with `src/types.ts` schemas.

2. **Pharmaceutical & Regulatory Accuracy:**
   - Always treat Indian drug regulatory categories strictly according to the **Drugs and Cosmetics Rules, 1945**:
     - `Schedule H`: Requires physical or verified digital prescription signed by a registered medical practitioner. No OTC dispensing allowed.
     - `Schedule H1`: Requires mandatory prescription, recorded in a separate register with 3-year record retention (e.g. 3rd/4th generation antibiotics, psychotropics).
     - `Schedule X`: High-dependence drugs requiring triplicate prescription records; strictly flagged in UI.
     - `OTC`: Non-prescription items permitted for direct checkout.
   - Always display Indian Pharmacopoeia (`IP`), British Pharmacopoeia (`BP`), or United States Pharmacopeia (`USP`) quality badge where active salt is shown.

3. **Pricing Integrity & Transparency:**
   - Always enforce the total payable cost equation:
     $$\text{totalPayableCost} = \text{basePrice} + \text{deliveryFee} + \text{packagingFee} + \text{tax}$$
   - Never show a discounted price without showing the base breakdown and verified branded MRP comparison.

---

## 2. Coding Standards

### TypeScript & React Guidelines
- **Strict Typing:** All new files, components, and utilities must be written in TypeScript (`.ts` / `.tsx`).
  - Do not use `any` unless wrapping an untyped external SDK payload (e.g. Gemini raw grounding chunks). Even then, immediately parse and validate into a strict type.
  - Define all domain interfaces and union types in `src/types.ts`. Avoid local duplicate type declarations.
- **Functional Components & React 19:**
  - Use standard functional components with hooks.
  - Optimize heavy computations (such as multi-criterion medicine filtering or D3 coordinate mappings) with `useMemo` and `useCallback`.
  - Preserve functional state updates: `setState(prev => ...)` when mutating arrays or nested objects.
- **Defensive API Calls:**
  - Wrap all asynchronous network requests (`fetch`, SDK calls) in `try / catch` blocks.
  - Always provide deterministic fallbacks so the UI remains operational when offline or when external API keys are missing.

```typescript
// Example: Standard async API handler with graceful fallback
async function fetchLogisticsIntel(pincode: string): Promise<LogisticsResult> {
  try {
    const response = await fetch('/api/regional-logistics-intel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pincode }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('API call failed, using verified fallback:', error);
    return getOfflineFallbackLogistics(pincode);
  }
}
```

---

## 3. Folder & File Structure Rules

Maintain strict separation of concerns across the directory tree:

```
s:/My Project/Shri/
├── server.ts                 # Express backend entry point & Vite middleware integration
├── index.html                # Main HTML template & root DOM anchor
├── package.json              # Dependencies and scripts (React 19, Vite, Express, @google/genai)
├── tsconfig.json             # TypeScript compiler configuration
├── vite.config.ts            # Vite plugins configuration (React, Tailwind)
├── metadata.json             # AI agent project metadata and major capabilities
├── decisions.md              # Persistent Architecture Decision Records (ADRs)
├── rules.md                  # Project rules and engineering guidelines (This file)
├── memory.md                 # Persistent long-term project memory
├── changelog.md              # Chronological version and release history
├── public/                   # Static public assets (favicons, SVG logos)
└── src/
    ├── main.tsx              # React client mount point
    ├── App.tsx               # Root application controller, multi-role dispatcher & state coordinator
    ├── index.css             # Tailwind v4 import directives and custom utility classes
    ├── types.ts              # Single source of truth for all domain interfaces and models
    ├── components/           # Modular view components and interactive modals
    │   ├── Header.tsx                 # Global navigation, role switcher & pincode selector
    │   ├── AuthScreen.tsx             # Multi-role authentication & chemist onboarding
    │   ├── MedicineCard.tsx           # Product display card with bioequivalence badge
    │   ├── PriceComparisonModal.tsx   # Verified total-payable cost breakdown modal
    │   ├── PrescriptionUploadModal.tsx# Digital Rx upload & mock OCR extraction
    │   ├── CartModal.tsx              # Cart drawer & transparent checkout breakdown
    │   ├── OrderTrackingView.tsx      # Multi-step order fulfillment tracker & invoice
    │   ├── SavingsAndRefillsView.tsx  # Chronic care 30-day refill manager
    │   ├── PharmacistQueueView.tsx    # Registered Pharmacist verification console
    │   ├── PartnerPharmacyView.tsx    # Chemist inventory & batch fulfillment portal
    │   ├── AdminAuditView.tsx         # Tamper-evident regulatory audit log viewer
    │   ├── RegionalDeliveryHeatmap.tsx# D3-powered regional logistics density viewer
    │   ├── PeakHoursHeatmap.tsx       # OPD clinic release hours congestion matrix
    │   ├── DigitalInvoiceModal.tsx    # GSTIN-compliant digital invoice generator
    │   ├── PrdComplianceModal.tsx     # PRD specifications & statutory compliance guide
    │   └── SupportModal.tsx           # Pharmacist hotline & dispute resolution
    └── data/
        ├── mockData.ts                # Initial seed data for medicines, partners, and orders
        └── regionalDeliveryData.ts    # Geographic logistics metrics & pincode clusters
```

### Placement Invariants
- **Backend API Routes:** Add new backend endpoints exclusively inside `server.ts` or in an `api/` subfolder if modularized.
- **Frontend Components:** Place reusable UI elements in `src/components/`.
- **Domain Models:** Export all shared types from `src/types.ts`. Never define shared models inside component files.
- **Static Seeds:** Place reference pharmaceutical catalogs and mock data in `src/data/`.

---

## 4. Naming Conventions

| Entity Type | Convention | Examples |
| :--- | :--- | :--- |
| **Component Files** | `PascalCase.tsx` | `MedicineCard.tsx`, `CartModal.tsx` |
| **Utility & Data Files** | `camelCase.ts` | `mockData.ts`, `regionalDeliveryData.ts` |
| **Type & Interface Names** | `PascalCase` | `Medicine`, `PharmacyPartner`, `AuditEvent` |
| **Union Role Literals** | `lowercase` | `'customer'`, `'pharmacist'`, `'partner'`, `'admin'` |
| **Functions & Handlers** | `camelCase` | `handleAddToCart()`, `calculateTotalSavings()` |
| **Global Constants** | `UPPER_SNAKE_CASE` | `INITIAL_USER`, `PHARMACY_PARTNERS`, `PORT` |
| **DOM Element IDs** | `kebab-case` with descriptive prefix | `id="btn-hero-upload-rx"`, `id="input-medicine-search"` |
| **CSS Utility Classes** | Tailwind standard | `bg-emerald-600`, `text-neutral-900`, `shadow-xs` |

---

## 5. UI/UX Consistency & Design System

The GenericMed aesthetic communicates clinical trust, regulatory compliance, and total financial transparency.

### Color Tokens & Semantics
- **Primary Clinical Brand:** Emerald & Teal
  - Primary Action / Brand: `emerald-600` (hover: `emerald-700`)
  - Deep Clinical Background: `from-emerald-800 to-teal-900`
  - Subtle Badges: `bg-emerald-50 text-emerald-800 border-emerald-200`
- **Attention & Regulatory Warnings:** Amber
  - Pending Review / In Queue: `bg-amber-100 text-amber-800 border-amber-300`
  - Low Stock Warning: `bg-amber-50 text-amber-700`
- **Errors & Statutory Rejections:** Rose
  - Rejected Rx / Cold-Chain Breach: `bg-rose-100 text-rose-800 border-rose-300`
- **Surfaces & Borders:** Neutral Slate / Zinc
  - App Background: `bg-neutral-100`
  - Card Surfaces: `bg-white border-neutral-200`
  - Muted Text: `text-neutral-500` / `text-neutral-400`

### Formatting Standards
1. **Currency:**
   - Always prefix prices with the Indian Rupee symbol: `₹`.
   - Format numeric currency values using `toFixed(2)` (e.g. `₹42.50`) or whole numbers for rounded MRPs.
2. **Dates & Timestamps:**
   - Use Indian locale formatting: `new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })`.
   - Display relative time badges for stock freshness (e.g. `"Just now (Partner Feed)"`, `"12 mins ago"`).
3. **Interactive Accessibility & Testing:**
   - Every interactive button, input, tab, and card must have a unique, semantic `id` attribute to support end-to-end browser automation.

---

## 6. Git Commit Rules

Follow the **Conventional Commits** specification. Every commit must have a clear, lowercase prefix indicating the nature of the change:

- `feat:` A new feature for the user or portal (e.g., `feat: add digital invoice PDF export`).
- `fix:` A bug fix in existing behavior (e.g., `fix: correct GST slab calculation in cart drawer`).
- `docs:` Documentation updates only (e.g., `docs: update ADR-003 with Gemini fallback details`).
- `style:` Formatting, whitespace, or CSS styling tweaks without code logic changes.
- `refactor:` Code refactoring that neither fixes a bug nor adds a feature.
- `perf:` Performance optimizations (e.g., memoizing D3 rendering calculations).
- `test:` Adding or adjusting automated tests.
- `chore:` Tooling, dependencies, or build pipeline updates.

### Rules for Commit Messages
- Write in the imperative mood: `"feat: add role-based auth"` instead of `"feat: added role-based auth"`.
- Keep the summary line under 72 characters.
- If breaking changes are unavoidable, append `!` (e.g. `feat!: change offer data schema`) and describe the migration in the body.

---

## 7. Security, Privacy & Environment Variable Rules

1. **Zero Secret Leakage:**
   - **Never** hardcode API keys, secrets, or bearer tokens in client-side code (`src/`).
   - Store sensitive keys in `.env` and load them exclusively on the server (`server.ts`).
   - Always commit a sanitized `.env.example` showing the necessary variable keys without real values.
2. **Server-Side AI Access:**
   - Never initialize `@google/genai` on the browser client. All generative calls and Maps Grounding must route through `server.ts`.
3. **Patient Health Information (PHI) & Prescription Data:**
   - Treat uploaded prescription images and patient demographic records with strict privacy (conforming to DISHA guidelines).
   - Never log full doctor-patient clinical notes to unauthenticated public endpoints.
   - Restrict access to prescription review queues to users logged in with the `pharmacist` or `admin` role.
4. **Input Validation:**
   - Validate Indian PIN codes as 6-digit numeric strings (`/^[1-9][0-9]{5}$/`).
   - Validate GSTIN format (`/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`) for chemist partner registrations.
   - Validate Pharmacist Council Registration Numbers before granting verification privileges.

---

## 8. Development & Verification Checklist

Before finalizing any modification, AI assistants must verify:

- [ ] Does `npm run lint` (`tsc --noEmit`) pass with zero TypeScript compiler errors?
- [ ] Are all 5 user roles (`customer`, `pharmacist`, `partner`, `admin`, `auth`) operational?
- [ ] Does the regional logistics endpoint handle missing `GEMINI_API_KEY` gracefully without crashing?
- [ ] Are all prices, taxes, and savings percentages mathematically accurate?
- [ ] Is every state transition accompanied by a corresponding `logAuditEvent()` call?
- [ ] Did you preserve all existing component IDs and click handlers?
