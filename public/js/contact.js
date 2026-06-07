import { db, collection, addDoc, serverTimestamp } from './firebase-init.js';
import { notifyAdmin } from './notifications.js';

const form = document.getElementById('contactForm');
const status = document.getElementById('contactStatus');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      message: document.getElementById('message').value.trim(),
      createdAt: serverTimestamp()
    };
    if (!data.name || !data.email || !data.message) {
      if (status) status.textContent = 'Please fill in all fields.';
      return;
    }
    try {
      const ref = await addDoc(collection(db, 'messages'), data);
      await notifyAdmin('contact', { id: ref.id, name: data.name, email: data.email, message: data.message });
      if (status) status.textContent = 'Message sent! We\'ll get back to you soon.';
      form.reset();
    } catch (err) {
      if (status) status.textContent = 'Failed to send message. Please try again.';
      console.error(err);
    }
  });
}
