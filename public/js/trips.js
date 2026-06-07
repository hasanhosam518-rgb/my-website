import { db, collection, getDocs, query, orderBy } from './firebase-init.js';

const grid = document.getElementById('tripsGrid');

(async () => {
  if (!grid) return;
  try {
    let snapshot = await getDocs(query(collection(db, 'trips'), orderBy('createdAt', 'desc')));
    let items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const searchQuery = sessionStorage.getItem('searchQuery');
    if (searchQuery) {
      sessionStorage.removeItem('searchQuery');
      const q = searchQuery.toLowerCase();
      items = items.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
      if (items.length === 0) {
        grid.innerHTML = `<p>No trips matching "${esc(searchQuery)}".</p>`;
        return;
      }
    }

    if (items.length === 0) {
      grid.innerHTML = '<p>No trips available at the moment.</p>';
      return;
    }

    grid.innerHTML = items.map(t => `<article class="card">
      <div class="card-image" style="background:linear-gradient(135deg,#0077b6,#00b4d8);height:140px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:2rem">${esc(t.category || 'Trip')}</div>
      <div class="card-body">
        <h3>${esc(t.title)}</h3>
        <p>${esc(t.duration || '')}</p>
        <p class="price">${t.currency || 'USD'} ${t.price}</p>
        <a href="trip.html?id=${t.id}" class="btn">View Details</a>
      </div>
    </article>`).join('');
  } catch (err) {
    grid.innerHTML = '<p>Error loading trips.</p>';
    console.error(err);
  }
})();

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
