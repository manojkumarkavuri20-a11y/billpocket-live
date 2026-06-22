# BillPocket

> **Track every bill. Zero cloud. Zero cost.**

BillPocket is a fully local bill tracker and spending analyser for subscriptions, recurring bills, budgets, and bank statement review. Everything runs in your browser — no account, no server, no data leaves your device.

---

## Install

| Platform | How |
|---|---|
| **Windows** (native app) | Download the latest `BillPocket_x.x.x_x64-setup.exe` or `.msi` from the [Releases page](https://github.com/manojkumarkavuri20-a11y/billpocket-live/releases/latest), then double-click to install. ~5 MB. |
| **Browser (any OS)** | Visit [the live site](https://manojkumarkavuri20-a11y.github.io/billpocket-live/) — works offline once loaded. |
| **PWA (install in Edge/Chrome on Windows, Mac, Linux, Android)** | Visit the live site, then click the **"Install app"** button in the header, or use the browser's install prompt in the address bar. Adds an app icon to your launcher/start menu. |
| **iOS / iPadOS** | Visit the live site in Safari → Share sheet → "Add to Home Screen". |

> **Privacy by default**: every install path keeps your data on the device. No telemetry, no account, no server.

### Cutting a Windows release

The Windows installer is built automatically by the [`Build Windows app`](.github/workflows/windows-release.yml) GitHub Action when you push a tag matching `v*`. To cut a new release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

In about 5 minutes the Action will create a new GitHub Release with `BillPocket_1.0.0_x64-setup.exe` (NSIS) and `BillPocket_1.0.0_x64_en-US.msi` (WiX) attached.

---

## Simple workflow

1. Add regular bills.
2. Upload or paste a statement.
3. Check the transaction rows before trusting totals.
4. Use insights, charts, budgets, and simulator after the rows look right.

Money In means money received into the account, Money Out means money paid out, and Balance means the account balance after that row.

---

## Features

| Section | What it does |
|---|---|
| **Dashboard** | Monthly total, yearly estimate, due-soon count, active bill count |
| **Bills** | Add, edit, and delete recurring bills with frequency, category, currency, and due date |
| **Insights** | Spending breakdown by category, top bills, trend detection |
| **Charts** | Visual bar and pie-style breakdowns of your spending |
| **Statements** | Upload CSV / TSV / TXT / PDF / DOCX / XLSX / OFX / QIF bank exports for local analysis |
| **Analyst** | Safe-to-spend, savings rate, cashflow forecast, and recommendations |
| **Simulator** | Life Decisions what-if planning for salary, rent, moving costs, subscriptions, and goals |
| **Planner** | Savings goals and cancellation planner with statement history |
| **Tools** | JSON / CSV export, data restore, custom categories, browser reminders, email-receipt import |
| **Privacy** | Full audit of what is stored in localStorage, with one-click wipe |

---

## Getting started

```
# No build step needed — just open the file
open index.html
```

Or double-click `index.html` in your file explorer. No install, no server, no sign-up required.

---

On Windows, you can also double-click `Open-BillPocket.bat`. It opens
`index.html` directly from this device, so you do not need `localhost`, a server
window, or any setup step.

## Privacy

- All data is stored exclusively in **this browser's localStorage**.
- Uploaded statement files are read locally for analysis; the original files are **never saved** by the app.
- Saved Life Decisions simulator scenarios stay only in this browser.
- BillPocket makes **no network requests** — it does not connect to banks, send telemetry, or upload anything.

---

## File structure

```
billpocket/
├── index.html   # App shell and all UI sections
├── styles.css   # Design tokens, light/dark themes, layout
├── js/          # Application logic, split into classic (non-module) scripts
│   ├── constants.js          # Storage keys, default categories/accounts, rules
│   ├── dom.js                # Cached DOM element references
│   ├── utils.js              # Generic date / money / text helpers
│   ├── storage.js            # localStorage load & save helpers
│   ├── statement-parser.js   # CSV/PDF/DOCX/XLSX/OFX/QIF/loose parsers + reconcile
│   ├── statement-analysis.js # Scan, subscription detection, upload UI
│   ├── account.js            # Own-account & transfer detection
│   ├── transactions.js       # Transaction review (Analyst) table & reports
│   ├── charts.js             # SVG charts
│   ├── planning.js           # Budgets, goals, cancellations, health & cashflow
│   ├── simulator.js          # Life Decisions money simulator
│   ├── bills.js              # Bills list, dashboard, insights & timeline
│   ├── ui.js                 # Categories, privacy, reminders, import/export, theme
│   └── app.js                # Bootstrap: global state, init sequence & event wiring
├── test/parser.test.js  # Dependency-free Node tests for the parser (node test/parser.test.js)
├── Open-BillPocket.bat # Windows launcher
└── README.md
```

> The scripts are plain `<script>` files that share one global scope (no ES
> modules), so the app still works when opened directly from `file://`. Load
> order matters — `app.js` runs last. See the comments in `index.html`.

---

## Supported statement formats

| Format | Notes |
|---|---|
| CSV / TSV / TXT | Best accuracy — use CSV exports from your bank when available |
| PDF | Text-layer PDFs (not scanned images) |
| DOCX | Word documents |
| XLSX | Excel spreadsheets |
| OFX / QIF | Standard open finance formats |

---

## Tech stack

- **Vanilla HTML, CSS, JavaScript** — zero dependencies, zero frameworks
- `localStorage` for persistence
- Native `File` API for statement parsing
- CSS custom properties for theming (light and dark mode built-in)

---

## Disclaimer

BillPocket is a personal finance **helper**, not a financial adviser. It does not provide investment or tax advice.
