# Changelog

All notable changes to the **GenericMed** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.7.0] - 2026-09-09 (Phase 4: Vernacular Multilingual i18n + National Tier 2/3/4 Pincode Expansion)

### Added
- **Vernacular Localisation Engine (`src/i18n/index.ts`):**
  - Supports 7 Indian languages: English, Hindi (हिन्दी), Marathi (मराठी), Tamil (தமிழ்), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Bengali (বাংলা).
  - 80-key `Translations` interface covering app/header labels, customer tabs, hero section, search bar, category pills, medicine card, cart/checkout, prescription statuses, and common actions.
  - All 7 language objects fully populated with authentic native-script strings verified for correct Devanagari, Tamil, Telugu, Kannada, and Bengali Unicode.
  - `LocaleContext` + `LocaleProvider` with `localStorage` persistence under `genericmed_locale`.
  - `useLocale()` hook returning `{ locale, setLocale, t }` for any component.
  - `LOCALE_META` record with native script name, English name, flag emoji, and script block per locale.
- **Language Switcher (`VernacularSwitcher.tsx`):**
  - Compact pill button in the Header showing current language in native script.
  - Dropdown (closes on outside click) lists all 7 locales with flag + native name + English name + active checkmark.
  - Accessible: `aria-haspopup="listbox"`, `aria-expanded`, `role="option"`, `aria-selected`.
  - `id="vernacular-switcher"` and `id="lang-option-{code}"` for each option.
- **National Tier 2/3/4 Pincode Expansion (`regionalDeliveryData.ts`):**
  - 8 new `RegionalDeliveryZone` records: Chennai, Kolkata, Ahmedabad, Jaipur, Nagpur, Lucknow, Kochi, Chandigarh.
  - 25 new `PincodeServiceabilityInfo` entries merged into `PINCODE_DIRECTORY` via `Object.assign`.
  - `TIER2_PREFIX_MAP` for 2-digit prefix inference covering Tamil Nadu (60), West Bengal (70), Gujarat (38), Rajasthan (30), Nagpur (44), Uttar Pradesh (22), Kerala (68), Chandigarh (16).
  - `getTier2PincodeServiceability()` enhanced resolver exported for optional upstream use.
  - `TIER2_CITIES` const array (8 entries with name, state, samplePin, flag) exported for UI quick-select.
- **`PincodeServiceabilityModal.tsx` — Phase 4 City Quick-Select:**
  - Phase 1 cluster heading relabelled to "Phase 1 Pilot Clusters (Metro)".
  - New "Phase 4 National Expansion (Tier 2 / 3 Cities)" section below: 2×4 grid of city buttons with flag emoji, city name, state, and representative pincode. Blue active state distinct from the emerald metro style.
  - All 8 Tier 2 city buttons have `id="pincode-tier2-{pin}"` for test automation.

### Changed
- **`main.tsx`:** Wrapped `<App />` in `<LocaleProvider>` so the locale context is available to all components from root.
- **`Header.tsx`:** Imported `useLocale` + `VernacularSwitcher`. Inserted `<VernacularSwitcher />` between PRD Specs and Helpline buttons. Translated `deliverTo`, `prdSpecs`, `helpline` strings via `t`.
- **`App.tsx`:** Imported `useLocale`, added `const { t } = useLocale()`. Translated: hero badge, headline, subtext, both CTA buttons; search placeholder, bio-equivalence banner (label + suffix + average saving), results count line, sort label, reset button; all 8 category pill labels.
- **`MedicineCard.tsx`:** Imported `useLocale`. Translated: Generic IP badge, Rx required label, "Verified Total Payable", savings percent badge + `vs Branded MRP`, delivery estimate line, Compare Prices button, Add to Cart button.

---



### Added
- **ERP / POS Bidirectional Sync (`ErpSyncView.tsx`):**
  - Full connector panel inside the Chemist Partner Portal with 3 sub-tabs: **Connectors**, **Catalogue**, and **Webhook Log**.
  - Supports 4 Indian pharmacy ERP systems: **Marg ERP 9.9**, **Mediman 4.2**, **POSibolt 3.1**, and **Vyapar 17.4**.
  - Each connector card displays live state badge (`connected` / `syncing` / `error` / `disconnected`), last sync timestamp, next scheduled sync, total items synced, and pending item count.
  - Auto-sync toggle (calls `PATCH /api/erp/sync-status/:id/toggle-auto`), expand panel for API key (masked) and config details.
  - **Simulate Webhook** button fires a `STOCK_UPDATE` event to `POST /api/erp/webhook` and updates state live.
  - Catalogue tab lists all 4 ERP systems with one-click **Connect** button (optimistic UI update, 1.4s simulated handshake).
  - Webhook Log tab shows all inbound events with event-type colour-coded badges and item-level batch/expiry/price details.
- **IoT Cold-Chain Telemetry Monitor (`ColdChainMonitorView.tsx`):**
  - Deployed in both the **Admin Cockpit** (`Cold-Chain IoT` tab) and the **Chemist Partner Portal** (`Cold-Chain IoT` tab).
  - KPI summary row: Active sensors, Breach count, Warning count, Unresolved alerts.
  - **Sensors tab:** Clickable sensor list (status dot + live temp + battery + last ping) with right-side D3.js 48-hour temperature timeline chart.
    - D3 chart: `scaleTime` × `scaleLinear`, emerald safe-zone rect (2–8°C), dashed threshold lines, catmull-rom spline line, red circle markers on breach readings.
  - **Alerts tab:** Unresolved alerts with severity badges (Critical / Warning / Info), `Acknowledge` button calling `PATCH /api/cold-chain/alerts/:id/acknowledge`, order-linked breach warnings.
  - **Compliance Cert tab:** Auto-generated CDSCO Schedule M compliance certificate per sensor — avg/min/max temp, breach count, compliant/non-compliant verdict, and **downloadable `.txt` audit document**.
- **6 IoT Sensors seeded** across Mumbai, Delhi NCR, Bengaluru, Pune, and Hyderabad covering Insulin & Biologics, Vaccines, Eye Drops, and General Refrigerated categories.
- **97-point 48-hour temperature history** per sensor (sampled every 30 min) with simulated breach window for the AIIMS Delhi transit sensor.
- **4 cold-chain alerts** seeded: 2 Critical (AIIMS breach, Kothrud offline), 1 Warning (Parel vaccine fridge), 1 Info/resolved (Worli insulin bay audit).
- **Phase 3 Backend API Routes (`server.ts`):**
  - `GET /api/erp/systems` — full ERP system catalogue.
  - `GET /api/erp/sync-status`, `GET /api/erp/sync-status/:partnerId` — sync status per partner.
  - `POST /api/erp/webhook` — inbound ERP/POS webhook receiver; updates sync status and logs payload.
  - `PATCH /api/erp/sync-status/:id/toggle-auto` — toggles auto-sync flag.
  - `GET /api/cold-chain/sensors` — all sensors with optional `?partnerId=` filter.
  - `GET /api/cold-chain/readings/:sensorId` — 48h ordered readings for a sensor.
  - `GET /api/cold-chain/readings-by-order/:orderId` — readings + sensor for a shipment.
  - `GET /api/cold-chain/alerts` — all alerts with optional `?resolved=true/false` filter.
  - `POST /api/cold-chain/alert` — inbound IoT alert; updates sensor live temp and status, appends reading, creates breach alert.
  - `PATCH /api/cold-chain/alerts/:id/acknowledge` — marks alert resolved with acknowledger name.

### Changed
- **`PartnerPharmacyView.tsx`:** Added purple tab switcher bar with 3 tabs — **Inventory & Orders** (existing content preserved), **ERP / POS Sync** (new `ErpSyncView`), **Cold-Chain IoT** (new `ColdChainMonitorView` filtered by `partnerId`).
- **`AdminAuditView.tsx`:** Added 4th tab **Cold-Chain IoT** (id `tab-admin-cold-chain`) rendering global `ColdChainMonitorView` alongside existing Pilot Cockpit, Audit Logs, and Logistics Heatmap tabs.
- **`src/types.ts`:** Added `ErpSystem`, `ErpSystemName`, `ErpSyncState`, `ErpSyncStatus`, `ErpWebhookPayload`, `ColdChainSensor`, `ColdChainSensorStatus`, `ColdChainReading`, `ColdChainAlert`, `ColdChainAlertSeverity`.
- **`src/data/mockData.ts`:** Added `ERP_SYSTEMS`, `INITIAL_ERP_SYNC_STATUSES`, `RECENT_ERP_WEBHOOKS`, `COLD_CHAIN_SENSORS`, `COLD_CHAIN_READINGS` (via `buildReadings` helper), `INITIAL_COLD_CHAIN_ALERTS`.

---



### Added
- **Full REST API Layer (`server.ts`):**
  - `GET /api/db-status` — Real-time PostgreSQL connectivity check, latency measurement, and entity count telemetry.
  - `POST /api/db-seed` — Seeds the PostgreSQL database from domain mock data via Prisma ORM.
  - `GET /api/medicines`, `GET /api/medicines/:id` — Medicine catalog with optional `?q=` text search and `?schedule=` filter.
  - `GET /api/partners` — Pharmacy partner list with optional `?city=` and `?pincode=` filters.
  - `GET /api/offers`, `PATCH /api/offers/:id/stock` — Offers with proximity-ranked pincode sorting; partner stock state and count updates.
  - `GET /api/prescriptions`, `PATCH /api/prescriptions/:id/review` — Prescription queue with status filter; pharmacist review (Verified / Rejected / Clarification Requested).
  - `GET /api/orders`, `POST /api/orders` — Order history retrieval and new order creation.
  - `GET /api/audit-events`, `POST /api/audit-events` — Immutable audit log read (with `?limit=`) and write endpoints.
- **Database Status Badge (`AdminAuditView.tsx`):**
  - Live `GET /api/db-status` fetch on component mount renders an emerald (PostgreSQL) or amber (in-memory fallback) status pill showing provider, latency, and entity counts (partners, medicines, audit records).
  - Badge `id="db-status-badge"` for end-to-end test automation targeting.

### Changed
- **`App.tsx` — API-Hydrated State Bootstrap:**
  - Replaced static `useState(MOCK_DATA)` initializations for medicines, offers, partners, prescriptions, orders, and audit logs with a `useCallback`-wrapped `bootstrapData()` function executed via `useEffect` on first render.
  - Uses `Promise.allSettled` across all 6 API routes; each dataset falls back silently to its in-memory seed if the API response is empty or fails (zero regressions to offline / no-DB mode).
  - `medicines` and `partners` are now full `useState` variables (were previously `const` frozen).
- **`App.tsx` — Fire-and-Forget API Persistence:**
  - `handleOrderCompleted` — POSTs new order to `POST /api/orders`.
  - `logAuditEvent` — POSTs every audit event to `POST /api/audit-events`.
  - `handleUpdateOfferStock` — PATCHes stock state and count to `PATCH /api/offers/:id/stock`.
  - `handleApproveRx`, `handleRejectRx`, `handleRequestClarification` — Each PATCHes prescription review status to `PATCH /api/prescriptions/:id/review`.
- **`server/db.ts` — Import Naming Fix:**
  - Corrected import of `INITIAL_AUDIT_LOGS` (was incorrectly referenced as `INITIAL_AUDIT_EVENTS`) and `INITIAL_REFILLS` (was incorrectly referenced as `REFILL_REMINDERS`) from `src/data/mockData.ts`. Internal aliases maintain backward compatibility with all existing downstream usages.

---



### Added
- **Phase 1 Pilot Network of 50 Jan Aushadhi Kendras & Licensed Partners:**
  - Expanded verified pharmacy partner network from 5 to 50 active stores spanning 5 key healthcare corridors: Mumbai MMR (15 stores), Pune Hub (9 stores), Delhi NCR (9 stores), Bengaluru (9 stores), and Hyderabad (8 stores).
  - Configured state-authentic Form 20B/21B drug licenses, 15-character GSTINs, and verified quality badges.
- **National Pincode Serviceability & Nearest Kendra Discovery Engine (`PincodeServiceabilityModal.tsx`):**
  - Interactive postal code lookup dialog with 6-digit PIN validation, live delivery SLA calculation (hyperlocal bike vs. regional express), courier fee estimation, and cold-chain readiness indicators.
  - 1-click popular healthcare corridor selectors for Mumbai, Pune, Delhi NCR, Bengaluru, and Hyderabad.
  - Nearby Jan Aushadhi Kendra list displaying verified distance, license numbers, and store ratings.
- **Pincode-Aware Proximity Offer Ranking:**
  - Updated `getOffersForMedicine` in `App.tsx` to automatically prioritize offers from chemists matching the active delivery PIN code, then matching city, before falling back to lowest total payable cost.
- **Phase 1 Pilot Performance & Statutory Compliance KPI Cockpit (`PilotMetricsView.tsx`):**
  - Live telemetry dashboard tracking 5 core pilot KPIs: 50/50 stores onboarded (100% Form 20B/21B verified), 98.4% cold-chain transit integrity, 32.8 min average delivery SLA, ₹15.48L total patient savings, and 11.4 min prescription verification turnaround.
  - CDSCO Rule 65 statutory compliance checklist verifying registered pharmacist presence, digital register maintenance, and WORM-compliant audit trails.
- **Grouped Store Selector in Partner Chemist Portal (`PartnerPharmacyView.tsx`):**
  - Grouped `<optgroup>` store selector categorized by city cluster, enabling chemist operators to manage inventory and pack orders across all 50 pilot locations.

### Changed
- **Global Header Delivery Pill (`Header.tsx`):**
  - Dynamically displays resolved city name and PIN code (e.g. "Deliver to: Delhi 110029", "Deliver to: Bengaluru 560034").
- **Admin & Operations View (`AdminAuditView.tsx`):**
  - Added multi-tab navigation: `[Phase 1 Pilot Cockpit (50 Stores)]`, `[Audit Logs]`, and `[Logistics Heatmap]`.

---

## [0.3.0] - 2026-09-08

### Added
- **Persistent AI Context Foundation:** Created `decisions.md`, `rules.md`, `memory.md`, and `changelog.md` to establish persistent architectural, operational, and contextual continuity across development sessions.
- **Role-Based Authentication & Onboarding Gateway (`AuthScreen.tsx`):**
  - Dedicated sign-in and registration portal supporting Customers, Registered Pharmacists, Chemist Partners, and Audit Officers.
  - Form validation for Indian Pharmacist Council Registration Numbers and Chemist GSTIN / Drug License Numbers (Form 20B/21B).
  - Session state persistence via browser `localStorage` (`genericmed_auth_user`, `genericmed_auth_role`, `genericmed_is_authenticated`).
- **Google Maps Grounded Regional Logistics Intel (`/api/regional-logistics-intel`):**
  - Server-side integration with `@google/genai` (v2.4.0) invoking `gemini-3.5-flash` with Google Maps tool (`tools: [{ googleMaps: {} }]`).
  - Real-time place metadata extraction, grounding links, and localized pharmacy review snippets.
  - Resilient offline fallback generator returning pre-formatted Jan Aushadhi search corridors when `GEMINI_API_KEY` is not present.
- **D3-Powered Peak Hours Congestion Heatmap (`PeakHoursHeatmap.tsx`):**
  - Heatmap visualizer displaying delivery transit latency correlated with hospital Outpatient Department (OPD) clinic release corridors (10:00–13:00 and 17:00–21:00).
- **PRD Statutory Compliance Guide (`PrdComplianceModal.tsx`):**
  - Interactive reference modal outlining regulatory adherence to the Indian Drugs and Cosmetics Rules (Rule 65), Telemedicine Practice Guidelines, and Consumer Protection E-Commerce Rules.

### Changed
- **Global Header & Navigation Controller (`Header.tsx`):**
  - Added user identity pill displaying authenticated name, council registration badge, and 1-click Sign Out button.
  - Integrated dedicated `Auth` portal tab and quick role switcher.
- **Application Controller Refactor (`App.tsx`):**
  - Wired `handleAuthSuccess` and `handleLogout` state handlers with automated `logAuditEvent()` triggers.
  - Added notification toast alerts for all authentication, cart, and prescription review events.

### Fixed
- **Logistics Intel Exception Handling:** Prevented unhandled promise rejections on the Express server when external AI rate limits or network dropouts occur.
- **Address Synchronization:** Synchronized patient default pincode across the active search bar, logistics heatmaps, and checkout drawers.

### Removed
- **Unauthenticated Mock Switcher:** Replaced primitive mock profile toggles with authentic role-based sign-in and session-managed personas.

---

## [0.2.0] - 2026-09-05

### Added
- **Registered Pharmacist Verification Queue (`PharmacistQueueView.tsx`):**
  - Verification console for licensed pharmacists to inspect uploaded patient prescriptions.
  - Clinical decision actions: `Approve` (advancing orders to pharmacy processing), `Reject` (with clinical rationale), and `Request Clarification`.
- **Licensed Chemist Partner Management Portal (`PartnerPharmacyView.tsx`):**
  - Partner inventory console with live partner switching (Jan Aushadhi Kendras vs. Apollo / MedPlus partners).
  - Real-time stock state toggles (`In Stock`, `Low Stock`, `Out of Stock`) with automated freshness timestamps.
  - Order packing and batch verification checklist.
- **Tamper-Evident Regulatory Audit Cockpit (`AdminAuditView.tsx`):**
  - Immutable audit trail conforming to PRD FR-ADM-04.
  - Filterable by actor name, operational role, and action type (e.g. `USER_AUTHENTICATED`, `PRESCRIPTION_APPROVED`, `ORDER_CREATED`).
  - 1-click JSON audit export for State Drug Inspector review.
- **Digital Tax Invoice Generator (`DigitalInvoiceModal.tsx`):**
  - GSTIN and CDSCO-compliant printable invoices displaying drug batch numbers, manufacturing/expiry dates, and licensed chemist Form 20B/21B registration numbers.
- **30-Day Chronic Refill Manager (`SavingsAndRefillsView.tsx`):**
  - Automated refill scheduler with days-remaining countdowns for long-term chronic prescriptions (Metformin, Telmisartan, Atorvastatin) and 1-click reorder triggers.

### Changed
- **Price Comparison Modal (`PriceComparisonModal.tsx`):**
  - Standardized transparent total-payable cost equation: $\text{Base Price} + \text{Delivery Fee} + \text{Packaging Fee} + \text{GST}$.
  - Explicit bioequivalence confirmation badge linking active pharmaceutical ingredient (API) to reference branded formulations.

### Fixed
- **Cart Price Recalculation:** Fixed rounding anomalies in multi-item cart GST calculations.
- **Timeline Progression:** Resolved milestone timeline update delays when advancing orders through delivery stages.

---

## [0.1.0] - 2026-09-01

### Added
- **Initial Project Architecture & Setup:**
  - TypeScript + React 19 single-page application bundled with Vite 6.
  - Node.js Express server (`server.ts`) hosting Vite middleware in development and static assets in production.
  - Tailwind CSS v4 styling with custom clinical color tokens.
- **Core Product Catalog & Search:**
  - Initial seed data catalog (`mockData.ts`) covering key therapeutic classes (Diabetes, Hypertension, Pain & Fever, Antibiotics, GERD).
  - Brand-to-generic molecule search autocomplete (e.g. *Dolo 650* $\rightarrow$ *Paracetamol 650mg*).
- **Prescription Upload & Mock OCR:**
  - Client-side drag-and-drop prescription upload interface with simulated OCR data extraction.
- **Cart & Order Tracking:**
  - Interactive shopping cart drawer.
  - Multi-milestone order tracking screen with timeline updates.
