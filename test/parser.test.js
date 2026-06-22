"use strict";
// Lightweight, dependency-free unit tests for the pure statement-parser module.
// Run with:  node test/parser.test.js
// Loads only the DOM-free modules (constants + utils + statement-parser) by
// evaluating them in a single scope, so parsing logic can be verified without
// a browser. No build tooling required.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const source = ["js/constants.js", "js/utils.js", "js/statement-parser.js"]
  .map((f) => fs.readFileSync(path.join(ROOT, f), "utf8"))
  .join("\n\n");

// Evaluate the concatenated modules in one function scope and surface the
// functions under test. (Classic scripts share one scope in the browser; this
// mirrors that without needing import/export.)
const api = new Function(
  source + "\n;return { parseLooseStatementLine, parseMoneyValue, categorizeStatement };"
)();

let passed = 0;
let failed = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed++;
    console.log("  PASS", name);
  } else {
    failed++;
    console.log("  FAIL", name, "-> got", JSON.stringify(actual), "expected", JSON.stringify(expected));
  }
}

// --- Regression lock for the Stage-2 fix -----------------------------------
// Loose/PDF statement lines whose amount is a whole number carrying a currency
// symbol used to be dropped because the amount regex required `.\d{2}`.
const line = (text) => api.parseLooseStatementLine(text, 0);

check("£100 whole-number amount recovered", line("15 Jun 2026  NETFLIX  £100").spending, 100);
check("£1,200 thousands whole-number recovered", line("17 Jun 2026  RENT  £1,200").spending, 1200);
check("£12.34 decimal amount intact", line("16 Jun 2026  TESCO  £12.34").spending, 12.34);
check("£2500.00 income line intact", line("18 Jun 2026  SALARY paid in £2500.00").income, 2500);
// Guard against over-matching: a line with only a bare integer (no symbol /
// decimal) is still treated as non-parseable (avoids reading years/refs as money).
check("bare integer not parsed as amount", line("19 Jun 2026  RANDOM 2026"), null);

// --- parseMoneyValue --------------------------------------------------------
check("parseMoneyValue('£100')", api.parseMoneyValue("£100"), 100);
check("parseMoneyValue('(45.00)')", api.parseMoneyValue("(45.00)"), -45);
check("parseMoneyValue('1,234.56')", api.parseMoneyValue("1,234.56"), 1234.56);

// --- categorizeStatement ----------------------------------------------------
check("TESCO -> Groceries", api.categorizeStatement("TESCO STORES"), "Groceries");
check("SPOTIFY -> Entertainment", api.categorizeStatement("SPOTIFY"), "Entertainment");
check("Unknown -> Other", api.categorizeStatement("UNKNOWN XYZ"), "Other");
// Word-boundary matching: "netflix" must NOT match Transport's "tfl" substring.
check("NETFLIX -> Entertainment (not Transport)", api.categorizeStatement("NETFLIX.COM"), "Entertainment");
// ...but a real "tfl" token is still Transport.
check("TFL TRAVEL -> Transport", api.categorizeStatement("TFL TRAVEL CH"), "Transport");
check("BP token -> Transport", api.categorizeStatement("BP GARAGE"), "Transport");

// --- Bill templates list (sanity: static data still parses & isn't empty) --
// Loaded by concatenating constants.js into a Function — the parser-test
// bundle doesn't include it, so do a tiny standalone check.
{
  const constantsSrc = fs.readFileSync(path.join(ROOT, "js/constants.js"), "utf8");
  const cfg = new Function(constantsSrc + ";return { billTemplates, accentOptions, viewIds };")();
  check("bill templates list is non-empty", cfg.billTemplates.length > 0, true);
  check("Netflix template present", cfg.billTemplates.some((t) => t.name === "Netflix"), true);
  check("six accent options", cfg.accentOptions.length, 6);
  check("seven views", cfg.viewIds.length, 7);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
