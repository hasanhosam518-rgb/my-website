const PAYMENT_EMAIL = 'hasanhosam518@gmail.com';

export async function startStripeCheckout(bookingId, amount, currency = 'USD') {
  alert(`Stripe Checkout for booking ${bookingId}\nAmount: ${amount} ${currency}\nAccount: ${PAYMENT_EMAIL}\n\nThis is a demo placeholder. Integrate real Stripe Checkout here.`);
  return true;
}

export async function startPayPal(bookingId, amount, currency = 'USD') {
  alert(`PayPal payment for booking ${bookingId}\nAmount: ${amount} ${currency}\nAccount: ${PAYMENT_EMAIL}\n\nThis is a demo placeholder. Integrate real PayPal here.`);
  return true;
}
