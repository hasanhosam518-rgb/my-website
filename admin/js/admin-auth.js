import { signInWithEmailAndPassword, onAuthStateChanged, signOut, getAdminDoc } from '../../public/js/firebase-init.js';

// Wait for auth functions to be ready
const waitForAuth = () => {
  return new Promise((resolve) => {
    const checkAuth = () => {
      if (onAuthStateChanged && signInWithEmailAndPassword && signOut) {
        resolve();
      } else {
        setTimeout(checkAuth, 50);
      }
    };
    checkAuth();
  });
};

// Initialize auth protection
waitForAuth().then(() => {
  // Protect admin pages
  onAuthStateChanged((user) => {
    const path = location.pathname.split('/').pop();
    const isLogin = path === 'login.html';
    if (user && isLogin) {
      location.href = 'dashboard.html';
      return;
    }
    if (!user && !isLogin) {
      location.href = 'login.html';
      return;
    }
    // If user is logged in and not on login page, verify admin whitelist
    if (user && !isLogin) {
      (async () => {
        const snap = await getAdminDoc(user.uid);
        if (!snap || (typeof snap.exists === 'function' && !snap.exists())) {
          // Not an admin — sign out and redirect to login
          await signOut();
          alert('Access denied. Your account is not listed as an admin.');
          location.href = 'login.html';
        }
      })();
    }
  });
});

// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    try {
      await signInWithEmailAndPassword(email, password);
      location.href = 'dashboard.html';
    } catch (err) {
      console.error('Login attempt failed', err);
      alert('Login failed: ' + (err.message || err));
    }
  });
}

// Logout button (any admin page)
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut();
    location.href = 'login.html';
  });
}

export default null;
