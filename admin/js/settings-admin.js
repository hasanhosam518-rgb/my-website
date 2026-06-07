import { db, doc, getDoc, setDoc } from '../../public/js/firebase-init.js';

const form = document.getElementById('settingsForm');

const waitForDb = () => {
  return new Promise((resolve) => {
    const checkDb = () => {
      if (getDoc) { resolve(); } else { setTimeout(checkDb, 50); }
    };
    checkDb();
  });
};

const load = async () => {
  try {
    const s = await getDoc(doc(db, 'settings', 'site'));
    if (!s.exists()) return;
    const data = s.data();
    document.getElementById('siteName').value = data.name || '';
    document.getElementById('contactEmail').value = data.email || '';
    document.getElementById('whatsapp').value = data.whatsapp || '';
  } catch (err) {
    console.error('Error loading settings:', err);
  }
};

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const name = document.getElementById('siteName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const whatsapp = document.getElementById('whatsapp').value.trim();

      await setDoc(doc(db, 'settings', 'site'), { name, email, whatsapp }, { merge: true });
      alert('Settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert(`Error: ${err.message}`);
    }
  });
}

waitForDb().then(load);
