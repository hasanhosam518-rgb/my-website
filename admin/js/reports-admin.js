import { db, collection, getDocs, query, orderBy } from '../../public/js/firebase-init.js';
import { getAdminEmail, getWhatsAppNumber } from '../../public/js/notifications.js';

const WAIT = () => new Promise(r => { const c = () => { if (getDocs) r(); else setTimeout(c, 50); }; c(); });

const COMPETITOR_DATA = [
  { name: 'Paradise Island', ourPrice: 45, marketMin: 20, marketMax: 45, unit: '€' },
  { name: 'Dolphin House', ourPrice: 30, marketMin: 25, marketMax: 55, unit: '€' },
  { name: 'Quad Bike Safari', ourPrice: 30, marketMin: 15, marketMax: 35, unit: '€' },
  { name: 'Orange Bay', ourPrice: 40, marketMin: 20, marketMax: 45, unit: '€' },
  { name: 'Mahmya Island', ourPrice: 55, marketMin: 45, marketMax: 99, unit: '€' }
];

const sectionsDiv = document.getElementById('reportSections');
const priceBody = document.getElementById('priceBody');

async function loadData() {
  try {
    const [tripsSnap, bookingsSnap] = await Promise.all([
      getDocs(query(collection(db, 'trips'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')))
    ]);

    const now = Date.now();
    const DAY = 86400000;

    const bookings = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const recentBookings = bookings.filter(b => {
      const t = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (now - t) < DAY;
    });

    const stats = [
      { label: 'Total Trips', value: tripsSnap.docs.length, color: '#4caf50' },
      { label: 'Total Bookings', value: bookings.length, color: '#ffd166' },
      { label: '24h Bookings', value: recentBookings.length, color: recentBookings.length > 0 ? '#4caf50' : '#888' },
      { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: '#ff9800' }
    ];

    sectionsDiv.innerHTML = `
      <div class="stats-grid" style="margin-top:0">${stats.map(s => `
        <div class="stat-card">
          <h3>${s.label}</h3>
          <p class="value" style="color:${s.color}">${s.value}</p>
        </div>
      `).join('')}</div>

      <h2 style="margin-top:2rem">Recent Bookings (24h)</h2>
      <div id="recentBookings">${recentBookings.length === 0 ?
        '<p style="color:rgba(255,255,255,0.5)">No bookings in the last 24 hours.</p>' :
        recentBookings.map(b => `
          <div class="message-item">
            <strong>${esc(b.name || 'N/A')} &mdash; ${esc(b.tripId || 'N/A')}</strong>
            <small>${esc(b.date || 'N/A')} &bull; ${b.people || 1} persons &bull; Status: <span class="status-badge ${b.status || 'pending'}">${esc(b.status || 'pending')}</span></small>
            <p>${esc(b.email || '')} &bull; ${esc(b.phone || '')}</p>
          </div>
        `).join('')
      }</div>

      <h2 style="margin-top:2rem">Recent Messages & Reviews</h2>
      <div id="recentMessages">${renderMessagesPlaceholder()}</div>
    `;

    renderPriceTable();

  } catch (err) {
    console.error('Error loading report:', err);
    if (sectionsDiv) sectionsDiv.innerHTML = '<p style="color:#f44;">Error loading report data</p>';
  }
}

function renderMessagesPlaceholder() {
  const store = getMessagesFromStore();
  if (store.length === 0) {
    return '<p style="color:rgba(255,255,255,0.5)">No messages or reviews yet. Check the Bookings panel for all records.</p>';
  }
  return store.slice(0, 10).map(m => `
    <div class="message-item">
      <strong>${esc(m.name || 'Unknown')}</strong>
      <small>${esc(m.type || 'message')} &bull; ${m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</small>
      <p>${esc(m.message || m.text || '(no content)')}</p>
    </div>
  `).join('');
}

function getMessagesFromStore() {
  try {
    const raw = localStorage.getItem('mockFirestore');
    if (!raw) return [];
    const store = JSON.parse(raw);
    const contacts = store['contactMessages'] || {};
    const reviews = store['reviews'] || {};
    const all = [];
    Object.values(contacts).forEach(c => all.push({ ...c, type: 'Contact Message' }));
    Object.values(reviews).forEach(r => all.push({ ...r, type: 'Review' }));
    all.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    return all;
  } catch { return []; }
}

function renderPriceTable() {
  if (!priceBody) return;
  priceBody.innerHTML = COMPETITOR_DATA.map(item => {
    const ourUSD = item.ourPrice;
    const marketMin = item.marketMin;
    const marketMax = item.marketMax;
    const mid = (marketMin + marketMax) / 2;
    const diffPct = ((ourUSD - mid) / mid * 100).toFixed(0);
    let advice, adviceColor;
    if (ourUSD < marketMin) {
      advice = 'Below market — consider raising price';
      adviceColor = '#4caf50';
    } else if (ourUSD > marketMax) {
      advice = 'Above market — consider lowering';
      adviceColor = '#f44';
    } else {
      advice = 'Competitive range';
      adviceColor = '#ffd166';
    }
    return `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:1rem;font-weight:600">${item.name}</td>
        <td style="padding:1rem">$${ourUSD}</td>
        <td style="padding:1rem">${item.unit}${marketMin} &ndash; ${item.unit}${marketMax}</td>
        <td style="padding:1rem;color:${adviceColor}">${advice} (${diffPct > 0 ? '+' : ''}${diffPct}% vs midpoint)</td>
      </tr>
    `;
  }).join('');
}

document.getElementById('refreshBtn')?.addEventListener('click', () => WAIT().then(loadData));
document.getElementById('sendReportBtn')?.addEventListener('click', () => {
  const email = getAdminEmail();
  const wa = getWhatsAppNumber();
  const lines = [
    'Daily Report - Red Sea Excursions Hub',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    '--- Pricing vs Market ---',
    ...COMPETITOR_DATA.map(i => `${i.name}: Our $${i.ourPrice} | Market ${i.unit}${i.marketMin}-${i.unit}${i.marketMax}`),
    '',
    '--- Recent Bookings ---',
    ...getRecentBookingSummary(),
    '',
    '--- View Full Dashboard ---',
    window.location.origin + '/admin/dashboard.html'
  ];
  const body = encodeURIComponent(lines.join('\n'));
  window.open(`mailto:${email}?subject=${encodeURIComponent('Daily Report - Red Sea Excursions Hub')}&body=${body}`, '_blank');
});

function getRecentBookingSummary() {
  try {
    const raw = localStorage.getItem('mockFirestore');
    if (!raw) return ['(no data)'];
    const store = JSON.parse(raw);
    const bookings = store['bookings'] || {};
    const now = Date.now();
    const DAY = 86400000;
    const recent = Object.values(bookings).filter(b => {
      const t = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (now - t) < DAY;
    });
    if (recent.length === 0) return ['No bookings in the last 24 hours.'];
    return recent.map(b => `${b.name} | ${b.tripId} | ${b.people} persons | ${b.date}`);
  } catch { return ['(error reading data)']; }
}

WAIT().then(loadData);

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
