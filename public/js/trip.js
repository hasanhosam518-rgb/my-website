import { db, collection, getDoc, doc } from './firebase-init.js';

const params = new URLSearchParams(location.search);
const id = params.get('id');
const container = document.getElementById('tripDetail');

(async () => {
  if (!container) return;
  if (!id) {
    container.innerHTML = '<p>Trip not found.</p>';
    return;
  }
  try {
    const snap = await getDoc(doc(db, 'trips', id));
    if (!snap.exists()) {
      container.innerHTML = '<p>Trip not found.</p>';
      return;
    }
    const t = snap.data();
    container.innerHTML = `
      <div class="trip-hero" style="background:linear-gradient(135deg,#0077b6,#00b4d8);padding:2rem;border-radius:12px;color:#fff;margin-bottom:2rem">
        <h1>${esc(t.title)}</h1>
        <p><strong>${esc(t.duration)}</strong> — ${t.currency || 'USD'} ${t.price}</p>
        <p>Category: ${esc(t.category || 'General')}</p>
      </div>
      <div class="trip-content" style="max-width:800px">
        <p>${esc(t.description)}</p>
        <div id="tripGallery" class="grid" style="margin:2rem 0">
          ${t.image ? `<img src="${esc(t.image)}" alt="${esc(t.title)}" style="width:100%;border-radius:8px">` : '<p style="color:var(--muted)">Gallery images coming soon.</p>'}
        </div>
        <a href="booking.html?trip=${id}" class="btn" style="display:inline-block;padding:0.8rem 2rem">Book This Trip</a>
      </div>
      <div id="reviews" style="margin-top:3rem"></div>
    `;
    const { renderReviews } = await import('./reviews.js');
    renderReviews('reviews', id);
  } catch (err) {
    container.innerHTML = '<p>Error loading trip details.</p>';
    console.error(err);
  }
})();

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
