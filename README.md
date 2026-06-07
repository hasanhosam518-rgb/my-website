# Red Sea Excursions Hub

Scaffold for a tourism booking website for Hurghada, Red Sea, Egypt.

Structure:
- `public/` - public website files
- `admin/` - admin dashboard files

## Quick Start (Mock Mode)

The project includes a built-in mock mode that works without a real Firebase project (set `useLocalMock: true` in `public/js/firebase-config.js`).

1. **Serve the project root** (not just `public/`):
   ```bash
   # Python
   python -m http.server 8000
   # Node.js
   npx http-server -p 8000
   ```

2. **Open** `http://localhost:8000/public/index.html` to browse the site

3. **Admin login** at `http://localhost:8000/admin/login.html`
   - Email: `admin@local`
   - Password: any non-empty value

Mock mode persists data in localStorage, so you can add trips, posts, and manage bookings locally.

## Going Live (Real Firebase)

1. Replace Firebase config in `public/js/firebase-config.js` with your project values.
2. Set `useLocalMock: false` in the config.
3. In Firebase Console enable Authentication (Email/Password) and Firestore + Storage.
4. Create an admin entry for each admin user in Firestore under collection `admins` with document id = the admin user's UID (this allows admin-only access).
5. Create Firestore collections: `trips`, `bookings`, `media`, `posts`, `settings`, `messages`.
6. Add payment integration (Stripe/PayPal). For serverless payments use Cloud Functions or a small backend to sign requests.
7. Implement multilingual translations and SEO meta tags (meta tags per page are scaffolded).

### How to create an admin user

- Go to Firebase Console → Authentication → Users → Add user. Create a user with email and password.
- After creating the user, note the user's `UID` (click user to view details).
- In Firestore, create document `admins/{UID}` (no fields required, or add `role: 'admin'`).
- Now the admin can login at `admin/login.html` and manage trips, bookings, media and posts.

### Firebase config example (`public/js/firebase-config.js`)

```js
export const firebaseConfig = {
  useLocalMock: false,
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "...",
  appId: "..."
}
```
