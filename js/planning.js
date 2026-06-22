// BillPocket — budgets, goals, cancellations, health & cashflow
// Classic (non-module) script. Loaded in dependency order from index.html.
// Shares the global scope with the other js/*.js files; do not add import/export.

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

  // Extended horizons: 3 / 6 / 12 months. Each horizon shows the projected
  // position and a confidence band (±1 stdev of the historical monthly net).
  const variability = getHistoricalMonthlyVariability();
  const horizons = [
    { label: "3 months", months: 3 },
    { label: "6 months", months: 6 },
    { label: "12 months", months: 12 },
  ].map((h) => {
    const projection = getCashflowForecast(h.months * 30).projected;
    const band = variability.stdev * Math.sqrt(h.months);
    return { ...h, projection, low: projection - band, high: projection + band };
  });

  const horizonTiles = horizons
    .map(
      (h) => `
    <div class="forecast-horizon ${h.projection >= 0 ? "positive" : "negative"}">
      <span class="muted">${escapeHtml(h.label)}</span>
      <strong>${formatMoney(h.projection, "GBP")}</strong>
      ${variability.samples >= 2 ? `<small class="muted">${formatMoney(h.low, "GBP")} … ${formatMoney(h.high, "GBP")}</small>` : ""}
    </div>`
    )
    .join("");

  const events = forecast.events.slice(0, 5).map((event) => `
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
    <div class="forecast-horizons">${horizonTiles}</div>
    ${events.length ? events.join("") : `<p class="muted">No bill or income events found for the next 30 days.</p>`}
  `;
}

// Standard deviation of the last 6 months of net cashflow (income − spend).
// Used to draw confidence bands around longer-horizon forecasts.
function getHistoricalMonthlyVariability() {
  const today = startOfDay(new Date());
  const buckets = {};
  getAnalyzedTransactions().forEach((tx) => {
    if (isTransactionExcluded(tx)) return;
    const txDate = parseLocalDate(tx.date);
    const monthsBack = (today.getFullYear() - txDate.getFullYear()) * 12 + (today.getMonth() - txDate.getMonth());
    if (monthsBack < 0 || monthsBack > 5) return;
    const key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}`;
    if (!buckets[key]) buckets[key] = { income: 0, spend: 0 };
    buckets[key].income += Number(tx.income) || 0;
    buckets[key].spend += Number(tx.spending) || 0;
  });
  const nets = Object.values(buckets).map((b) => b.income - b.spend);
  if (nets.length < 2) return { samples: nets.length, mean: 0, stdev: 0 };
  const mean = nets.reduce((a, b) => a + b, 0) / nets.length;
  const variance = nets.reduce((s, n) => s + (n - mean) ** 2, 0) / nets.length;
  return { samples: nets.length, mean: roundMoney(mean), stdev: Math.sqrt(variance) };
}

// Year-over-year category totals: returns this-year and last-year aggregates
// for the trailing 12 months, suitable for a side-by-side bar chart.
function getYearOverYearTotals() {
  const today = startOfDay(new Date());
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const twelveMonthsAgoSameWindow = new Date(today.getFullYear() - 1, today.getMonth() - 5, 1);
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth() + 1, 0);

  const thisYearByMonth = {};
  const lastYearByMonth = {};
  getAnalyzedTransactions().forEach((tx) => {
    if (!tx.spending || isTransactionExcluded(tx)) return;
    const txDate = parseLocalDate(tx.date);
    const key = String(txDate.getMonth() + 1).padStart(2, "0");
    if (txDate >= sixMonthsAgo && txDate <= today) {
      thisYearByMonth[key] = (thisYearByMonth[key] || 0) + tx.spending;
    } else if (txDate >= twelveMonthsAgoSameWindow && txDate <= oneYearAgo) {
      lastYearByMonth[key] = (lastYearByMonth[key] || 0) + tx.spending;
    }
  });
  return { thisYearByMonth, lastYearByMonth };
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

  // Anomaly detection: this-month category spend vs the prior 90-day mean.
  const anomalies = detectSpendingAnomalies();
  anomalies.slice(0, 2).forEach((item) => {
    recommendations.push({
      title: `Watch ${item.category}`,
      body: `${formatMoney(item.thisMonth, "GBP")} spent this month vs ${formatMoney(item.baseline, "GBP")} typical — ${item.pctOver > 0 ? "up" : "down"} ${Math.abs(Math.round(item.pctOver))}%.`,
    });
  });

  // Bill price-change history: surface the most recent shift across all bills.
  const billChanges = detectBillPriceChanges();
  if (billChanges.length > 0) {
    const top = billChanges[0];
    recommendations.push({
      title: `${top.bill.name} ${top.delta > 0 ? "went up" : "dropped"}`,
      body: `Last two payments: ${formatMoney(top.previous, "GBP")} → ${formatMoney(top.current, "GBP")} (${top.delta > 0 ? "+" : ""}${Math.round(top.pct)}%).`,
    });
  }

  return recommendations.slice(0, 8);
}

// Compare each category's current-month spend to the mean of the prior 90
// days; flag anything > 1.5 standard deviations above (or below) baseline.
function detectSpendingAnomalies() {
  const today = startOfDay(new Date());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const periodStart = new Date(today.getTime() - 90 * 86400000);

  const baselineByCategory = {};
  const thisMonthByCategory = {};
  getAnalyzedTransactions().forEach((tx) => {
    if (!tx.spending || isTransactionExcluded(tx)) return;
    const txDate = parseLocalDate(tx.date);
    if (txDate >= periodStart && txDate < monthStart) {
      baselineByCategory[tx.category] = (baselineByCategory[tx.category] || []);
      baselineByCategory[tx.category].push(tx.spending);
    }
    if (txDate >= monthStart && txDate <= today) {
      thisMonthByCategory[tx.category] = (thisMonthByCategory[tx.category] || 0) + tx.spending;
    }
  });

  const anomalies = [];
  for (const [category, thisMonth] of Object.entries(thisMonthByCategory)) {
    const samples = baselineByCategory[category];
    if (!samples || samples.length < 3) continue;
    // Project the prior 90-day spend to a monthly baseline.
    const baseline = (samples.reduce((a, b) => a + b, 0) / 3);
    if (baseline < 10) continue;
    const pctOver = ((thisMonth - baseline) / baseline) * 100;
    if (Math.abs(pctOver) >= 30) {
      anomalies.push({ category, thisMonth: roundMoney(thisMonth), baseline: roundMoney(baseline), pctOver });
    }
  }
  return anomalies.sort((a, b) => Math.abs(b.pctOver) - Math.abs(a.pctOver));
}

// Scan paymentHistory for bills whose last two recorded payments differ by
// 5% or more. Returns the largest change first.
function detectBillPriceChanges() {
  const out = [];
  bills.forEach((bill) => {
    const history = Array.isArray(paymentHistory[bill.id]) ? paymentHistory[bill.id] : [];
    if (history.length < 2) return;
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    const delta = last.amount - prev.amount;
    const pct = (delta / Math.max(prev.amount, 0.01)) * 100;
    if (Math.abs(pct) >= 5) {
      out.push({ bill, previous: prev.amount, current: last.amount, delta, pct });
    }
  });
  return out.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
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
