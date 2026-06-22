// BillPocket — categories, privacy, reminders, import/export, email, nav & theme
// Classic (non-module) script. Loaded in dependency order from index.html.
// Shares the global scope with the other js/*.js files; do not add import/export.

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
      id: "categoryRules",
      label: "Auto-category rules",
      description: "Your merchant-to-category matching rules.",
      key: CATEGORY_RULES_KEY,
      count: Array.isArray(categoryRules) ? categoryRules.length : 0,
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

  if (id === "categoryRules") {
    categoryRules = [];
    saveCategoryRules();
    renderCategoryRules();
    applyCategoryRulesToTransactions();
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

  [STORAGE_KEY, STATEMENT_KEY, BUDGET_KEY, GOAL_KEY, CANCEL_KEY, CATEGORY_KEY, CATEGORY_RULES_KEY, ACCOUNT_KEY, REMINDER_KEY, THEME_KEY, SIMULATOR_KEY].forEach((key) => localStorage.removeItem(key));
  bills = [];
  categories = [...defaultCategories];
  categoryRules = [];
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
  renderCategoryRules();
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
  renderCategoryRules();
  render();
}

function renderCategoryRules() {
  if (!categoryRuleList) {
    return;
  }

  if (categoryRuleCategoryInput) {
    const selected = categoryRuleCategoryInput.value;
    categoryRuleCategoryInput.innerHTML = categories
      .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
      .join("");
    if (categories.includes(selected)) {
      categoryRuleCategoryInput.value = selected;
    }
  }

  if (!Array.isArray(categoryRules) || categoryRules.length === 0) {
    categoryRuleList.innerHTML = `<p class="muted">No custom rules yet. Add one to override how a merchant is filed, e.g. text "amazon" → Shopping.</p>`;
    return;
  }

  categoryRuleList.innerHTML = categoryRules
    .map(
      (rule) =>
        `<span class="tag">${escapeHtml(rule.match)} → ${escapeHtml(rule.category)}<button type="button" data-rule-id="${escapeHtml(rule.id)}">Remove</button></span>`
    )
    .join("");
}

function addCategoryRule(event) {
  event.preventDefault();
  const match = String(categoryRuleMatchInput.value || "").trim();
  if (!match) {
    return;
  }
  const category = categoryRuleCategoryInput.value || "Other";

  categoryRules = [
    { id: createId(), match: match.slice(0, 60), category },
    ...categoryRules.filter((rule) => rule.match.toLowerCase() !== match.toLowerCase()),
  ];
  saveCategoryRules();
  categoryRuleMatchInput.value = "";
  renderCategoryRules();

  const changed = applyCategoryRulesToTransactions();
  if (categoryRuleStatus) {
    categoryRuleStatus.textContent = changed > 0 ? `Rule added. Re-filed ${changed} transaction${changed === 1 ? "" : "s"}.` : "Rule added. It will apply to new imports.";
  }
  showToast(`Rule "${match} → ${category}" added${changed > 0 ? ` · re-filed ${changed}` : ""}`);
}

function handleCategoryRuleAction(event) {
  const button = event.target.closest("button[data-rule-id]");
  if (!button) {
    return;
  }

  categoryRules = categoryRules.filter((rule) => rule.id !== button.dataset.ruleId);
  saveCategoryRules();
  renderCategoryRules();
  const changed = applyCategoryRulesToTransactions();
  if (categoryRuleStatus) {
    categoryRuleStatus.textContent = changed > 0 ? `Rule removed. Re-filed ${changed} transaction${changed === 1 ? "" : "s"}.` : "Rule removed.";
  }
}

// Re-run categorisation over saved transactions after the rules change.
// Manually reviewed rows and income/transfer rows are left untouched.
function applyCategoryRulesToTransactions() {
  let changed = 0;
  statementTransactions = statementTransactions.map((transaction) => {
    if (transaction.reviewedAt || ["transfer", "salary", "income"].includes(transaction.type)) {
      return transaction;
    }
    const next = categorizeStatement(transaction.description);
    if (next !== transaction.category) {
      changed += 1;
      return { ...transaction, category: next, updatedAt: new Date().toISOString() };
    }
    return transaction;
  });

  if (changed > 0) {
    saveStatementTransactions();
    if (statementTransactions.length > 0) {
      refreshStatementAnalyticsAfterReview();
    }
  }
  return changed;
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
    categoryRules,
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
      categoryRules = Array.isArray(payload.categoryRules)
        ? payload.categoryRules
            .map((rule) => ({ id: String(rule.id || createId()), match: String(rule.match || "").trim().slice(0, 60), category: String(rule.category || "Other").trim() || "Other" }))
            .filter((rule) => rule.match)
        : categoryRules;
      saveBills();
      saveStatementTransactions();
      saveBudgets();
      saveSavingsGoals();
      saveCancelPlans();
      saveAccountSettings();
      saveCategories();
      saveSimulatorScenarios();
      saveCategoryRules();
      renderCategories();
      renderCategoryRules();
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

// ─── View switcher (tabbed views + onboarding-aware) ─────────────────────────
function readActiveViewFromHash() {
  const hash = (location.hash || "").replace(/^#/, "");
  return viewIds.includes(hash) ? hash : "home";
}

function setActiveView(viewId, options = {}) {
  if (!viewIds.includes(viewId)) viewId = "home";
  activeView = viewId;
  document.querySelectorAll("[data-view]").forEach((node) => {
    const id = node.dataset.view;
    node.classList.toggle("is-active", id === viewId);
  });
  appNavLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.view === viewId);
  });
  if (!options.skipPush && location.hash.replace(/^#/, "") !== viewId) {
    history.replaceState(null, "", `#${viewId}`);
  }
  if (viewId === "charts") renderVisualInsights();
  if (viewId === "review") renderAnalystCenter();
  if (viewId === "home") {
    if (!onboardingState.sawInsights && (bills.length > 0 || statementTransactions.length > 0)) {
      markOnboardingStep("sawInsights");
    }
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleNavLinkClick(event) {
  const link = event.currentTarget;
  const view = link.dataset.view;
  if (!view) return;
  event.preventDefault();
  setActiveView(view);
}

// ─── Accent picker ───────────────────────────────────────────────────────────
function applyAccent(accentId) {
  const opt = accentOptions.find((o) => o.id === accentId);
  activeAccent = opt ? opt.id : defaultAccent;
  document.body.dataset.accent = activeAccent;
}

function renderAccentPicker() {
  if (!accentPicker) return;
  accentPicker.innerHTML = accentOptions
    .map(
      (opt) =>
        `<button type="button" class="accent-swatch ${opt.id === activeAccent ? "is-active" : ""}" data-accent-id="${opt.id}" aria-label="${escapeHtml(opt.label)}" title="${escapeHtml(opt.label)}" style="--swatch:${opt.hex}"><span></span></button>`
    )
    .join("");
}

function handleAccentClick(event) {
  const button = event.target.closest("button[data-accent-id]");
  if (!button) return;
  applyAccent(button.dataset.accentId);
  saveAccentPreference();
  renderAccentPicker();
  renderPrivacyReport();
  const label = accentOptions.find((o) => o.id === activeAccent)?.label || activeAccent;
  showToast(`${label} accent applied`);
}

// ─── Onboarding card ─────────────────────────────────────────────────────────
function markOnboardingStep(key) {
  if (!onboardingState || onboardingState.dismissed) return;
  if (onboardingState[key]) return;
  onboardingState[key] = true;
  saveOnboardingState();
  renderOnboarding();
}

function isOnboardingComplete() {
  return onboardingState.hasBill && onboardingState.hasStatement && onboardingState.sawInsights;
}

function renderOnboarding() {
  if (!onboardingCard) return;
  if (onboardingState.dismissed || isOnboardingComplete()) {
    onboardingCard.hidden = true;
    onboardingCard.innerHTML = "";
    return;
  }

  const steps = [
    { key: "hasBill",      title: "Add a bill",         body: "Rent, Netflix, gym — anything that repeats.",   action: { type: "view", view: "bills",  label: "Go to Bills" } },
    { key: "hasStatement", title: "Upload a statement", body: "CSV or PDF from your bank works best.",          action: { type: "view", view: "upload", label: "Upload one" } },
    { key: "sawInsights",  title: "See your picture",   body: "Charts and the safe-to-spend summary on Home.",  action: { type: "view", view: "home",   label: "Open Home" } },
  ];

  const completed = steps.filter((s) => onboardingState[s.key]).length;
  onboardingCard.hidden = false;
  onboardingCard.innerHTML = `
    <div class="onboarding-head">
      <div>
        <p class="eyebrow">Get started · ${completed}/${steps.length}</p>
        <h2>Three quick steps</h2>
      </div>
      <button class="ghost-button" type="button" data-onboarding-action="dismiss">Hide</button>
    </div>
    <ol class="onboarding-steps">
      ${steps
        .map(
          (step, index) => `
        <li class="onboarding-step ${onboardingState[step.key] ? "is-done" : ""}">
          <span class="onboarding-bullet">${onboardingState[step.key] ? "✓" : index + 1}</span>
          <div>
            <h3>${escapeHtml(step.title)}</h3>
            <p>${escapeHtml(step.body)}</p>
          </div>
          ${
            onboardingState[step.key]
              ? `<span class="muted">Done</span>`
              : `<button class="ghost-button" type="button" data-onboarding-action="go" data-view="${step.action.view}">${escapeHtml(step.action.label)}</button>`
          }
        </li>`
        )
        .join("")}
    </ol>
  `;
}

function handleOnboardingClick(event) {
  const button = event.target.closest("button[data-onboarding-action]");
  if (!button) return;
  const action = button.dataset.onboardingAction;
  if (action === "dismiss") {
    onboardingState.dismissed = true;
    saveOnboardingState();
    renderOnboarding();
    return;
  }
  if (action === "go" && button.dataset.view) {
    setActiveView(button.dataset.view);
  }
}

// ─── Toast notifications + Undo ──────────────────────────────────────────────
let toastTimerId = null;
function showToast(message, options = {}) {
  if (!toastHost) return;
  if (toastTimerId) {
    clearTimeout(toastTimerId);
    toastTimerId = null;
  }
  const hasUndo = typeof options.undo === "function";
  toastHost.innerHTML = `
    <div class="toast" role="status" aria-live="polite">
      <span>${escapeHtml(message)}</span>
      ${hasUndo ? `<button type="button" class="toast-undo" data-toast-action="undo">Undo</button>` : ""}
      <button type="button" class="toast-close" data-toast-action="close" aria-label="Dismiss">×</button>
    </div>
  `;
  const node = toastHost.querySelector(".toast");
  const close = () => {
    if (toastTimerId) clearTimeout(toastTimerId);
    toastTimerId = null;
    toastHost.innerHTML = "";
  };
  node.addEventListener("click", (event) => {
    const action = event.target.closest("[data-toast-action]")?.dataset.toastAction;
    if (action === "undo" && hasUndo) {
      close();
      options.undo();
    }
    if (action === "close") {
      close();
    }
  });
  toastTimerId = setTimeout(close, options.duration || 6000);
}

// ─── Global search ───────────────────────────────────────────────────────────
function handleGlobalSearchInput() {
  if (!globalSearchInput || !globalSearchResults) return;
  const query = globalSearchInput.value.trim().toLowerCase();
  if (!query) {
    globalSearchResults.hidden = true;
    globalSearchResults.innerHTML = "";
    return;
  }
  const results = runGlobalSearch(query).slice(0, 12);
  if (results.length === 0) {
    globalSearchResults.hidden = false;
    globalSearchResults.innerHTML = `<p class="muted search-empty">No matches for "${escapeHtml(query)}"</p>`;
    return;
  }
  globalSearchResults.hidden = false;
  globalSearchResults.innerHTML = results
    .map(
      (r) =>
        `<button type="button" class="search-result" data-search-view="${r.view}" data-search-id="${escapeHtml(r.id || "")}">
          <span class="search-kind">${r.kind}</span>
          <span class="search-title">${escapeHtml(r.title)}</span>
          ${r.detail ? `<span class="search-detail muted">${escapeHtml(r.detail)}</span>` : ""}
        </button>`
    )
    .join("");
}

function runGlobalSearch(query) {
  const results = [];
  bills.forEach((bill) => {
    const haystack = `${bill.name} ${bill.note || ""} ${bill.category}`.toLowerCase();
    if (haystack.includes(query)) {
      results.push({
        kind: "Bill",
        title: bill.name,
        detail: `${formatMoney(bill.amount, bill.currency || "GBP")} · ${bill.category}`,
        view: "bills",
        id: bill.id,
      });
    }
  });
  statementTransactions.slice(0, 500).forEach((tx) => {
    const haystack = `${tx.merchant} ${tx.description} ${tx.account || ""} ${tx.category || ""}`.toLowerCase();
    if (haystack.includes(query)) {
      results.push({
        kind: "Tx",
        title: titleCase(tx.merchant),
        detail: `${formatDate(tx.date)} · ${tx.category} · ${tx.account || ""}`,
        view: "review",
      });
    }
  });
  categories.forEach((cat) => {
    if (cat.toLowerCase().includes(query)) {
      results.push({ kind: "Category", title: cat, view: "tools" });
    }
  });
  (Array.isArray(categoryRules) ? categoryRules : []).forEach((rule) => {
    if (`${rule.match} ${rule.category}`.toLowerCase().includes(query)) {
      results.push({ kind: "Rule", title: `${rule.match} → ${rule.category}`, view: "tools" });
    }
  });
  return results;
}

function handleGlobalSearchKeyDown(event) {
  if (event.key === "Escape") {
    globalSearchInput.value = "";
    globalSearchInput.blur();
    if (globalSearchResults) {
      globalSearchResults.hidden = true;
      globalSearchResults.innerHTML = "";
    }
  }
}

function handleGlobalSearchResultClick(event) {
  const button = event.target.closest(".search-result");
  if (!button) return;
  const view = button.dataset.searchView || "home";
  setActiveView(view);
  if (globalSearchInput) globalSearchInput.value = "";
  if (globalSearchResults) {
    globalSearchResults.hidden = true;
    globalSearchResults.innerHTML = "";
  }
}

// ─── Bill templates ──────────────────────────────────────────────────────────
function renderBillTemplates() {
  if (!billTemplatesRow) return;
  billTemplatesRow.innerHTML = billTemplates
    .map(
      (tpl, idx) =>
        `<button type="button" class="template-chip" data-template-index="${idx}">+ ${escapeHtml(tpl.name)}${tpl.amount ? ` · ${formatMoney(tpl.amount, "GBP")}` : ""}</button>`
    )
    .join("");
}

function handleBillTemplateClick(event) {
  const button = event.target.closest("button[data-template-index]");
  if (!button) return;
  const tpl = billTemplates[Number(button.dataset.templateIndex)];
  if (!tpl) return;
  billIdInput.value = "";
  nameInput.value = tpl.name;
  amountInput.value = tpl.amount > 0 ? tpl.amount.toFixed(2) : "";
  currencyInput.value = "GBP";
  frequencyInput.value = tpl.frequency;
  categoryInput.value = categories.includes(tpl.category) ? tpl.category : "Other";
  noteInput.value = "";
  setDefaultDueDate();
  formTitle.textContent = `Add ${tpl.name}`;
  saveButton.textContent = "Save bill";
  setActiveView("bills");
  nameInput.focus();
}

// ─── Simulate this ───────────────────────────────────────────────────────────
function simulateFromBill(bill) {
  const monthly = monthlyEquivalent(bill);
  if (simNameInput) simNameInput.value = `Cancel ${bill.name}`;
  if (simSubSavingsInput) simSubSavingsInput.value = monthly.toFixed(2);
  setActiveView("whatif");
  if (simulatorForm) {
    const submit = simulatorForm.querySelector("button[type='submit']");
    if (submit) submit.focus();
  }
  showToast(`Simulator set up: cancel ${bill.name}`);
}

// ─── Keyboard shortcuts ──────────────────────────────────────────────────────
let pendingGotoTimer = null;
let pendingGoto = false;
const gotoMap = { h: "home", b: "bills", u: "upload", r: "review", c: "charts", w: "whatif", t: "tools" };

function handleGlobalKeyDown(event) {
  const tag = (event.target.tagName || "").toLowerCase();
  const isTyping = ["input", "textarea", "select"].includes(tag) || (event.target.isContentEditable === true);

  if (event.key === "Escape") {
    if (toastHost && toastHost.innerHTML) { toastHost.innerHTML = ""; return; }
    if (globalSearchResults && !globalSearchResults.hidden) {
      globalSearchResults.hidden = true;
      globalSearchResults.innerHTML = "";
      return;
    }
  }

  if (isTyping) return;

  if (event.key === "/") {
    if (globalSearchInput) {
      event.preventDefault();
      globalSearchInput.focus();
      globalSearchInput.select();
    }
    return;
  }
  if (event.key === "n") {
    event.preventDefault();
    setActiveView("bills");
    if (nameInput) nameInput.focus();
    return;
  }
  if (event.key === "g") {
    pendingGoto = true;
    clearTimeout(pendingGotoTimer);
    pendingGotoTimer = setTimeout(() => { pendingGoto = false; }, 900);
    return;
  }
  if (pendingGoto && gotoMap[event.key]) {
    event.preventDefault();
    pendingGoto = false;
    clearTimeout(pendingGotoTimer);
    setActiveView(gotoMap[event.key]);
  }
}
