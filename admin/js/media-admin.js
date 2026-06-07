import { db, storage, collection, addDoc, getDocs, deleteDoc, doc, ref, uploadBytes, getDownloadURL, deleteObject, serverTimestamp } from '../../public/js/firebase-init.js';

const form = document.getElementById('uploadForm');
const mediaList = document.getElementById('mediaList');

const waitForDb = () => {
  return new Promise((resolve) => {
    const checkDb = () => {
      if (addDoc) { resolve(); } else { setTimeout(checkDb, 50); }
    };
    checkDb();
  });
};

const render = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'media'));
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!mediaList) return;

    if (items.length === 0) {
      mediaList.innerHTML = '<p style="color: #d0e8ff;">No media uploaded yet.</p>';
      return;
    }

    mediaList.innerHTML = items.map(m => `
      <div class="gallery-item-admin">
        <strong>${esc(m.title || 'Untitled')}</strong>
        ${m.url ? `<img src="${esc(m.url)}" alt="${esc(m.title || 'Media')}" />` : '<p style="color:#888">No preview</p>'}
        <div class="action-row">
          <button data-id="${m.id}" class="btn btn-danger">Delete</button>
        </div>
      </div>
    `).join('');

    mediaList.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        try {
          if (!confirm('Delete this media?')) return;
          const id = e.target.dataset.id;
          const m = items.find(x => x.id === id);
          if (m && m.storagePath) {
            await deleteObject(ref(storage, m.storagePath)).catch(() => {});
          }
          await deleteDoc(doc(db, 'media', id));
          await render();
        } catch (err) {
          console.error('Error deleting media:', err);
          alert(`Error: ${err.message}`);
        }
      });
    });
  } catch (err) {
    console.error('Error loading media:', err);
    if (mediaList) mediaList.innerHTML = '<p style="color: #f44;">Error loading media</p>';
  }
};

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const fileInput = document.getElementById('fileInput');
      const title = document.getElementById('title').value.trim();

      if (!fileInput.files.length) { alert('Please select a file'); return; }
      if (!title) { alert('Please enter a title'); return; }

      const file = fileInput.files[0];
      const storagePath = `media/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, 'media'), {
        title, url, storagePath, createdAt: serverTimestamp()
      });

      form.reset();
      await render();
    } catch (err) {
      console.error('Error uploading media:', err);
      if (err.message && err.message.includes('not available in mock mode')) {
        alert('Media upload requires a real Firebase project. Configure Firebase and set useLocalMock: false.');
      } else {
        alert(`Error: ${err.message}`);
      }
    }
  });
}

waitForDb().then(render);

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
