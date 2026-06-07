import { db, collection, getDocs, query, orderBy } from './firebase-init.js';

(async () => {
  const container = document.getElementById('posts');
  if (!container) return;
  try {
    const snapshot = await getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc')));
    if (snapshot.empty) {
      container.innerHTML = '<p>No posts yet. Check back soon!</p>';
      return;
    }
    container.innerHTML = snapshot.docs.map(d => {
      const p = d.data();
      return `<article class="card">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.content ? p.content.slice(0, 200) : '')}${p.content && p.content.length > 200 ? '...' : ''}</p>
        <small>${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}</small>
      </article>`;
    }).join('');
  } catch (err) {
    container.innerHTML = '<p>Error loading posts.</p>';
    console.error(err);
  }
})();

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
