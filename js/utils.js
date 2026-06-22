// BillPocket — generic date / money / text helpers
// Classic (non-module) script. Loaded in dependency order from index.html.
// Shares the global scope with the other js/*.js files; do not add import/export.

function sortTransactionsByStatementOrder(transactions) {
  return [...transactions].sort(compareStatementOrder);
}

function compareStatementOrder(a, b) {
  const batchCompare = String(a.importBatch || "").localeCompare(String(b.importBatch || ""));
  if (batchCompare !== 0) {
    return batchCompare;
  }

  const sourceCompare = Number(a.sourceIndex || 0) - Number(b.sourceIndex || 0);
  if (sourceCompare !== 0) {
    return sourceCompare;
  }

  const sequenceCompare = Number(a.sourceSequence ?? a.sourceOrder ?? 0) - Number(b.sourceSequence ?? b.sourceOrder ?? 0);
  if (sequenceCompare !== 0) {
    return sequenceCompare;
  }

  return String(a.firstSeenAt || "").localeCompare(String(b.firstSeenAt || ""));
}

function getTransactionKey(transaction) {
  const date = transaction.date || "";
  const merchant = normalizeMerchant(transaction.merchant || transaction.description || "");
  const amountValue = Number(transaction.spending) > 0 ? Number(transaction.spending) : -(Number(transaction.income) || 0);
  const amount = roundMoney(amountValue).toFixed(2);
  const account = normalizeAccount(transaction.account || "Unknown");
  const descriptionToken = normalizeKeyText(transaction.description || merchant).slice(0, 24);
  return `${date}|${amount}|${account}|${merchant}|${descriptionToken}`;
}

function getLegacyTransactionKey(transaction) {
  const date = transaction.date || "";
  const merchant = normalizeMerchant(transaction.merchant || transaction.description || "");
  const amountValue = Number(transaction.spending) > 0 ? Number(transaction.spending) : -(Number(transaction.income) || 0);
  const amount = roundMoney(amountValue).toFixed(2);
  const descriptionToken = normalizeKeyText(transaction.description || merchant).slice(0, 24);
  return `${date}|${amount}|${merchant}|${descriptionToken}`;
}

function normalizeKeyText(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function decodeXmlEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function moneyAlmostEqual(a, b) {
  return Math.abs(roundMoney(a) - roundMoney(b)) <= 0.02;
}

function normalizeMerchant(description) {
  return (
    description
      .toLowerCase()
      .replace(/\b(card payment|direct debit|standing order|pos|visa|debit|payment to|payment from|online)\b/g, " ")
      .replace(/[0-9*#]/g, " ")
      .replace(/[^a-z &.+-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 42) || "Unknown merchant"
  );
}

function monthSpan(start, end) {
  return (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1;
}

function daysBetween(start, end) {
  return Math.round((parseLocalDate(end) - parseLocalDate(start)) / 86400000);
}

function titleCase(value) {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

function advanceDateByFrequency(date, frequency) {
  const next = new Date(date);
  if (frequency === "weekly") {
    next.setDate(next.getDate() + 7);
    return next;
  }
  if (frequency === "quarterly") {
    return addMonths(next, 3);
  }
  if (frequency === "yearly") {
    return addMonths(next, 12);
  }
  return addMonths(next, 1);
}

function normalizeMerchantCleanupKey(value) {
  return normalizeKeyText(value)
    .replace(/\b(ltd|limited|plc|uk|gb|com|online|store|payment|card)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 18);
}

function formatShortMonth(value) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { month: "short" }).format(new Date(year, month - 1, 1));
}

function formatCompactMoney(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatMonthLabel(value) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(new Date(year, month - 1, 1));
}

function normalizeCategory(value) {
  return value.trim().replace(/\s+/g, " ").slice(0, 28);
}

function cleanMerchantName(value) {
  if (!value) {
    return "";
  }
  return value.replace(/receipt|invoice|renewal|payment/gi, "").trim().slice(0, 60);
}

function normalizeCurrency(value = "GBP") {
  const symbolMap = {
    "£": "GBP",
    "$": "USD",
    "€": "EUR",
    "₹": "INR",
  };
  const upper = value.toUpperCase();
  return symbolMap[value] || (["GBP", "USD", "EUR", "INR"].includes(upper) ? upper : "GBP");
}

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatTotalsByCurrency(items, mapper) {
  const totals = items.reduce((result, bill) => {
    result[bill.currency] = (result[bill.currency] || 0) + mapper(bill);
    return result;
  }, {});

  const entries = Object.entries(totals);
  if (entries.length === 0) {
    return formatMoney(0, "GBP");
  }

  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, amount]) => formatMoney(amount, currency))
    .join(" + ");
}

function monthlyEquivalent(bill) {
  const amount = Number(bill.amount) || 0;
  if (bill.frequency === "weekly") {
    return (amount * 52) / 12;
  }
  if (bill.frequency === "quarterly") {
    return amount / 3;
  }
  if (bill.frequency === "yearly") {
    return amount / 12;
  }
  return amount;
}

function yearlyEquivalent(bill) {
  const amount = Number(bill.amount) || 0;
  if (bill.frequency === "weekly") {
    return amount * 52;
  }
  if (bill.frequency === "quarterly") {
    return amount * 4;
  }
  if (bill.frequency === "monthly") {
    return amount * 12;
  }
  return amount;
}

function getNextDueDate(dateValue, frequency) {
  let next = parseLocalDate(dateValue);
  const today = startOfDay(new Date());

  do {
    if (frequency === "weekly") {
      next.setDate(next.getDate() + 7);
    } else if (frequency === "quarterly") {
      next = addMonths(next, 3);
    } else if (frequency === "yearly") {
      next = addMonths(next, 12);
    } else {
      next = addMonths(next, 1);
    }
  } while (next <= today);

  return toDateInputValue(next);
}

function addMonths(date, months) {
  const originalDay = date.getDate();
  const next = new Date(date);
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(originalDay, lastDay));
  return next;
}

function daysUntil(dateValue) {
  const today = startOfDay(new Date());
  const dueDate = parseLocalDate(dateValue);
  const difference = dueDate - today;
  return Math.round(difference / 86400000);
}

function getDueBadge(days, status) {
  if (status !== "active") {
    return "";
  }

  if (days < 0) {
    return `<span class="badge overdue">${Math.abs(days)}d overdue</span>`;
  }

  if (days <= 7) {
    return `<span class="badge due-soon">Due in ${days}d</span>`;
  }

  return "";
}

function parseLocalDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return startOfDay(new Date(year, month - 1, day));
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parseLocalDate(value));
}

function formatMoney(amount, currency) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    maximumFractionDigits: 2,
  }).format(amount);
}

// Multi-currency conversion. If `displayCurrency` differs from `currency`,
// the amount is converted via the locally-stored FX rates (1 unit of X = rate
// units of GBP base). Returns the converted value AND the formatted string,
// so callers can either use formatMoneyDisplay() for UI or get the raw number.
function convertCurrency(amount, fromCurrency, toCurrency) {
  if (!fromCurrency || fromCurrency === toCurrency) return Number(amount) || 0;
  if (typeof fxRates !== "object" || !fxRates) return Number(amount) || 0;
  const fromRate = Number(fxRates[fromCurrency]) || 1;
  const toRate = Number(fxRates[toCurrency]) || 1;
  if (toRate === 0) return Number(amount) || 0;
  // amount * fromRate = GBP equivalent; / toRate = target currency
  return roundMoney((Number(amount) || 0) * fromRate / toRate);
}

// Format a money value, converting to the user's chosen display currency
// when set. Mirrors formatMoney's API but funnels everything through one
// display currency for cross-currency summary screens.
function formatMoneyDisplay(amount, sourceCurrency) {
  const display = typeof displayCurrency === "string" ? displayCurrency : fxBaseCurrency;
  if (!sourceCurrency || sourceCurrency === display) {
    return formatMoney(amount, display);
  }
  return formatMoney(convertCurrency(amount, sourceCurrency, display), display);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return replacements[character];
  });
}

// ─── Life Decisions Simulator ───────────────────────────────────────────────
