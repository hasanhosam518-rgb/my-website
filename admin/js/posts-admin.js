import { db, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from '../../public/js/firebase-init.js';

const form = document.getElementById('postForm');
const list = document.getElementById('postsList');

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
    const snapshot = await getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc')));
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!list) return;

    if (items.length === 0) {
      list.innerHTML = '<p style="color: #d0e8ff;">No posts yet.</p>';
      return;
    }

    list.innerHTML = items.map(p => `
      <div class="admin-list-item">
        <strong>${esc(p.title || 'Untitled')}</strong>
        <small>${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}</small>
        <p>${esc((p.content || '').slice(0, 200))}${p.content && p.content.length > 200 ? '...' : ''}</p>
        <div class="action-row">
          <button data-id="${p.id}" class="btn btn-danger">Delete</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        try {
          if (!confirm('Delete this post?')) return;
          await deleteDoc(doc(db, 'posts', e.target.dataset.id));
          await render();
        } catch (err) {
          console.error('Error deleting post:', err);
          alert(`Error: ${err.message}`);
        }
      });
    });
  } catch (err) {
    console.error('Error loading posts:', err);
    if (list) list.innerHTML = '<p style="color: #f44;">Error loading posts</p>';
  }
};

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const title = document.getElementById('postTitle').value.trim();
      const content = document.getElementById('postContent').value.trim();

      if (!title || !content) {
        alert('Please fill in both title and content');
        return;
      }

      await addDoc(collection(db, 'posts'), { title, content, createdAt: serverTimestamp() });
      form.reset();
      await render();
    } catch (err) {
      console.error('Error adding post:', err);
      alert(`Error: ${err.message}`);
    }
  });
}

waitForDb().then(render);

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
