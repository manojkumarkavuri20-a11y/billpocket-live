// BillPocket — bills list, dashboard, insights & timeline
// Classic (non-module) script. Loaded in dependency order from index.html.
// Shares the global scope with the other js/*.js files; do not add import/export.

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

function setDefaultDueDate() {
  nextDueDateInput.value = toDateInputValue(new Date());
}
