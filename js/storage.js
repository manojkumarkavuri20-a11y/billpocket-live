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

function loadAccentPreference() {
  try {
    const saved = localStorage.getItem(ACCENT_KEY);
    return saved && accentOptions.some((opt) => opt.id === saved) ? saved : defaultAccent;
  } catch {
    return defaultAccent;
  }
}

function saveAccentPreference() {
  if (!activeAccent || activeAccent === defaultAccent) {
    localStorage.removeItem(ACCENT_KEY);
  } else {
    localStorage.setItem(ACCENT_KEY, activeAccent);
  }
}

function loadOnboardingState() {
  try {
    const saved = localStorage.getItem(ONBOARDING_KEY);
    return saved ? JSON.parse(saved) : { dismissed: false, hasBill: false, hasStatement: false, sawInsights: false };
  } catch {
    return { dismissed: false, hasBill: false, hasStatement: false, sawInsights: false };
  }
}

function saveOnboardingState() {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(onboardingState));
}

// ─── FX rates ────────────────────────────────────────────────────────────────
function loadFxRates() {
  try {
    const saved = localStorage.getItem(FX_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    const merged = { ...defaultFxRates, ...(parsed && typeof parsed === "object" ? parsed : {}) };
    merged[fxBaseCurrency] = 1;
    return merged;
  } catch {
    return { ...defaultFxRates };
  }
}

function saveFxRates() {
  const onlyOverrides = Object.fromEntries(
    Object.entries(fxRates).filter(([code, rate]) => Number(rate) !== defaultFxRates[code])
  );
  if (Object.keys(onlyOverrides).length === 0) {
    localStorage.removeItem(FX_KEY);
  } else {
    localStorage.setItem(FX_KEY, JSON.stringify(onlyOverrides));
  }
  renderPrivacyReport();
}

// ─── Tags ────────────────────────────────────────────────────────────────────
function loadTags() {
  try {
    const saved = localStorage.getItem(TAGS_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed)
      ? parsed
          .filter((t) => t && typeof t === "object" && typeof t.name === "string")
          .map((t) => ({
            id: String(t.id || createId()),
            name: String(t.name).trim().slice(0, 30),
            color: typeof t.color === "string" ? t.color : defaultTagPalette[0],
          }))
          .filter((t) => t.name)
      : [];
  } catch {
    return [];
  }
}

function saveTags() {
  if (!Array.isArray(tags) || tags.length === 0) {
    localStorage.removeItem(TAGS_KEY);
  } else {
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  }
  renderPrivacyReport();
}

// ─── Saved filters ───────────────────────────────────────────────────────────
function loadSavedFilters() {
  try {
    const saved = localStorage.getItem(SAVED_FILTERS_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed)
      ? parsed
          .filter((f) => f && typeof f === "object" && typeof f.name === "string" && f.config)
          .map((f) => ({
            id: String(f.id || createId()),
            name: String(f.name).trim().slice(0, 40),
            scope: f.scope === "bills" ? "bills" : "transactions",
            config: f.config && typeof f.config === "object" ? f.config : {},
          }))
      : [];
  } catch {
    return [];
  }
}

function saveSavedFilters() {
  if (!Array.isArray(savedFilters) || savedFilters.length === 0) {
    localStorage.removeItem(SAVED_FILTERS_KEY);
  } else {
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(savedFilters));
  }
  renderPrivacyReport();
}

// ─── Bill payment history ────────────────────────────────────────────────────
function loadPaymentHistory() {
  try {
    const saved = localStorage.getItem(PAYMENT_HISTORY_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function savePaymentHistory() {
  const trimmed = {};
  for (const [billId, entries] of Object.entries(paymentHistory)) {
    if (Array.isArray(entries) && entries.length > 0) trimmed[billId] = entries.slice(-24);
  }
  if (Object.keys(trimmed).length === 0) {
    localStorage.removeItem(PAYMENT_HISTORY_KEY);
  } else {
    localStorage.setItem(PAYMENT_HISTORY_KEY, JSON.stringify(trimmed));
  }
  renderPrivacyReport();
}

// ─── Lock state (passphrase + WebCrypto AES-GCM encryption) ─────────────────
function loadLockState() {
  try {
    const saved = localStorage.getItem(LOCK_KEY);
    return saved ? JSON.parse(saved) : { enabled: false };
  } catch {
    return { enabled: false };
  }
}

function saveLockState() {
  if (!lockState || !lockState.enabled) {
    localStorage.removeItem(LOCK_KEY);
  } else {
    localStorage.setItem(LOCK_KEY, JSON.stringify(lockState));
  }
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
