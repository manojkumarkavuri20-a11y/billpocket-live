// BillPocket — own-account & transfer detection
// Classic (non-module) script. Loaded in dependency order from index.html.
// Shares the global scope with the other js/*.js files; do not add import/export.

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
