const ADMIN_EMAIL = 'hasanhosam518@gmail.com';
const WHATSAPP_NUMBER = '201092236166';

export async function notifyAdmin(type, data) {
  const subject = encodeURIComponent(`New ${type} - Red Sea Excursions Hub`);
  let body = '';

  if (type === 'booking') {
    body = encodeURIComponent(
      `New Booking!\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nTrip: ${data.tripId}\nDate: ${data.date}\nPeople: ${data.people}\nBooking ID: ${data.id}`
    );
  } else if (type === 'contact') {
    body = encodeURIComponent(
      `New Contact Message!\n\nFrom: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}`
    );
  } else if (type === 'review') {
    body = encodeURIComponent(
      `New Review!\n\nFrom: ${data.name}\nTrip: ${data.tripId || 'General'}\nReview: ${data.message}`
    );
  }

  const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${body}`;

  tryNotifyEmailJS(type, data);

  return { mailtoLink, waLink };
}

async function tryNotifyEmailJS(type, data) {
  if (typeof window.emailjs !== 'undefined') {
    try {
      const templateParams = {
        type: type,
        to_email: ADMIN_EMAIL,
        ...data
      };
      await window.emailjs.send('default_service', 'template_default', templateParams);
      console.log(`EmailJS notification sent for ${type}`);
    } catch (e) {
      console.warn('EmailJS send failed:', e);
    }
  }
}

export function getAdminEmail() {
  return ADMIN_EMAIL;
}

export function getWhatsAppNumber() {
  return WHATSAPP_NUMBER;
}
