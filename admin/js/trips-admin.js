import { db, collection, addDoc, getDocs, deleteDoc, doc, getDoc, updateDoc, serverTimestamp } from '../../public/js/firebase-init.js';

const form = document.getElementById('tripForm');
const tripsList = document.getElementById('tripsList');

const waitForDb = () => {
  return new Promise((resolve) => {
    const checkDb = () => {
      if (addDoc) { resolve(); } else { setTimeout(checkDb, 50); }
    };
    checkDb();
  });
};

const renderTrips = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'trips'));
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!tripsList) return;

    tripsList.innerHTML = items.map(t => `
      <div class="admin-list-item">
        <strong>${esc(t.title || 'Untitled')}</strong>
        <small>${esc(t.category || 'N/A')} &bull; ${esc(t.duration || 'N/A')} &bull; $${esc(t.price || '0')}</small>
        <p>${esc(t.description || '')}</p>
        <div class="action-row">
          <button data-id="${t.id}" class="edit btn">Edit</button>
          <button data-id="${t.id}" class="delete btn btn-danger">Delete</button>
        </div>
      </div>
    `).join('');

    tripsList.querySelectorAll('.delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        try {
          const id = e.target.dataset.id;
          if (!confirm('Delete this trip?')) return;
          await deleteDoc(doc(db, 'trips', id));
          await renderTrips();
        } catch (err) {
          console.error('Error deleting trip:', err);
          alert(`Error: ${err.message}`);
        }
      });
    });

    tripsList.querySelectorAll('.edit').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        try {
          const id = e.target.dataset.id;
          const docRef = doc(db, 'trips', id);
          const docSnap = await getDoc(docRef);
          const d = docSnap.exists() ? docSnap.data() : null;
          if (!d) return alert('Document not found');

          const updates = {};
          const title = prompt('Title', d.title || '');
          if (title !== null) updates.title = title;
          else return;

          const category = prompt('Category (Island/Sea/Safari/Water Sports/Historical)', d.category || '');
          if (category !== null) updates.category = category;

          const price = prompt('Price (USD)', d.price || '');
          if (price !== null) updates.price = price;

          const duration = prompt('Duration', d.duration || '');
          if (duration !== null) updates.duration = duration;

          const description = prompt('Description', d.description || '');
          if (description !== null) updates.description = description;

          await updateDoc(docRef, updates);
          await renderTrips();
        } catch (err) {
          console.error('Error editing trip:', err);
          alert(`Error: ${err.message}`);
        }
      });
    });
  } catch (err) {
    console.error('Error loading trips:', err);
    if (tripsList) tripsList.innerHTML = '<p style="color: #f44;">Error loading trips</p>';
  }
};

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const title = document.getElementById('title').value.trim();
      const category = document.getElementById('category').value;
      const price = document.getElementById('price').value.trim();
      const duration = document.getElementById('duration').value.trim();
      const description = document.getElementById('description').value.trim();

      if (!title || !price || !duration) {
        alert('Please fill in title, price, and duration');
        return;
      }

      const data = { title, category, price, duration, description, createdAt: serverTimestamp() };
      await addDoc(collection(db, 'trips'), data);
      form.reset();
      await renderTrips();
    } catch (err) {
      console.error('Error adding trip:', err);
      alert(`Error: ${err.message}`);
    }
  });
}

waitForDb().then(renderTrips);

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
