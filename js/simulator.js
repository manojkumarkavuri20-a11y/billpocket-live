// BillPocket — Life Decisions money simulator
// Classic (non-module) script. Loaded in dependency order from index.html.
// Shares the global scope with the other js/*.js files; do not add import/export.

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
