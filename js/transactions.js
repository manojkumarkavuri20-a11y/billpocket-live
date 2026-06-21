// BillPocket — transaction review (Analyst) table, edits & reports
// Classic (non-module) script. Loaded in dependency order from index.html.
// Shares the global scope with the other js/*.js files; do not add import/export.

function normalizeStoredTransaction(transaction, fallbackOrder = 0) {
  const description = String(transaction.description || "Transaction").trim();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(transaction.date) ? transaction.date : parseStatementDate(transaction.date);
  let spending = Number(transaction.spending) || 0;
  let income = Number(transaction.income) || 0;
  const balance = Number.isFinite(Number(transaction.balance)) ? roundMoney(Number(transaction.balance)) : null;
  const merchant = transaction.merchant || normalizeMerchant(description);
  const category = transaction.category || categorizeStatement(description);
  const account = normalizeAccount(transaction.account || transaction.sourceAccount || detectStatementAccount(transaction.sourceName || description));
  const key = transaction.key || getTransactionKey({ date, merchant, spending, income, description, account });
  const storedType = transaction.reviewedAt ? transaction.type : "";
  const directionHint = getStatementDirectionHint(description);
  let type = normalizeTransactionType(storedType || inferTransactionType({ description, spending, income, account }));
  const amount = Math.max(spending, income);

  if (directionHint === "in" && type === "spending") {
    type = "income";
  }

  if (directionHint === "out" && !transaction.reviewedAt && (type === "income" || type === "salary" || type === "refund")) {
    type = "spending";
  }

  if ((type === "income" || type === "salary" || type === "refund") && income <= 0 && spending > 0) {
    income = amount;
    spending = 0;
  }

  if (type === "spending" && spending <= 0 && income > 0 && !looksLikeIncomeText({ description, merchant })) {
    spending = amount;
    income = 0;
  }

  return {
    id: transaction.id || key,
    key,
    date,
    description,
    merchant,
    spending: roundMoney(spending),
    income: roundMoney(income),
    balance,
    balanceCheck: transaction.balanceCheck || "",
    category: type === "transfer" ? "Transfers" : type === "salary" || type === "income" ? "Income" : category,
    account,
    sourceName: String(transaction.sourceName || "").trim(),
    importBatch: transaction.importBatch || transaction.firstSeenAt || new Date().toISOString(),
    sourceIndex: Number.isFinite(Number(transaction.sourceIndex)) ? Number(transaction.sourceIndex) : 0,
    sourceOrder: Number.isFinite(Number(transaction.sourceOrder)) ? Number(transaction.sourceOrder) : fallbackOrder,
    sourceSequence: Number.isFinite(Number(transaction.sourceSequence)) ? Number(transaction.sourceSequence) : fallbackOrder,
    type,
    excluded: Boolean(transaction.excluded) || type === "ignore",
    firstSeenAt: transaction.firstSeenAt || new Date().toISOString(),
    reviewedAt: transaction.reviewedAt || "",
    updatedAt: new Date().toISOString(),
  };
}

function normalizeTransactionType(value) {
  return ["spending", "income", "salary", "transfer", "refund", "ignore"].includes(value) ? value : "spending";
}

function inferTransactionType(transaction) {
  const text = `${transaction.description || ""} ${transaction.merchant || ""} ${transaction.account || ""}`.toLowerCase();
  const looksLikeTransfer = looksLikeOwnTransferText(text);
  const looksLikeSalary = salaryWords.some((word) => text.includes(word));
  const looksLikeIncome = looksLikeIncomeText(transaction);
  const looksLikeRefund = /\b(refund|reversal|cashback|returned|chargeback)\b/.test(text);

  if (looksLikeRefund) {
    return "refund";
  }
  if (looksLikeTransfer && !looksLikeIncome) {
    return "transfer";
  }
  if (looksLikeSalary) {
    return "salary";
  }
  if (Number(transaction.income) > 0) {
    return "income";
  }
  return "spending";
}

function looksLikeIncomeText(transaction) {
  const text = `${transaction.description || ""} ${transaction.merchant || ""}`.toLowerCase();
  return /\b(salary|wage|payroll|paye|payslip|employer|deposit|paid in|interest paid|dividend|credit from|credited|fpi|faster payment in)\b/.test(text) || salaryWords.some((word) => text.includes(word));
}

function isTransactionExcluded(transaction) {
  return Boolean(transaction.excluded) || ["transfer", "refund", "ignore"].includes(transaction.type);
}

function renderAnalystCenter() {
  if (!healthScoreCard) {
    return;
  }

  const analyzedTransactions = getAnalyzedTransactions();
  latestStatementScan = analyzedTransactions.length > 0 ? buildStatementScan(analyzedTransactions) : buildStatementScan([]);
  renderHealthScoreCard();
  renderSafeToSpendCard();
  renderSavingsRateCard();
  renderImportConfidenceCard();
  renderCashflowForecast();
  renderSmartRecommendations();
  renderScenarioGoalOptions();
  renderScenarioPlanner();
  renderAccountOverlapSummary();
  renderTransactionReviewFilters();
  renderTransactionReview();
}

function renderTransactionReviewFilters() {
  const currentMonth = transactionMonthFilter.value || "all";
  const currentAccount = transactionAccountFilter.value || "all";
  const currentCategory = transactionCategoryFilter.value || "all";
  const months = [...new Set(statementTransactions.map((transaction) => transaction.date.slice(0, 7)).filter(Boolean))].sort().reverse();
  const accounts = [...new Set([...getOwnAccounts(false), ...statementTransactions.map((transaction) => normalizeAccount(transaction.account)).filter(Boolean)])].sort(compareAccountNames);
  const statementCategories = [...new Set(statementTransactions.map((transaction) => transaction.category).filter(Boolean))];
  const categoryOptions = [...new Set([...categories, ...statementCategories])].sort((a, b) => {
    if (a === "Other") {
      return 1;
    }
    if (b === "Other") {
      return -1;
    }
    return a.localeCompare(b);
  });

  transactionMonthFilter.innerHTML = [`<option value="all">All months</option>`, ...months.map((month) => `<option value="${month}">${formatMonthLabel(month)}</option>`)].join("");
  transactionMonthFilter.value = months.includes(currentMonth) ? currentMonth : "all";
  transactionAccountFilter.innerHTML = [`<option value="all">All accounts</option>`, ...accounts.map((account) => `<option value="${escapeHtml(account)}">${escapeHtml(account)}</option>`)].join("");
  transactionAccountFilter.value = accounts.includes(currentAccount) ? currentAccount : "all";
  transactionCategoryFilter.innerHTML = [`<option value="all">All categories</option>`, ...categoryOptions.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)].join("");
  transactionCategoryFilter.value = categoryOptions.includes(currentCategory) ? currentCategory : "all";
}

function renderTransactionReview() {
  if (statementTransactions.length === 0) {
    transactionReviewStatus.textContent = "No saved statement transactions yet.";
    transactionReviewList.innerHTML = `<p class="muted">Upload or paste a statement first. This table will then show what was received, what was spent, and the balance after each row.</p>`;
    return;
  }

  const rows = getVisibleStatementTransactions();
  const excludedCount = statementTransactions.filter(isTransactionExcluded).length;
  transactionReviewStatus.textContent = `Showing ${rows.length} of ${statementTransactions.length} rows. Money In means received. Money Out means spent. ${excludedCount} ignored or treated as own-account transfers.`;

  if (rows.length === 0) {
    transactionReviewList.innerHTML = `<p class="muted">No transactions match these filters.</p>`;
    return;
  }

  const header = `<div class="transaction-row is-header" role="row">
    <div>Transaction</div>
    <div class="transaction-money-header">Money in (received)</div>
    <div class="transaction-money-header">Money out (spent)</div>
    <div class="transaction-money-header">Balance after</div>
    <div>Account</div>
    <div>Category</div>
    <div>Type</div>
    <div></div>
  </div>`;
  transactionReviewList.innerHTML = header + rows
    .slice(0, 80)
    .map(renderTransactionRow)
    .join("");
}

function getVisibleStatementTransactions() {
  const query = transactionSearchInput.value.trim().toLowerCase();
  const month = transactionMonthFilter.value;
  const account = transactionAccountFilter.value;
  const category = transactionCategoryFilter.value;
  const type = transactionTypeFilter.value;
  const sort = transactionSortMode.value;

  const rows = statementTransactions.filter((transaction) => {
    const matchesQuery = !query || [transaction.merchant, transaction.description, transaction.date, transaction.account].join(" ").toLowerCase().includes(query);
    const matchesMonth = month === "all" || transaction.date.slice(0, 7) === month;
    const matchesAccount = account === "all" || normalizeAccount(transaction.account) === account;
    const matchesCategory = category === "all" || transaction.category === category;
    const displayType = isTransactionExcluded(transaction) && transaction.type === "ignore" ? "ignore" : transaction.type;
    const matchesType = type === "all" || displayType === type;
    return matchesQuery && matchesMonth && matchesAccount && matchesCategory && matchesType;
  });

  return rows.sort((a, b) => {
    if (sort === "statement") {
      return compareStatementOrder(a, b);
    }
    if (sort === "oldest") {
      return parseLocalDate(a.date) - parseLocalDate(b.date) || compareStatementOrder(a, b);
    }
    if (sort === "amount") {
      return Math.max(b.spending, b.income) - Math.max(a.spending, a.income) || compareStatementOrder(a, b);
    }
    if (sort === "merchant") {
      return a.merchant.localeCompare(b.merchant) || compareStatementOrder(a, b);
    }
    return parseLocalDate(b.date) - parseLocalDate(a.date) || compareStatementOrder(a, b);
  });
}

function renderTransactionRow(transaction) {
  const hasIncome = Number(transaction.income) > 0;
  const hasSpending = Number(transaction.spending) > 0;
  const hasBalance = Number.isFinite(Number(transaction.balance));
  const moneyInLabel = hasIncome ? formatMoney(transaction.income, "GBP") : "—";
  const moneyOutLabel = hasSpending ? formatMoney(transaction.spending, "GBP") : "—";
  const balanceLabel = hasBalance ? formatMoney(transaction.balance, "GBP") : "—";
  const moneyInClass = hasIncome ? "positive" : "is-empty";
  const moneyOutClass = hasSpending ? "negative" : "is-empty";
  const balanceClass = hasBalance ? "" : "is-empty";
  const balanceCheckLabel = transaction.balanceCheck ? ` · ${getBalanceCheckLabel(transaction.balanceCheck)}` : "";
  const categoryOptions = [...new Set([...categories, transaction.category])]
    .filter(Boolean)
    .map((category) => `<option value="${escapeHtml(category)}" ${category === transaction.category ? "selected" : ""}>${escapeHtml(category)}</option>`)
    .join("");
  const accountOptions = [...new Set([...getOwnAccounts(true), normalizeAccount(transaction.account)])]
    .sort(compareAccountNames)
    .map((account) => `<option value="${escapeHtml(account)}" ${normalizeAccount(transaction.account) === account ? "selected" : ""}>${escapeHtml(account)}</option>`)
    .join("");
  const typeOptions = [
    ["spending", "Spending - money out"],
    ["income", "Income - money in"],
    ["salary", "Salary - money in"],
    ["transfer", "Transfer - own accounts"],
    ["refund", "Refund - money in"],
    ["ignore", "Ignore"],
  ]
    .map(([value, label]) => `<option value="${value}" ${transaction.type === value || (transaction.excluded && value === "ignore") ? "selected" : ""}>${label}</option>`)
    .join("");

  const directionLabel = hasIncome ? "Received into account" : hasSpending ? "Paid out of account" : titleCase(transaction.type || "No amount");

  return `
    <div class="transaction-row ${isTransactionExcluded(transaction) ? "is-excluded" : ""}" data-transaction-id="${escapeHtml(transaction.id)}">
      <div class="transaction-main">
        <div class="transaction-date">${formatDate(transaction.date)}</div>
        <input class="merchant-input" data-field="merchant" value="${escapeHtml(titleCase(transaction.merchant))}" aria-label="Merchant">
        <p>${escapeHtml(getStatementOrderLabel(transaction))} · ${escapeHtml(directionLabel)} · ${escapeHtml(normalizeAccount(transaction.account))} · ${escapeHtml(transaction.description)}${escapeHtml(balanceCheckLabel)}</p>
      </div>
      <span class="transaction-money ${moneyInClass}" data-label="Money in received">${moneyInLabel}</span>
      <span class="transaction-money ${moneyOutClass}" data-label="Money out spent">${moneyOutLabel}</span>
      <span class="transaction-money ${balanceClass}" data-label="Balance after">${balanceLabel}</span>
      <select data-field="account" aria-label="Transaction account">${accountOptions}</select>
      <select data-field="category" aria-label="Transaction category">${categoryOptions}</select>
      <select data-field="type" aria-label="Transaction type">${typeOptions}</select>
      <button class="ghost-button danger-button" type="button" data-action="delete-transaction">Delete</button>
    </div>
  `;
}

function getBalanceCheckLabel(value) {
  if (value === "ok") {
    return "balance checked";
  }
  if (value === "corrected") {
    return "direction corrected";
  }
  if (value === "mismatch") {
    return "balance needs review";
  }
  return "";
}

function getStatementOrderLabel(transaction) {
  const order = Number(transaction.sourceOrder);
  return Number.isFinite(order) ? `Row ${order + 1}` : "Statement row";
}

function handleTransactionReviewChange(event) {
  const field = event.target.dataset.field;
  const row = event.target.closest("[data-transaction-id]");
  if (!field || !row) {
    return;
  }

  const transaction = statementTransactions.find((item) => item.id === row.dataset.transactionId);
  if (!transaction) {
    return;
  }

  if (field === "merchant") {
    const merchant = event.target.value.trim();
    if (!merchant) {
      event.target.value = titleCase(transaction.merchant);
      return;
    }
    transaction.merchant = merchant.slice(0, 60);
  }

  if (field === "category") {
    transaction.category = event.target.value || "Other";
  }

  if (field === "account") {
    transaction.account = normalizeAccount(event.target.value);
  }

  if (field === "type") {
    applyTransactionType(transaction, event.target.value);
  }

  transaction.reviewedAt = new Date().toISOString();
  transaction.updatedAt = new Date().toISOString();
  saveStatementTransactions();
  refreshStatementAnalyticsAfterReview();
}

function applyTransactionType(transaction, typeValue) {
  const type = normalizeTransactionType(typeValue);
  const amount = Math.max(transaction.spending, transaction.income);
  transaction.type = type;
  transaction.excluded = type === "ignore";

  if (type === "income" || type === "salary") {
    transaction.income = amount;
    transaction.spending = 0;
    transaction.category = "Income";
  }

  if (type === "spending") {
    transaction.spending = amount;
    transaction.income = 0;
    if (transaction.category === "Transfers") {
      transaction.category = categorizeStatement(transaction.description);
    }
  }

  if (type === "refund") {
    transaction.income = amount;
    transaction.spending = 0;
  }

  if (type === "transfer") {
    transaction.category = "Transfers";
  }
}

function handleTransactionReviewAction(event) {
  const button = event.target.closest("button[data-action='delete-transaction']");
  if (!button) {
    return;
  }

  const row = button.closest("[data-transaction-id]");
  const transaction = statementTransactions.find((item) => item.id === row?.dataset.transactionId);
  if (!transaction) {
    return;
  }

  const confirmed = window.confirm(`Delete ${transaction.merchant} on ${formatDate(transaction.date)}?`);
  if (!confirmed) {
    return;
  }

  statementTransactions = statementTransactions.filter((item) => item.id !== transaction.id);
  saveStatementTransactions();
  refreshStatementAnalyticsAfterReview();
}

function refreshStatementAnalyticsAfterReview() {
  const analyzed = getAnalyzedTransactions();
  latestStatementScan = buildStatementScan(analyzed);
  if (statementTransactions.length === 0) {
    renderStatementEmpty();
    statementMessage.textContent = "Saved statement history deleted from this device.";
  } else {
    renderStatementScan(latestStatementScan);
    statementMessage.textContent = `Updated review. ${analyzed.length} of ${statementTransactions.length} transaction${statementTransactions.length === 1 ? "" : "s"} are included in analysis.`;
  }
  renderPlanning();
  renderVisualInsights();
}

function downloadMonthlyReport() {
  const report = buildMonthlyReportText();
  downloadFile(`billpocket-report-${toDateInputValue(new Date())}.txt`, report, "text/plain");
  statementMessage.textContent = "Monthly report downloaded from this browser.";
}

function printMonthlyReport() {
  window.print();
}

function buildMonthlyReportText() {
  const health = getFinancialHealthSnapshot();
  const safe = getSafeToSpendSnapshot();
  const savings = getSavingsRateSnapshot();
  const scan = latestStatementScan || buildStatementScan(getAnalyzedTransactions());
  const topCategories = scan.categoryTotals.slice(0, 5).map((row) => `- ${row.category}: ${formatMoney(row.amount, "GBP")}`).join("\n") || "- No spending categories yet";
  const recommendations = getSmartRecommendations().slice(0, 5).map((item) => `- ${item.title}: ${item.body}`).join("\n") || "- No recommendations yet";

  return [
    "BillPocket Monthly Money Report",
    `Created: ${new Date().toLocaleString("en-GB")}`,
    "",
    `Financial health: ${health.score}/100 (${health.label})`,
    `Safe to spend: ${formatMoney(safe.safeAmount, "GBP")}`,
    `Savings rate: ${Math.round(savings.rate)}%`,
    `Transactions included: ${getAnalyzedTransactions().length}`,
    "",
    "Top categories",
    topCategories,
    "",
    "Recommendations",
    recommendations,
    "",
    "Privacy",
    "This report was generated locally in your browser. BillPocket does not upload your statement data.",
  ].join("\n");
}
