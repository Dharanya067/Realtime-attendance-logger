(() => {
  const dom = {
    clock: document.getElementById('liveClock'),
    form: document.getElementById('entryForm'),
    name: document.getElementById('personName'),
    id: document.getElementById('personId'),
    action: document.getElementById('actionType'),
    quickIn: document.getElementById('quickCheckin'),
    quickOut: document.getElementById('quickCheckout'),
    exportCsv: document.getElementById('exportCsv'),
    clearAll: document.getElementById('clearAll'),
    search: document.getElementById('searchInput'),
    filter: document.getElementById('statusFilter'),
    from: document.getElementById('dateFrom'),
    to: document.getElementById('dateTo'),
    resetFilters: document.getElementById('resetFilters'),
    tbody: document.getElementById('recordsTbody'),
    summary: document.getElementById('summary'),
    toast: document.getElementById('toast')
  };

  const STORAGE_KEY = 'attendance.records.v1';
  /** @type {Array<{id:string,name:string,action:'checkin'|'checkout',ts:number}>} */
  let records = loadRecords();

  function loadRecords() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(Boolean);
    } catch {
      return [];
    }
  }
  function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function setClock() {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    const ss = now.getSeconds().toString().padStart(2, '0');
    dom.clock.textContent = `${hh}:${mm}:${ss}`;
  }
  setClock();
  setInterval(setClock, 1000);

  function normalize(str) {
    return (str || '').trim();
  }
  function toast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add('toast--show');
    setTimeout(() => dom.toast.classList.remove('toast--show'), 1800);
  }

  function toLocalISODate(ts) {
    const d = new Date(ts);
    const yyyy = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  function formatTime(ts) {
    const d = new Date(ts);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');
    return `${toLocalISODate(ts)} ${h}:${m}:${s}`;
  }

  function getTodayBounds() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    const end = start + 24 * 60 * 60 * 1000 - 1;
    return [start, end];
  }

  function getPresentIds() {
    const lastActionById = new Map();
    for (const r of records) {
      lastActionById.set(r.id, r.action);
    }
    return new Set([...lastActionById.entries()].filter(([, a]) => a === 'checkin').map(([id]) => id));
  }

  function computeSessionDurationForRow(rowIndex, filtered) {
    const row = filtered[rowIndex];
    if (!row) return '';
    if (row.action !== 'checkin') return '';
    // find next checkout for same id after this ts
    const nextOut = filtered.find(r => r.id === row.id && r.action === 'checkout' && r.ts > row.ts);
    const endTs = nextOut ? nextOut.ts : Date.now();
    const ms = endTs - row.ts;
    if (ms <= 0) return '';
    const totalMin = Math.floor(ms / 60000);
    const hh = Math.floor(totalMin / 60).toString().padStart(2, '0');
    const mm = (totalMin % 60).toString().padStart(2, '0');
    return `${hh}h ${mm}m`;
  }

  function applyFilters() {
    const q = normalize(dom.search.value).toLowerCase();
    const status = dom.filter.value;
    const from = dom.from.value ? new Date(dom.from.value + 'T00:00:00').getTime() : null;
    const to = dom.to.value ? new Date(dom.to.value + 'T23:59:59.999').getTime() : null;

    let out = records.slice();
    if (q) {
      out = out.filter(r => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
    }
    if (from != null) out = out.filter(r => r.ts >= from);
    if (to != null) out = out.filter(r => r.ts <= to);

    if (status === 'checkin') out = out.filter(r => r.action === 'checkin');
    else if (status === 'checkout') out = out.filter(r => r.action === 'checkout');
    else if (status === 'present') {
      const present = getPresentIds();
      out = out.filter(r => present.has(r.id));
    }
    return out.sort((a, b) => a.ts - b.ts);
  }

  function render() {
    const filtered = applyFilters();
    const [startToday, endToday] = getTodayBounds();
    const present = getPresentIds();
    const todayCount = records.filter(r => r.ts >= startToday && r.ts <= endToday).length;
    dom.summary.textContent = `${present.size} present • ${todayCount} total today`;

    if (filtered.length === 0) {
      dom.tbody.innerHTML = `<tr><td colspan="6" class="empty">No records match</td></tr>`;
      return;
    }
    let html = '';
    filtered.forEach((r, i) => {
      const badgeClass = r.action === 'checkin' ? 'badge--in' : 'badge--out';
      const badgeText = r.action === 'checkin' ? 'Check-In' : 'Check-Out';
      const session = computeSessionDurationForRow(i, filtered);
      html += `
        <tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(r.name)}</td>
          <td><code>${escapeHtml(r.id)}</code></td>
          <td><span class="badge ${badgeClass}">${badgeText}</span></td>
          <td class="time">${formatTime(r.ts)}</td>
          <td>${session || ''}</td>
        </tr>
      `;
    });
    dom.tbody.innerHTML = html;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function addRecord({ id, name, action }) {
    const ts = Date.now();
    const clean = {
      id: normalize(id),
      name: normalize(name),
      action: action === 'checkout' ? 'checkout' : 'checkin',
      ts
    };
    if (!clean.id || !clean.name) {
      toast('Name and ID are required.');
      return false;
    }
    // Prevent consecutive duplicate actions
    const last = [...records].reverse().find(r => r.id === clean.id);
    if (last && last.action === clean.action) {
      toast(`Already ${clean.action === 'checkin' ? 'checked in' : 'checked out'}.`);
      return false;
    }
    records.push(clean);
    saveRecords();
    render();
    toast(`${clean.name} • ${clean.action === 'checkin' ? 'Checked In' : 'Checked Out'}`);
    return true;
  }

  dom.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = addRecord({
      id: dom.id.value,
      name: dom.name.value,
      action: dom.action.value
    });
    if (ok) {
      dom.name.value = '';
      dom.id.value = '';
      dom.action.value = 'checkin';
      dom.name.focus();
    }
  });

  dom.quickIn.addEventListener('click', () => {
    addRecord({ id: dom.id.value, name: dom.name.value, action: 'checkin' });
  });
  dom.quickOut.addEventListener('click', () => {
    addRecord({ id: dom.id.value, name: dom.name.value, action: 'checkout' });
  });

  ['input', 'change'].forEach(evt => {
    dom.search.addEventListener(evt, render);
    dom.filter.addEventListener(evt, render);
    dom.from.addEventListener(evt, render);
    dom.to.addEventListener(evt, render);
  });
  dom.resetFilters.addEventListener('click', () => {
    dom.search.value = '';
    dom.filter.value = 'all';
    dom.from.value = '';
    dom.to.value = '';
    render();
  });

  dom.exportCsv.addEventListener('click', () => {
    const filtered = applyFilters();
    if (filtered.length === 0) {
      toast('Nothing to export.');
      return;
    }
    const rows = [
      ['#', 'Name', 'ID', 'Action', 'Timestamp', 'ISO Time']
    ];
    filtered.forEach((r, i) => {
      rows.push([
        (i + 1).toString(),
        r.name,
        r.id,
        r.action,
        r.ts.toString(),
        new Date(r.ts).toISOString()
      ]);
    });
    const csv = rows.map(cols =>
      cols.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    ).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const d = new Date();
    a.download = `attendance_${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  dom.clearAll.addEventListener('click', () => {
    if (!confirm('Clear all attendance records? This cannot be undone.')) return;
    records = [];
    saveRecords();
    render();
    toast('All records cleared.');
  });

  // Seed date inputs to today for convenience
  const [startToday] = getTodayBounds();
  dom.from.value = toLocalISODate(startToday);
  dom.to.value = toLocalISODate(Date.now());

  render();
})();



