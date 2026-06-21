// BillPocket — statement scan, subscription detection, reconciliation & upload UI
// Classic (non-module) script. Loaded in dependency order from index.html.
// Shares the global scope with the other js/*.js files; do not add import/export.

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

function getAnalyzedTransactions() {
  return statementTransactions.filter((transaction) => !isTransactionExcluded(transaction) && transaction.date && (transaction.spending > 0 || transaction.income > 0));
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
