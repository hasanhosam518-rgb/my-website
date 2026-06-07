import { db, collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from '../../public/js/firebase-init.js';

const list = document.getElementById('bookingsList');

const waitForDb = () => {
  return new Promise((resolve) => {
    const checkDb = () => {
      if (updateDoc) { resolve(); } else { setTimeout(checkDb, 50); }
    };
    checkDb();
  });
};

const render = async () => {
  try {
    const snapshot = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')));
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!list) return;

    if (items.length === 0) {
      list.innerHTML = '<p style="color: #d0e8ff;">No bookings yet.</p>';
      return;
    }

    list.innerHTML = items.map(b => `
      <div class="message-item">
        <strong>${esc(b.tripId || 'N/A')} &bull; ${esc(b.name || 'N/A')}</strong>
        <small>${esc(b.date || 'N/A')} &bull; Status: <span class="status-badge ${b.status || 'pending'}">${esc(b.status || 'pending')}</span></small>
        <p>${b.people || 1} persons &bull; ${esc(b.email || '')} &bull; ${esc(b.phone || '')}</p>
        <div class="action-row">
          ${b.status !== 'confirmed' ? `<button data-id="${b.id}" data-action="confirm" class="btn">Mark Confirmed</button>` : ''}
          <button data-id="${b.id}" data-action="cancel" class="btn btn-danger">Cancel Booking</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const action = e.target.dataset.action;
        const ref = doc(db, 'bookings', id);
        try {
          if (action === 'confirm') {
            await updateDoc(ref, { status: 'confirmed' });
          } else if (action === 'cancel') {
            if (!confirm('Cancel this booking?')) return;
            await deleteDoc(ref);
          }
          await render();
        } catch (err) {
          console.error(`Error during ${action}:`, err);
          alert(`Error: ${err.message}`);
        }
      });
    });
  } catch (err) {
    console.error('Error loading bookings:', err);
    if (list) list.innerHTML = '<p style="color: #f44;">Error loading bookings</p>';
  }
};

waitForDb().then(render);

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
