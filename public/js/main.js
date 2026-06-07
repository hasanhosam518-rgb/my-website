import { db, collection, getDocs, query, orderBy } from './firebase-init.js';
import i18n from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
  i18n.initI18n();
  loadFeatured();
  wireLanguageToggle();
  wireCurrencyToggle();
  wireSearch();
  loadStats();
});

async function loadFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  try {
    const snapshot = await getDocs(query(collection(db, 'trips'), orderBy('createdAt', 'desc')));
    if (!snapshot.empty) {
      grid.innerHTML = snapshot.docs.slice(0, 6).map(d => {
        const t = d.data();
        return `<article class="card">
          <div class="card-image" style="background:linear-gradient(135deg,#0077b6,#00b4d8);height:140px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:2rem">${esc(t.category || 'Trip')}</div>
          <div class="card-body">
            <h3>${esc(t.title)}</h3>
            <p>${esc(t.duration)}</p>
            <p class="price">${t.currency || 'USD'} ${t.price}</p>
            <a href="trip.html?id=${d.id}" class="btn">View</a>
          </div>
        </article>`;
      }).join('');
      return;
    }
  } catch (err) {
    console.warn('Could not load from Firestore, using fallback:', err);
  }
  grid.innerHTML = [
    { id: 'paradise', title: 'Paradise Island', price: '45', currency: 'USD', duration: '6 hours', category: 'Island' },
    { id: 'dolphin', title: 'Dolphin House Trip', price: '30', currency: 'USD', duration: '4 hours', category: 'Sea' },
    { id: 'quad', title: 'Quad Bike Safari', price: '60', currency: 'USD', duration: '3 hours', category: 'Safari' },
    { id: 'orange-bay', title: 'Orange Bay', price: '40', currency: 'USD', duration: '5 hours', category: 'Island' },
    { id: 'mahmya', title: 'Mahmya Island', price: '55', currency: 'USD', duration: '7 hours', category: 'Island' }
  ].map(t => `<article class="card">
    <div class="card-image" style="background:linear-gradient(135deg,#0077b6,#00b4d8);height:140px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:2rem">${t.category}</div>
    <div class="card-body">
      <h3>${t.title}</h3>
      <p>${t.duration}</p>
      <p class="price">${t.currency} ${t.price}</p>
      <a href="trip.html?id=${t.id}" class="btn">View</a>
    </div>
  </article>`).join('');
}

function wireLanguageToggle() {
  const btn = document.getElementById('langBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const current = localStorage.getItem('lang') || 'en';
    const next = current === 'en' ? 'ar' : 'en';
    i18n.setLang(next);
    btn.textContent = next === 'en' ? 'AR' : 'EN';
  });
  btn.textContent = (localStorage.getItem('lang') || 'en') === 'en' ? 'AR' : 'EN';
}

function wireCurrencyToggle() {
  const btn = document.getElementById('currencyBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const current = localStorage.getItem('currency') || 'USD';
    const next = current === 'USD' ? 'EGP' : 'USD';
    localStorage.setItem('currency', next);
    btn.textContent = next;
    document.querySelectorAll('.price').forEach(el => {
      const val = parseFloat(el.dataset.usd || el.textContent.replace(/[^0-9.]/g, ''));
      if (val) {
        el.dataset.usd = val;
        el.textContent = next === 'EGP' ? `EGP ${Math.round(val * 48)}` : `USD ${val}`;
      }
    });
  });
}

function wireSearch() {
  const input = document.getElementById('tripSearch');
  const btn = document.getElementById('searchBtn');
  if (!input || !btn) return;
  const doSearch = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) return;
    sessionStorage.setItem('searchQuery', q);
    location.href = 'trips.html';
  };
  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

async function loadStats() {
  try {
    const snap = await getDocs(collection(db, 'bookings'));
    const bookingsEl = document.getElementById('statBookings');
    if (bookingsEl) bookingsEl.textContent = snap.size;
  } catch (e) {}
  const guestsEl = document.getElementById('statGuests');
  if (guestsEl) guestsEl.textContent = Math.floor(Math.random() * 500) + 1000;
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
