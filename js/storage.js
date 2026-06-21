// BillPocket — localStorage load & save helpers
// Classic (non-module) script. Loaded in dependency order from index.html.
// Shares the global scope with the other js/*.js files; do not add import/export.

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

function loadCategoryRules() {
  try {
    const saved = localStorage.getItem(CATEGORY_RULES_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((rule) => ({
        id: String(rule.id || createId()),
        match: String(rule.match || "").trim().slice(0, 60),
        category: String(rule.category || "Other").trim() || "Other",
      }))
      .filter((rule) => rule.match);
  } catch (error) {
    console.warn("Could not load category rules", error);
    return [];
  }
}

function saveCategoryRules() {
  if (!Array.isArray(categoryRules) || categoryRules.length === 0) {
    localStorage.removeItem(CATEGORY_RULES_KEY);
  } else {
    localStorage.setItem(CATEGORY_RULES_KEY, JSON.stringify(categoryRules));
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

function loadTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}

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
