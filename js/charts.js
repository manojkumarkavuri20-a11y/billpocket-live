// BillPocket — SVG charts
// Classic (non-module) script. Loaded in dependency order from index.html.
// Shares the global scope with the other js/*.js files; do not add import/export.

function renderVisualInsights() {
  const months = getMonthlyStatementHistory().slice(-8);
  renderIncomeSpendChart(months);
  renderCategoryDonutChart();
  renderCashflowChart(months);
  renderBudgetChart();
  renderYearOverYearChart();
}

// Side-by-side bar chart: this-year vs last-year spending per month for the
// trailing 6 months. Pure SVG. Renders into #yearOverYearChart if present.
function renderYearOverYearChart() {
  const host = document.querySelector("#yearOverYearChart");
  if (!host) return;
  const { thisYearByMonth, lastYearByMonth } = getYearOverYearTotals();
  const keys = Object.keys({ ...thisYearByMonth, ...lastYearByMonth }).sort();
  if (keys.length === 0) {
    host.innerHTML = renderChartEmpty("Upload statements covering both this year and last year to compare.");
    return;
  }
  const width = 480;
  const height = 200;
  const padding = 40;
  const maxValue = Math.max(
    ...keys.map((k) => Math.max(thisYearByMonth[k] || 0, lastYearByMonth[k] || 0)),
    1
  );
  const groupWidth = (width - padding * 2) / keys.length;
  const barWidth = Math.max(6, groupWidth * 0.35);

  const bars = keys
    .map((key, i) => {
      const x = padding + i * groupWidth;
      const lastY = lastYearByMonth[key] || 0;
      const thisY = thisYearByMonth[key] || 0;
      const lastH = (lastY / maxValue) * (height - padding * 2);
      const thisH = (thisY / maxValue) * (height - padding * 2);
      const labelMonth = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(new Date(2024, Number(key) - 1, 1));
      return `
        <rect class="chart-spend" x="${x + groupWidth * 0.15}" y="${height - padding - lastH}" width="${barWidth}" height="${lastH}" opacity="0.45" />
        <rect class="chart-income" x="${x + groupWidth * 0.5}" y="${height - padding - thisH}" width="${barWidth}" height="${thisH}" />
        <text x="${x + groupWidth * 0.5}" y="${height - padding + 14}" class="chart-axis-label" text-anchor="middle">${labelMonth}</text>
      `;
    })
    .join("");

  host.innerHTML = `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-label="Year over year spending">
      ${renderYAxis(width, height, padding, maxValue)}
      <line class="chart-axis" x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" />
      ${bars}
    </svg>
    ${renderLegend([
      { label: "This year", className: "chart-income" },
      { label: "Last year (same month)", className: "chart-spend" },
    ])}
  `;
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
