import { db, collection, getDocs, query, orderBy } from '../../public/js/firebase-init.js';

const statsDiv = document.getElementById('adminStats');

const waitForDb = () => {
  return new Promise((resolve) => {
    const checkDb = () => {
      if (getDocs) { resolve(); } else { setTimeout(checkDb, 50); }
    };
    checkDb();
  });
};

const loadStats = async () => {
  try {
    const [tripsSnap, bookingsSnap, postsSnap, mediaSnap] = await Promise.all([
      getDocs(query(collection(db, 'trips'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'media'), orderBy('createdAt', 'desc')))
    ]);

    const stats = [
      { label: 'Total Trips', value: tripsSnap.docs.length },
      { label: 'Total Bookings', value: bookingsSnap.docs.length },
      { label: 'Blog Posts', value: postsSnap.docs.length },
      { label: 'Media Items', value: mediaSnap.docs.length }
    ];

    if (statsDiv) {
      statsDiv.innerHTML = stats.map(stat => `
        <div class="stat-card">
          <h3>${stat.label}</h3>
          <p class="value">${stat.value}</p>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading stats:', err);
    if (statsDiv) statsDiv.innerHTML = '<p style="color: #f44;">Error loading statistics</p>';
  }
};

waitForDb().then(loadStats);
