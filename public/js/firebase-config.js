// Replace with your Firebase project config. For quick local testing you can
// enable `useLocalMock: true` which uses an in-browser mock auth (admin@local/password).
export const firebaseConfig = {
  useLocalMock: true,
  // When ready, replace below with real Firebase values and set useLocalMock: false
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Note: mock credentials for local testing (only when useLocalMock=true):
// email: admin@local  password: password
