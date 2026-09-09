# Architecture & Product Decision Records (ADRs)

This document records every significant architectural, technical, and product decision made for the **GenericMed** platform. It provides persistent AI context to ensure future contributions align with the established design principles and technical constraints.

---

## Table of Contents

- [ADR-001: Selection of React 19, TypeScript, and Vite as the Frontend Core](#adr-001-selection-of-react-19-typescript-and-vite-as-the-frontend-core)
- [ADR-002: Express Backend with Integrated Vite Middleware Architecture](#adr-002-express-backend-with-integrated-vite-middleware-architecture)
- [ADR-003: Regional Logistics Intelligence via Gemini with Google Maps Grounding](#adr-003-regional-logistics-intelligence-via-gemini-with-google-maps-grounding)
- [ADR-004: Multi-Persona Role-Based Access Control (RBAC) System](#adr-004-multi-persona-role-based-access-control-rbac-system)
- [ADR-005: Verified Total-Payable Cost Model vs. Deceptive Base-Price Comparison](#adr-005-verified-total-payable-cost-model-vs-deceptive-base-price-comparison)
- [ADR-006: Immutable Tamper-Evident Regulatory Audit Trail (FR-ADM-04)](#adr-006-immutable-tamper-evident-regulatory-audit-trail-fr-adm-04)
- [ADR-007: D3.js and Motion for Logistics Density & Dispatch Heatmaps](#adr-007-d3js-and-motion-for-logistics-density--dispatch-heatmaps)
- [ADR-008: Dual-Persistence State Strategy (LocalStorage + In-Memory Domain Seed)](#adr-008-dual-persistence-state-strategy-localstorage--in-memory-domain-seed)
- [ADR-009: National 50-Kendra Pilot Distribution & Pincode-Aware Offer Ranking](#adr-009-national-50-kendra-pilot-distribution--pincode-aware-offer-ranking)

---

### ADR-001: Selection of React 19, TypeScript, and Vite as the Frontend Core

- **Date:** 2026-09-01
- **Status:** Accepted

#### Context / Problem
GenericMed is an interactive healthcare e-commerce and regulatory portal requiring instantaneous price recalculations, reactive search filtering across thousands of generic formulations, dynamic modal workflows (prescription upload, pricing comparison, invoice display), and real-time state synchronization across multiple user roles (Customer, Pharmacist, Chemist Partner, Auditor). We needed a modern, lightweight, and type-safe frontend toolchain.

#### Decision Taken
Adopt **React 19** with **TypeScript ~5.8** using **Vite 6** as the build and bundling engine.

#### Reasoning
1. **Sub-millisecond HMR & Build Speed:** Vite leverages native ES modules in development, eliminating the slow bundling overhead of legacy Webpack configurations.
2. **Compile-Time Pharmaceutical Type Safety:** Handling complex pharmaceutical entities (Schedule H/H1 classifications, cold-chain temperature thresholds, GST slabs, and doctor council registration numbers) requires rigorous compile-time type enforcement to prevent fatal runtime errors.
3. **React 19 Concurrency & Performance:** React 19's updated reconciliation algorithms provide stutter-free rendering during rapid filter adjustments and chart interactions.

#### Alternatives Considered
- **Next.js (App Router / SSR):** Considered for SEO, but deferred because the primary application is an authenticated, interactive transaction and regulatory portal. Added overhead of Node server hydration and edge routing was unnecessary for the rapid prototype and pilot phase.
- **Vanilla JavaScript:** Lacked compile-time schema validation for pharmaceutical domain models and component reusability.

#### Impact on Project
- Fast development cycles with instant hot module reloading.
- Strict typing enforced via `src/types.ts`.
- Simple production bundling (`vite build`) producing static browser-optimized assets.

---

### ADR-002: Express Backend with Integrated Vite Middleware Architecture

- **Date:** 2026-09-02
- **Status:** Accepted

#### Context / Problem
The platform requires server-side execution for secure operations (specifically calling the Google Gen AI API with server-side credentials and Google Maps Grounding) while simultaneously serving the single-page application (SPA). We needed a unified server architecture that works identically in local development and production without managing separate ports or complex reverse proxy setups.

#### Decision Taken
Implement a single Node.js Express server (`server.ts`) that runs Vite in middleware mode during development (`process.env.NODE_ENV !== 'production'`) and serves bundled static assets from `dist/` in production.

#### Reasoning
1. **Single Port Execution:** Both API endpoints (`/api/*`) and frontend UI run on `PORT 3000`, eliminating Cross-Origin Resource Sharing (CORS) friction.
2. **Credential Isolation:** Keeps `GEMINI_API_KEY` and other sensitive environment variables strictly on the server, avoiding any client-side bundle leakage.
3. **Deployment Simplicity:** The production build runs cleanly via `tsx server.ts` or bundled `dist/server.cjs`.

#### Alternatives Considered
- **Separate Express Backend (Port 5000) + Vite Dev Server (Port 5173):** Rejected due to CORS setup complexity, dual terminal management, and port conflict risks.
- **Serverless Cloud Functions:** Deferred to future cloud deployment phase; unnecessary complexity during active core platform development.

#### Impact on Project
- Single entry point for both server logic and client SPA.
- Simplified `.env` configuration managed via `dotenv`.

---

### ADR-003: Regional Logistics Intelligence via Gemini with Google Maps Grounding

- **Date:** 2026-09-04
- **Status:** Accepted

#### Context / Problem
Patients ordering generic medicines need verification of real-world licensed pharmacies, Pradhan Mantri Bhartiya Janaushadhi Kendras, hospital medicine dispatch counters, and cold-chain route feasibility based on their specific location or pincode. Hardcoded directories quickly become obsolete and lack dynamic transit intelligence.

#### Decision Taken
Utilize the official Google Gen AI SDK (`@google/genai` v2.4.0) to call `gemini-3.5-flash` with Google Maps Grounding (`tools: [{ googleMaps: {} }]`) using geographic latitude/longitude coordinates via `POST /api/regional-logistics-intel`. Include a robust offline fallback system with verified Jan Aushadhi search URLs for environments where the API key is not configured.

#### Reasoning
1. **Live Geolocation Verification:** Grounding queries in Google Maps provides authentic place metadata, operational hours, verified URLs, and customer review snippets for local pharmacies.
2. **Cold-Chain & Route Feasibility:** The LLM synthesizes route transit times, peak clinic release corridors, and temperature-controlled dispatch capabilities.
3. **Resilient Fallback Mode:** When `GEMINI_API_KEY` is omitted, the endpoint transparently returns a structured regional overview and pre-formatted Jan Aushadhi Kendra search URLs so the UI never breaks.

#### Alternatives Considered
- **Google Places API (Direct REST):** Requires extensive manual filtering, multiple round-trips for reviews and place details, and cannot synthesize narrative transit advice.
- **Static Pincode Directory:** Static database of pharmacies lacks real-time operational status, cold-chain route feasibility, and regional delivery insights.

#### Impact on Project
- Live geographic intelligence embedded in `RegionalDeliveryHeatmap.tsx`.
- Guaranteed uptime even without active cloud credentials through fallback grounding links.

---

### ADR-004: Multi-Persona Role-Based Access Control (RBAC) System

- **Date:** 2026-09-05
- **Status:** Accepted

#### Context / Problem
Indian pharmaceutical regulations (Drugs and Cosmetics Act & Rules, 1945; Rule 65) mandate distinct separation of responsibilities between prescribing doctors, dispensing registered pharmacists, licensed retail chemist partners (Form 20B/21B), and administrative audit officers. Building a customer-only view would fail statutory compliance testing.

#### Decision Taken
Implement a multi-persona architecture supporting 5 dedicated operational roles:
1. `customer`: Medicine discovery, price comparison, Rx upload, order placement, refill management.
2. `pharmacist`: Registered pharmacist verification queue, Rx sign-off, doctor council reg validation.
3. `partner`: Retail chemist / Jan Aushadhi Kendra stock management, batch tracking, packing, dispatch.
4. `admin`: Regulatory compliance officer, immutable audit logs inspection, platform governance.
5. `auth`: Dedicated authentication gateway for role-based sign-in and licensed chemist onboarding.

Include a quick role-switcher in the navigation header to facilitate rapid end-to-end verification during demonstrations and audit reviews.

#### Reasoning
1. **Regulatory Compliance by Design:** Demonstrates complete compliance with CDSCO guidelines by requiring pharmacist sign-off before order processing.
2. **Realistic End-to-End Testing:** Allows pairing customer actions directly with downstream partner and pharmacist actions in real time.

#### Alternatives Considered
- **Role separation via distinct subdomain portals:** High setup overhead; complicates unified state management during pilot testing.
- **Single monolithic interface:** Would confuse regulatory compliance by mixing patient browsing with pharmacist verification actions.

#### Impact on Project
- Clear separation of component views in `src/components/`.
- Dynamic UI adaptation based on `currentRole`.

---

### ADR-005: Verified Total-Payable Cost Model vs. Deceptive Base-Price Comparison

- **Date:** 2026-09-03
- **Status:** Accepted

#### Context / Problem
Most online medicine platforms advertise artificially low base prices for generic medicines, only to add hidden packaging charges, doorstep delivery surcharges, and high minimum order constraints at checkout. This creates distrust among chronic patients seeking genuine savings.

#### Decision Taken
Enforce the **Verified Total-Cost Comparison** principle across the entire system:
$$\text{Total Payable Cost} = \text{Base Price} + \text{Delivery Fee} + \text{Packaging Fee} + \text{Applicable GST}$$

Every medicine offer displayed must explicitly show:
- Base generic price.
- Verified packaging and delivery fees.
- Percentage savings calculated against verified Branded MRP.
- Active ingredient bioequivalence confirmation.

#### Reasoning
1. **Patient Trust & Retention:** Chronic patients (diabetes, hypertension) budget monthly; total-cost transparency builds loyalty and minimizes abandoned carts.
2. **Consumer Protection E-Commerce Rules (2020) Compliance:** Forbids drip pricing and misleading discounts.

#### Alternatives Considered
- **Base-Price Sorting:** Standard in general e-commerce; rejected as misleading in healthcare.
- **Subsidized Flat Delivery Markup:** Unrealistic for hyper-local chemist partners operating on tight margins.

#### Impact on Project
- Standardized calculation helpers in `src/types.ts` (`Offer.totalPayableCost`).
- Transparent breakdown modals in `PriceComparisonModal.tsx`.

---

### ADR-006: Immutable Tamper-Evident Regulatory Audit Trail (FR-ADM-04)

- **Date:** 2026-09-05
- **Status:** Accepted

#### Context / Problem
Under Indian pharmaceutical law, dispensing Schedule H and H1 prescription medicines requires verifiable records of who uploaded the prescription, which registered pharmacist validated it (including Council Registration Number), which licensed chemist dispensed it, and the corresponding invoice numbers.

#### Decision Taken
Implement an immutable `AuditEvent` log pattern throughout the application state:
- Every authentication, prescription upload, pharmacist review (approval/rejection/clarification), order booking, and stock adjustment generates a timestamped `AuditEvent` record.
- Records are displayed in a dedicated `AdminAuditView.tsx` with filtering by action, actor, and role, plus JSON audit export capabilities.

#### Reasoning
1. **Statutory Inspection Readiness:** State Drug Control inspectors can review the digital register at any moment.
2. **Non-Repudiation:** Clear audit logs prevent disputes regarding unauthorized substitution or dispensing without a valid prescription.

#### Alternatives Considered
- **Ephemeral Browser Console Logs:** Completely unacceptable for regulatory compliance.
- **Database-only logging without UI:** Prevents immediate demonstration of compliance during audits and demos.

#### Impact on Project
- Central `logAuditEvent()` helper invoked across all critical state-transition handlers in `App.tsx`.
- Transparent regulatory inspection via Admin Audit Cockpit.

---

### ADR-007: D3.js and Motion for Logistics Density & Dispatch Heatmaps

- **Date:** 2026-09-06
- **Status:** Accepted

#### Context / Problem
Generic medicine distribution involves local delivery bottlenecks, especially during peak Outpatient Department (OPD) clinic release hours (10:00–13:00 and 17:00–21:00) and in specific geographic delivery clusters. Simple bar charts fail to communicate spatial density and real-time route congestion.

#### Decision Taken
Integrate **D3.js (v7)** for SVG coordinate calculations, color-scale interpolations, and heatmap matrix rendering, combined with **Motion (Framer Motion v12)** for micro-interactions, tab transitions, and real-time status pulses.

#### Reasoning
1. **Mathematical Precision:** D3 provides granular control over color interpolation scales (`d3.interpolateYlGnBu` / `d3.interpolateInferno`) for multi-dimensional logistics matrices.
2. **Smooth Visual Feedback:** Motion ensures smooth transitions between customer discovery, order tracking progress timelines, and role switcher transitions.

#### Alternatives Considered
- **Heavy GIS Frameworks (e.g. Leaflet / Mapbox GL):** Overkill for schematic cluster heatmaps; adds external tile server dependencies.
- **Static CSS Grid Tables:** Lacks dynamic density interpolation and interactive tooltips.

#### Impact on Project
- Implemented in `RegionalDeliveryHeatmap.tsx` and `PeakHoursHeatmap.tsx`.
- Standout visual excellence for logistics intelligence and delivery SLA monitoring.

---

### ADR-008: Dual-Persistence State Strategy (LocalStorage + In-Memory Domain Seed)

- **Date:** 2026-09-07
- **Status:** Accepted

#### Context / Problem
During pilot testing, demonstrations, and offline development, users frequently refresh the page. We needed persistent authentication sessions and role memory without requiring a full relational database server setup for the client demo.

#### Decision Taken
Adopt a dual-persistence strategy:
1. **Persistent Session Keys:** User profile, authenticated role, and login status are persisted in `localStorage` under `genericmed_auth_user`, `genericmed_auth_role`, and `genericmed_is_authenticated`.
2. **Rich Domain Mock Seeds:** In-memory state is initialized with comprehensive, realistic Indian pharmaceutical data (`src/data/mockData.ts` and `src/data/regionalDeliveryData.ts`), updated reactively during the user session.

#### Reasoning
1. **Zero-Setup Reliability:** The application runs immediately out of the box after cloning without requiring database migrations or local Docker containers.
2. **Session Continuity:** Refreshing the browser maintains user identity, role, and active pincode.

#### Alternatives Considered
- **SQLite / IndexedDB:** Excessive complexity for current prototype phase.
- **Pure In-Memory State:** Lost all session data on browser refresh, creating friction during testing.

#### Impact on Project
- Consistent user experience during local development and product presentations.
- Easy migration path to REST/GraphQL APIs with PostgreSQL in future phases.

---

### ADR-009: National 50-Kendra Pilot Distribution & Pincode-Aware Offer Ranking

- **Date:** 2026-09-08
- **Status:** Accepted

#### Context / Problem
Demonstrating true regulatory and supply-chain viability requires moving beyond single-neighborhood mock data. Indian generic drug distribution depends on licensed retail chemist corridors and government-backed **Pradhan Mantri Bhartiya Janaushadhi Kendras (PMBJK)** situated near major hospital clusters. Furthermore, delivery fees and cold-chain integrity vary significantly across geographic radiuses.

#### Decision Taken
1. Expand the partner network to 50 verified pilot stores spanning 5 critical healthcare corridors:
   - **Mumbai MMR** (15 stores: Worli, Parel, Bandra, Fort, Dadar, Andheri, Thane, Vashi).
   - **Pune Hub** (9 stores: Kothrud, Deccan, Shivajinagar, Camp, Hadapsar, Pimpri).
   - **Delhi NCR** (9 stores: AIIMS Ansari Nagar, Saket, Connaught Place, Hauz Khas, GK, Gurugram, Noida).
   - **Bengaluru** (9 stores: Koramangala, Indiranagar, HSR Layout, Whitefield, MG Road, Jayanagar).
   - **Hyderabad** (8 stores: HITEC City, Gachibowli, Banjara Hills, Jubilee Hills, Secunderabad, Kukatpally).
2. Implement a national pincode resolver (`getPincodeServiceability`) and interactive `PincodeServiceabilityModal.tsx`.
3. Dynamically sort medicine offers in `getOffersForMedicine()` by geographic proximity (exact PIN $\rightarrow$ same city $\rightarrow$ lowest total payable cost).
4. Integrate a dedicated `PilotMetricsView.tsx` into the Operations & Audit Cockpit to track Phase 1 SLAs (hyperlocal delivery &lt; 60 mins, cold-chain &lt; 8°C, and Rule 65 statutory compliance).

#### Reasoning
1. **Realistic Indian Healthcare Logistics:** 6-digit postal PIN codes are the standard administrative unit for medicine delivery logistics, cold-chain courier dispatch, and GST billing in India.
2. **Patient Trust & SLA Accuracy:** Displaying nearby Kendras with verifiable Form 20B/21B licenses and real-time delivery fee computation eliminates unexpected delivery surcharges.
3. **Statutory Inspection Readiness:** State Drug Control inspectors require visibility over which local licensed chemist fulfilled an order.

#### Alternatives Considered
- **Single Centralized Mega-Warehouse:** Unworkable for acute prescription delivery (e.g. anti-infectives, antipyretics) and cold-chain insulin requiring same-day doorstep transit.
- **Browser GPS-Only Coordinates:** GPS coordinates lack postal district boundaries required for Indian GST invoicing (State Tax SGST/CGST) and drug license jurisdiction.

#### Impact on Project
- Seamless switching between 50 pilot Kendras across 5 metropolitan clusters.
- Dynamic localized pricing and delivery fee calculation in search and checkout.
- Clear Phase 1 operational KPI monitoring in the Admin Cockpit.
