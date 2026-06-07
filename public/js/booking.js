import { db, collection, addDoc, serverTimestamp, getDoc, doc } from './firebase-init.js';
import { startStripeCheckout, startPayPal } from './payments.js';
import { notifyAdmin } from './notifications.js';

const params = new URLSearchParams(location.search);
const tripId = params.get('trip');
const area = document.getElementById('bookingArea');

const render = () => {
  area.innerHTML = `
    <h1>Book Your Trip</h1>
    <form id="bookingForm" class="booking-form">
      <label>Trip ID</label>
      <input id="tripId" value="${esc(tripId || '')}" readonly>
      <label>Full Name</label>
      <input id="name" required>
      <label>Email</label>
      <input id="email" type="email" required>
      <label>Phone</label>
      <input id="phone" type="tel" required>
      <label>Date</label>
      <input id="date" type="date" required>
      <label>Number of People</label>
      <input id="people" type="number" value="1" min="1" required>
      <label>Coupon Code (optional)</label>
      <input id="coupon">
      <div class="actions">
        <button type="submit" class="btn">Confirm Booking</button>
      </div>
    </form>
    <div id="bookingStatus" class="status"></div>
  `;
  const form = document.getElementById('bookingForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      tripId: document.getElementById('tripId').value,
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      date: document.getElementById('date').value,
      people: Number(document.getElementById('people').value || 1),
      coupon: document.getElementById('coupon').value.trim() || null,
      status: 'pending',
      createdAt: serverTimestamp()
    };
    if (!data.name || !data.email || !data.phone || !data.date) {
      document.getElementById('bookingStatus').textContent = 'Please fill in all required fields.';
      return;
    }
    try {
      const ref = await addDoc(collection(db, 'bookings'), data);
      const statusDiv = document.getElementById('bookingStatus');
      statusDiv.textContent = 'Booking created! ID: ' + ref.id;

      let amount = 50;
      try {
        if (tripId) {
          const tripSnap = await getDoc(doc(db, 'trips', tripId));
          if (tripSnap.exists()) {
            const trip = tripSnap.data();
            amount = Number(trip.price) || 50;
          }
        }
      } catch (e) {}
      amount = amount * data.people;

      const method = confirm(`Booking ${ref.id}\nTotal: USD ${amount}\n\nClick OK for Stripe or Cancel for PayPal`);
      let paid = false;
      if (method) {
        paid = await startStripeCheckout(ref.id, amount);
      } else {
        paid = await startPayPal(ref.id, amount);
      }

      notifyAdmin('booking', { id: ref.id, name: data.name, email: data.email, phone: data.phone, tripId: data.tripId, date: data.date, people: data.people });

      if (paid) {
        statusDiv.textContent = 'Payment successful! Booking confirmed.';
        setTimeout(() => location.href = 'payment-success.html?id=' + ref.id, 1200);
      } else {
        statusDiv.textContent = 'Payment cancelled. Your booking is saved (pending payment).';
      }
    } catch (err) {
      document.getElementById('bookingStatus').textContent = 'Failed to create booking: ' + err.message;
    }
  });
};

render();

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
