# BillPocket

> **Track every bill. Zero cloud. Zero cost.**

BillPocket is a fully local bill tracker and spending analyser for subscriptions, recurring bills, budgets, and bank statement review. Everything runs in your browser — no account, no server, no data leaves your device.

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
├── app.js       # All application logic (storage, parsing, charts, analysis)
├── Open-BillPocket.bat # Windows launcher
└── README.md
```

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
