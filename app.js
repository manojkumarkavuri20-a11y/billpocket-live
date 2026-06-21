const STORAGE_KEY = "billpocket.bills.v1";
const CATEGORY_KEY = "billpocket.categories.v1";
const REMINDER_KEY = "billpocket.reminders.v1";
const THEME_KEY = "billpocket.theme.v1";
const STATEMENT_KEY = "billpocket.statementTransactions.v1";
const BUDGET_KEY = "billpocket.budgets.v1";
const GOAL_KEY = "billpocket.goals.v1";
const CANCEL_KEY = "billpocket.cancelPlanner.v1";
const ACCOUNT_KEY = "billpocket.accountSettings.v1";
const SIMULATOR_KEY = "billpocket.simulatorScenarios.v1";
const defaultCategories = ["Housing", "Utilities", "Entertainment", "Health", "Transport", "Learning", "Other"];
const defaultOwnAccounts = ["HSBC", "Lloyds", "Revolut", "Monzo"];
const defaultAccountSettings = {
  accounts: defaultOwnAccounts,
  transferWindowDays: 2,
  amountTolerancePercent: 1.5,
};
const statementCategoryRules = [
  { category: "Groceries", words: ["tesco", "sainsbury", "asda", "aldi", "lidl", "morrisons", "waitrose", "grocery", "supermarket"] },
  { category: "Dining", words: ["restaurant", "cafe", "coffee", "starbucks", "costa", "mcdonald", "kfc", "deliveroo", "ubereats", "just eat", "takeaway"] },
  { category: "Transport", words: ["uber", "bolt", "train", "rail", "bus", "tfl", "petrol", "fuel", "shell", "bp ", "parking"] },
  { category: "Housing", words: ["rent", "mortgage", "letting", "landlord"] },
  { category: "Utilities", words: ["energy", "electric", "gas", "water", "broadband", "internet", "mobile", "phone", "vodafone", "o2", "ee ", "three"] },
  { category: "Shopping", words: ["amazon", "ebay", "argos", "primark", "zara", "hm", "ikea", "paypal"] },
  { category: "Entertainment", words: ["netflix", "spotify", "disney", "youtube", "prime video", "cinema", "odeon", "steam", "xbox", "playstation"] },
  { category: "Health", words: ["pharmacy", "boots", "dentist", "doctor", "gym", "puregym", "fitness"] },
  { category: "Fees", words: ["fee", "charge", "interest", "overdraft"] },
];
const subscriptionWords = ["subscription", "membership", "netflix", "spotify", "disney", "apple", "google", "microsoft", "adobe", "youtube", "prime", "gym", "canva", "notion", "dropbox", "icloud"];
const salaryWords = ["salary", "wage", "payroll", "paye", "payslip", "employer"];
const nonSubscriptionWords = ["salary", "wage", "payroll", "paye", "payslip", "employer", "hmrc", "dwp", "universal credit", "student finance", "refund", "transfer", "the range"];

const themeToggle = document.querySelector("#themeToggle");
const form = document.querySelector("#billForm");
const billIdInput = document.querySelector("#billId");
const nameInput = document.querySelector("#name");
const amountInput = document.querySelector("#amount");
const currencyInput = document.querySelector("#currency");
const nextDueDateInput = document.querySelector("#nextDueDate");
const frequencyInput = document.querySelector("#frequency");
const categoryInput = document.querySelector("#category");
const noteInput = document.querySelector("#note");
const saveButton = document.querySelector("#saveButton");
const resetFormButton = document.querySelector("#resetFormButton");
const formTitle = document.querySelector("#formTitle");
const billList = document.querySelector("#billList");
const emptyState = document.querySelector("#emptyState");
const statusLine = document.querySelector("#statusLine");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const sortMode = document.querySelector("#sortMode");
const monthlyTotal = document.querySelector("#monthlyTotal");
const yearlyTotal = document.querySelector("#yearlyTotal");
const dueSoonCount = document.querySelector("#dueSoonCount");
const activeCount = document.querySelector("#activeCount");
const exportJsonButton = document.querySelector("#exportJsonButton");
const exportCsvButton = document.querySelector("#exportCsvButton");
const importJsonButton = document.querySelector("#importJsonButton");
const importJsonInput = document.querySelector("#importJsonInput");
const exportMessage = document.querySelector("#exportMessage");
const insightSummary = document.querySelector("#insightSummary");
const categoryBreakdown = document.querySelector("#categoryBreakdown");
const upcomingTimeline = document.querySelector("#upcomingTimeline");
const incomeSpendChart = document.querySelector("#incomeSpendChart");
const categoryDonutChart = document.querySelector("#categoryDonutChart");
const cashflowChart = document.querySelector("#cashflowChart");
const budgetChart = document.querySelector("#budgetChart");
const statementUploadButton = document.querySelector("#statementUploadButton");
const statementFileInput = document.querySelector("#statementFileInput");
const statementFolderButton = document.querySelector("#statementFolderButton");
const statementFolderInput = document.querySelector("#statementFolderInput");
const clearStatementButton = document.querySelector("#clearStatementButton");
const statementAccountInput = document.querySelector("#statementAccountInput");
const statementMessage = document.querySelector("#statementMessage");
const statementTextInput = document.querySelector("#statementTextInput");
const analyzeStatementTextButton = document.querySelector("#analyzeStatementTextButton");
const statementSummary = document.querySelector("#statementSummary");
const subscriptionFindings = document.querySelector("#subscriptionFindings");
const savingSuggestions = document.querySelector("#savingSuggestions");
const healthScoreCard = document.querySelector("#healthScoreCard");
const safeToSpendCard = document.querySelector("#safeToSpendCard");
const savingsRateCard = document.querySelector("#savingsRateCard");
const importConfidenceCard = document.querySelector("#importConfidenceCard");
const cashflowForecast = document.querySelector("#cashflowForecast");
const smartRecommendations = document.querySelector("#smartRecommendations");
const scenarioCutRange = document.querySelector("#scenarioCutRange");
const scenarioCutValue = document.querySelector("#scenarioCutValue");
const scenarioCancelInput = document.querySelector("#scenarioCancelInput");
const scenarioGoalInput = document.querySelector("#scenarioGoalInput");
const scenarioResult = document.querySelector("#scenarioResult");
const accountOverlapSummary = document.querySelector("#accountOverlapSummary");
const autoDetectTransfersButton = document.querySelector("#autoDetectTransfersButton");
const accountSettingsForm = document.querySelector("#accountSettingsForm");
const newOwnAccountInput = document.querySelector("#newOwnAccount");
const ownAccountList = document.querySelector("#ownAccountList");
const transferWindowInput = document.querySelector("#transferWindowInput");
const transferToleranceInput = document.querySelector("#transferToleranceInput");
const downloadMonthlyReportButton = document.querySelector("#downloadMonthlyReportButton");
const printMonthlyReportButton = document.querySelector("#printMonthlyReportButton");
const transactionSearchInput = document.querySelector("#transactionSearchInput");
const transactionMonthFilter = document.querySelector("#transactionMonthFilter");
const transactionAccountFilter = document.querySelector("#transactionAccountFilter");
const transactionCategoryFilter = document.querySelector("#transactionCategoryFilter");
const transactionTypeFilter = document.querySelector("#transactionTypeFilter");
const transactionSortMode = document.querySelector("#transactionSortMode");
const transactionReviewStatus = document.querySelector("#transactionReviewStatus");
const transactionReviewList = document.querySelector("#transactionReviewList");
const budgetForm = document.querySelector("#budgetForm");
const budgetCategoryInput = document.querySelector("#budgetCategory");
const budgetLimitInput = document.querySelector("#budgetLimit");
const budgetList = document.querySelector("#budgetList");
const priceAlerts = document.querySelector("#priceAlerts");
const cancelForm = document.querySelector("#cancelForm");
const cancelNameInput = document.querySelector("#cancelName");
const cancelSavingInput = document.querySelector("#cancelSaving");
const cancelList = document.querySelector("#cancelList");
const goalForm = document.querySelector("#goalForm");
const goalNameInput = document.querySelector("#goalName");
const goalTargetInput = document.querySelector("#goalTarget");
const goalSavedInput = document.querySelector("#goalSaved");
const goalList = document.querySelector("#goalList");
const statementHistory = document.querySelector("#statementHistory");
const wipeAllButton = document.querySelector("#wipeAllButton");
const privacyReportList = document.querySelector("#privacyReportList");
const categoryForm = document.querySelector("#categoryForm");
const newCategoryInput = document.querySelector("#newCategory");
const categoryList = document.querySelector("#categoryList");
const reminderDaysInput = document.querySelector("#reminderDays");
const reminderModeInput = document.querySelector("#reminderMode");
const notificationButton = document.querySelector("#notificationButton");
const checkRemindersButton = document.querySelector("#checkRemindersButton");
const reminderMessage = document.querySelector("#reminderMessage");
const emailTextInput = document.querySelector("#emailText");
const parseEmailButton = document.querySelector("#parseEmailButton");
const gmailFutureButton = document.querySelector("#gmailFutureButton");
const importMessage = document.querySelector("#importMessage");
const appNavLinks = [...document.querySelectorAll(".app-nav a")];
const simulatorForm = document.querySelector("#simulatorForm");
const simScenarioIdInput = document.querySelector("#simScenarioId");
const simNameInput = document.querySelector("#simName");
const simStartMonthInput = document.querySelector("#simStartMonth");
const simDurationInput = document.querySelector("#simDuration");
const simIncomeDeltaInput = document.querySelector("#simIncomeDelta");
const simRentDeltaInput = document.querySelector("#simRentDelta");
const simOneOffCostInput = document.querySelector("#simOneOffCost");
const simSubSavingsInput = document.querySelector("#simSubSavings");
const simGoalSelect = document.querySelector("#simGoalSelect");
const simCatGrid = document.querySelector("#simCatGrid");
const simOutput = document.querySelector("#simOutput");
const simCharts = document.querySelector("#simCharts");
const simSaveButton = document.querySelector("#simSaveButton");
const simResetButton = document.querySelector("#simResetButton");
const simScenarioList = document.querySelector("#simScenarioList");

const frequencyLabels = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

let bills = loadBills();
let categories = loadCategories();
let simulatorScenarios = loadSimulatorScenarios();
let currentSimResult = null;
let accountSettings = loadAccountSettings();
let reminderSettings = loadReminderSettings();
let statementTransactions = reconcileStoredStatementTransactions(loadStatementTransactions());
if (statementTransactions.length > 0) {
  localStorage.setItem(STATEMENT_KEY, JSON.stringify(statementTransactions));
}
let latestStatementScan = statementTransactions.length > 0 ? buildStatementScan(getAnalyzedTransactions()) : null;
let budgets = loadBudgets();
let savingsGoals = loadSavingsGoals();
let cancelPlans = loadCancelPlans();
let latestImportReport = null;

applyTheme(loadTheme(), Boolean(localStorage.getItem(THEME_KEY)));
renderCategories();
renderStatementAccountOptions();
renderAccountSettings();
applyReminderSettings();
initSectionNavigation();
renderStoredStatementState();
renderPlanning();
renderVisualInsights();
renderAnalystCenter();
renderSimulator();
renderPrivacyReport();
setDefaultDueDate();
render();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const now = new Date().toISOString();
  const bill = {
    id: billIdInput.value || createId(),
    name: nameInput.value.trim(),
    amount: Number(amountInput.value),
    currency: currencyInput.value,
    category: categoryInput.value,
    nextDueDate: nextDueDateInput.value,
    frequency: frequencyInput.value,
    status: "active",
    note: noteInput.value.trim(),
    createdAt: now,
    updatedAt: now,
  };

  if (!bill.name || !Number.isFinite(bill.amount) || bill.amount < 0 || !bill.nextDueDate) {
    return;
  }

  const existingBill = bills.find((item) => item.id === bill.id);
  if (existingBill) {
    bill.status = existingBill.status;
    bill.createdAt = existingBill.createdAt;
    bills = bills.map((item) => (item.id === bill.id ? bill : item));
  } else {
    bills = [bill, ...bills];
  }

  saveBills();
  resetForm();
  render();
});

resetFormButton.addEventListener("click", resetForm);
themeToggle.addEventListener("click", toggleTheme);
searchInput.addEventListener("input", render);
statusFilter.addEventListener("change", render);
sortMode.addEventListener("change", render);
exportJsonButton.addEventListener("click", exportJson);
exportCsvButton.addEventListener("click", exportCsv);
importJsonButton.addEventListener("click", () => importJsonInput.click());
importJsonInput.addEventListener("change", importJsonBackup);
statementUploadButton.addEventListener("click", () => statementFileInput.click());
statementFileInput.addEventListener("change", analyzeStatementFiles);
statementFolderButton.addEventListener("click", () => statementFolderInput.click());
statementFolderInput.addEventListener("change", analyzeStatementFiles);
clearStatementButton.addEventListener("click", clearStatementScan);
analyzeStatementTextButton.addEventListener("click", analyzePastedStatementText);
transactionSearchInput.addEventListener("input", renderTransactionReview);
transactionMonthFilter.addEventListener("change", renderTransactionReview);
transactionAccountFilter.addEventListener("change", renderTransactionReview);
transactionCategoryFilter.addEventListener("change", renderTransactionReview);
transactionTypeFilter.addEventListener("change", renderTransactionReview);
transactionSortMode.addEventListener("change", renderTransactionReview);
transactionReviewList.addEventListener("change", handleTransactionReviewChange);
transactionReviewList.addEventListener("click", handleTransactionReviewAction);
scenarioCutRange.addEventListener("input", syncScenarioCutFromRange);
scenarioCutValue.addEventListener("input", syncScenarioCutFromNumber);
scenarioCancelInput.addEventListener("input", renderScenarioPlanner);
scenarioGoalInput.addEventListener("change", renderScenarioPlanner);
autoDetectTransfersButton.addEventListener("click", autoDetectOwnTransfers);
accountSettingsForm.addEventListener("submit", addOwnAccount);
ownAccountList.addEventListener("click", handleOwnAccountAction);
transferWindowInput.addEventListener("change", saveAccountSettingsFromInputs);
transferToleranceInput.addEventListener("change", saveAccountSettingsFromInputs);
downloadMonthlyReportButton.addEventListener("click", downloadMonthlyReport);
printMonthlyReportButton.addEventListener("click", printMonthlyReport);
budgetForm.addEventListener("submit", saveBudget);
goalForm.addEventListener("submit", addSavingsGoal);
cancelForm.addEventListener("submit", addCancelPlan);
budgetList.addEventListener("click", handleBudgetAction);
goalList.addEventListener("click", handleGoalAction);
cancelList.addEventListener("click", handleCancelAction);
privacyReportList.addEventListener("click", handlePrivacyDelete);
wipeAllButton.addEventListener("click", wipeAllLocalData);
categoryForm.addEventListener("submit", addCategory);
reminderDaysInput.addEventListener("change", saveReminderSettings);
reminderModeInput.addEventListener("change", saveReminderSettings);
notificationButton.addEventListener("click", requestNotificationAccess);
checkRemindersButton.addEventListener("click", () => checkReminders(true));
parseEmailButton.addEventListener("click", parseEmailReceipt);
gmailFutureButton.addEventListener("click", explainGmailConnection);
subscriptionFindings.addEventListener("click", addDetectedSubscriptionToForm);
if (simulatorForm) simulatorForm.addEventListener("submit", handleSimulatorSubmit);
if (simSaveButton) simSaveButton.addEventListener("click", handleSimSave);
if (simResetButton) simResetButton.addEventListener("click", handleSimReset);
if (simScenarioList) simScenarioList.addEventListener("click", handleSavedScenarioAction);

billList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const bill = bills.find((item) => item.id === button.dataset.id);
  if (!bill) {
    return;
  }

  const action = button.dataset.action;
  if (action === "paid") {
    bill.nextDueDate = getNextDueDate(bill.nextDueDate, bill.frequency);
    bill.status = "active";
    bill.updatedAt = new Date().toISOString();
  }

  if (action === "edit") {
    fillForm(bill);
    return;
  }

  if (action === "pause") {
    bill.status = bill.status === "paused" ? "active" : "paused";
    bill.updatedAt = new Date().toISOString();
  }

  if (action === "cancel") {
    bill.status = bill.status === "cancelled" ? "active" : "cancelled";
    bill.updatedAt = new Date().toISOString();
  }

  if (action === "delete") {
    const confirmed = window.confirm(`Delete ${bill.name}?`);
    if (!confirmed) {
      return;
    }
    bills = bills.filter((item) => item.id !== bill.id);
  }

  saveBills();
  render();
});

function render() {
  const activeBills = bills.filter((bill) => bill.status === "active");
  const dueSoonBills = activeBills.filter((bill) => {
    const days = daysUntil(bill.nextDueDate);
    return days >= 0 && days <= 7;
  });

  monthlyTotal.textContent = formatTotalsByCurrency(activeBills, monthlyEquivalent);
  yearlyTotal.textContent = formatTotalsByCurrency(activeBills, yearlyEquivalent);
  dueSoonCount.textContent = String(dueSoonBills.length);
  activeCount.textContent = String(activeBills.length);
  renderInsights(activeBills);
  renderTimeline(activeBills);
  renderAnalystCenter();

  const visibleBills = getVisibleBills();
  emptyState.classList.toggle("hidden", visibleBills.length > 0);
  billList.innerHTML = visibleBills.map(renderBillCard).join("");

  if (bills.length === 0) {
    statusLine.textContent = "No saved bills yet.";
  } else if (visibleBills.length === 1) {
    statusLine.textContent = "Showing 1 bill.";
  } else if (visibleBills.length === 0) {
    statusLine.textContent = "No bills match your filters.";
  } else {
    statusLine.textContent = `Showing ${visibleBills.length} of ${bills.length} bills.`;
  }

  checkReminders(false);
}

function renderBillCard(bill) {
  const days = daysUntil(bill.nextDueDate);
  const dueBadge = getDueBadge(days, bill.status);
  const pauseLabel = bill.status === "paused" ? "Resume" : "Pause";
  const cancelLabel = bill.status === "cancelled" ? "Restore" : "Cancel";
  const actionDisabled = bill.status !== "active" ? "disabled" : "";
  const note = bill.note ? `<p class="bill-note">${escapeHtml(bill.note)}</p>` : "";

  return `
    <article class="bill-card">
      <div class="bill-main">
        <div class="bill-title-row">
          <h3>${escapeHtml(bill.name)}</h3>
          <span class="badge ${bill.status}">${bill.status}</span>
          ${dueBadge}
        </div>
        <div class="bill-meta">
          <span>${formatMoney(bill.amount, bill.currency)}</span>
          <span>${escapeHtml(bill.category)}</span>
          <span>${frequencyLabels[bill.frequency]}</span>
          <span>Due ${formatDate(bill.nextDueDate)}</span>
        </div>
        ${note}
      </div>
      <div class="bill-actions">
        <button class="bill-action primary" data-action="paid" data-id="${bill.id}" ${actionDisabled}>Paid</button>
        <button class="bill-action" data-action="edit" data-id="${bill.id}">Edit</button>
        <button class="bill-action" data-action="pause" data-id="${bill.id}">${pauseLabel}</button>
        <button class="bill-action" data-action="cancel" data-id="${bill.id}">${cancelLabel}</button>
        <button class="bill-action danger" data-action="delete" data-id="${bill.id}">Delete</button>
      </div>
    </article>
  `;
}

function getVisibleBills() {
  const filter = statusFilter.value;
  const query = searchInput.value.trim().toLowerCase();
  const filtered = bills.filter((bill) => {
    const matchesFilter = filter === "all" || bill.status === filter;
    const searchableText = [bill.name, bill.category, bill.note, bill.currency, bill.frequency].join(" ").toLowerCase();
    const matchesQuery = !query || searchableText.includes(query);
    return matchesFilter && matchesQuery;
  });

  return filtered.sort((a, b) => {
    if (sortMode.value === "amount") {
      return b.amount - a.amount;
    }

    if (sortMode.value === "name") {
      return a.name.localeCompare(b.name);
    }

    return parseLocalDate(a.nextDueDate) - parseLocalDate(b.nextDueDate);
  });
}

function renderInsights(activeBills) {
  const overdueBills = activeBills.filter((bill) => daysUntil(bill.nextDueDate) < 0);
  const yearlyBills = activeBills.filter((bill) => bill.frequency === "yearly");
  const highestBill = activeBills
    .map((bill) => ({ bill, monthly: monthlyEquivalent(bill) }))
    .sort((a, b) => b.monthly - a.monthly)[0]?.bill;

  insightSummary.innerHTML = `
    <div class="mini-stat">
      <span>Overdue</span>
      <strong>${overdueBills.length}</strong>
    </div>
    <div class="mini-stat">
      <span>Annual renewals</span>
      <strong>${yearlyBills.length}</strong>
    </div>
    <div class="mini-stat wide">
      <span>Review first</span>
      <strong>${highestBill ? escapeHtml(highestBill.name) : "Add a bill"}</strong>
    </div>
  `;

  const categoryRows = getCategoryRows(activeBills);
  if (categoryRows.length === 0) {
    categoryBreakdown.innerHTML = `<p class="muted">Add active bills to see category spending.</p>`;
    return;
  }

  const maxAmount = Math.max(...categoryRows.map((row) => row.amount));
  categoryBreakdown.innerHTML = categoryRows
    .map((row) => {
      const width = Math.max(8, Math.round((row.amount / maxAmount) * 100));
      return `
        <div class="breakdown-row">
          <div class="breakdown-label">
            <span>${escapeHtml(row.category)}</span>
            <strong>${formatMoney(row.amount, row.currency)}/mo</strong>
          </div>
          <div class="bar-track"><span style="width: ${width}%"></span></div>
        </div>
      `;
    })
    .join("");
}

function getCategoryRows(activeBills) {
  const totals = activeBills.reduce((result, bill) => {
    const key = `${bill.currency}|${bill.category}`;
    if (!result[key]) {
      result[key] = { currency: bill.currency, category: bill.category, amount: 0 };
    }
    result[key].amount += monthlyEquivalent(bill);
    return result;
  }, {});

  return Object.values(totals).sort((a, b) => b.amount - a.amount).slice(0, 6);
}

function renderTimeline(activeBills) {
  const upcomingBills = activeBills
    .map((bill) => ({ ...bill, days: daysUntil(bill.nextDueDate) }))
    .filter((bill) => bill.days >= 0 && bill.days <= 30)
    .sort((a, b) => a.days - b.days || a.name.localeCompare(b.name));

  if (upcomingBills.length === 0) {
    upcomingTimeline.innerHTML = `<p class="muted">No active bills are due in the next 30 days.</p>`;
    return;
  }

  upcomingTimeline.innerHTML = upcomingBills
    .map((bill) => {
      const timing = bill.days === 0 ? "Today" : bill.days === 1 ? "Tomorrow" : `In ${bill.days} days`;
      return `
        <div class="timeline-item">
          <div class="date-tile">
            <strong>${parseLocalDate(bill.nextDueDate).getDate()}</strong>
            <span>${new Intl.DateTimeFormat("en-GB", { month: "short" }).format(parseLocalDate(bill.nextDueDate))}</span>
          </div>
          <div>
            <h3>${escapeHtml(bill.name)}</h3>
            <p>${timing} · ${formatMoney(bill.amount, bill.currency)} · ${escapeHtml(bill.category)}</p>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderStatementEmpty() {
  statementSummary.innerHTML = `
    <div class="mini-stat">
      <span>Total spend</span>
      <strong>Upload</strong>
    </div>
    <div class="mini-stat">
      <span>Transactions</span>
      <strong>0</strong>
    </div>
  `;
  subscriptionFindings.innerHTML = `<p class="muted">Likely subscriptions will appear here after a scan.</p>`;
  savingSuggestions.innerHTML = `<p class="muted">Spending suggestions will appear here after a scan.</p>`;
}

function renderStoredStatementState() {
  if (statementTransactions.length === 0) {
    renderStatementEmpty();
    return;
  }

  latestStatementScan = buildStatementScan(getAnalyzedTransactions());
  renderStatementScan(latestStatementScan);
  statementMessage.textContent = `Loaded ${statementTransactions.length} saved statement transaction${statementTransactions.length === 1 ? "" : "s"} from this device. Check rows before trusting totals. New uploads merge into this history.`;
}

function mergeStatementTransactions(incomingTransactions) {
  const transactionMap = new Map();
  const result = {
    transactions: [],
    added: 0,
    updated: 0,
    duplicates: 0,
  };

  statementTransactions.forEach((transaction, index) => {
    transactionMap.set(transaction.key || getTransactionKey(transaction), normalizeStoredTransaction(transaction, index));
  });

  incomingTransactions.forEach((transaction) => {
    const normalized = normalizeStoredTransaction(transaction);
    const key = normalized.key;
    const legacyKey = getLegacyTransactionKey(normalized);
    const matchedKey = transactionMap.has(key) ? key : transactionMap.has(legacyKey) ? legacyKey : "";
    const existing = matchedKey ? transactionMap.get(matchedKey) : null;

    if (!existing) {
      transactionMap.set(key, normalized);
      result.added += 1;
      return;
    }

    const merged = { ...chooseBetterStatementTransaction(existing, normalized), key };
    transactionMap.delete(matchedKey);
    transactionMap.set(key, merged);
    if (JSON.stringify(merged) !== JSON.stringify(existing)) {
      result.updated += 1;
    } else {
      result.duplicates += 1;
    }
  });

  result.transactions = sortTransactionsByStatementOrder([...transactionMap.values()]);
  return result;
}

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

function getAnalyzedTransactions() {
  return statementTransactions.filter((transaction) => !isTransactionExcluded(transaction) && transaction.date && (transaction.spending > 0 || transaction.income > 0));
}

function normalizeAccount(value) {
  const original = String(value || "").trim();
  const text = normalizeAccountText(original);
  if (!text) {
    return "Unknown";
  }

  const matchedAccount = getOwnAccounts(false).find((account) => getAccountAliases(account).some((alias) => text.includes(alias)));
  if (matchedAccount) {
    return matchedAccount;
  }

  return original === "Unknown" ? "Unknown" : "Unknown";
}

function getOwnAccounts(includeUnknown = true) {
  const accounts = normalizeAccountList(accountSettings?.accounts || defaultOwnAccounts);
  return includeUnknown ? [...accounts, "Unknown"] : accounts;
}

function isOwnAccount(value) {
  const account = normalizeAccount(value);
  return account !== "Unknown" && getOwnAccounts(false).includes(account);
}

function normalizeAccountList(accounts) {
  const cleaned = (Array.isArray(accounts) ? accounts : [])
    .map((account) => titleCase(String(account || "").replace(/[^a-z0-9 &.-]+/gi, " ").trim()).slice(0, 32))
    .filter(Boolean);
  const unique = [];
  cleaned.forEach((account) => {
    if (!unique.some((item) => normalizeAccountText(item) === normalizeAccountText(account))) {
      unique.push(account);
    }
  });
  return unique.length ? unique : [...defaultOwnAccounts];
}

function normalizeAccountText(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function getAccountAliases(account) {
  const base = normalizeAccountText(account);
  const aliases = [base];
  if (base.includes("lloyd") || base.includes("loyald")) {
    aliases.push("lloyd", "lloyds", "loyald", "loyalds");
  }
  return [...new Set(aliases)].filter(Boolean);
}

function looksLikeOwnTransferText(value) {
  const text = normalizeAccountText(value);
  const rawText = String(value || "").toLowerCase();
  const mentionsTransfer = /\b(transfer|internal|between accounts|savings account|standing order to self|own account|faster payment)\b/.test(rawText);
  const mentionsKnownAccount = getOwnAccounts(false).some((account) => getAccountAliases(account).some((alias) => text.includes(alias)));
  const directionalAccount = getOwnAccounts(false).some((account) => {
    return getAccountAliases(account).some((alias) => new RegExp(`\\b(to|from)\\s+${alias}\\b`, "i").test(rawText.replace(/[^a-z0-9]+/g, " ")));
  });
  return (mentionsTransfer && mentionsKnownAccount) || directionalAccount;
}

function compareAccountNames(a, b) {
  const accountA = typeof a === "string" ? a : a.account;
  const accountB = typeof b === "string" ? b : b.account;
  const rank = getOwnAccounts(true);
  const rankA = rank.includes(accountA) ? rank.indexOf(accountA) : rank.length;
  const rankB = rank.includes(accountB) ? rank.indexOf(accountB) : rank.length;
  return rankA - rankB || String(accountA).localeCompare(String(accountB));
}

function detectStatementAccount(value) {
  return normalizeAccount(value);
}

function getStatementAccountForSource(sourceName) {
  const selected = statementAccountInput.value || "auto";
  return selected === "auto" ? detectStatementAccount(sourceName) : normalizeAccount(selected);
}

function renderStatementAccountOptions() {
  const selected = statementAccountInput.value || "auto";
  const options = [
    `<option value="auto">Auto detect</option>`,
    ...getOwnAccounts(false).map((account) => `<option value="${escapeHtml(account)}">${escapeHtml(account)}</option>`),
  ];
  statementAccountInput.innerHTML = options.join("");
  statementAccountInput.value = selected === "auto" || getOwnAccounts(false).includes(selected) ? selected : "auto";
}

function renderAccountSettings() {
  transferWindowInput.value = accountSettings.transferWindowDays;
  transferToleranceInput.value = accountSettings.amountTolerancePercent;
  const accounts = getOwnAccounts(false);
  ownAccountList.innerHTML = accounts
    .map((account) => {
      const removeButton = accounts.length > 1 ? `<button type="button" data-account="${escapeHtml(account)}">Remove</button>` : "";
      return `<span class="account-chip">${escapeHtml(account)}${removeButton}</span>`;
    })
    .join("");
}

function addOwnAccount(event) {
  event.preventDefault();
  const account = titleCase(newOwnAccountInput.value.replace(/[^a-z0-9 &.-]+/gi, " ").trim()).slice(0, 32);
  if (!account) {
    return;
  }

  const accounts = normalizeAccountList([...getOwnAccounts(false), account]);
  accountSettings = {
    ...accountSettings,
    accounts,
  };
  newOwnAccountInput.value = "";
  saveAccountSettings();
  renderStatementAccountOptions();
  renderAccountSettings();
  renderAnalystCenter();
  renderTransactionReviewFilters();
  renderTransactionReview();
}

function handleOwnAccountAction(event) {
  const button = event.target.closest("button[data-account]");
  if (!button) {
    return;
  }

  const account = button.dataset.account;
  const accounts = getOwnAccounts(false).filter((item) => item !== account);
  if (accounts.length === 0) {
    return;
  }

  accountSettings = {
    ...accountSettings,
    accounts,
  };
  saveAccountSettings();
  renderStatementAccountOptions();
  renderAccountSettings();
  renderAnalystCenter();
  renderTransactionReviewFilters();
  renderTransactionReview();
}

function saveAccountSettingsFromInputs() {
  accountSettings = {
    ...accountSettings,
    transferWindowDays: Math.round(clamp(Number(transferWindowInput.value || defaultAccountSettings.transferWindowDays), 0, 7)),
    amountTolerancePercent: roundMoney(clamp(Number(transferToleranceInput.value || defaultAccountSettings.amountTolerancePercent), 0, 10)),
  };
  saveAccountSettings();
  renderAccountSettings();
  renderAnalystCenter();
}

function tagTransactionsWithAccount(transactions, account, sourceName, sourceIndex = 0, importBatch = new Date().toISOString()) {
  return transactions.map((transaction) => ({
    ...transaction,
    account,
    sourceName,
    sourceIndex,
    importBatch,
    sourceOrder: Number.isFinite(Number(transaction.sourceOrder)) ? Number(transaction.sourceOrder) : 0,
    sourceSequence: sourceIndex * 100000 + (Number.isFinite(Number(transaction.sourceOrder)) ? Number(transaction.sourceOrder) : 0),
  }));
}

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

function chooseBetterStatementTransaction(existing, incoming) {
  const merged = { ...existing };
  let changed = false;

  if (incoming.description.length > existing.description.length) {
    merged.description = incoming.description;
    changed = true;
  }

  if (existing.category === "Other" && incoming.category !== "Other") {
    merged.category = incoming.category;
    changed = true;
  }

  if (existing.merchant === "Unknown merchant" && incoming.merchant !== "Unknown merchant") {
    merged.merchant = incoming.merchant;
    changed = true;
  }

  if (existing.account === "Unknown" && incoming.account !== "Unknown") {
    merged.account = incoming.account;
    changed = true;
  }

  if (!existing.sourceName && incoming.sourceName) {
    merged.sourceName = incoming.sourceName;
    changed = true;
  }

  if (!existing.importBatch && incoming.importBatch) {
    merged.importBatch = incoming.importBatch;
    changed = true;
  }

  if (!Number.isFinite(Number(existing.sourceSequence)) && Number.isFinite(Number(incoming.sourceSequence))) {
    merged.sourceIndex = incoming.sourceIndex;
    merged.sourceOrder = incoming.sourceOrder;
    merged.sourceSequence = incoming.sourceSequence;
    changed = true;
  }

  if (changed) {
    merged.updatedAt = new Date().toISOString();
  }

  return merged;
}

async function analyzeStatementFiles(event) {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) {
    return;
  }

  const importBatch = new Date().toISOString();
  const result = {
    transactions: [],
    read: [],
    skipped: [],
  };

  for (const [fileIndex, file] of files.entries()) {
    if (file.size > 10 * 1024 * 1024) {
      result.skipped.push(`${file.name}: over 10 MB`);
      continue;
    }

    if (!isSupportedStatementFile(file)) {
      result.skipped.push(`${file.name}: unsupported type`);
      continue;
    }

    try {
      const text = await extractStatementTextFromFile(file);
      const transactions = parseStatementText(text);
      if (transactions.length > 0) {
        const account = getStatementAccountForSource(file.name);
        result.transactions.push(...tagTransactionsWithAccount(transactions, account, file.name, fileIndex, importBatch));
        result.read.push(`${file.name} · ${account} (${transactions.length})`);
      } else {
        result.skipped.push(`${file.name}: no transactions found`);
      }
    } catch (error) {
      console.warn("Could not analyze statement", error);
      result.skipped.push(`${file.name}: ${error.message || "could not read"}`);
    }
  }

  statementFileInput.value = "";
  statementFolderInput.value = "";
  renderStatementTransactions(result.transactions, result.read, result.skipped);
}

function analyzePastedStatementText() {
  analyzeStatementText(statementTextInput.value, "pasted text");
}

function analyzeStatementText(text, sourceLabel) {
  const transactions = parseStatementText(text);
  if (transactions.length === 0) {
    statementMessage.textContent = "No transactions were found. Try CSV, or copy statement text with dates, descriptions, money in, money out, and balance.";
    renderStoredStatementState();
    return;
  }

  const account = getStatementAccountForSource(sourceLabel);
  renderStatementTransactions(tagTransactionsWithAccount(transactions, account, sourceLabel, 0, new Date().toISOString()), [`${sourceLabel} · ${account}`], []);
}

function renderStatementTransactions(transactions, sourceLabels, skippedLabels) {
  if (transactions.length === 0) {
    latestImportReport = buildImportReport({
      sourceLabels,
      skippedLabels,
      incomingCount: 0,
      added: 0,
      updated: 0,
      duplicates: 0,
    });
    statementMessage.textContent = skippedLabels.length
      ? `No transactions found. Skipped: ${skippedLabels.slice(0, 3).join("; ")}${skippedLabels.length > 3 ? "..." : ""}`
      : "No transactions were found.";
    renderStoredStatementState();
    renderAnalystCenter();
    return;
  }

  const mergeResult = mergeStatementTransactions(transactions);
  statementTransactions = mergeResult.transactions;
  saveStatementTransactions();
  latestStatementScan = buildStatementScan(getAnalyzedTransactions());
  renderStatementScan(latestStatementScan);
  latestImportReport = buildImportReport({
    sourceLabels,
    skippedLabels,
    incomingCount: transactions.length,
    added: mergeResult.added,
    updated: mergeResult.updated,
    duplicates: mergeResult.duplicates,
  });
  renderPlanning();
  renderVisualInsights();
  renderAnalystCenter();
  const sourceText = sourceLabels.length === 1 ? sourceLabels[0] : `${sourceLabels.length} files`;
  const skippedText = skippedLabels.length ? ` Skipped ${skippedLabels.length}: ${skippedLabels.slice(0, 2).join("; ")}${skippedLabels.length > 2 ? "..." : ""}` : "";
  const balanceText = formatBalanceCheckSummary(getBalanceCheckSummary(transactions));
  statementMessage.textContent = `Merged ${mergeResult.added} new, updated ${mergeResult.updated}, skipped ${mergeResult.duplicates} duplicate transaction${mergeResult.duplicates === 1 ? "" : "s"} from ${sourceText}. Saved total: ${statementTransactions.length}. Next: open Check rows and confirm Money In, Money Out, and Balance.${balanceText}${skippedText}`;
}

async function extractStatementTextFromFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const text = await extractPdfTextBestEffort(await file.arrayBuffer());
    if (!text.trim()) {
      throw new Error("This PDF did not expose readable text. If it is scanned or image-based, copy the text manually or export CSV from your bank.");
    }
    return text;
  }

  if (name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return extractDocxText(await file.arrayBuffer());
  }

  if (name.endsWith(".xlsx") || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    return extractXlsxText(await file.arrayBuffer());
  }

  return file.text();
}

function isSupportedStatementFile(file) {
  const name = file.name.toLowerCase();
  return [".csv", ".tsv", ".txt", ".pdf", ".docx", ".xlsx", ".ofx", ".qif"].some((extension) => name.endsWith(extension));
}

function clearStatementScan() {
  const confirmed = window.confirm("Delete saved statement history from this device?");
  if (!confirmed) {
    return;
  }

  latestStatementScan = null;
  statementTransactions = [];
  latestImportReport = null;
  saveStatementTransactions();
  statementTextInput.value = "";
  statementMessage.textContent = "Saved statement history deleted from this device.";
  renderStatementEmpty();
  renderPlanning();
  renderVisualInsights();
  renderAnalystCenter();
}

async function extractDocxText(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const entries = parseZipEntries(bytes);
  const documentEntry = entries.find((entry) => entry.name === "word/document.xml");
  if (!documentEntry) {
    throw new Error("This DOCX does not contain a readable Word document body.");
  }

  const xmlBytes = await readZipEntry(bytes, documentEntry);
  const xml = new TextDecoder("utf-8").decode(xmlBytes);
  return decodeXmlEntities(
    xml
      .replace(/<w:tab\/>/g, "\t")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/[^\S\r\n]+/g, " ")
      .replace(/\n\s+/g, "\n"),
  );
}

async function extractXlsxText(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const entries = parseZipEntries(bytes);
  const sharedStrings = await readXlsxSharedStrings(bytes, entries);
  const sheetEntries = entries.filter((entry) => /^xl\/worksheets\/sheet\d+\.xml$/.test(entry.name));

  if (sheetEntries.length === 0) {
    throw new Error("This XLSX does not contain readable sheets.");
  }

  const lines = [];
  for (const entry of sheetEntries) {
    const xml = new TextDecoder("utf-8").decode(await readZipEntry(bytes, entry));
    lines.push(...extractXlsxRows(xml, sharedStrings));
  }

  return lines.join("\n");
}

async function readXlsxSharedStrings(bytes, entries) {
  const sharedEntry = entries.find((entry) => entry.name === "xl/sharedStrings.xml");
  if (!sharedEntry) {
    return [];
  }

  const xml = new TextDecoder("utf-8").decode(await readZipEntry(bytes, sharedEntry));
  return [...xml.matchAll(/<si[\s\S]*?<\/si>/g)].map((match) => {
    const text = [...match[0].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((textMatch) => decodeXmlEntities(textMatch[1])).join("");
    return text.replace(/\s+/g, " ").trim();
  });
}

function extractXlsxRows(xml, sharedStrings) {
  return [...xml.matchAll(/<row[\s\S]*?<\/row>/g)]
    .map((rowMatch) => {
      const cells = [...rowMatch[0].matchAll(/<c([^>]*)>([\s\S]*?)<\/c>/g)].map((cellMatch) => {
        const attrs = cellMatch[1];
        const body = cellMatch[2];
        const valueMatch = body.match(/<v>([\s\S]*?)<\/v>/);
        const inlineMatch = body.match(/<is>([\s\S]*?)<\/is>/);

        if (attrs.includes('t="s"') && valueMatch) {
          return sharedStrings[Number(valueMatch[1])] || "";
        }

        if (attrs.includes('t="inlineStr"') && inlineMatch) {
          return decodeXmlEntities([...inlineMatch[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((match) => match[1]).join(""));
        }

        return valueMatch ? decodeXmlEntities(valueMatch[1]) : "";
      });

      return cells.map(csvCell).join(",");
    })
    .filter((line) => line.replace(/[",]/g, "").trim());
}

function parseZipEntries(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocdOffset = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65558); offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      eocdOffset = offset;
      break;
    }
  }

  if (eocdOffset < 0) {
    throw new Error("This DOCX could not be opened as a document archive.");
  }

  const entryCount = view.getUint16(eocdOffset + 10, true);
  let offset = view.getUint32(eocdOffset + 16, true);
  const entries = [];

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) {
      break;
    }

    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const nameBytes = bytes.slice(offset + 46, offset + 46 + nameLength);
    const name = new TextDecoder("utf-8").decode(nameBytes);

    entries.push({ name, method, compressedSize, uncompressedSize, localHeaderOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

async function readZipEntry(bytes, entry) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const localOffset = entry.localHeaderOffset;
  if (view.getUint32(localOffset, true) !== 0x04034b50) {
    throw new Error("This DOCX has an unreadable document part.");
  }

  const nameLength = view.getUint16(localOffset + 26, true);
  const extraLength = view.getUint16(localOffset + 28, true);
  const dataStart = localOffset + 30 + nameLength + extraLength;
  const compressed = bytes.slice(dataStart, dataStart + entry.compressedSize);

  if (entry.method === 0) {
    return compressed;
  }

  if (entry.method === 8) {
    return inflateBytes(compressed, entry.uncompressedSize);
  }

  throw new Error("This DOCX compression method is not supported in the browser.");
}

async function inflateBytes(bytes, expectedSize) {
  if (!("DecompressionStream" in window)) {
    throw new Error("This browser cannot extract DOCX files locally. Paste the statement text or use CSV.");
  }

  for (const format of ["deflate-raw", "deflate"]) {
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
      const inflated = new Uint8Array(await new Response(stream).arrayBuffer());
      if (!expectedSize || inflated.length === expectedSize) {
        return inflated;
      }
    } catch (error) {
      // Try the next deflate variant.
    }
  }

  throw new Error("This compressed DOCX text could not be extracted locally.");
}

async function extractPdfTextBestEffort(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const raw = new TextDecoder("latin1").decode(bytes);
  const streamTexts = await extractPdfStreams(bytes, raw);
  const positionedText = extractPdfPositionedLines(streamTexts);
  const operatorText = extractPdfTextOperators(`${raw}\n${streamTexts.join("\n")}`);
  return `${positionedText}\n${operatorText}`.trim();
}

function extractPdfPositionedLines(streamTexts) {
  const lines = [];
  const structuredRows = [];
  const textMatrixPattern = /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+Tm/g;

  streamTexts.forEach((streamText, streamIndex) => {
    if (!streamText.includes(" Tm") || (!streamText.includes("Tj") && !streamText.includes("TJ")) || !isMostlyPrintable(streamText)) {
      return;
    }

    const matrices = [...streamText.matchAll(textMatrixPattern)];
    const chunks = [];

    matrices.forEach((matrix, index) => {
      const x = Number(matrix[5]);
      const y = Number(matrix[6]);
      const end = matrices[index + 1]?.index ?? Math.min(streamText.length, matrix.index + 500);
      const segment = streamText.slice(matrix.index + matrix[0].length, end);
      const text = extractPdfLiteralStrings(segment).join("").trim();

      if (text && Number.isFinite(x) && Number.isFinite(y)) {
        chunks.push({ streamIndex, x, y, text });
      }
    });

    groupPdfChunksIntoLineGroups(chunks).forEach((group) => {
      lines.push(pdfLineGroupToText(group));
      const structuredRow = pdfLineGroupToStatementCsv(group);
      if (structuredRow) {
        structuredRows.push(structuredRow);
      }
    });
  });

  const structuredText = structuredRows.length > 0 ? ["Date,Description,Type,Money In,Money Out,Balance", ...structuredRows].join("\n") : "";
  return `${structuredText}\n${lines.join("\n")}`.trim();
}

function isMostlyPrintable(value) {
  if (!value) {
    return false;
  }

  const printable = [...value].filter((character) => {
    const code = character.charCodeAt(0);
    return code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126) || code >= 160;
  }).length;
  return printable / value.length > 0.85;
}

function extractPdfLiteralStrings(value) {
  return [...value.matchAll(/\((?:\\.|[^\\)])*\)/g)]
    .map((match) => decodePdfString(match[0].slice(1, -1)).trim())
    .filter(Boolean);
}

function groupPdfChunksIntoLineGroups(chunks) {
  const lineGroups = [];

  chunks
    .sort((a, b) => b.y - a.y || a.x - b.x)
    .forEach((chunk) => {
      const group = lineGroups.find((line) => line.streamIndex === chunk.streamIndex && Math.abs(line.y - chunk.y) < 3);
      if (group) {
        group.items.push(chunk);
      } else {
        lineGroups.push({ streamIndex: chunk.streamIndex, y: chunk.y, items: [chunk] });
      }
    });

  return lineGroups.map((line) => line.items.sort((a, b) => a.x - b.x));
}

function pdfLineGroupToText(items) {
  return items
    .map((item) => item.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function pdfLineGroupToStatementCsv(items) {
  const dateItem = items.find((item) => isStatementDateText(item.text));
  if (!dateItem) {
    return "";
  }

  const moneyIn = findPdfAmountByColumn(items, 300, 420);
  const moneyOut = findPdfAmountByColumn(items, 420, 500);
  const balance = findPdfAmountByColumn(items, 500, 620);
  if (!moneyIn && !moneyOut) {
    return "";
  }

  const typeItem = items.find((item) => item.x >= 245 && item.x < 315 && /^[A-Za-z]{1,5}$/.test(item.text));
  const description = items
    .filter((item) => item.x >= 90 && item.x < 300)
    .filter((item) => item !== typeItem)
    .filter((item) => !isStatementDateText(item.text) && !isAmountText(item.text) && !/^(blank|type)$/i.test(item.text))
    .map((item) => item.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (isStatementNonTransactionText(description || pdfLineGroupToText(items))) {
    return "";
  }

  const row = [dateItem.text, description || "Transaction", typeItem?.text || "", moneyIn, moneyOut, balance];
  return row.map(csvCell).join(",");
}

function findPdfAmountByColumn(items, minX, maxX) {
  const item = items.find((candidate) => candidate.x >= minX && candidate.x < maxX && isAmountText(candidate.text));
  return item ? item.text : "";
}

function isStatementDateText(value) {
  return /^(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4})$/.test(value.trim());
}

function isAmountText(value) {
  return /^[-(]?\s*[£$€₹Ł]?\s*\d[\d,]*\.\d{2}\)?\.?$/.test(value.trim());
}

async function extractPdfStreams(bytes, raw) {
  const texts = [];
  const streamPattern = /<<([\s\S]*?)>>\s*stream\r?\n?/g;
  let match;

  while ((match = streamPattern.exec(raw))) {
    const streamStart = streamPattern.lastIndex;
    const endIndex = raw.indexOf("endstream", streamStart);
    if (endIndex < 0) {
      break;
    }

    const streamEnd = raw[endIndex - 1] === "\n" && raw[endIndex - 2] === "\r" ? endIndex - 2 : raw[endIndex - 1] === "\n" ? endIndex - 1 : endIndex;
    const streamBytes = bytes.slice(streamStart, streamEnd);

    if (/FlateDecode/.test(match[1]) && "DecompressionStream" in window) {
      try {
        const inflated = await inflatePdfStream(streamBytes);
        texts.push(new TextDecoder("latin1").decode(inflated));
      } catch (error) {
        // Some PDFs use filters this demo intentionally does not support.
      }
    } else if (!/Filter/.test(match[1])) {
      texts.push(new TextDecoder("latin1").decode(streamBytes));
    }

    streamPattern.lastIndex = endIndex + "endstream".length;
  }

  return texts;
}

async function inflatePdfStream(bytes) {
  for (const format of ["deflate", "deflate-raw"]) {
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    } catch (error) {
      // Try the next deflate variant.
    }
  }
  throw new Error("Could not inflate PDF stream.");
}

function extractPdfTextOperators(text) {
  const blocks = [...text.matchAll(/BT([\s\S]*?)ET/g)].map((match) => match[1]).join("\n") || text;
  const pieces = [];

  for (const match of blocks.matchAll(/\((?:\\.|[^\\)])*\)/g)) {
    pieces.push(decodePdfString(match[0].slice(1, -1)));
  }

  for (const match of blocks.matchAll(/<([0-9A-Fa-f\s]{4,})>/g)) {
    const decoded = decodePdfHexString(match[1]);
    if (decoded.trim()) {
      pieces.push(decoded);
    }
  }

  return pieces
    .join("\n")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodePdfString(value) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
}

function decodePdfHexString(value) {
  const hex = value.replace(/\s+/g, "");
  if (hex.length < 4) {
    return "";
  }

  const bytes = [];
  for (let index = 0; index < hex.length - 1; index += 2) {
    bytes.push(parseInt(hex.slice(index, index + 2), 16));
  }

  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    let text = "";
    for (let index = 2; index < bytes.length - 1; index += 2) {
      text += String.fromCharCode((bytes[index] << 8) + bytes[index + 1]);
    }
    return text;
  }

  return new TextDecoder("latin1").decode(new Uint8Array(bytes));
}

function decodeXmlEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function parseStatementText(text) {
  const cleanText = text.replace(/^\uFEFF/, "").trim();
  if (!cleanText) {
    return [];
  }

  const ofxTransactions = parseOfxStatement(cleanText);
  if (ofxTransactions.length > 0) {
    return ofxTransactions;
  }

  const qifTransactions = parseQifStatement(cleanText);
  if (qifTransactions.length > 0) {
    return qifTransactions;
  }

  const delimiter = detectDelimiter(cleanText);
  const rows = parseDelimitedRows(cleanText, delimiter).filter((row) => row.some((cell) => cell.trim()));
  if (rows.length < 2) {
    return parseLooseStatementText(cleanText);
  }

  const header = rows[0].map(normalizeHeader);
  const indexes = detectStatementColumns(header);
  const hasUsefulColumns = indexes.date >= 0 && indexes.description >= 0 && (indexes.amount >= 0 || indexes.debit >= 0);
  if (!hasUsefulColumns) {
    return parseLooseStatementText(cleanText);
  }

  const parsedRows = rows
    .slice(1)
    .map((row, rowIndex) => normalizeStatementRow(row, indexes, rowIndex))
    .filter(Boolean);

  const transactions = parsedRows.filter((transaction) => transaction.spending > 0 || transaction.income > 0);
  return transactions.length > 0
    ? reconcileTransactionsWithBalances(parsedRows).filter((transaction) => !transaction.isBalanceOnly && (transaction.spending > 0 || transaction.income > 0))
    : parseLooseStatementText(cleanText);
}

function reconcileTransactionsWithBalances(transactions) {
  const rowsWithBalance = transactions.filter((transaction) => Number.isFinite(Number(transaction.balance)));
  if (rowsWithBalance.length < 2) {
    return transactions;
  }

  const orderedRows = [...transactions].sort((a, b) => Number(a.sourceOrder || 0) - Number(b.sourceOrder || 0));
  const forwardScore = scoreBalanceDirection(orderedRows, "forward");
  const reverseScore = scoreBalanceDirection(orderedRows, "reverse");
  const direction = reverseScore.matches > forwardScore.matches ? "reverse" : "forward";

  return orderedRows
    .map((transaction, index, list) => applyBalanceCheck(transaction, index, list, direction))
    .sort((a, b) => Number(a.sourceOrder || 0) - Number(b.sourceOrder || 0));
}

function reconcileStoredStatementTransactions(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return transactions;
  }

  const groups = new Map();
  transactions.forEach((transaction) => {
    const key = `${transaction.account || "Unknown"}|${transaction.importBatch || ""}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(transaction);
  });

  const out = [];
  groups.forEach((group) => {
    const ordered = [...group].sort(compareStatementOrder);
    const hasBalance = ordered.some((transaction) => Number.isFinite(Number(transaction.balance)));
    out.push(...(hasBalance ? reconcileTransactionsWithBalances(ordered) : ordered));
  });

  return sortTransactionsByStatementOrder(out);
}

function scoreBalanceDirection(rows, direction) {
  let matches = 0;
  let checked = 0;

  rows.forEach((transaction, index) => {
    const balanceDelta = getBalanceDelta(rows, index, direction);
    if (balanceDelta === null) {
      return;
    }

    checked += 1;
    if (moneyAlmostEqual(balanceDelta, getSignedTransactionAmount(transaction))) {
      matches += 1;
    }
  });

  return { matches, checked };
}

function applyBalanceCheck(transaction, index, rows, direction) {
  if (transaction.reviewedAt) {
    return { ...transaction, balanceCheck: transaction.balanceCheck || "" };
  }

  const balanceDelta = getBalanceDelta(rows, index, direction);
  if (balanceDelta === null) {
    return { ...transaction, balanceCheck: transaction.balanceCheck || "" };
  }

  const signedAmount = getSignedTransactionAmount(transaction);
  if (moneyAlmostEqual(balanceDelta, signedAmount)) {
    return { ...transaction, balanceCheck: "ok" };
  }

  const rowAmount = Math.max(Number(transaction.income) || 0, Number(transaction.spending) || 0);
  const allowFlip = rowAmount > 0 && (transaction.needsReconcile || moneyAlmostEqual(Math.abs(balanceDelta), rowAmount));
  if (allowFlip) {
    return {
      ...transaction,
      income: balanceDelta > 0 ? roundMoney(Math.abs(balanceDelta)) : 0,
      spending: balanceDelta < 0 ? roundMoney(Math.abs(balanceDelta)) : 0,
      balanceCheck: "corrected",
    };
  }

  return {
    ...transaction,
    balanceCheck: "mismatch",
  };
}

function getBalanceDelta(rows, index, direction) {
  const currentBalance = Number(rows[index]?.balance);
  if (!Number.isFinite(currentBalance)) {
    return null;
  }

  if (direction === "forward") {
    const previousBalance = Number(rows[index - 1]?.balance);
    return Number.isFinite(previousBalance) ? roundMoney(currentBalance - previousBalance) : null;
  }

  const nextBalance = Number(rows[index + 1]?.balance);
  return Number.isFinite(nextBalance) ? roundMoney(currentBalance - nextBalance) : null;
}

function getSignedTransactionAmount(transaction) {
  return roundMoney((Number(transaction.income) || 0) - (Number(transaction.spending) || 0));
}

function moneyAlmostEqual(a, b) {
  return Math.abs(roundMoney(a) - roundMoney(b)) <= 0.02;
}

function parseOfxStatement(text) {
  const blocks = [...text.matchAll(/<STMTTRN>([\s\S]*?)(?=<STMTTRN>|<\/BANKTRANLIST>|$)/gi)].map((match) => match[1]);
  return blocks
    .map((block) => {
      const amount = parseMoneyValue(readOfxTag(block, "TRNAMT"));
      const date = parseOfxDate(readOfxTag(block, "DTPOSTED"));
      const description = readOfxTag(block, "NAME") || readOfxTag(block, "MEMO") || "Transaction";
      const spending = amount < 0 ? Math.abs(amount) : 0;
      const income = amount > 0 ? amount : 0;

      if (!date || (!spending && !income)) {
        return null;
      }

      return {
        date,
        description,
        merchant: normalizeMerchant(description),
        spending,
        income,
        category: categorizeStatement(description),
      };
    })
    .filter(Boolean);
}

function readOfxTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, "i"));
  return match ? match[1].trim() : "";
}

function parseOfxDate(value) {
  const match = String(value || "").match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) {
    return "";
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function parseQifStatement(text) {
  const records = text.split(/\n\^/).map((record) => record.replace(/^\^/, "").trim()).filter(Boolean);
  return records
    .map((record) => {
      const lines = record.split(/\r?\n/);
      const dateLine = lines.find((line) => line.startsWith("D")) || "";
      const amountLine = lines.find((line) => line.startsWith("T")) || "";
      const payeeLine = lines.find((line) => line.startsWith("P")) || "";
      const memoLine = lines.find((line) => line.startsWith("M")) || "";
      const amount = parseMoneyValue(amountLine.slice(1));
      const date = parseStatementDate(dateLine.slice(1));
      const description = (payeeLine.slice(1) || memoLine.slice(1) || "Transaction").trim();
      const spending = amount < 0 ? Math.abs(amount) : 0;
      const income = amount > 0 ? amount : 0;

      if (!date || (!spending && !income)) {
        return null;
      }

      return {
        date,
        description,
        merchant: normalizeMerchant(description),
        spending,
        income,
        category: categorizeStatement(description),
      };
    })
    .filter(Boolean);
}

function parseLooseStatementText(text) {
  const parsedRows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, lineIndex) => parseLooseStatementLine(line, lineIndex))
    .filter(Boolean);

  const transactions = parsedRows.filter((transaction) => transaction.spending > 0 || transaction.income > 0);
  return transactions.length > 0
    ? reconcileTransactionsWithBalances(parsedRows).filter((transaction) => !transaction.isBalanceOnly && (transaction.spending > 0 || transaction.income > 0))
    : [];
}

function parseLooseStatementLine(line, sourceOrder = 0) {
  if (isStatementNonTransactionText(line)) {
    return null;
  }

  const dateMatch = line.match(/\b(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4})\b/);
  const amountMatches = [...line.matchAll(/[£$€₹]\s*\d[\d,]*(?:\.\d{1,2})?|[-(]?\s*[£$€₹]?\s*\d[\d,]*\.\d{2}\)?/g)];
  if (!dateMatch || amountMatches.length === 0) {
    return null;
  }

  if (amountMatches.length === 1 && /\b(opening balance|closing balance|previous balance|balance brought forward|brought forward|balance)\b/i.test(line)) {
    const date = parseStatementDate(dateMatch[0]);
    const balance = parseOptionalMoneyValue(amountMatches[0][0]);
    return date && Number.isFinite(balance)
      ? {
          date,
          description: "Balance",
          merchant: "Balance",
          spending: 0,
          income: 0,
          balance,
          balanceCheck: "",
          sourceOrder,
          category: "Other",
          isBalanceOnly: true,
        }
      : null;
  }

  const amountText = chooseLooseAmount(line, amountMatches);
  const amount = parseMoneyValue(amountText);
  const balanceText = amountMatches.length > 1 ? amountMatches[amountMatches.length - 1][0] : "";
  const balance = amountMatches.length > 1 && balanceText !== amountText ? parseOptionalMoneyValue(balanceText) : null;
  const directionHint = getStatementDirectionHint(line);
  const debitWords = /\b(payment|withdrawal|debit|purchase|atm|standing order|direct debit|bill|charge|fee|paid out|transfer to|spent|fpo|faster payment out)\b/i;
  const incomeWords = /\b(salary|wage|payroll|deposit|refund|credit|credited|paid in|interest paid|transfer from|received|reimbursement|cashback|bacs in|fpi|faster payment in)\b/i;
  const explicitNegative = /[-(]\s*[£$€₹]?\s*\d/.test(amountText) || /\bdr\b/i.test(line);
  const explicitPositive = /\bcr\b/i.test(line);
  const looksDebit = debitWords.test(line);
  const looksIncome = incomeWords.test(line);
  let direction;
  if (amount < 0 || explicitNegative) {
    direction = "out";
  } else if (directionHint) {
    direction = directionHint;
  } else if (explicitPositive || (looksIncome && !looksDebit)) {
    direction = "in";
  } else if (looksDebit && !looksIncome) {
    direction = "out";
  } else {
    direction = null;
  }
  const magnitude = Math.abs(amount);
  const spending = direction === "out" ? magnitude : direction === null ? magnitude : 0;
  const income = direction === "in" ? magnitude : 0;
  const needsReconcile = direction === null;
  const date = parseStatementDate(dateMatch[0]);
  let description = line.replace(dateMatch[0], " ");
  amountMatches.forEach((match) => {
    description = description.replace(match[0], " ");
  });
  description = description
    .replace(/\s+/g, " ")
    .trim();

  if (!date || (!spending && !income) || !description) {
    return null;
  }

  return {
    date,
    description,
    merchant: normalizeMerchant(description),
    spending,
    income,
    balance,
    balanceCheck: "",
    sourceOrder,
    category: categorizeStatement(description),
    needsReconcile,
  };
}

function chooseLooseAmount(line, amountMatches) {
  const lowerLine = line.toLowerCase();
  if (lowerLine.includes("balance") && amountMatches.length > 1) {
    return amountMatches[0][0];
  }
  if (amountMatches.length > 1) {
    return amountMatches[0][0];
  }
  return amountMatches[amountMatches.length - 1][0];
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || "";
  const candidates = [",", "\t", ";"];
  return candidates
    .map((delimiter) => ({ delimiter, count: firstLine.split(delimiter).length }))
    .sort((a, b) => b.count - a.count)[0].delimiter;
}

function parseDelimitedRows(text, delimiter) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell.trim());
  rows.push(row);
  return rows;
}

function normalizeHeader(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isStatementNonTransactionText(value) {
  const text = normalizeKeyText(value);
  if (!text) {
    return false;
  }

  const headerLike = text.includes("money in") && text.includes("money out") && text.includes("balance");
  const balanceSummary = text.includes("money out") && (text.includes("balance on") || text.includes("balance"));
  const balanceOnly = /\b(opening balance|closing balance|previous balance|balance brought forward|brought forward|balance on)\b/i.test(String(value || ""));
  const noMerchantText = /^(date )?(description )?(type )?(money in )?money out (balance )?(on )?/.test(text);
  return headerLike || balanceSummary || balanceOnly || noMerchantText;
}

function getStatementDirectionHint(value) {
  const text = normalizeKeyText(value);
  if (/\b(fpi|faster payment in|paid in|money in|bacs in|credit from|credited|received)\b/.test(text)) {
    return "in";
  }
  if (/\b(fpo|faster payment out|paid out|money out|direct debit|debit|card payment|purchase|withdrawal)\b/.test(text)) {
    return "out";
  }
  return "";
}

function detectStatementColumns(header) {
  const findIndex = (terms) => header.findIndex((label) => terms.some((term) => label.includes(term)));
  return {
    date: findIndex(["date", "posted", "transaction date"]),
    description: findIndex(["description", "details", "narrative", "merchant", "payee", "name", "reference"]),
    type: findIndex(["type", "transaction type"]),
    amount: findIndex(["amount", "value", "transaction amount"]),
    debit: findIndex(["debit", "paid out", "money out", "withdrawal", "spent"]),
    credit: findIndex(["credit", "paid in", "money in", "deposit"]),
    balance: findIndex(["balance", "running balance"]),
  };
}

function normalizeStatementRow(row, indexes, rowIndex = 0) {
  const dateValue = row[indexes.date] || row[0] || "";
  const description = row[indexes.description] || row[1] || "Transaction";
  const typeText = indexes.type >= 0 ? row[indexes.type] || "" : "";
  const amount = indexes.amount >= 0 ? parseMoneyValue(row[indexes.amount]) : 0;
  const debit = indexes.debit >= 0 ? parseMoneyValue(row[indexes.debit]) : 0;
  const credit = indexes.credit >= 0 ? parseMoneyValue(row[indexes.credit]) : 0;
  const balance = indexes.balance >= 0 ? parseOptionalMoneyValue(row[indexes.balance]) : null;
  const directionHint = getStatementDirectionHint(`${typeText} ${description}`);
  let spending = indexes.debit >= 0 && debit !== 0 ? Math.abs(debit) : amount < 0 ? Math.abs(amount) : 0;
  let income = indexes.credit >= 0 && credit !== 0 ? Math.abs(credit) : amount > 0 ? amount : 0;
  const visibleAmount = Math.max(Math.abs(debit), Math.abs(credit), Math.abs(amount));
  const date = parseStatementDate(dateValue);

  if (directionHint === "in" && visibleAmount > 0) {
    income = visibleAmount;
    spending = 0;
  }

  if (directionHint === "out" && visibleAmount > 0) {
    spending = visibleAmount;
    income = 0;
  }

  if (!date) {
    return null;
  }

  if (isStatementNonTransactionText(description)) {
    return null;
  }

  if (!spending && !income) {
    return Number.isFinite(balance)
      ? {
          date,
          description: description.trim() || "Balance",
          merchant: "Balance",
          spending: 0,
          income: 0,
          balance,
          balanceCheck: "",
          sourceOrder: rowIndex,
          category: "Other",
          isBalanceOnly: true,
        }
      : null;
  }

  return {
    date,
    description: description.trim(),
    merchant: normalizeMerchant(description),
    spending,
    income,
    balance: Number.isFinite(balance) ? balance : null,
    balanceCheck: "",
    sourceOrder: rowIndex,
    category: categorizeStatement(description),
  };
}

function parseMoneyValue(value) {
  const text = String(value || "").trim();
  if (!text) {
    return 0;
  }

  const isNegative = /\(|-|dr\b/i.test(text);
  const cleaned = text.replace(/[^\d.,-]/g, "").replace(/,/g, "").replace(/\.(?=.*\.)/g, "").replace(/\.$/, "");
  const number = Number(cleaned);
  if (!Number.isFinite(number)) {
    return 0;
  }
  return isNegative ? -Math.abs(number) : number;
}

function parseOptionalMoneyValue(value) {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }

  const amount = parseMoneyValue(text);
  return Number.isFinite(amount) ? amount : null;
}

function parseStatementDate(value) {
  const text = String(value || "").trim();
  const excelSerial = Number(text);
  if (/^\d{5}(?:\.\d+)?$/.test(text) && Number.isFinite(excelSerial)) {
    return toDateInputValue(new Date(Math.round((excelSerial - 25569) * 86400000)));
  }

  const isoMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return toDateInputValue(new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3])));
  }

  const monthNameMatch = text.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})$/);
  if (monthNameMatch) {
    const monthIndex = monthNameToIndex(monthNameMatch[2]);
    const year = Number(monthNameMatch[3].length === 2 ? `20${monthNameMatch[3]}` : monthNameMatch[3]);
    if (monthIndex >= 0) {
      return toDateInputValue(new Date(year, monthIndex, Number(monthNameMatch[1])));
    }
  }

  const slashMatch = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (slashMatch) {
    const year = Number(slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3]);
    return toDateInputValue(new Date(year, Number(slashMatch[2]) - 1, Number(slashMatch[1])));
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return toDateInputValue(parsed);
}

function monthNameToIndex(value) {
  const month = value.slice(0, 3).toLowerCase();
  return ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(month);
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

function categorizeStatement(description) {
  const text = description.toLowerCase();
  const match = statementCategoryRules.find((rule) => rule.words.some((word) => text.includes(word)));
  return match ? match.category : "Other";
}

function buildStatementScan(transactions) {
  const totalSpend = transactions.reduce((sum, transaction) => sum + transaction.spending, 0);
  const totalIncome = transactions.reduce((sum, transaction) => sum + transaction.income, 0);
  const dateRange = getStatementDateRange(transactions);
  const categoryTotals = getStatementCategoryTotals(transactions);
  const subscriptions = detectStatementSubscriptions(transactions);
  const balanceSummary = getBalanceCheckSummary(transactions);
  const suggestions = buildSavingSuggestions({ totalSpend, totalIncome, categoryTotals, subscriptions, dateRange });

  return {
    totalSpend,
    totalIncome,
    netCashflow: totalIncome - totalSpend,
    transactionCount: transactions.length,
    incomeCount: transactions.filter((transaction) => transaction.income > 0).length,
    spendingCount: transactions.filter((transaction) => transaction.spending > 0).length,
    balanceSummary,
    dateRange,
    categoryTotals,
    subscriptions,
    suggestions,
  };
}

function getStatementDateRange(transactions) {
  if (transactions.length === 0) {
    const today = toDateInputValue(new Date());
    return {
      start: today,
      end: today,
      months: 1,
    };
  }

  const dates = transactions.map((transaction) => parseLocalDate(transaction.date)).sort((a, b) => a - b);
  return {
    start: toDateInputValue(dates[0]),
    end: toDateInputValue(dates[dates.length - 1]),
    months: Math.max(1, monthSpan(dates[0], dates[dates.length - 1])),
  };
}

function monthSpan(start, end) {
  return (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1;
}

function getStatementCategoryTotals(transactions) {
  const totals = transactions.reduce((result, transaction) => {
    if (transaction.spending <= 0) {
      return result;
    }
    result[transaction.category] = (result[transaction.category] || 0) + transaction.spending;
    return result;
  }, {});

  return Object.entries(totals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

function detectStatementSubscriptions(transactions) {
  const merchantGroups = transactions.filter((transaction) => transaction.spending > 0 && !shouldExcludeFromSubscriptionDetection(transaction)).reduce((result, transaction) => {
    if (!result[transaction.merchant]) {
      result[transaction.merchant] = [];
    }
    result[transaction.merchant].push(transaction);
    return result;
  }, {});

  return Object.entries(merchantGroups)
    .map(([merchant, group]) => buildSubscriptionCandidate(merchant, group))
    .filter(Boolean)
    .sort((a, b) => b.confidence - a.confidence || b.monthlyEstimate - a.monthlyEstimate)
    .slice(0, 8);
}

function buildSubscriptionCandidate(merchant, group) {
  const sorted = group.sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
  const combinedText = `${merchant} ${sorted.map((item) => item.description).join(" ")}`.toLowerCase();
  if (nonSubscriptionWords.some((word) => combinedText.includes(word))) {
    return null;
  }

  const averageAmount = sorted.reduce((sum, item) => sum + item.spending, 0) / sorted.length;
  const similarAmounts = sorted.filter((item) => Math.abs(item.spending - averageAmount) <= Math.max(1, averageAmount * 0.12)).length;
  const recurringGap = hasRecurringGap(sorted);
  const keywordMatch = subscriptionWords.some((word) => merchant.includes(word) || sorted.some((item) => item.description.toLowerCase().includes(word)));
  const repeated = sorted.length >= 2 && similarAmounts >= 2;
  const confidence = Math.min(95, (keywordMatch ? 35 : 0) + (repeated ? 35 : 0) + (recurringGap ? 25 : 0) + Math.min(10, sorted.length * 2));

  if (!keywordMatch && averageAmount > 250) {
    return null;
  }

  if (!keywordMatch && !recurringGap && sorted.length < 3) {
    return null;
  }

  if (confidence < 45) {
    return null;
  }

  return {
    merchant: titleCase(merchant),
    amount: averageAmount,
    category: sorted[0].category,
    frequency: recurringGap || "monthly",
    lastDate: sorted[sorted.length - 1].date,
    occurrences: sorted.length,
    confidence,
    monthlyEstimate: recurringGap === "yearly" ? averageAmount / 12 : recurringGap === "weekly" ? (averageAmount * 52) / 12 : averageAmount,
  };
}

function shouldExcludeFromSubscriptionDetection(transaction) {
  if (["income", "salary", "transfer", "refund", "ignore"].includes(transaction.type)) {
    return true;
  }

  const text = `${transaction.description || ""} ${transaction.merchant || ""}`.toLowerCase();
  return nonSubscriptionWords.some((word) => text.includes(word));
}

function hasRecurringGap(transactions) {
  if (transactions.length < 2) {
    return "";
  }

  const gaps = [];
  for (let index = 1; index < transactions.length; index += 1) {
    gaps.push(daysBetween(transactions[index - 1].date, transactions[index].date));
  }

  const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  if (averageGap >= 5 && averageGap <= 10) {
    return "weekly";
  }
  if (averageGap >= 25 && averageGap <= 38) {
    return "monthly";
  }
  if (averageGap >= 350 && averageGap <= 380) {
    return "yearly";
  }
  return "";
}

function daysBetween(start, end) {
  return Math.round((parseLocalDate(end) - parseLocalDate(start)) / 86400000);
}

function buildSavingSuggestions(scan) {
  const suggestions = [];
  const months = scan.dateRange.months || 1;
  const flexibleCategories = ["Dining", "Shopping", "Entertainment", "Other"];
  const monthlyIncome = scan.totalIncome / months;
  const monthlySpend = scan.totalSpend / months;

  if (scan.totalIncome > 0) {
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlySpend) / monthlyIncome) * 100 : 0;
    suggestions.push({
      title: "Track your savings rate",
      body: `Average income is ${formatMoney(monthlyIncome, "GBP")} per month and average spend is ${formatMoney(monthlySpend, "GBP")}. Current estimated savings rate: ${Math.round(savingsRate)}%.`,
    });
  }

  scan.categoryTotals.slice(0, 4).forEach((row) => {
    const monthlyAverage = row.amount / months;
    if (flexibleCategories.includes(row.category) && monthlyAverage >= 50) {
      suggestions.push({
        title: `Set a ${row.category.toLowerCase()} limit`,
        body: `Average spend is about ${formatMoney(monthlyAverage, "GBP")} per month. Try a 10% cut first: ${formatMoney(monthlyAverage * 0.1, "GBP")} monthly saving target.`,
      });
    }
  });

  if (scan.subscriptions.length > 0) {
    const subscriptionTotal = scan.subscriptions.reduce((sum, item) => sum + item.monthlyEstimate, 0);
    suggestions.push({
      title: "Review recurring payments",
      body: `Detected subscriptions cost around ${formatMoney(subscriptionTotal, "GBP")} per month. Cancel one unused service before adding another.`,
    });
  }

  const feeCategory = scan.categoryTotals.find((row) => row.category === "Fees");
  if (feeCategory && feeCategory.amount > 0) {
    suggestions.push({
      title: "Reduce avoidable fees",
      body: `Fees and charges total ${formatMoney(feeCategory.amount, "GBP")} in this statement. Check overdraft, late payment, or ATM charges first.`,
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      title: "Use a weekly money check",
      body: "Pick one day each week to review upcoming bills and recent card spending. Small checks prevent surprise renewals.",
    });
  }

  return suggestions.slice(0, 5);
}

function renderStatementScan(scan) {
  const maxCategory = Math.max(1, ...scan.categoryTotals.map((row) => row.amount));
  const balanceCheckText = scan.balanceSummary.checked
    ? `${scan.balanceSummary.ok} ok${scan.balanceSummary.corrected ? ` · ${scan.balanceSummary.corrected} corrected` : ""}${scan.balanceSummary.mismatch ? ` · ${scan.balanceSummary.mismatch} review` : ""}`
    : "No balance";
  const categoryRows = scan.categoryTotals.length
    ? scan.categoryTotals
        .slice(0, 6)
        .map((row) => {
          const width = Math.max(8, Math.round((row.amount / maxCategory) * 100));
          return `
        <div class="breakdown-row">
          <div class="breakdown-label">
            <span>${escapeHtml(row.category)}</span>
            <strong>${formatMoney(row.amount, "GBP")}</strong>
          </div>
          <div class="bar-track"><span style="width: ${width}%"></span></div>
        </div>
      `;
        })
        .join("")
    : `<p class="muted">No spending transactions are currently included in analysis.</p>`;

  statementSummary.innerHTML = `
    <div class="mini-stat">
      <span>Total earned</span>
      <strong>${formatMoney(scan.totalIncome, "GBP")}</strong>
    </div>
    <div class="mini-stat">
      <span>Total spent</span>
      <strong>${formatMoney(scan.totalSpend, "GBP")}</strong>
    </div>
    <div class="mini-stat">
      <span>Net cashflow</span>
      <strong>${formatMoney(scan.netCashflow, "GBP")}</strong>
    </div>
    <div class="mini-stat">
      <span>Balance check</span>
      <strong>${escapeHtml(balanceCheckText)}</strong>
    </div>
    <div class="mini-stat wide">
      <span>Statement period</span>
      <strong>${formatDate(scan.dateRange.start)} to ${formatDate(scan.dateRange.end)} · ${scan.spendingCount} spent · ${scan.incomeCount} earned</strong>
    </div>
    <div class="statement-bars">${categoryRows}</div>
  `;

  subscriptionFindings.innerHTML = scan.subscriptions.length
    ? scan.subscriptions.map(renderSubscriptionFinding).join("")
    : `<p class="muted">No strong recurring subscriptions found in this file.</p>`;

  savingSuggestions.innerHTML = scan.suggestions.map(renderSavingSuggestion).join("");
}

function renderSubscriptionFinding(item, index) {
  return `
    <div class="finding-item">
      <div>
        <h4>${escapeHtml(item.merchant)}</h4>
        <p>${formatMoney(item.amount, "GBP")} | ${item.frequency} | ${item.occurrences} payment${item.occurrences === 1 ? "" : "s"} | ${item.confidence}% confidence</p>
      </div>
      <button class="ghost-button" type="button" data-subscription-index="${index}">Add bill</button>
    </div>
  `;
}

function renderSavingSuggestion(item) {
  return `
    <div class="finding-item text-only">
      <div>
        <h4>${escapeHtml(item.title)}</h4>
        <p>${escapeHtml(item.body)}</p>
      </div>
    </div>
  `;
}

function addDetectedSubscriptionToForm(event) {
  const button = event.target.closest("button[data-subscription-index]");
  if (!button || !latestStatementScan) {
    return;
  }

  const item = latestStatementScan.subscriptions[Number(button.dataset.subscriptionIndex)];
  if (!item) {
    return;
  }

  if (!categories.includes(item.category)) {
    categories = [...categories.filter((category) => category !== "Other"), item.category, "Other"];
    saveCategories();
    renderCategories();
  }

  billIdInput.value = "";
  nameInput.value = item.merchant;
  amountInput.value = item.amount.toFixed(2);
  currencyInput.value = "GBP";
  categoryInput.value = categories.includes(item.category) ? item.category : "Other";
  frequencyInput.value = item.frequency;
  nextDueDateInput.value = getNextDueDate(item.lastDate, item.frequency);
  noteInput.value = "Suggested from local bank statement scan.";
  formTitle.textContent = "Review detected bill";
  saveButton.textContent = "Save bill";
  nameInput.focus();
}

function titleCase(value) {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

function renderPlanning() {
  renderBudgetCategoryOptions();
  renderBudgets();
  renderPriceAlerts();
  renderCancelPlans();
  renderSavingsGoals();
  renderStatementHistory();
  renderVisualInsights();
  renderAnalystCenter();
}

function renderVisualInsights() {
  const months = getMonthlyStatementHistory().slice(-8);
  renderIncomeSpendChart(months);
  renderCategoryDonutChart();
  renderCashflowChart(months);
  renderBudgetChart();
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

function buildImportReport({ sourceLabels, skippedLabels, incomingCount, added, updated, duplicates }) {
  const balanceSummary = getBalanceCheckSummary(statementTransactions);
  const totalSources = sourceLabels.length + skippedLabels.length;
  const readRatio = totalSources > 0 ? sourceLabels.length / totalSources : 0;
  const mergeTotal = added + updated + duplicates;
  const score = Math.round(
    Math.min(
      100,
      readRatio * 45 + (incomingCount > 0 ? 25 : 0) + (mergeTotal > 0 ? 20 : 0) + (skippedLabels.length === 0 && sourceLabels.length > 0 ? 10 : 0),
    ),
  );

  return {
    createdAt: new Date().toISOString(),
    sourceLabels,
    skippedLabels,
    incomingCount,
    added,
    updated,
    duplicates,
    score,
    balanceSummary,
  };
}

function getBalanceCheckSummary(transactions) {
  return transactions.reduce(
    (summary, transaction) => {
      if (!transaction.balanceCheck) {
        return summary;
      }

      summary.checked += 1;
      if (transaction.balanceCheck === "ok") {
        summary.ok += 1;
      }
      if (transaction.balanceCheck === "corrected") {
        summary.corrected += 1;
      }
      if (transaction.balanceCheck === "mismatch") {
        summary.mismatch += 1;
      }
      return summary;
    },
    { checked: 0, ok: 0, corrected: 0, mismatch: 0 },
  );
}

function formatBalanceCheckSummary(summary) {
  if (!summary.checked) {
    return "";
  }

  const parts = [`Balance check: ${summary.ok} ok`];
  if (summary.corrected) {
    parts.push(`${summary.corrected} corrected`);
  }
  if (summary.mismatch) {
    parts.push(`${summary.mismatch} needs review`);
  }
  return ` ${parts.join(", ")}.`;
}

function renderHealthScoreCard() {
  const health = getFinancialHealthSnapshot();
  healthScoreCard.innerHTML = `
    <div class="score-layout">
      <div class="score-ring" style="--score: ${health.score}">
        <strong>${health.score}</strong>
        <span>/100</span>
      </div>
      <div>
        <p class="score-label">${escapeHtml(health.label)}</p>
        <ul class="driver-list">
          ${health.drivers.map((driver) => `<li>${escapeHtml(driver)}</li>`).join("")}
        </ul>
      </div>
    </div>
  `;
}

function getFinancialHealthSnapshot() {
  const analyzed = getAnalyzedTransactions();
  const scan = latestStatementScan || buildStatementScan(analyzed);
  const safe = getSafeToSpendSnapshot();
  const savings = getSavingsRateSnapshot();
  const budget = getBudgetHealthSnapshot();
  const monthlyIncome = scan.dateRange.months > 0 ? scan.totalIncome / scan.dateRange.months : 0;
  const subscriptionCost = scan.subscriptions.reduce((sum, item) => sum + item.monthlyEstimate, 0);
  const subscriptionRatio = monthlyIncome > 0 ? subscriptionCost / monthlyIncome : 0;
  const dataScore = analyzed.length >= 30 ? 10 : analyzed.length >= 10 ? 7 : analyzed.length >= 1 ? 4 : 1;
  const savingsScore = monthlyIncome > 0 ? clamp(((savings.rate + 5) / 30) * 30, 0, 30) : 12;
  const safeScore = safe.safeAmount >= 0 ? (safe.monthIncome > 0 ? clamp((safe.safeAmount / Math.max(1, safe.monthIncome * 0.25)) * 25, 12, 25) : 13) : 2;
  const budgetScore = budget.score;
  const subscriptionScore = monthlyIncome === 0 ? 8 : subscriptionRatio <= 0.05 ? 15 : subscriptionRatio <= 0.1 ? 11 : subscriptionRatio <= 0.18 ? 7 : 3;
  const score = Math.round(clamp(savingsScore + safeScore + budgetScore + subscriptionScore + dataScore, 0, 100));
  const label = score >= 80 ? "Strong" : score >= 60 ? "Stable" : score >= 40 ? "Needs attention" : "High risk";
  const drivers = [
    monthlyIncome > 0 ? `Savings rate is ${Math.round(savings.rate)}%.` : "Income is not clear yet from saved statements.",
    safe.safeAmount >= 0 ? `This month has ${formatMoney(safe.safeAmount, "GBP")} after spending and upcoming bills.` : `This month is short by ${formatMoney(Math.abs(safe.safeAmount), "GBP")}.`,
    budget.summary,
    analyzed.length > 0 ? `${analyzed.length} reviewed transaction${analyzed.length === 1 ? "" : "s"} included in analysis.` : "Upload or paste a statement to start scoring.",
  ];

  return {
    score,
    label,
    drivers,
  };
}

function getBudgetHealthSnapshot() {
  const rows = Object.entries(budgets);
  if (rows.length === 0) {
    return {
      score: 10,
      summary: "No budget limits set yet.",
    };
  }

  const currentSpend = getCurrentMonthCategorySpend();
  const overCount = rows.filter(([category, limit]) => (currentSpend[category] || 0) > limit).length;
  const closeCount = rows.filter(([category, limit]) => {
    const spent = currentSpend[category] || 0;
    return spent <= limit && spent >= limit * 0.8;
  }).length;

  if (overCount > 0) {
    return {
      score: 6,
      summary: `${overCount} budget${overCount === 1 ? " is" : "s are"} over limit.`,
    };
  }

  if (closeCount > 0) {
    return {
      score: 14,
      summary: `${closeCount} budget${closeCount === 1 ? " is" : "s are"} close to the limit.`,
    };
  }

  return {
    score: 20,
    summary: "Budgets are currently on track.",
  };
}

function renderSafeToSpendCard() {
  const safe = getSafeToSpendSnapshot();
  const tone = safe.safeAmount >= 0 ? "positive" : "negative";
  const currencyNote = safe.otherCurrencyBills > 0 ? `<p>${safe.otherCurrencyBills} non-GBP bill${safe.otherCurrencyBills === 1 ? "" : "s"} not included in this estimate.</p>` : "";

  safeToSpendCard.innerHTML = `
    <div class="big-money ${tone}">${formatMoney(safe.safeAmount, "GBP")}</div>
    <p>Income ${formatMoney(safe.monthIncome, "GBP")} minus spend ${formatMoney(safe.monthSpend, "GBP")}, upcoming bills ${formatMoney(safe.upcomingBills, "GBP")}, and goal buffer ${formatMoney(safe.goalBuffer, "GBP")}.</p>
    ${currencyNote}
  `;
}

function getSafeToSpendSnapshot() {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthTransactions = getAnalyzedTransactions().filter((transaction) => transaction.date.slice(0, 7) === month);
  const monthIncome = roundMoney(monthTransactions.reduce((sum, transaction) => sum + transaction.income, 0));
  const monthSpend = roundMoney(monthTransactions.reduce((sum, transaction) => sum + transaction.spending, 0));
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const activeBills = bills.filter((bill) => bill.status === "active");
  const upcomingBills = activeBills
    .filter((bill) => bill.currency === "GBP")
    .filter((bill) => {
      const due = parseLocalDate(bill.nextDueDate);
      return due <= monthEnd;
    })
    .reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  const otherCurrencyBills = activeBills.filter((bill) => bill.currency !== "GBP").length;
  const goalRemaining = savingsGoals.reduce((sum, goal) => sum + Math.max(0, goal.target - goal.saved), 0);
  const preGoalAmount = monthIncome - monthSpend - upcomingBills;
  const goalBuffer = goalRemaining > 0 && preGoalAmount > 0 ? roundMoney(Math.min(goalRemaining / 6, preGoalAmount * 0.2)) : 0;

  return {
    monthIncome,
    monthSpend,
    upcomingBills: roundMoney(upcomingBills),
    goalBuffer,
    otherCurrencyBills,
    safeAmount: roundMoney(preGoalAmount - goalBuffer),
  };
}

function renderSavingsRateCard() {
  const savings = getSavingsRateSnapshot();
  savingsRateCard.innerHTML = `
    <div class="big-money ${savings.rate >= 0 ? "positive" : "negative"}">${Math.round(savings.rate)}%</div>
    <p>${escapeHtml(savings.message)}</p>
    <div class="bar-track tall-track">
      <span class="${savings.rate < 0 ? "danger-bar" : ""}" style="width: ${Math.min(100, Math.max(4, savings.rate + 10))}%"></span>
    </div>
  `;
}

function getSavingsRateSnapshot() {
  const scan = latestStatementScan || buildStatementScan(getAnalyzedTransactions());
  const months = scan.dateRange.months || 1;
  const monthlyIncome = scan.totalIncome / months;
  const monthlySpend = scan.totalSpend / months;

  if (monthlyIncome <= 0) {
    return {
      rate: 0,
      message: "Upload income transactions to calculate a reliable savings rate.",
    };
  }

  const rate = ((monthlyIncome - monthlySpend) / monthlyIncome) * 100;
  return {
    rate,
    message: `Average monthly income is ${formatMoney(monthlyIncome, "GBP")} and average monthly spend is ${formatMoney(monthlySpend, "GBP")}.`,
  };
}

function renderImportConfidenceCard() {
  if (!latestImportReport) {
    const savedCount = statementTransactions.length;
    importConfidenceCard.innerHTML = `
      <div class="big-money">${savedCount > 0 ? "Saved" : "Ready"}</div>
      <p>${savedCount > 0 ? `${savedCount} transaction${savedCount === 1 ? "" : "s"} loaded from this browser.` : "Upload CSV, PDF, DOCX, XLSX, OFX, QIF, TXT, or a folder to see the import report."}</p>
    `;
    return;
  }

  importConfidenceCard.innerHTML = `
    <div class="big-money ${latestImportReport.score >= 70 ? "positive" : latestImportReport.score >= 40 ? "" : "negative"}">${latestImportReport.score}%</div>
    <p>${latestImportReport.incomingCount} found · ${latestImportReport.added} new · ${latestImportReport.updated} improved · ${latestImportReport.duplicates} duplicates.</p>
    <p>${latestImportReport.balanceSummary?.checked ? `Balance check: ${latestImportReport.balanceSummary.ok} ok, ${latestImportReport.balanceSummary.corrected} corrected, ${latestImportReport.balanceSummary.mismatch} needs review.` : "No balance column found to verify row direction."}</p>
    <p>${latestImportReport.sourceLabels.length} read, ${latestImportReport.skippedLabels.length} skipped.</p>
  `;
}

function renderCashflowForecast() {
  const forecast = getCashflowForecast(30);
  if (forecast.events.length === 0 && statementTransactions.length === 0 && bills.length === 0) {
    cashflowForecast.innerHTML = `<p class="muted">Add bills or upload statements to forecast the next 30 days.</p>`;
    return;
  }

  const events = forecast.events.slice(0, 7).map((event) => `
    <div class="analysis-item">
      <div>
        <h4>${escapeHtml(event.name)} <span>${formatDate(event.date)}</span></h4>
        <p>${event.kind === "income" ? "Expected income" : "Expected bill"} · ${event.kind === "income" ? "+" : "-"}${formatMoney(event.amount, "GBP")}</p>
      </div>
    </div>
  `);

  cashflowForecast.innerHTML = `
    <div class="forecast-total ${forecast.projected >= 0 ? "positive" : "negative"}">
      <span>Projected 30-day position</span>
      <strong>${formatMoney(forecast.projected, "GBP")}</strong>
    </div>
    ${events.length ? events.join("") : `<p class="muted">No bill or income events found for the next 30 days.</p>`}
  `;
}

function getCashflowForecast(days) {
  const safe = getSafeToSpendSnapshot();
  const start = startOfDay(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  const events = [];

  bills
    .filter((bill) => bill.status === "active" && bill.currency === "GBP")
    .forEach((bill) => {
      let due = parseLocalDate(bill.nextDueDate);
      while (due <= end) {
        if (due >= start) {
          events.push({
            date: toDateInputValue(due),
            name: bill.name,
            amount: Number(bill.amount || 0),
            kind: "bill",
          });
        }
        due = advanceDateByFrequency(due, bill.frequency);
      }
    });

  detectRecurringIncome().forEach((income) => {
    let due = parseLocalDate(income.nextDate);
    while (due <= end) {
      if (due >= start) {
        events.push({
          date: toDateInputValue(due),
          name: income.merchant,
          amount: income.amount,
          kind: "income",
        });
      }
      due = advanceDateByFrequency(due, income.frequency);
    }
  });

  const sortedEvents = events.sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date) || a.name.localeCompare(b.name));
  const projected = sortedEvents.reduce((value, event) => value + (event.kind === "income" ? event.amount : -event.amount), safe.safeAmount);

  return {
    events: sortedEvents,
    projected: roundMoney(projected),
  };
}

function detectRecurringIncome() {
  const incomeGroups = getAnalyzedTransactions()
    .filter((transaction) => transaction.income > 0)
    .reduce((result, transaction) => {
      const key = transaction.merchant.toLowerCase();
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(transaction);
      return result;
    }, {});

  return Object.entries(incomeGroups)
    .map(([merchant, group]) => {
      const sorted = group.sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
      const amount = sorted.reduce((sum, item) => sum + item.income, 0) / sorted.length;
      const frequency = hasRecurringGap(sorted) || (sorted.some((item) => /\b(salary|wage|payroll|employer)\b/i.test(item.description)) ? "monthly" : "");
      if (!frequency || sorted.length < 1) {
        return null;
      }
      const lastDate = sorted[sorted.length - 1].date;
      return {
        merchant: titleCase(merchant),
        amount: roundMoney(amount),
        frequency,
        nextDate: getNextDueDate(lastDate, frequency),
      };
    })
    .filter(Boolean)
    .slice(0, 4);
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

function renderSmartRecommendations() {
  const recommendations = getSmartRecommendations();
  smartRecommendations.innerHTML = recommendations.map(renderRecommendationItem).join("");
}

function getSmartRecommendations() {
  const recommendations = [];
  const analyzed = getAnalyzedTransactions();
  const scan = latestStatementScan || buildStatementScan(analyzed);
  const safe = getSafeToSpendSnapshot();
  const savings = getSavingsRateSnapshot();
  const currentSpend = getCurrentMonthCategorySpend();
  const priceAlertsList = getPriceChangeAlerts();

  if (analyzed.length === 0) {
    recommendations.push({
      title: "Start with one clean statement",
      body: "Upload a CSV export first if possible. It gives the app the highest chance of reading dates, descriptions, money in, and money out correctly.",
    });
  }

  if (latestImportReport?.skippedLabels.length > 0) {
    recommendations.push({
      title: "Fix skipped files",
      body: `${latestImportReport.skippedLabels.length} file${latestImportReport.skippedLabels.length === 1 ? " was" : "s were"} skipped. For stubborn PDFs, paste text or export CSV from the bank app.`,
    });
  }

  if (safe.safeAmount < 0) {
    recommendations.push({
      title: "Protect this month first",
      body: `Your safe-to-spend estimate is negative by ${formatMoney(Math.abs(safe.safeAmount), "GBP")}. Pause non-essential spending until income or bills are clearer.`,
    });
  }

  if (savings.rate < 10 && scan.totalIncome > 0) {
    recommendations.push({
      title: "Raise the savings rate",
      body: "Aim for the first 10% gap between income and spending. Start with a small weekly transfer after payday.",
    });
  }

  const flexibleCategories = scan.categoryTotals.filter((row) => ["Dining", "Shopping", "Entertainment", "Other"].includes(row.category));
  const biggestFlexible = flexibleCategories[0];
  if (biggestFlexible) {
    const monthlyAverage = biggestFlexible.amount / Math.max(1, scan.dateRange.months);
    if (monthlyAverage >= 50) {
      recommendations.push({
        title: `Review ${biggestFlexible.category.toLowerCase()}`,
        body: `Average spend is ${formatMoney(monthlyAverage, "GBP")} per month. A 10% cut frees about ${formatMoney(monthlyAverage * 0.1, "GBP")} monthly.`,
      });
    }
  }

  Object.entries(budgets).forEach(([category, limit]) => {
    const spent = currentSpend[category] || 0;
    if (spent > limit) {
      recommendations.push({
        title: `${category} is over budget`,
        body: `${formatMoney(spent, "GBP")} spent against a ${formatMoney(limit, "GBP")} limit. Move future purchases into next month if possible.`,
      });
    }
  });

  if (priceAlertsList.length > 0) {
    recommendations.push({
      title: "Check price increases",
      body: `${priceAlertsList[0].merchant} looks higher than before. Confirm whether the plan changed or a promotion ended.`,
    });
  }

  const cleanup = getMerchantCleanupSuggestions();
  if (cleanup.length > 0) {
    recommendations.push({
      title: "Clean merchant names",
      body: `${cleanup[0].names.join(", ")} may be the same merchant. Rename them in Transaction review for cleaner charts.`,
    });
  }

  const renewal = getRenewalWatchList()[0];
  if (renewal) {
    recommendations.push({
      title: "Upcoming renewal",
      body: `${renewal.name} is due ${formatDate(renewal.date)}. Decide now whether to keep, downgrade, or cancel.`,
    });
  }

  if (savingsGoals.length === 0 && scan.totalIncome > 0) {
    recommendations.push({
      title: "Create one savings goal",
      body: "Turn any spending cut into a visible goal. It makes the advice feel like progress instead of punishment.",
    });
  }

  return recommendations.slice(0, 7);
}

function renderRecommendationItem(item) {
  return `
    <div class="analysis-item text-only">
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.body)}</p>
    </div>
  `;
}

function getMerchantCleanupSuggestions() {
  const grouped = getAnalyzedTransactions().reduce((result, transaction) => {
    const key = normalizeMerchantCleanupKey(transaction.merchant);
    if (!key) {
      return result;
    }
    if (!result[key]) {
      result[key] = new Set();
    }
    result[key].add(titleCase(transaction.merchant));
    return result;
  }, {});

  return Object.values(grouped)
    .map((names) => [...names].filter(Boolean))
    .filter((names) => names.length > 1)
    .map((names) => ({ names }))
    .slice(0, 4);
}

function normalizeMerchantCleanupKey(value) {
  return normalizeKeyText(value)
    .replace(/\b(ltd|limited|plc|uk|gb|com|online|store|payment|card)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 18);
}

function getRenewalWatchList() {
  const today = startOfDay(new Date());
  const end = new Date(today);
  end.setDate(end.getDate() + 45);
  return bills
    .filter((bill) => bill.status === "active")
    .map((bill) => ({
      name: bill.name,
      amount: bill.amount,
      currency: bill.currency,
      date: bill.nextDueDate,
      due: parseLocalDate(bill.nextDueDate),
    }))
    .filter((item) => item.due >= today && item.due <= end)
    .sort((a, b) => a.due - b.due)
    .slice(0, 5);
}

function renderScenarioGoalOptions() {
  const selected = scenarioGoalInput.value;
  const options = savingsGoals.length
    ? savingsGoals.map((goal) => `<option value="${escapeHtml(goal.id)}">${escapeHtml(goal.name)}</option>`).join("")
    : `<option value="">No goal yet</option>`;
  scenarioGoalInput.innerHTML = options;
  if (savingsGoals.some((goal) => goal.id === selected)) {
    scenarioGoalInput.value = selected;
  }
}

function renderScenarioPlanner() {
  const scan = latestStatementScan || buildStatementScan(getAnalyzedTransactions());
  const cutPercent = Number(scenarioCutValue.value || scenarioCutRange.value || 0);
  const cancelSaving = Number(scenarioCancelInput.value || 0);
  const flexibleCategories = scan.categoryTotals.filter((row) => ["Dining", "Shopping", "Entertainment", "Other"].includes(row.category));
  const flexibleMonthly = flexibleCategories.reduce((sum, row) => sum + row.amount, 0) / Math.max(1, scan.dateRange.months);
  const monthlyCutSaving = flexibleMonthly * (cutPercent / 100);
  const monthlySaving = roundMoney(monthlyCutSaving + cancelSaving);
  const yearlySaving = roundMoney(monthlySaving * 12);
  const selectedGoal = savingsGoals.find((goal) => goal.id === scenarioGoalInput.value);
  const remainingGoal = selectedGoal ? Math.max(0, selectedGoal.target - selectedGoal.saved) : 0;
  const monthsToGoal = selectedGoal && monthlySaving > 0 ? Math.ceil(remainingGoal / monthlySaving) : 0;

  scenarioResult.innerHTML = `
    <div class="big-money positive">${formatMoney(monthlySaving, "GBP")}/mo</div>
    <p>${cutPercent}% cut from flexible categories plus ${formatMoney(cancelSaving, "GBP")} cancelled monthly cost equals ${formatMoney(yearlySaving, "GBP")} per year.</p>
    <p>${selectedGoal ? `${escapeHtml(selectedGoal.name)} could be reached in about ${monthsToGoal || "more than 12"} month${monthsToGoal === 1 ? "" : "s"}.` : "Add a savings goal to connect this plan to a target."}</p>
  `;
}

function renderAccountOverlapSummary() {
  const accountCounts = getAccountCounts();
  const transferCount = statementTransactions.filter((transaction) => transaction.type === "transfer").length;
  const potentialPairs = findPotentialOwnTransferPairs();
  const accountText = accountCounts.length
    ? accountCounts.map((item) => `${item.account}: ${item.count}`).join(" · ")
    : "No accounts loaded yet.";
  const ownAccountText = getOwnAccounts(false).join(", ");

  accountOverlapSummary.innerHTML = `
    <p>${escapeHtml(accountText)}</p>
    <div class="overlap-stats">
      <span>${transferCount} marked transfer${transferCount === 1 ? "" : "s"}</span>
      <span>${potentialPairs.length} possible overlap${potentialPairs.length === 1 ? "" : "s"}</span>
    </div>
    <p>Own accounts: ${escapeHtml(ownAccountText)}. Matched transfers are excluded from spending and income totals.</p>
  `;

  autoDetectTransfersButton.disabled = potentialPairs.length === 0 && statementTransactions.length === 0;
}

function getAccountCounts() {
  const counts = statementTransactions.reduce((result, transaction) => {
    const account = normalizeAccount(transaction.account);
    result[account] = (result[account] || 0) + 1;
    return result;
  }, {});

  return Object.entries(counts)
    .map(([account, count]) => ({ account, count }))
    .sort(compareAccountNames);
}

function findPotentialOwnTransferPairs() {
  const outgoing = statementTransactions.filter((transaction) => !isTransactionExcluded(transaction) && transaction.spending > 0 && isOwnAccount(transaction.account));
  const incoming = statementTransactions.filter((transaction) => !isTransactionExcluded(transaction) && transaction.income > 0 && isOwnAccount(transaction.account));
  const usedIncoming = new Set();
  const pairs = [];
  const transferWindowDays = clamp(Number(accountSettings.transferWindowDays), 0, 7);
  const tolerancePercent = clamp(Number(accountSettings.amountTolerancePercent), 0, 10);

  outgoing
    .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date))
    .forEach((outTransaction) => {
      const match = incoming.find((inTransaction) => {
        if (usedIncoming.has(inTransaction.id) || inTransaction.account === outTransaction.account) {
          return false;
        }

        const amountGap = Math.abs(outTransaction.spending - inTransaction.income);
        const dateGap = Math.abs(daysBetween(outTransaction.date, inTransaction.date));
        const allowedGap = Math.max(0.5, outTransaction.spending * (tolerancePercent / 100));
        return amountGap <= allowedGap && dateGap <= transferWindowDays;
      });

      if (match) {
        usedIncoming.add(match.id);
        pairs.push({
          outgoing: outTransaction,
          incoming: match,
        });
      }
    });

  return pairs;
}

function autoDetectOwnTransfers() {
  if (statementTransactions.length === 0) {
    statementMessage.textContent = "Upload statements first, then run the overlap filter.";
    return;
  }

  const pairs = findPotentialOwnTransferPairs();
  const pairIds = new Set(pairs.flatMap((pair) => [pair.outgoing.id, pair.incoming.id]));
  const keywordTransfers = statementTransactions
    .filter((transaction) => !isTransactionExcluded(transaction))
    .filter(isLikelyOwnTransferText);
  const keywordIds = new Set(keywordTransfers.map((transaction) => transaction.id));
  const transferIds = new Set([...pairIds, ...keywordIds]);

  if (transferIds.size === 0) {
    statementMessage.textContent = "No likely own-account overlaps found. You can still mark rows as Transfer in Transaction review.";
    renderAccountOverlapSummary();
    return;
  }

  statementTransactions = statementTransactions.map((transaction) => {
    if (!transferIds.has(transaction.id)) {
      return transaction;
    }

    return {
      ...transaction,
      type: "transfer",
      category: "Transfers",
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  saveStatementTransactions();
  refreshStatementAnalyticsAfterReview();
  statementMessage.textContent = `Marked ${transferIds.size} likely own-account transfer row${transferIds.size === 1 ? "" : "s"} as Transfer. These rows no longer affect income or spending totals.`;
}

function isLikelyOwnTransferText(transaction) {
  return looksLikeOwnTransferText(`${transaction.description || ""} ${transaction.merchant || ""} ${transaction.account || ""}`);
}

function syncScenarioCutFromRange() {
  scenarioCutValue.value = scenarioCutRange.value;
  renderScenarioPlanner();
}

function syncScenarioCutFromNumber() {
  const value = clamp(Number(scenarioCutValue.value || 0), 0, 35);
  scenarioCutValue.value = value;
  scenarioCutRange.value = value;
  renderScenarioPlanner();
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

function renderIncomeSpendChart(months) {
  if (months.length === 0) {
    incomeSpendChart.innerHTML = renderChartEmpty("Upload statements to see earned vs spent by month.");
    return;
  }

  const width = 720;
  const height = 300;
  const padding = { top: 22, right: 18, bottom: 48, left: 72 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...months.map((month) => Math.max(month.earned, month.spent)));
  const groupWidth = chartWidth / months.length;
  const barWidth = Math.min(26, groupWidth / 3);

  const bars = months
    .map((month, index) => {
      const x = padding.left + index * groupWidth + groupWidth / 2;
      const earnedHeight = (month.earned / maxValue) * chartHeight;
      const spentHeight = (month.spent / maxValue) * chartHeight;
      return `
        <rect class="chart-income" x="${x - barWidth - 2}" y="${padding.top + chartHeight - earnedHeight}" width="${barWidth}" height="${earnedHeight}" rx="4">
          <title>${formatMonthLabel(month.month)} earned ${formatMoney(month.earned, "GBP")}</title>
        </rect>
        <rect class="chart-spend" x="${x + 2}" y="${padding.top + chartHeight - spentHeight}" width="${barWidth}" height="${spentHeight}" rx="4">
          <title>${formatMonthLabel(month.month)} spent ${formatMoney(month.spent, "GBP")}</title>
        </rect>
        <text class="chart-label" x="${x}" y="${height - 18}" text-anchor="middle">${formatShortMonth(month.month)}</text>
      `;
    })
    .join("");

  incomeSpendChart.innerHTML = `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Earned versus spent bar chart">
      ${renderYAxis(width, height, padding, maxValue)}
      ${bars}
      ${renderLegend([
        ["Earned", "chart-income"],
        ["Spent", "chart-spend"],
      ])}
    </svg>
  `;
}

function renderCategoryDonutChart() {
  const rows = getStatementCategoryTotals(getAnalyzedTransactions()).slice(0, 7);
  if (rows.length === 0) {
    categoryDonutChart.innerHTML = renderChartEmpty("Upload statements to see category spending.");
    return;
  }

  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const colors = ["#14746f", "#d9922e", "#365f8c", "#b42318", "#6f5cc2", "#2f855a", "#805ad5"];
  let offset = 0;

  const segments = rows
    .map((row, index) => {
      const length = (row.amount / total) * circumference;
      const segment = `
        <circle cx="115" cy="115" r="${radius}" fill="none" stroke="${colors[index % colors.length]}" stroke-width="28" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}" transform="rotate(-90 115 115)">
          <title>${row.category}: ${formatMoney(row.amount, "GBP")}</title>
        </circle>
      `;
      offset += length;
      return segment;
    })
    .join("");

  const legend = rows
    .map(
      (row, index) => `
        <div class="donut-legend-row">
          <span style="background:${colors[index % colors.length]}"></span>
          <p>${escapeHtml(row.category)}</p>
          <strong>${formatMoney(row.amount, "GBP")}</strong>
        </div>
      `,
    )
    .join("");

  categoryDonutChart.innerHTML = `
    <div class="donut-layout">
      <svg class="donut-svg" viewBox="0 0 230 230" role="img" aria-label="Category spending donut chart">
        <circle cx="115" cy="115" r="${radius}" fill="none" stroke="var(--line)" stroke-width="28"></circle>
        ${segments}
        <text class="donut-total" x="115" y="110" text-anchor="middle">Spent</text>
        <text class="donut-value" x="115" y="134" text-anchor="middle">${formatCompactMoney(total)}</text>
      </svg>
      <div class="donut-legend">${legend}</div>
    </div>
  `;
}

function renderCashflowChart(months) {
  if (months.length === 0) {
    cashflowChart.innerHTML = renderChartEmpty("Upload statements to see net cashflow trend.");
    return;
  }

  const width = 460;
  const height = 280;
  const padding = { top: 24, right: 20, bottom: 44, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = months.map((month) => month.net);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(1, ...values);
  const range = maxValue - minValue || 1;
  const points = months.map((month, index) => {
    const x = padding.left + (months.length === 1 ? chartWidth / 2 : (index / (months.length - 1)) * chartWidth);
    const y = padding.top + chartHeight - ((month.net - minValue) / range) * chartHeight;
    return { x, y, month };
  });
  const zeroY = padding.top + chartHeight - ((0 - minValue) / range) * chartHeight;

  const pointMarkup = points
    .map(
      (point) => `
        <circle class="${point.month.net >= 0 ? "chart-income" : "chart-spend"}" cx="${point.x}" cy="${point.y}" r="5">
          <title>${formatMonthLabel(point.month.month)} net ${formatMoney(point.month.net, "GBP")}</title>
        </circle>
        <text class="chart-label" x="${point.x}" y="${height - 18}" text-anchor="middle">${formatShortMonth(point.month.month)}</text>
      `,
    )
    .join("");

  cashflowChart.innerHTML = `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Net cashflow line chart">
      <line class="chart-axis" x1="${padding.left}" y1="${zeroY}" x2="${width - padding.right}" y2="${zeroY}"></line>
      <polyline class="chart-line" points="${points.map((point) => `${point.x},${point.y}`).join(" ")}"></polyline>
      ${pointMarkup}
    </svg>
  `;
}

function renderBudgetChart() {
  const currentSpend = getCurrentMonthCategorySpend();
  const rows = Object.entries(budgets).map(([category, limit]) => ({
    category,
    limit,
    spent: currentSpend[category] || 0,
  }));

  if (rows.length === 0) {
    budgetChart.innerHTML = renderChartEmpty("Set budgets to see progress visuals.");
    return;
  }

  budgetChart.innerHTML = rows
    .sort((a, b) => b.spent / b.limit - a.spent / a.limit)
    .map((row) => {
      const percent = row.limit > 0 ? Math.round((row.spent / row.limit) * 100) : 0;
      return `
        <div class="budget-visual-row">
          <div class="breakdown-label">
            <span>${escapeHtml(row.category)}</span>
            <strong>${percent}%</strong>
          </div>
          <div class="bar-track tall-track">
            <span class="${percent >= 100 ? "danger-bar" : ""}" style="width: ${Math.min(100, Math.max(4, percent))}%"></span>
          </div>
          <p>${formatMoney(row.spent, "GBP")} of ${formatMoney(row.limit, "GBP")}</p>
        </div>
      `;
    })
    .join("");
}

function renderYAxis(width, height, padding, maxValue) {
  const chartHeight = height - padding.top - padding.bottom;
  return [0, 0.5, 1]
    .map((tick) => {
      const value = maxValue * tick;
      const y = padding.top + chartHeight - chartHeight * tick;
      return `
        <line class="chart-grid" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"></line>
        <text class="chart-axis-label" x="${padding.left - 10}" y="${y + 4}" text-anchor="end">${formatCompactMoney(value)}</text>
      `;
    })
    .join("");
}

function renderLegend(items) {
  return items
    .map(
      ([label, className], index) => `
        <g transform="translate(${index * 92 + 74}, 18)">
          <rect class="${className}" x="0" y="-10" width="12" height="12" rx="3"></rect>
          <text class="chart-label" x="18" y="0">${label}</text>
        </g>
      `,
    )
    .join("");
}

function renderChartEmpty(message) {
  return `<div class="chart-empty">${escapeHtml(message)}</div>`;
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

function renderPrivacyReport() {
  const rows = getPrivacyRows();
  const totalBytes = rows.reduce((sum, row) => sum + row.bytes, 0);

  privacyReportList.innerHTML = `
    <div class="privacy-total">
      <span>Total local storage used</span>
      <strong>${formatBytes(totalBytes)}</strong>
    </div>
    ${rows.map(renderPrivacyRow).join("")}
  `;
}

function getPrivacyRows() {
  return [
    {
      id: "bills",
      label: "Bills",
      description: "Saved recurring bills and notes.",
      key: STORAGE_KEY,
      count: bills.length,
    },
    {
      id: "statements",
      label: "Statement history",
      description: "Merged bank statement transactions from uploads.",
      key: STATEMENT_KEY,
      count: statementTransactions.length,
    },
    {
      id: "budgets",
      label: "Budgets",
      description: "Monthly category spending limits.",
      key: BUDGET_KEY,
      count: Object.keys(budgets).length,
    },
    {
      id: "goals",
      label: "Savings goals",
      description: "Goal names, targets, and saved amounts.",
      key: GOAL_KEY,
      count: savingsGoals.length,
    },
    {
      id: "cancel",
      label: "Cancel planner",
      description: "Services marked for cancellation and savings estimates.",
      key: CANCEL_KEY,
      count: cancelPlans.length,
    },
    {
      id: "accounts",
      label: "Own account settings",
      description: "Account names and transfer overlap matching rules.",
      key: ACCOUNT_KEY,
      count: getOwnAccounts(false).length,
    },
    {
      id: "categories",
      label: "Custom categories",
      description: "Categories added by you.",
      key: CATEGORY_KEY,
      count: categories.filter((category) => !defaultCategories.includes(category)).length,
    },
    {
      id: "reminders",
      label: "Reminder settings",
      description: "Alert window, mode, and last reminder state.",
      key: REMINDER_KEY,
      count: localStorage.getItem(REMINDER_KEY) ? 1 : 0,
    },
    {
      id: "theme",
      label: "Theme preference",
      description: "Light or dark mode setting.",
      key: THEME_KEY,
      count: localStorage.getItem(THEME_KEY) ? 1 : 0,
    },
    {
      id: "simulator",
      label: "Life decisions simulator",
      description: "Saved scenario plans — local only, never synced.",
      key: SIMULATOR_KEY,
      count: simulatorScenarios.length,
    },
  ].map((row) => ({
    ...row,
    bytes: getStorageBytes(row.key),
  }));
}

function renderPrivacyRow(row) {
  return `
    <div class="privacy-row">
      <div>
        <h3>${escapeHtml(row.label)} <span>${row.count} item${row.count === 1 ? "" : "s"}</span></h3>
        <p>${escapeHtml(row.description)} · ${formatBytes(row.bytes)}</p>
      </div>
      <button class="ghost-button danger-button" type="button" data-privacy-id="${row.id}" ${row.bytes === 0 ? "disabled" : ""}>Delete</button>
    </div>
  `;
}

function handlePrivacyDelete(event) {
  const button = event.target.closest("button[data-privacy-id]");
  if (!button) {
    return;
  }

  deletePrivacyDataset(button.dataset.privacyId);
}

function deletePrivacyDataset(id) {
  const row = getPrivacyRows().find((item) => item.id === id);
  if (!row || row.bytes === 0) {
    return;
  }

  const confirmed = window.confirm(`Delete ${row.label.toLowerCase()} from this browser?`);
  if (!confirmed) {
    return;
  }

  if (id === "bills") {
    bills = [];
    saveBills();
    resetForm();
    render();
  }

  if (id === "statements") {
    statementTransactions = [];
    saveStatementTransactions();
    latestStatementScan = null;
    renderStatementEmpty();
    renderPlanning();
  }

  if (id === "budgets") {
    budgets = {};
    saveBudgets();
    renderPlanning();
  }

  if (id === "goals") {
    savingsGoals = [];
    saveSavingsGoals();
    renderPlanning();
  }

  if (id === "cancel") {
    cancelPlans = [];
    saveCancelPlans();
    renderPlanning();
  }

  if (id === "accounts") {
    accountSettings = { ...defaultAccountSettings, accounts: [...defaultOwnAccounts] };
    localStorage.removeItem(ACCOUNT_KEY);
    renderStatementAccountOptions();
    renderAccountSettings();
    renderAnalystCenter();
    renderTransactionReviewFilters();
    renderTransactionReview();
  }

  if (id === "categories") {
    categories = [...defaultCategories];
    saveCategories();
    renderCategories();
    renderPlanning();
  }

  if (id === "reminders") {
    reminderSettings = { days: 7, mode: "off", lastNotified: "" };
    localStorage.removeItem(REMINDER_KEY);
    applyReminderSettings();
  }

  if (id === "theme") {
    localStorage.removeItem(THEME_KEY);
    applyTheme("light", false);
  }

  if (id === "simulator") {
    simulatorScenarios = [];
    localStorage.removeItem(SIMULATOR_KEY);
    renderSavedScenarios();
  }

  renderPrivacyReport();
}

function wipeAllLocalData() {
  const confirmed = window.confirm("Delete all BillPocket local data from this browser?");
  if (!confirmed) {
    return;
  }

  [STORAGE_KEY, STATEMENT_KEY, BUDGET_KEY, GOAL_KEY, CANCEL_KEY, CATEGORY_KEY, ACCOUNT_KEY, REMINDER_KEY, THEME_KEY, SIMULATOR_KEY].forEach((key) => localStorage.removeItem(key));
  bills = [];
  categories = [...defaultCategories];
  accountSettings = { ...defaultAccountSettings, accounts: [...defaultOwnAccounts] };
  reminderSettings = { days: 7, mode: "off", lastNotified: "" };
  statementTransactions = [];
  latestStatementScan = null;
  budgets = {};
  savingsGoals = [];
  cancelPlans = [];
  simulatorScenarios = [];
  currentSimResult = null;

  applyTheme("light", false);
  renderCategories();
  renderStatementAccountOptions();
  renderAccountSettings();
  applyReminderSettings();
  renderStatementEmpty();
  renderPlanning();
  renderSimulator();
  resetForm();
  render();
  renderPrivacyReport();
}

function getStorageBytes(key) {
  const value = localStorage.getItem(key);
  return value ? new Blob([value]).size : 0;
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

function renderBudgetCategoryOptions() {
  if (!budgetCategoryInput) {
    return;
  }

  const selected = budgetCategoryInput.value || categories[0] || "Other";
  budgetCategoryInput.innerHTML = categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");
  budgetCategoryInput.value = categories.includes(selected) ? selected : categories[0] || "Other";
}

function saveBudget(event) {
  event.preventDefault();
  const category = budgetCategoryInput.value;
  const limit = Number(budgetLimitInput.value);
  if (!category || !Number.isFinite(limit) || limit <= 0) {
    return;
  }

  budgets = { ...budgets, [category]: roundMoney(limit) };
  saveBudgets();
  budgetLimitInput.value = "";
  renderPlanning();
}

function handleBudgetAction(event) {
  const button = event.target.closest("button[data-budget-category]");
  if (!button) {
    return;
  }

  delete budgets[button.dataset.budgetCategory];
  saveBudgets();
  renderPlanning();
}

function renderBudgets() {
  const currentSpend = getCurrentMonthCategorySpend();
  const rows = Object.entries(budgets);

  if (rows.length === 0) {
    budgetList.innerHTML = `<p class="muted">Set a monthly category limit to track overspending.</p>`;
    return;
  }

  budgetList.innerHTML = rows
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, limit]) => {
      const spent = currentSpend[category] || 0;
      const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const width = Math.min(100, Math.max(4, percent));
      const status = percent >= 100 ? "Over budget" : percent >= 80 ? "Close" : "On track";
      return `
        <div class="planner-item">
          <div>
            <h4>${escapeHtml(category)} <span>${status}</span></h4>
            <p>${formatMoney(spent, "GBP")} of ${formatMoney(limit, "GBP")} this month</p>
            <div class="bar-track"><span class="${percent >= 100 ? "danger-bar" : ""}" style="width: ${width}%"></span></div>
          </div>
          <button class="ghost-button" type="button" data-budget-category="${escapeHtml(category)}">Remove</button>
        </div>
      `;
    })
    .join("");
}

function getCurrentMonthCategorySpend() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return getAnalyzedTransactions().reduce((result, transaction) => {
    if (transaction.date.slice(0, 7) === currentMonth && transaction.spending > 0) {
      result[transaction.category] = (result[transaction.category] || 0) + transaction.spending;
    }
    return result;
  }, {});
}

function renderPriceAlerts() {
  const alerts = getPriceChangeAlerts();
  if (alerts.length === 0) {
    priceAlerts.innerHTML = `<p class="muted">Upload multiple months of statements to catch subscription price changes.</p>`;
    return;
  }

  priceAlerts.innerHTML = alerts
    .map((alert) => `
      <div class="planner-item text-only">
        <h4>${escapeHtml(alert.merchant)} <span>+${formatMoney(alert.increase, "GBP")}</span></h4>
        <p>Latest payment is ${formatMoney(alert.latest, "GBP")}, previous typical payment was ${formatMoney(alert.previous, "GBP")}.</p>
      </div>
    `)
    .join("");
}

function getPriceChangeAlerts() {
  const grouped = getAnalyzedTransactions().filter((transaction) => transaction.spending > 0).reduce((result, transaction) => {
    const key = transaction.merchant.toLowerCase();
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(transaction);
    return result;
  }, {});

  return Object.values(grouped)
    .map((group) => {
      const sorted = group.sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
      if (sorted.length < 2) {
        return null;
      }

      const latest = sorted[sorted.length - 1];
      const previous = sorted.slice(0, -1);
      const previousAverage = previous.reduce((sum, item) => sum + item.spending, 0) / previous.length;
      const increase = latest.spending - previousAverage;
      const relativeIncrease = previousAverage > 0 ? increase / previousAverage : 0;
      const keywordMatch = subscriptionWords.some((word) => latest.merchant.toLowerCase().includes(word) || latest.description.toLowerCase().includes(word));

      if (increase < 1 || relativeIncrease < 0.08 || (!keywordMatch && sorted.length < 3)) {
        return null;
      }

      return {
        merchant: titleCase(latest.merchant),
        latest: latest.spending,
        previous: previousAverage,
        increase,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.increase - a.increase)
    .slice(0, 6);
}

function addCancelPlan(event) {
  event.preventDefault();
  const name = cancelNameInput.value.trim();
  const monthlySaving = Number(cancelSavingInput.value);
  if (!name || !Number.isFinite(monthlySaving) || monthlySaving <= 0) {
    return;
  }

  cancelPlans = [
    ...cancelPlans,
    {
      id: createId(),
      name,
      monthlySaving: roundMoney(monthlySaving),
      status: "planned",
      createdAt: new Date().toISOString(),
    },
  ];
  saveCancelPlans();
  cancelForm.reset();
  renderPlanning();
}

function handleCancelAction(event) {
  const button = event.target.closest("button[data-cancel-id]");
  if (!button) {
    return;
  }

  const id = button.dataset.cancelId;
  const action = button.dataset.action;
  if (action === "done") {
    cancelPlans = cancelPlans.map((plan) => (plan.id === id ? { ...plan, status: plan.status === "done" ? "planned" : "done" } : plan));
  }
  if (action === "remove") {
    cancelPlans = cancelPlans.filter((plan) => plan.id !== id);
  }
  saveCancelPlans();
  renderPlanning();
}

function renderCancelPlans() {
  if (cancelPlans.length === 0) {
    cancelList.innerHTML = `<p class="muted">Track services you plan to cancel and the yearly saving.</p>`;
    return;
  }

  const yearlySaving = cancelPlans.reduce((sum, plan) => sum + (plan.status === "done" ? plan.monthlySaving * 12 : 0), 0);
  cancelList.innerHTML = `
    <div class="planner-total">Completed yearly saving: <strong>${formatMoney(yearlySaving, "GBP")}</strong></div>
    ${cancelPlans
      .map((plan) => `
        <div class="planner-item">
          <div>
            <h4>${escapeHtml(plan.name)} <span>${plan.status === "done" ? "Cancelled" : "Planned"}</span></h4>
            <p>${formatMoney(plan.monthlySaving, "GBP")}/mo | ${formatMoney(plan.monthlySaving * 12, "GBP")}/yr</p>
          </div>
          <div class="planner-actions">
            <button class="ghost-button" type="button" data-action="done" data-cancel-id="${plan.id}">${plan.status === "done" ? "Undo" : "Done"}</button>
            <button class="ghost-button" type="button" data-action="remove" data-cancel-id="${plan.id}">Remove</button>
          </div>
        </div>
      `)
      .join("")}
  `;
}

function addSavingsGoal(event) {
  event.preventDefault();
  const name = goalNameInput.value.trim();
  const target = Number(goalTargetInput.value);
  const saved = Number(goalSavedInput.value || 0);
  if (!name || !Number.isFinite(target) || target <= 0 || saved < 0) {
    return;
  }

  savingsGoals = [
    ...savingsGoals,
    {
      id: createId(),
      name,
      target: roundMoney(target),
      saved: roundMoney(saved),
      createdAt: new Date().toISOString(),
    },
  ];
  saveSavingsGoals();
  goalForm.reset();
  renderPlanning();
}

function handleGoalAction(event) {
  const button = event.target.closest("button[data-goal-id]");
  if (!button) {
    return;
  }

  const id = button.dataset.goalId;
  const action = button.dataset.action;
  if (action === "add") {
    savingsGoals = savingsGoals.map((goal) => (goal.id === id ? { ...goal, saved: Math.min(goal.target, roundMoney(goal.saved + 25)) } : goal));
  }
  if (action === "remove") {
    savingsGoals = savingsGoals.filter((goal) => goal.id !== id);
  }
  saveSavingsGoals();
  renderPlanning();
}

function renderSavingsGoals() {
  if (savingsGoals.length === 0) {
    goalList.innerHTML = `<p class="muted">Create a goal and use spending cuts to fund it.</p>`;
    return;
  }

  goalList.innerHTML = savingsGoals
    .map((goal) => {
      const percent = goal.target > 0 ? Math.round((goal.saved / goal.target) * 100) : 0;
      return `
        <div class="planner-item">
          <div>
            <h4>${escapeHtml(goal.name)} <span>${percent}%</span></h4>
            <p>${formatMoney(goal.saved, "GBP")} saved of ${formatMoney(goal.target, "GBP")}</p>
            <div class="bar-track"><span style="width: ${Math.min(100, Math.max(4, percent))}%"></span></div>
          </div>
          <div class="planner-actions">
            <button class="ghost-button" type="button" data-action="add" data-goal-id="${goal.id}">+25</button>
            <button class="ghost-button" type="button" data-action="remove" data-goal-id="${goal.id}">Remove</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderStatementHistory() {
  const months = getMonthlyStatementHistory();
  if (months.length === 0) {
    statementHistory.innerHTML = `<p class="muted">Upload saved statement data to compare spending by month.</p>`;
    return;
  }

  const maxSpend = Math.max(...months.map((month) => Math.max(month.spent, month.earned)));
  statementHistory.innerHTML = months
    .slice(-8)
    .reverse()
    .map((month, index, list) => {
      const previous = list[index + 1];
      const change = previous ? month.net - previous.net : 0;
      const changeLabel = previous ? `${change >= 0 ? "+" : ""}${formatMoney(change, "GBP")} net vs previous` : "First saved month";
      return `
        <div class="planner-item text-only">
          <h4>${formatMonthLabel(month.month)} <span>${formatMoney(month.net, "GBP")} net</span></h4>
          <p>Earned ${formatMoney(month.earned, "GBP")} | Spent ${formatMoney(month.spent, "GBP")} | ${month.count} transactions | ${changeLabel}</p>
          <div class="history-bars">
            <div class="bar-track income-track"><span style="width: ${Math.max(5, Math.round((month.earned / maxSpend) * 100))}%"></span></div>
            <div class="bar-track"><span class="danger-bar" style="width: ${Math.max(5, Math.round((month.spent / maxSpend) * 100))}%"></span></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function getMonthlyStatementHistory() {
  const grouped = getAnalyzedTransactions().reduce((result, transaction) => {
    const month = transaction.date.slice(0, 7);
    if (!result[month]) {
      result[month] = { month, earned: 0, spent: 0, net: 0, count: 0 };
    }
    result[month].earned += transaction.income;
    result[month].spent += transaction.spending;
    result[month].net = result[month].earned - result[month].spent;
    result[month].count += 1;
    return result;
  }, {});

  return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
}

function formatMonthLabel(value) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(new Date(year, month - 1, 1));
}


function fillForm(bill) {
  billIdInput.value = bill.id;
  nameInput.value = bill.name;
  amountInput.value = bill.amount;
  currencyInput.value = bill.currency;
  nextDueDateInput.value = bill.nextDueDate;
  frequencyInput.value = bill.frequency;
  categoryInput.value = bill.category;
  noteInput.value = bill.note || "";
  formTitle.textContent = "Edit bill";
  saveButton.textContent = "Update bill";
  nameInput.focus();
}

function resetForm() {
  form.reset();
  billIdInput.value = "";
  currencyInput.value = "GBP";
  frequencyInput.value = "monthly";
  categoryInput.value = "Other";
  setDefaultDueDate();
  formTitle.textContent = "Add bill";
  saveButton.textContent = "Save bill";
}

function renderCategories() {
  const selected = categoryInput.value || "Other";
  categoryInput.innerHTML = categories
    .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    .join("");

  if (categories.includes(selected)) {
    categoryInput.value = selected;
  } else {
    categoryInput.value = "Other";
  }

  categoryList.innerHTML = categories
    .map((category) => {
      const removable = defaultCategories.includes(category) ? "" : `<button type="button" data-category="${escapeHtml(category)}">Remove</button>`;
      return `<span class="tag">${escapeHtml(category)}${removable}</span>`;
    })
    .join("");

  categoryList.querySelectorAll("button[data-category]").forEach((button) => {
    button.addEventListener("click", () => removeCategory(button.dataset.category));
  });

  renderBudgetCategoryOptions();
}

function addCategory(event) {
  event.preventDefault();
  const category = normalizeCategory(newCategoryInput.value);
  if (!category) {
    return;
  }

  const exists = categories.some((item) => item.toLowerCase() === category.toLowerCase());
  if (!exists) {
    categories = [...categories.filter((item) => item !== "Other"), category, "Other"];
    saveCategories();
    renderCategories();
  }

  categoryInput.value = categories.find((item) => item.toLowerCase() === category.toLowerCase()) || "Other";
  newCategoryInput.value = "";
}

function removeCategory(category) {
  if (defaultCategories.includes(category)) {
    return;
  }

  categories = categories.filter((item) => item !== category);
  bills = bills.map((bill) => {
    if (bill.category !== category) {
      return bill;
    }
    return { ...bill, category: "Other", updatedAt: new Date().toISOString() };
  });

  saveCategories();
  saveBills();
  renderCategories();
  render();
}

function normalizeCategory(value) {
  return value.trim().replace(/\s+/g, " ").slice(0, 28);
}

function setDefaultDueDate() {
  nextDueDateInput.value = toDateInputValue(new Date());
}

function loadBills() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn("Could not load saved bills", error);
    return [];
  }
}

function saveBills() {
  if (bills.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
  }
  renderPrivacyReport();
}

function loadStatementTransactions() {
  try {
    const saved = localStorage.getItem(STATEMENT_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? sortTransactionsByStatementOrder(parsed.map((transaction, index) => normalizeStoredTransaction(transaction, index)).filter(isValidSavedTransaction)) : [];
  } catch (error) {
    console.warn("Could not load statement history", error);
    return [];
  }
}

function isValidSavedTransaction(transaction) {
  return transaction.date && (transaction.spending > 0 || transaction.income > 0) && !isStatementNonTransactionText(transaction.description);
}

function saveStatementTransactions() {
  if (statementTransactions.length === 0) {
    localStorage.removeItem(STATEMENT_KEY);
  } else {
    localStorage.setItem(STATEMENT_KEY, JSON.stringify(statementTransactions));
  }
  renderPrivacyReport();
}

function loadBudgets() {
  try {
    const saved = localStorage.getItem(BUDGET_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.warn("Could not load budgets", error);
    return {};
  }
}

function saveBudgets() {
  if (Object.keys(budgets).length === 0) {
    localStorage.removeItem(BUDGET_KEY);
  } else {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
  }
  renderPrivacyReport();
}

function loadSavingsGoals() {
  try {
    const saved = localStorage.getItem(GOAL_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Could not load savings goals", error);
    return [];
  }
}

function saveSavingsGoals() {
  if (savingsGoals.length === 0) {
    localStorage.removeItem(GOAL_KEY);
  } else {
    localStorage.setItem(GOAL_KEY, JSON.stringify(savingsGoals));
  }
  renderPrivacyReport();
}

function loadCancelPlans() {
  try {
    const saved = localStorage.getItem(CANCEL_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Could not load cancel planner", error);
    return [];
  }
}

function saveCancelPlans() {
  if (cancelPlans.length === 0) {
    localStorage.removeItem(CANCEL_KEY);
  } else {
    localStorage.setItem(CANCEL_KEY, JSON.stringify(cancelPlans));
  }
  renderPrivacyReport();
}

function loadAccountSettings() {
  try {
    const saved = localStorage.getItem(ACCOUNT_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    return normalizeAccountSettings(parsed);
  } catch (error) {
    console.warn("Could not load account settings", error);
    return { ...defaultAccountSettings, accounts: [...defaultOwnAccounts] };
  }
}

function normalizeAccountSettings(value) {
  const settings = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    accounts: normalizeAccountList(settings.accounts || defaultAccountSettings.accounts),
    transferWindowDays: Math.round(clamp(Number(settings.transferWindowDays || defaultAccountSettings.transferWindowDays), 0, 7)),
    amountTolerancePercent: roundMoney(clamp(Number(settings.amountTolerancePercent || defaultAccountSettings.amountTolerancePercent), 0, 10)),
  };
}

function saveAccountSettings() {
  accountSettings = normalizeAccountSettings(accountSettings);
  const isDefault =
    JSON.stringify(accountSettings.accounts) === JSON.stringify(defaultOwnAccounts) &&
    accountSettings.transferWindowDays === defaultAccountSettings.transferWindowDays &&
    accountSettings.amountTolerancePercent === defaultAccountSettings.amountTolerancePercent;

  if (isDefault) {
    localStorage.removeItem(ACCOUNT_KEY);
  } else {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accountSettings));
  }
  renderPrivacyReport();
}

function loadCategories() {
  try {
    const saved = localStorage.getItem(CATEGORY_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    const merged = [...defaultCategories, ...parsed].filter(Boolean);
    return [...new Set(merged)].sort((a, b) => {
      if (a === "Other") {
        return 1;
      }
      if (b === "Other") {
        return -1;
      }
      return a.localeCompare(b);
    });
  } catch (error) {
    console.warn("Could not load categories", error);
    return defaultCategories;
  }
}

function saveCategories() {
  const customCategories = categories.filter((category) => !defaultCategories.includes(category));
  if (customCategories.length === 0) {
    localStorage.removeItem(CATEGORY_KEY);
  } else {
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(customCategories));
  }
  renderPrivacyReport();
}

function loadReminderSettings() {
  try {
    const saved = localStorage.getItem(REMINDER_KEY);
    return saved ? JSON.parse(saved) : { days: 7, mode: "off", lastNotified: "" };
  } catch (error) {
    console.warn("Could not load reminders", error);
    return { days: 7, mode: "off", lastNotified: "" };
  }
}

function saveReminderSettings() {
  reminderSettings = {
    ...reminderSettings,
    days: Number(reminderDaysInput.value),
    mode: reminderModeInput.value,
  };
  localStorage.setItem(REMINDER_KEY, JSON.stringify(reminderSettings));
  renderPrivacyReport();
  checkReminders(true);
}

function applyReminderSettings() {
  reminderDaysInput.value = String(reminderSettings.days || 7);
  reminderModeInput.value = reminderSettings.mode || "off";
  if (!("Notification" in window)) {
    notificationButton.disabled = true;
    reminderModeInput.value = "off";
    reminderMessage.textContent = "Browser alerts are not available here.";
  } else if (Notification.permission === "granted") {
    notificationButton.textContent = "Alerts enabled";
  }
}

function requestNotificationAccess() {
  if (!("Notification" in window)) {
    reminderMessage.textContent = "Browser alerts are not available here.";
    return;
  }

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      reminderModeInput.value = "on";
      notificationButton.textContent = "Alerts enabled";
      saveReminderSettings();
    } else {
      reminderModeInput.value = "off";
      saveReminderSettings();
      reminderMessage.textContent = "Alerts are blocked in this browser.";
    }
  });
}

function checkReminders(force) {
  const days = Number(reminderSettings.days || 7);
  const dueBills = bills.filter((bill) => {
    const remaining = daysUntil(bill.nextDueDate);
    return bill.status === "active" && remaining >= 0 && remaining <= days;
  });

  if (dueBills.length === 0) {
    if (force) {
      reminderMessage.textContent = "No active bills are due in this window.";
    } else {
      reminderMessage.textContent = "Reminders run while this page is open.";
    }
    return;
  }

  const names = dueBills.slice(0, 3).map((bill) => bill.name).join(", ");
  reminderMessage.textContent = `${dueBills.length} bill${dueBills.length === 1 ? "" : "s"} due soon: ${names}`;

  const today = toDateInputValue(new Date());
  const reminderKey = `${today}-${days}-${dueBills.map((bill) => bill.id).join(".")}`;
  const canNotify = reminderSettings.mode === "on" && "Notification" in window && Notification.permission === "granted";

  if ((force || reminderSettings.lastNotified !== reminderKey) && canNotify) {
    new Notification("BillPocket reminder", {
      body: `${dueBills.length} bill${dueBills.length === 1 ? "" : "s"} due soon: ${names}`,
    });
    reminderSettings.lastNotified = reminderKey;
    localStorage.setItem(REMINDER_KEY, JSON.stringify(reminderSettings));
  }
}

function exportJson() {
  const payload = {
    exportedAt: new Date().toISOString(),
    bills,
    categories,
    reminderSettings,
    statementTransactions,
    budgets,
    savingsGoals,
    cancelPlans,
    accountSettings,
    simulatorScenarios,
  };
  downloadFile("billpocket-backup.json", JSON.stringify(payload, null, 2), "application/json");
  exportMessage.textContent = "JSON backup downloaded.";
}

function exportCsv() {
  const headers = ["name", "amount", "currency", "category", "nextDueDate", "frequency", "status", "note"];
  const rows = bills.map((bill) => headers.map((header) => csvCell(bill[header])).join(","));
  downloadFile("billpocket-bills.csv", [headers.join(","), ...rows].join("\n"), "text/csv");
  exportMessage.textContent = "CSV file downloaded.";
}

function importJsonBackup(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const payload = JSON.parse(String(reader.result || "{}"));
      const importedBills = Array.isArray(payload.bills) ? payload.bills : [];
      const safeBills = importedBills.map(normalizeImportedBill).filter(Boolean);

      if (safeBills.length === 0 && importedBills.length > 0) {
        exportMessage.textContent = "No valid bills found in that backup.";
        return;
      }

      const confirmed = window.confirm(`Restore ${safeBills.length} bill${safeBills.length === 1 ? "" : "s"} from this backup? This replaces the current local list.`);
      if (!confirmed) {
        return;
      }

      bills = safeBills;
      const importedCategories = Array.isArray(payload.categories) ? payload.categories.map(normalizeCategory).filter(Boolean) : [];
      categories = [...new Set([...defaultCategories, ...importedCategories, ...bills.map((bill) => bill.category)])];
      statementTransactions = Array.isArray(payload.statementTransactions)
        ? sortTransactionsByStatementOrder(payload.statementTransactions.map((transaction, index) => normalizeStoredTransaction(transaction, index)).filter(isValidSavedTransaction))
        : statementTransactions;
      budgets = payload.budgets && typeof payload.budgets === "object" && !Array.isArray(payload.budgets) ? payload.budgets : budgets;
      savingsGoals = Array.isArray(payload.savingsGoals) ? payload.savingsGoals : savingsGoals;
      cancelPlans = Array.isArray(payload.cancelPlans) ? payload.cancelPlans : cancelPlans;
      accountSettings = normalizeAccountSettings(payload.accountSettings || accountSettings);
      simulatorScenarios = Array.isArray(payload.simulatorScenarios) ? payload.simulatorScenarios : simulatorScenarios;
      saveBills();
      saveStatementTransactions();
      saveBudgets();
      saveSavingsGoals();
      saveCancelPlans();
      saveAccountSettings();
      saveCategories();
      saveSimulatorScenarios();
      renderCategories();
      renderStatementAccountOptions();
      renderAccountSettings();
      renderStoredStatementState();
      renderPlanning();
      renderSimulator();
      resetForm();
      render();
      exportMessage.textContent = "Backup restored on this device.";
    } catch (error) {
      console.warn("Could not import backup", error);
      exportMessage.textContent = "That file is not a valid BillPocket JSON backup.";
    } finally {
      importJsonInput.value = "";
    }
  });
  reader.readAsText(file);
}

function normalizeImportedBill(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const name = String(value.name || "").trim().slice(0, 60);
  const amount = Number(value.amount);
  const nextDueDate = /^\d{4}-\d{2}-\d{2}$/.test(String(value.nextDueDate || "")) ? value.nextDueDate : "";
  const frequency = ["weekly", "monthly", "quarterly", "yearly"].includes(value.frequency) ? value.frequency : "monthly";
  const status = ["active", "paused", "cancelled"].includes(value.status) ? value.status : "active";
  const currency = ["GBP", "USD", "EUR", "INR"].includes(value.currency) ? value.currency : "GBP";
  const category = normalizeCategory(String(value.category || "Other")) || "Other";

  if (!name || !Number.isFinite(amount) || amount < 0 || !nextDueDate) {
    return null;
  }

  return {
    id: value.id || createId(),
    name,
    amount,
    currency,
    category,
    nextDueDate,
    frequency,
    status,
    note: String(value.note || "").trim().slice(0, 180),
    createdAt: value.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function parseEmailReceipt() {
  const text = emailTextInput.value.trim();
  if (!text) {
    importMessage.textContent = "Paste a receipt email first.";
    return;
  }

  const parsed = extractBillFromEmail(text);
  nameInput.value = parsed.name;
  amountInput.value = parsed.amount || "";
  currencyInput.value = parsed.currency;
  nextDueDateInput.value = parsed.nextDueDate;
  frequencyInput.value = parsed.frequency;
  categoryInput.value = parsed.category;
  noteInput.value = "Imported from pasted email text.";
  importMessage.textContent = "Draft filled. Review it, then save.";
  nameInput.focus();
}

function extractBillFromEmail(text) {
  const cleanText = text.replace(/\s+/g, " ");
  const knownServices = ["Netflix", "Spotify", "Apple", "Google", "Amazon", "Microsoft", "Adobe", "Disney", "YouTube", "Dropbox", "Notion", "Canva"];
  const matchedService = knownServices.find((service) => new RegExp(`\\b${service}\\b`, "i").test(cleanText));
  const subjectMatch = text.match(/(?:from|merchant|seller|subscription|renewal)[:\s]+([A-Z][A-Za-z0-9 &.+-]{2,40})/i);
  const amountMatch = cleanText.match(/(?:GBP|USD|EUR|INR|£|\$|€|₹)\s?([0-9]+(?:[.,][0-9]{2})?)/i);
  const currencyMatch = cleanText.match(/\b(GBP|USD|EUR|INR)\b|[£$€₹]/i);
  const dateMatch = cleanText.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  const yearly = /annual|annually|yearly|per year/i.test(cleanText);
  const weekly = /weekly|per week/i.test(cleanText);

  return {
    name: matchedService || cleanMerchantName(subjectMatch?.[1]) || "Subscription",
    amount: amountMatch ? Number(amountMatch[1].replace(",", ".")) : "",
    currency: normalizeCurrency(currencyMatch?.[0]),
    category: "Entertainment",
    frequency: yearly ? "yearly" : weekly ? "weekly" : "monthly",
    nextDueDate: dateMatch ? dateMatch[1] : toDateInputValue(new Date()),
  };
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

function explainGmailConnection() {
  importMessage.textContent = "Gmail auto-import would use Google OAuth, read receipt emails with permission, then suggest bills for review.";
}

function initSectionNavigation() {
  if (appNavLinks.length === 0) {
    return;
  }

  const setActiveLink = (hash) => {
    appNavLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === hash);
    });
  };

  appNavLinks.forEach((link) => {
    link.addEventListener("click", () => setActiveLink(link.getAttribute("href")));
  });

  if (!("IntersectionObserver" in window)) {
    return;
  }

  const sections = appNavLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visibleEntry) {
        setActiveLink(`#${visibleEntry.target.id}`);
      }
    },
    {
      rootMargin: "-18% 0px -68% 0px",
      threshold: [0.08, 0.24, 0.5],
    },
  );

  sections.forEach((section) => observer.observe(section));
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}

function applyTheme(theme, persist = true) {
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  if (persist) {
    localStorage.setItem(THEME_KEY, theme);
  }
  renderPrivacyReport();
}

function toggleTheme() {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
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

function loadSimulatorScenarios() {
  try {
    const saved = localStorage.getItem(SIMULATOR_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveSimulatorScenarios() {
  if (simulatorScenarios.length === 0) {
    localStorage.removeItem(SIMULATOR_KEY);
  } else {
    localStorage.setItem(SIMULATOR_KEY, JSON.stringify(simulatorScenarios));
  }
  renderPrivacyReport();
}

function getSimCategoryInputs() {
  const result = {};
  if (!simCatGrid) {
    return result;
  }
  simCatGrid.querySelectorAll(".sim-cat-input").forEach((input) => {
    const category = input.dataset.category;
    const value = Number(input.value) || 0;
    if (category && value > 0) {
      result[category] = value;
    }
  });
  return result;
}

function getTopStatementCategories() {
  const analyzed = getAnalyzedTransactions();
  const scan = buildStatementScan(analyzed);
  const months = Math.max(1, scan.dateRange.months);
  return scan.categoryTotals
    .filter((row) => row.amount > 0)
    .map((row) => ({ category: row.category, monthly: roundMoney(row.amount / months) }))
    .slice(0, 6);
}

function renderSimCategoryGrid() {
  if (!simCatGrid) {
    return;
  }
  const topCategories = getTopStatementCategories();
  if (topCategories.length === 0) {
    simCatGrid.innerHTML = `<p class="muted sim-cat-hint">Upload statements to see category cut options.</p>`;
    return;
  }
  simCatGrid.innerHTML = topCategories
    .map(
      (row) => `
        <label class="sim-cat-label">
          <span>${escapeHtml(row.category)} <span class="muted">${formatMoney(row.monthly, "GBP")}/mo</span></span>
          <input class="sim-cat-input" type="number" min="0" step="1" placeholder="cut £"
            data-category="${escapeHtml(row.category)}"
            aria-label="${escapeHtml(row.category)} monthly spending cut">
        </label>
      `,
    )
    .join("");
}

function renderSimGoalOptions() {
  if (!simGoalSelect) {
    return;
  }
  const current = simGoalSelect.value;
  const options = savingsGoals
    .map((goal) => {
      const remaining = Math.max(0, goal.target - goal.saved);
      return `<option value="${escapeHtml(goal.id)}">${escapeHtml(goal.name)} (${formatMoney(remaining, "GBP")} left)</option>`;
    })
    .join("");
  simGoalSelect.innerHTML = `<option value="">— no goal —</option>${options}`;
  if (current && savingsGoals.some((goal) => goal.id === current)) {
    simGoalSelect.value = current;
  }
}

function getSimulatorBaseline() {
  const analyzed = getAnalyzedTransactions();
  const scan = buildStatementScan(analyzed);
  const months = Math.max(1, scan.dateRange.months);
  const monthlyIncome = roundMoney(scan.totalIncome / months);
  const activeBills = bills.filter((bill) => bill.status === "active" && bill.currency === "GBP");
  const monthlyBills = roundMoney(activeBills.reduce((sum, bill) => sum + monthlyEquivalent(bill), 0));
  const statementSpend = roundMoney(scan.totalSpend / months);
  const monthlySpend = roundMoney(statementSpend > 0 ? statementSpend : monthlyBills);
  const monthlySurplus = roundMoney(monthlyIncome - monthlySpend);
  const safe = getSafeToSpendSnapshot();
  const hasStatements = analyzed.length >= 5;
  const hasBills = activeBills.length > 0;
  let confidence = "low";
  if (hasStatements && hasBills) {
    confidence = "high";
  } else if (hasStatements || hasBills) {
    confidence = "medium";
  }
  return {
    monthlyIncome,
    monthlySpend,
    monthlyBills,
    monthlySurplus,
    safeToSpend: safe.safeAmount,
    startingBuffer: roundMoney(Math.max(0, safe.safeAmount)),
    hasStatements,
    hasBills,
    confidence,
    statementMonths: months,
  };
}

function runSimulation(scenario) {
  const baseline = getSimulatorBaseline();
  const duration = Number(scenario.durationMonths) || 12;
  const incomeDelta = Number(scenario.incomeDelta) || 0;
  const rentDelta = Number(scenario.rentDelta) || 0;
  const oneOffCost = Number(scenario.oneOffCost) || 0;
  const subscriptionSavings = Number(scenario.subscriptionSavings) || 0;
  const spendingCutsTotal = Object.values(scenario.spendingCuts || {}).reduce((sum, v) => sum + Number(v), 0);
  const totalMonthlyImprovement = incomeDelta - rentDelta + subscriptionSavings + spendingCutsTotal;
  const scenarioSurplus = roundMoney(baseline.monthlySurplus + totalMonthlyImprovement);

  const [startYear, startMonthNum] = scenario.startMonth.split("-").map(Number);
  const monthly = [];
  let baselineBuffer = baseline.startingBuffer;
  let scenarioBuffer = baseline.startingBuffer;
  for (let i = 0; i < duration; i++) {
    const date = new Date(startYear, startMonthNum - 1 + i, 1);
    const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const scenarioThisMonth = roundMoney(scenarioSurplus - (i === 0 ? oneOffCost : 0));
    baselineBuffer = roundMoney(baselineBuffer + baseline.monthlySurplus);
    scenarioBuffer = roundMoney(scenarioBuffer + scenarioThisMonth);
    const dangerBills = scenarioBuffer < 0 ? getSimulatorDangerBills(label) : [];
    monthly.push({
      month: label,
      baseline: baseline.monthlySurplus,
      scenario: scenarioThisMonth,
      baselineBuffer,
      scenarioBuffer,
      dangerBills,
      isDanger: scenarioBuffer < 0,
    });
  }

  const dangerMonths = monthly.filter((m) => m.isDanger);
  const yearlyImpact = roundMoney(totalMonthlyImprovement * 12 - oneOffCost);

  let goalImpact = null;
  if (scenario.goalId) {
    const goal = savingsGoals.find((g) => g.id === scenario.goalId);
    if (goal) {
      const remaining = Math.max(0, goal.target - goal.saved);
      const baselineMonths = baseline.monthlySurplus > 0 ? Math.ceil(remaining / baseline.monthlySurplus) : null;
      const scenarioGoalMonths = scenarioSurplus > 0 ? Math.ceil(remaining / scenarioSurplus) : null;
      goalImpact = { goal, remaining, baselineMonths, scenarioMonths: scenarioGoalMonths };
    }
  }

  const actions = buildSimulatorActions(scenario, baseline, scenarioSurplus, dangerMonths);

  return {
    baseline,
    scenario,
    baselineSurplus: baseline.monthlySurplus,
    scenarioSurplus,
    totalMonthlyImprovement,
    monthly,
    dangerMonths,
    goalImpact,
    actions,
    yearlyImpact,
  };
}

function buildSimulatorActions(scenario, baseline, scenarioSurplus, dangerMonths) {
  const actions = [];
  const incomeDelta = Number(scenario.incomeDelta) || 0;
  const rentDelta = Number(scenario.rentDelta) || 0;
  const oneOffCost = Number(scenario.oneOffCost) || 0;
  const subscriptionSavings = Number(scenario.subscriptionSavings) || 0;
  const spendingCuts = Object.entries(scenario.spendingCuts || {});

  if (dangerMonths.length > 0) {
    const firstDanger = dangerMonths[0];
    const billText = firstDanger.dangerBills.length
      ? ` Watch ${firstDanger.dangerBills.map((bill) => `${bill.name} on ${formatDate(bill.date)}`).join(", ")}.`
      : "";
    actions.push({ type: "warning", text: `Cash shortfall by ${formatMonthLabel(firstDanger.month)} across ${dangerMonths.length} month${dangerMonths.length === 1 ? "" : "s"}.${billText} Plan extra income or cut costs before committing.` });
  }

  if (oneOffCost > 0) {
    const saveMonths = scenarioSurplus > 0 ? Math.ceil(oneOffCost / Math.max(1, scenarioSurplus)) : null;
    const detail = saveMonths ? ` — about ${saveMonths} month${saveMonths === 1 ? "" : "s"} of surplus to build that` : "";
    actions.push({ type: "save", text: `Set aside ${formatMoney(oneOffCost, "GBP")} before the start month for one-off costs${detail}.` });
  }

  if (rentDelta > 0) {
    actions.push({ type: "cut", text: `Rent increase of ${formatMoney(rentDelta, "GBP")}/mo — review other costs first to offset the impact.` });
  }

  if (rentDelta < 0) {
    actions.push({ type: "save", text: `Rent saving of ${formatMoney(Math.abs(rentDelta), "GBP")}/mo — redirect it straight to a goal rather than lifestyle creep.` });
  }

  if (subscriptionSavings > 0) {
    actions.push({ type: "cancel", text: `Cancel subscriptions to free ${formatMoney(subscriptionSavings, "GBP")}/mo — check direct debits and recurring card charges now.` });
  }

  if (spendingCuts.length > 0) {
    const total = spendingCuts.reduce((sum, [, v]) => sum + Number(v), 0);
    actions.push({ type: "cut", text: `Category cuts of ${formatMoney(total, "GBP")}/mo total — set matching limits in the Planner to track these.` });
  }

  if (incomeDelta > 0) {
    actions.push({ type: "save", text: `Income increase of ${formatMoney(incomeDelta, "GBP")}/mo — automate a transfer to savings on payday before it disappears.` });
  }

  if (incomeDelta < 0) {
    actions.push({ type: "warning", text: `Income drop of ${formatMoney(Math.abs(incomeDelta), "GBP")}/mo — confirm all bills are covered before the change takes effect.` });
  }

  if (actions.length === 0) {
    actions.push({ type: "ok", text: `Projected surplus of ${formatMoney(scenarioSurplus, "GBP")}/mo looks manageable across the ${scenario.durationMonths}-month window.` });
  }

  return actions;
}

function getSimulatorDangerBills(monthValue) {
  const [year, month] = monthValue.split("-").map(Number);
  const start = startOfDay(new Date(year, month - 1, 1));
  const end = startOfDay(new Date(year, month, 0));
  const dueBills = [];

  bills
    .filter((bill) => bill.status === "active" && bill.currency === "GBP")
    .forEach((bill) => {
      let due = parseLocalDate(bill.nextDueDate);
      while (due <= end) {
        if (due >= start) {
          dueBills.push({
            name: bill.name,
            date: toDateInputValue(due),
            amount: Number(bill.amount || 0),
          });
        }
        due = advanceDateByFrequency(due, bill.frequency);
      }
    });

  return dueBills.sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date) || a.name.localeCompare(b.name)).slice(0, 4);
}

function renderSimulator() {
  renderSimCategoryGrid();
  renderSimGoalOptions();
  renderSavedScenarios();
  if (simStartMonthInput && !simStartMonthInput.value) {
    const now = new Date();
    simStartMonthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
}

function renderSimulatorOutput(result) {
  if (!simOutput) {
    return;
  }
  const { baseline, scenarioSurplus, baselineSurplus, totalMonthlyImprovement, yearlyImpact, dangerMonths, goalImpact, actions } = result;
  const surplusTone = scenarioSurplus >= 0 ? "positive" : "negative";
  const improveTone = totalMonthlyImprovement >= 0 ? "positive" : "negative";
  const confidenceLabels = {
    high: "High confidence — statements and bills both available",
    medium: "Medium confidence — limited data",
    low: "Low confidence — no statements, using manual values only",
  };
  const confidenceClasses = { high: "confidence-high", medium: "confidence-med", low: "confidence-low" };

  const actionItems = actions
    .map((action) => {
      const icons = { warning: "⚠", save: "↑", cut: "✂", cancel: "✕", ok: "✓", delay: "⏱" };
      const icon = icons[action.type] || "·";
      return `<div class="sim-action-item sim-action-${escapeHtml(action.type)}"><span class="sim-action-icon" aria-hidden="true">${icon}</span><p>${escapeHtml(action.text)}</p></div>`;
    })
    .join("");

  const goalHtml = goalImpact
    ? (() => {
        const { goal, remaining, baselineMonths, scenarioMonths } = goalImpact;
        const baselineLabel = baselineMonths ? `${baselineMonths} month${baselineMonths === 1 ? "" : "s"}` : "Not achievable at current rate";
        const scenarioLabel = scenarioMonths ? `${scenarioMonths} month${scenarioMonths === 1 ? "" : "s"}` : "Not achievable in this scenario";
        const diff = baselineMonths && scenarioMonths ? baselineMonths - scenarioMonths : null;
        const diffLabel = diff !== null ? (diff > 0 ? `${diff} month${diff === 1 ? "" : "s"} faster` : diff < 0 ? `${Math.abs(diff)} month${Math.abs(diff) === 1 ? "" : "s"} slower` : "Same pace") : "";
        return `
          <div class="sim-goal-impact">
            <h4>Goal: ${escapeHtml(goal.name)}</h4>
            <div class="sim-goal-compare">
              <div><span class="muted">Without scenario</span><strong>${escapeHtml(baselineLabel)}</strong></div>
              <div><span class="muted">With scenario</span><strong class="${scenarioMonths && baselineMonths && scenarioMonths < baselineMonths ? "positive" : scenarioMonths && baselineMonths && scenarioMonths > baselineMonths ? "negative" : ""}">${escapeHtml(scenarioLabel)}</strong></div>
              ${diffLabel ? `<p class="sim-goal-diff">${escapeHtml(diffLabel)} · ${formatMoney(remaining, "GBP")} remaining</p>` : ""}
            </div>
          </div>
        `;
      })()
    : "";

  simOutput.innerHTML = `
    <div class="sim-metrics">
      <div class="sim-metric">
        <span class="muted">Baseline surplus</span>
        <strong class="${baselineSurplus >= 0 ? "positive" : "negative"}">${formatMoney(baselineSurplus, "GBP")}/mo</strong>
      </div>
      <div class="sim-metric">
        <span class="muted">Scenario surplus</span>
        <strong class="${surplusTone}">${formatMoney(scenarioSurplus, "GBP")}/mo</strong>
      </div>
      <div class="sim-metric">
        <span class="muted">Monthly change</span>
        <strong class="${improveTone}">${totalMonthlyImprovement >= 0 ? "+" : ""}${formatMoney(totalMonthlyImprovement, "GBP")}</strong>
      </div>
      <div class="sim-metric">
        <span class="muted">Yearly impact</span>
        <strong class="${yearlyImpact >= 0 ? "positive" : "negative"}">${yearlyImpact >= 0 ? "+" : ""}${formatMoney(yearlyImpact, "GBP")}</strong>
      </div>
      <div class="sim-metric">
        <span class="muted">Danger months</span>
        <strong class="${dangerMonths.length > 0 ? "negative" : "positive"}">${dangerMonths.length > 0 ? dangerMonths.length : "None"}</strong>
      </div>
      <div class="sim-metric">
        <span class="muted">Safe to spend now</span>
        <strong class="${baseline.safeToSpend >= 0 ? "positive" : "negative"}">${formatMoney(baseline.safeToSpend, "GBP")}</strong>
      </div>
      <div class="sim-metric">
        <span class="muted">Confidence</span>
        <strong class="${confidenceClasses[baseline.confidence]}">${escapeHtml(baseline.confidence)}</strong>
      </div>
    </div>
    <p class="sim-confidence-note muted">${escapeHtml(confidenceLabels[baseline.confidence])}</p>
    ${goalHtml}
    <div class="sim-actions">
      <h4>Action list</h4>
      ${actionItems}
    </div>
  `;

  renderSimulatorCharts(result);
  if (simSaveButton) {
    simSaveButton.disabled = false;
  }
}

function renderSimulatorCharts(result) {
  if (!simCharts) {
    return;
  }
  const { monthly, goalImpact } = result;
  simCharts.innerHTML = `
    <div class="sim-charts-grid">
      <article class="sim-chart-card wide-chart">
        <h3>Baseline vs scenario — monthly surplus</h3>
        <div id="simCompareChart" class="chart-shell"></div>
      </article>
      <article class="sim-chart-card">
        <h3>Projected buffer</h3>
        <div id="simCashflowChart" class="chart-shell"></div>
      </article>
      ${goalImpact ? `<article class="sim-chart-card"><h3>Goal progress impact</h3><div id="simGoalChart" class="sim-goal-chart-shell"></div></article>` : ""}
    </div>
  `;
  renderSimCompareChart(monthly);
  renderSimCashflowProjectionChart(monthly);
  if (goalImpact) {
    renderSimGoalChart(goalImpact);
  }
}

function renderSimYAxis(width, height, padding, minValue, maxValue) {
  const chartHeight = height - padding.top - padding.bottom;
  const range = maxValue - minValue || 1;
  const ticks = [minValue, (minValue + maxValue) / 2, maxValue];
  return ticks
    .map((value) => {
      const y = padding.top + chartHeight - ((value - minValue) / range) * chartHeight;
      return `
        <line class="chart-grid" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"></line>
        <text class="chart-axis-label" x="${padding.left - 10}" y="${y + 4}" text-anchor="end">${formatCompactMoney(value)}</text>
      `;
    })
    .join("");
}

function renderSimCompareChart(monthly) {
  const container = document.querySelector("#simCompareChart");
  if (!container) {
    return;
  }
  const width = 720;
  const height = 280;
  const padding = { top: 28, right: 18, bottom: 44, left: 72 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const visible = monthly.slice(0, 12);
  const allValues = visible.flatMap((m) => [m.baseline, m.scenario]);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(1, ...allValues);
  const range = maxValue - minValue || 1;
  const groupWidth = chartWidth / visible.length;
  const barWidth = Math.min(22, groupWidth / 3);
  const zeroY = padding.top + chartHeight - ((0 - minValue) / range) * chartHeight;

  const bars = visible
    .map((m, index) => {
      const x = padding.left + index * groupWidth + groupWidth / 2;
      const baselineH = Math.abs((m.baseline / range) * chartHeight);
      const scenarioH = Math.abs((m.scenario / range) * chartHeight);
      const baselineY = m.baseline >= 0 ? zeroY - baselineH : zeroY;
      const scenarioY = m.scenario >= 0 ? zeroY - scenarioH : zeroY;
      const scenarioClass = m.scenario < 0 ? "chart-spend" : "chart-scenario";
      return `
        <rect class="chart-income" x="${x - barWidth - 2}" y="${baselineY}" width="${barWidth}" height="${baselineH}" rx="3">
          <title>${formatShortMonth(m.month)} baseline: ${formatMoney(m.baseline, "GBP")}</title>
        </rect>
        <rect class="${scenarioClass}" x="${x + 2}" y="${scenarioY}" width="${barWidth}" height="${scenarioH}" rx="3">
          <title>${formatShortMonth(m.month)} scenario: ${formatMoney(m.scenario, "GBP")}</title>
        </rect>
        <text class="chart-label" x="${x}" y="${height - 18}" text-anchor="middle">${formatShortMonth(m.month)}</text>
      `;
    })
    .join("");

  container.innerHTML = `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Baseline versus scenario monthly surplus comparison">
      <line class="chart-axis" x1="${padding.left}" y1="${zeroY}" x2="${width - padding.right}" y2="${zeroY}"></line>
      ${renderSimYAxis(width, height, padding, minValue, maxValue)}
      ${bars}
      ${renderLegend([["Baseline", "chart-income"], ["Scenario", "chart-scenario"]])}
    </svg>
  `;
}

function renderSimCashflowProjectionChart(monthly) {
  const container = document.querySelector("#simCashflowChart");
  if (!container) {
    return;
  }
  const width = 460;
  const height = 280;
  const padding = { top: 24, right: 20, bottom: 44, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const visible = monthly.slice(0, 12);
  const allValues = visible.flatMap((m) => [m.baselineBuffer, m.scenarioBuffer]);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(1, ...allValues);
  const range = maxValue - minValue || 1;
  const zeroY = padding.top + chartHeight - ((0 - minValue) / range) * chartHeight;

  const getX = (index) => padding.left + (visible.length === 1 ? chartWidth / 2 : (index / (visible.length - 1)) * chartWidth);
  const getY = (value) => padding.top + chartHeight - ((value - minValue) / range) * chartHeight;

  const baselinePoints = visible.map((m, i) => `${getX(i)},${getY(m.baselineBuffer)}`).join(" ");
  const scenarioPoints = visible.map((m, i) => `${getX(i)},${getY(m.scenarioBuffer)}`).join(" ");

  const dots = visible
    .map(
      (m, i) => `
      <circle class="${m.baselineBuffer >= 0 ? "chart-income" : "chart-spend"}" cx="${getX(i)}" cy="${getY(m.baselineBuffer)}" r="4">
        <title>${formatShortMonth(m.month)} baseline buffer: ${formatMoney(m.baselineBuffer, "GBP")}</title>
      </circle>
      <circle class="${m.scenarioBuffer >= 0 ? "chart-scenario" : "chart-spend"}" cx="${getX(i)}" cy="${getY(m.scenarioBuffer)}" r="4">
        <title>${formatShortMonth(m.month)} scenario buffer: ${formatMoney(m.scenarioBuffer, "GBP")}</title>
      </circle>
      <text class="chart-label" x="${getX(i)}" y="${height - 18}" text-anchor="middle">${formatShortMonth(m.month)}</text>
    `,
    )
    .join("");

  container.innerHTML = `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Projected buffer line chart">
      <line class="chart-axis" x1="${padding.left}" y1="${zeroY}" x2="${width - padding.right}" y2="${zeroY}"></line>
      <polyline class="chart-line chart-line-muted" points="${baselinePoints}"></polyline>
      <polyline class="chart-line chart-line-scenario" points="${scenarioPoints}"></polyline>
      ${dots}
    </svg>
  `;
}

function renderSimGoalChart(goalImpact) {
  const container = document.querySelector("#simGoalChart");
  if (!container) {
    return;
  }
  const { goal, remaining, baselineMonths, scenarioMonths } = goalImpact;
  const faster = scenarioMonths && baselineMonths && scenarioMonths < baselineMonths;
  const slower = scenarioMonths && baselineMonths && scenarioMonths > baselineMonths;
  const baselineBarW = baselineMonths && scenarioMonths ? Math.max(4, Math.round((scenarioMonths / baselineMonths) * 100)) : 50;
  const scenarioBarW = baselineMonths && scenarioMonths ? Math.max(4, Math.round((baselineMonths / scenarioMonths) * 100)) : 50;

  container.innerHTML = `
    <div class="sim-goal-bars">
      <div class="sim-goal-bar-row">
        <span>Baseline pace</span>
        <div class="bar-track tall-track">
          <span style="width: ${Math.min(100, baselineBarW)}%"></span>
        </div>
        <strong>${baselineMonths ? `${baselineMonths} mo` : "—"}</strong>
      </div>
      <div class="sim-goal-bar-row">
        <span>Scenario pace</span>
        <div class="bar-track tall-track">
          <span class="${slower ? "danger-bar" : ""}" style="width: ${Math.min(100, scenarioBarW)}%"></span>
        </div>
        <strong class="${faster ? "positive" : slower ? "negative" : ""}">${scenarioMonths ? `${scenarioMonths} mo` : "—"}</strong>
      </div>
    </div>
    <p class="muted">${formatMoney(remaining, "GBP")} remaining toward <strong>${escapeHtml(goal.name)}</strong></p>
  `;
}

function renderSavedScenarios() {
  if (!simScenarioList) {
    return;
  }
  if (simulatorScenarios.length === 0) {
    simScenarioList.innerHTML = `<p class="muted">No saved scenarios yet. Run a simulation and click <strong>Save scenario</strong>.</p>`;
    return;
  }
  simScenarioList.innerHTML = simulatorScenarios
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map((scenario) => {
      const result = runSimulation(scenario);
      const tone = result.scenarioSurplus >= 0 ? "positive" : "negative";
      const dangerNote = result.dangerMonths.length > 0 ? `<p class="sim-danger-note">⚠ ${result.dangerMonths.length} danger month${result.dangerMonths.length === 1 ? "" : "s"}</p>` : "";
      return `
        <div class="sim-saved-card">
          <div class="sim-saved-info">
            <h4>${escapeHtml(scenario.name)}</h4>
            <p>${escapeHtml(scenario.startMonth)} · ${escapeHtml(String(scenario.durationMonths))} months · Surplus <span class="${tone}">${formatMoney(result.scenarioSurplus, "GBP")}/mo</span> · Yearly ${result.yearlyImpact >= 0 ? "+" : ""}${formatMoney(result.yearlyImpact, "GBP")}</p>
            ${dangerNote}
          </div>
          <div class="sim-saved-actions">
            <button class="ghost-button" type="button" data-sim-action="load" data-sim-id="${escapeHtml(scenario.id)}">Load</button>
            <button class="ghost-button danger-button" type="button" data-sim-action="delete" data-sim-id="${escapeHtml(scenario.id)}">Delete</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function handleSimulatorSubmit(event) {
  event.preventDefault();
  const name = simNameInput.value.trim();
  const startMonth = simStartMonthInput.value;
  if (!name || !startMonth) {
    return;
  }

  const existingId = simScenarioIdInput.value;
  const existing = simulatorScenarios.find((s) => s.id === existingId);

  const scenario = {
    id: existingId || createId(),
    name,
    mode: "life-decisions",
    startMonth,
    durationMonths: Number(simDurationInput.value) || 12,
    incomeDelta: Number(simIncomeDeltaInput.value) || 0,
    rentDelta: Number(simRentDeltaInput.value) || 0,
    oneOffCost: Number(simOneOffCostInput.value) || 0,
    subscriptionSavings: Number(simSubSavingsInput.value) || 0,
    spendingCuts: getSimCategoryInputs(),
    goalId: simGoalSelect.value || "",
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  simScenarioIdInput.value = scenario.id;
  currentSimResult = runSimulation(scenario);
  renderSimulatorOutput(currentSimResult);
}

function handleSimSave() {
  if (!currentSimResult) {
    return;
  }
  const scenario = currentSimResult.scenario;
  const index = simulatorScenarios.findIndex((s) => s.id === scenario.id);
  if (index >= 0) {
    simulatorScenarios[index] = scenario;
  } else {
    simulatorScenarios = [scenario, ...simulatorScenarios];
  }
  saveSimulatorScenarios();
  renderSavedScenarios();
  if (simSaveButton) {
    simSaveButton.textContent = "Saved ✓";
    setTimeout(() => {
      if (simSaveButton) {
        simSaveButton.textContent = "Save scenario";
      }
    }, 2000);
  }
}

function handleSimReset() {
  simScenarioIdInput.value = "";
  if (simulatorForm) {
    simulatorForm.reset();
  }
  const now = new Date();
  if (simStartMonthInput) {
    simStartMonthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  if (simOutput) {
    simOutput.innerHTML = `<p class="muted">Fill in the form and click <strong>Run simulation</strong> to see the monthly cashflow impact.</p>`;
  }
  if (simCharts) {
    simCharts.innerHTML = "";
  }
  if (simSaveButton) {
    simSaveButton.disabled = true;
  }
  currentSimResult = null;
  renderSimCategoryGrid();
}

function handleSavedScenarioAction(event) {
  const button = event.target.closest("button[data-sim-action]");
  if (!button) {
    return;
  }
  const id = button.dataset.simId;
  const action = button.dataset.simAction;
  const scenario = simulatorScenarios.find((s) => s.id === id);
  if (!scenario) {
    return;
  }

  if (action === "delete") {
    if (!window.confirm(`Delete scenario "${scenario.name}"?`)) {
      return;
    }
    simulatorScenarios = simulatorScenarios.filter((s) => s.id !== id);
    saveSimulatorScenarios();
    renderSavedScenarios();
    return;
  }

  if (action === "load") {
    simScenarioIdInput.value = scenario.id;
    simNameInput.value = scenario.name;
    simStartMonthInput.value = scenario.startMonth;
    simDurationInput.value = String(scenario.durationMonths);
    simIncomeDeltaInput.value = scenario.incomeDelta || "";
    simRentDeltaInput.value = scenario.rentDelta || "";
    simOneOffCostInput.value = scenario.oneOffCost || "";
    simSubSavingsInput.value = scenario.subscriptionSavings || "";
    if (scenario.goalId && simGoalSelect) {
      simGoalSelect.value = scenario.goalId;
    }
    renderSimCategoryGrid();
    setTimeout(() => {
      Object.entries(scenario.spendingCuts || {}).forEach(([cat, val]) => {
        const input = simCatGrid ? simCatGrid.querySelector(`.sim-cat-input[data-category="${cat}"]`) : null;
        if (input) {
          input.value = String(val);
        }
      });
    }, 0);
    currentSimResult = runSimulation(scenario);
    renderSimulatorOutput(currentSimResult);
    if (simSaveButton) {
      simSaveButton.disabled = false;
    }
    document.querySelector("#simulatorSection")?.scrollIntoView({ behavior: "smooth" });
  }
}
