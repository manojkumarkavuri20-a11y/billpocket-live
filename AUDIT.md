# BillPocket — Codebase Audit (Module 2)

_Reverse-engineered architecture review of the BillPocket front-end. Read-only analysis; no behaviour was changed by this document._

## 1. What the system is

BillPocket is a **zero-dependency, fully-local** single-page bill tracker and bank-statement analyser. There is no backend, no build step, no package manager, and no test suite. It ships three files plus launchers:

| File | Size | Role |
| --- | --- | --- |
| `index.html` | ~660 lines | App shell / all UI sections, loads one script |
| `styles.css` | ~2,400 lines | Design tokens, theming (light/dark), responsive layout |
| `app.js` | **5,579 lines** | **All** application logic (the monolith) |

It is distributed two ways and **must keep working in both**:
- **`file://`** — double-click `Open-BillPocket.bat` / open `index.html` directly.
- **GitHub Pages** — static hosting (`.nojekyll`).

All persistence is `localStorage`. No network requests are made.

## 2. Architecture (as-built)

`app.js` is a single classic script loaded at the end of `<body>`. Top-to-bottom it is:

1. **Constants** (`app.js:1-31`, `:155-160`) — 10 storage keys, default categories/accounts, `statementCategoryRules`, subscription/salary/exclusion word lists, `frequencyLabels`.
2. **Cached DOM references** (`app.js:33-153`) — ~120 `document.querySelector` constants.
3. **Global mutable state** (`app.js:162-176`) — `bills`, `categories`, `statementTransactions`, `budgets`, `savingsGoals`, `cancelPlans`, `accountSettings`, `reminderSettings`, `simulatorScenarios`, `latestStatementScan`, etc. Each initialised from a `load*()` helper.
4. **Boot sequence** (`app.js:178-191`) — synchronous render calls (theme, categories, planning, charts, analyst, simulator, privacy, dashboard).
5. **Event wiring** (`app.js:193-327`) — 59 `addEventListener` calls; click-delegation lists route via `event.target.closest("[data-action]")`.
6. **Feature functions** (`app.js:329-5579`) — bills, statement parsing/analysis, account/transfer detection, transaction review, planning, charts, simulator, privacy, storage, utilities.

**Data flow:** user action → handler mutates a global array/object → matching `save*()` writes JSON to `localStorage` → `render*()` rebuilds the relevant section via `innerHTML` string templates (`escapeHtml()` guards user-supplied text). Charts are hand-built SVG strings — no charting library.

### localStorage keys

| Key | Owner helpers |
| --- | --- |
| `billpocket.bills.v1` | `loadBills` / `saveBills` |
| `billpocket.categories.v1` | `loadCategories` / `saveCategories` |
| `billpocket.statementTransactions.v1` | `loadStatementTransactions` / `saveStatementTransactions` |
| `billpocket.budgets.v1` | `loadBudgets` / `saveBudgets` |
| `billpocket.goals.v1` | `loadSavingsGoals` / `saveSavingsGoals` |
| `billpocket.cancelPlanner.v1` | `loadCancelPlans` / `saveCancelPlans` |
| `billpocket.accountSettings.v1` | `loadAccountSettings` / `saveAccountSettings` |
| `billpocket.reminders.v1` | `loadReminderSettings` / `saveReminderSettings` |
| `billpocket.theme.v1` | `loadTheme` / `applyTheme` |
| `billpocket.simulatorScenarios.v1` | `loadSimulatorScenarios` / `saveSimulatorScenarios` |

## 3. Strengths

- **Genuinely dependency-free and offline.** No supply-chain surface, no tracking, strong privacy story (see the Privacy section / `wipeAllLocalData`).
- **Defensive storage layer.** Every `load*()` wraps `JSON.parse` in try/catch and falls back to a sane default, so corrupted `localStorage` does not white-screen the app.
- **Consistent XSS hygiene.** User-controlled text is routed through `escapeHtml()` before `innerHTML`.
- **Resilient statement parsing.** Multiple formats (CSV/TSV, OFX, QIF, PDF text-layer, DOCX, XLSX, loose text) with delimiter/header detection and balance reconciliation.

## 4. Risks, ranked

### R1 — The monolith itself (Highest)
5,579 lines in one file with no module boundaries and **zero tests**. Every concern (parsing, money math, rendering, persistence, charts, simulator) shares one global scope. Impact: high cognitive load, easy accidental coupling, risky changes, no unit-test seam. **Remediation: Stage 3 refactor** into classic-script modules (kept non-ESM to preserve `file://` support), plus a Node-testable seam for the pure parser/util functions.

### R2 — Whole-number amounts dropped in loose/PDF parsing (High, real bug — fixed in Stage 2)
`parseLooseStatementLine` (`app.js:1731`) matches amounts with `/[-(]?\s*[£$€₹]?\s*\d[\d,]*\.\d{2}\)?/g`. The mandatory `\.\d{2}` means a plain-text/PDF line whose amount has **no decimals** (e.g. `15 Jun 2026  NETFLIX  100`) matches nothing, so the row is silently discarded (`app.js:1732`). CSV/OFX/QIF use column mapping and are unaffected. **Remediation: make the decimal part optional.**

### R3 — Minor hardening (Low)
- `parseMoneyValue` (`app.js:1967`) strips all commas and treats the last dot as the decimal point. Correct for en-GB/US, wrong for European `1.234,56` formats. App is GBP-focused, so low priority.
- Cached DOM refs (`app.js:33-153`) are not null-guarded. Safe today because the IDs exist in `index.html`, but a rename would throw at boot with no user-visible message.

## 5. False positives (verified NOT bugs)

A shallow automated scan flagged these as "HIGH". Each was inspected and is **correct as written** — documented here so they are not "fixed" into regressions:

- **Simulator month overflow** (`app.js:5029`): `new Date(startYear, startMonthNum - 1 + i, 1)`. JavaScript's `Date` constructor **normalises** month overflow into later years, and the label reads back `date.getFullYear()` / `date.getMonth()+1` from the normalised date. November + N months rolls into the next year correctly.
- **Timezone date shift** (`app.js:1992-2024`, `:4858`): `parseStatementDate` builds dates with local `new Date(y, m-1, d)` and `toDateInputValue` formats with local `getFullYear/getMonth/getDate`. Local-in, local-out — no UTC round-trip, so no off-by-one.
- **Duplicate listeners in `renderCategories`** (`app.js:4185`): line 4178 resets `categoryList.innerHTML` first, discarding the old buttons and their listeners before new ones are attached. No accumulation.
- **Floating-point money drift**: `roundMoney` (`app.js:886`) is applied per step, so the claimed ±0.01 accumulation does not occur in the cited paths.

## 6. Refactor strategy (executed in Stage 3)

Split `app.js` into ordered **classic** `<script>` files under `js/` (no `import/export`, to keep `file://` working): `constants → dom → utils → storage → statement-parser → statement-analysis → account → transactions → planning → charts → simulator → bills → app`. `js/app.js` loads **last** and holds the global state declarations, boot sequence, and all event wiring; because classic scripts share one global scope and `app.js` runs after every function is defined, behaviour is preserved exactly. Pure files (`utils`, `statement-parser`) gain a `module.exports` tail (a no-op in browsers) so the parser can be unit-tested in Node.

## 7. Recommended features (Stage 4)

1. **Detected subscription → 1-click bill** — _already present_ (`addDetectedSubscriptionToForm`, `app.js:2328`); verify/polish only.
2. **Custom categorisation rules** — user-defined "merchant contains X → category Y", checked before the hardcoded rules.
3. **Duplicate-transaction detection UI** — surface likely duplicate rows for review/merge, reusing `chooseBetterStatementTransaction`.
4. **Filtered CSV export** — export only the rows matching the current Analyst filters.
