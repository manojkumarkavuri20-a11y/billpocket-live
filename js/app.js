// BillPocket — application bootstrap: global state, init sequence & event wiring (loaded last)
// Classic (non-module) script. Loaded in dependency order from index.html.
// Shares the global scope with the other js/*.js files; do not add import/export.

let bills = loadBills();
let categories = loadCategories();
let categoryRules = loadCategoryRules();
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
renderCategoryRules();
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
if (exportTransactionsCsvButton) exportTransactionsCsvButton.addEventListener("click", exportFilteredTransactionsCsv);
if (findDuplicatesButton) findDuplicatesButton.addEventListener("click", renderDuplicateFindings);
if (duplicateFindings) duplicateFindings.addEventListener("click", handleDuplicateAction);
budgetForm.addEventListener("submit", saveBudget);
goalForm.addEventListener("submit", addSavingsGoal);
cancelForm.addEventListener("submit", addCancelPlan);
budgetList.addEventListener("click", handleBudgetAction);
goalList.addEventListener("click", handleGoalAction);
cancelList.addEventListener("click", handleCancelAction);
privacyReportList.addEventListener("click", handlePrivacyDelete);
wipeAllButton.addEventListener("click", wipeAllLocalData);
categoryForm.addEventListener("submit", addCategory);
if (categoryRuleForm) categoryRuleForm.addEventListener("submit", addCategoryRule);
if (categoryRuleList) categoryRuleList.addEventListener("click", handleCategoryRuleAction);
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
