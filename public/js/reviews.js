import { db, collection, addDoc, getDocs, query, orderBy, where, serverTimestamp } from './firebase-init.js';
import { notifyAdmin } from './notifications.js';

const renderReviews = async (containerId = 'reviews', tripId = null) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  let ref = collection(db, 'reviews');
  let constraints = [orderBy('createdAt', 'desc')];
  if (tripId) constraints.unshift(where('tripId', '==', tripId));

  let items = [];
  try {
    const snapshot = await getDocs(query(ref, ...constraints));
    items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Could not load reviews:', err);
  }

  container.innerHTML = `
    <h3>Reviews</h3>
    <div id="reviewList" class="review-list">
      ${items.length ? items.map(i => `
        <div class="review-item">
          <strong>${esc(i.name)}</strong>
          <p>${esc(i.message)}</p>
          <small>${i.createdAt ? new Date(i.createdAt).toLocaleDateString() : ''}</small>
        </div>`).join('') : '<p>No reviews yet. Be the first!</p>'}
    </div>
    <form id="reviewForm" class="review-form">
      <input id="rname" placeholder="Your name" required>
      <textarea id="rmessage" placeholder="Share your experience..." required></textarea>
      <button type="submit" class="btn">Send Review</button>
    </form>
  `;

  document.getElementById('reviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('rname').value.trim();
    const message = document.getElementById('rmessage').value.trim();
    if (!name || !message) return;
    try {
      const data = { name, message, createdAt: serverTimestamp() };
      if (tripId) data.tripId = tripId;
      const ref = await addDoc(collection(db, 'reviews'), data);
      await notifyAdmin('review', { id: ref.id, name, message, tripId: tripId || 'General' });
      renderReviews(containerId, tripId);
    } catch (err) {
      console.error('Failed to add review:', err);
    }
  });
};

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

export { renderReviews };
