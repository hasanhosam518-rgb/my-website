import { firebaseConfig } from './firebase-config.js';

export let app = null;
export let auth = null;
export let db = null;
export let storage = null;

export let signInWithEmailAndPassword = null;
export let onAuthStateChanged = null;
export let signOut = null;
export let getAdminDoc = null;

export let collection = null;
export let doc = null;
export let addDoc = null;
export let getDocs = null;
export let getDoc = null;
export let deleteDoc = null;
export let updateDoc = null;
export let query = null;
export let orderBy = null;
export let where = null;
export let serverTimestamp = null;
export let onSnapshot = null;
export let setDoc = null;
export let ref = null;
export let uploadBytes = null;
export let getDownloadURL = null;
export let deleteObject = null;

if (firebaseConfig && firebaseConfig.useLocalMock) {
  let currentUser = null;
  const listeners = new Set();

  function notify() { listeners.forEach(cb => { try { cb(currentUser); } catch(e){} }); }

  signInWithEmailAndPassword = async (email, password) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPassword = String(password).trim();
    const validEmails = ['admin@local', 'admin@local.com', 'admin@localhost', 'admin@local.dev'];
    if (validEmails.includes(normalizedEmail) && normalizedPassword.length > 0) {
      currentUser = { uid: 'dev-admin', email: normalizedEmail };
      notify();
      return { user: currentUser };
    }
    const err = new Error('Invalid local mock credentials. Use admin@local with any non-empty password.');
    err.code = 'auth/wrong-password';
    throw err;
  };

  onAuthStateChanged = (cb) => {
    listeners.add(cb);
    setTimeout(()=> cb(currentUser), 0);
    return () => listeners.delete(cb);
  };

  signOut = async () => { currentUser = null; notify(); };

  getAdminDoc = async (uid) => ({ exists: () => uid === 'dev-admin' });

  function getMockData() {
    try { return JSON.parse(localStorage.getItem('mockFirestore') || '{}'); } catch { return {}; }
  }
  function saveMockData(data) {
    localStorage.setItem('mockFirestore', JSON.stringify(data));
  }

  collection = (dbRef, path) => ({ path, mock: true });
  doc = (dbRef, path, ...segments) => ({ path: [path, ...segments].join('/'), mock: true });

  addDoc = async (colRef, data) => {
    const store = getMockData();
    const id = 'mock_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    if (!store[colRef.path]) store[colRef.path] = {};
    store[colRef.path][id] = { ...data, id };
    saveMockData(store);
    return { id };
  };

  getDocs = async (src) => {
    const store = getMockData();
    const path = src.collection ? src.collection.path : src.path;
    const coll = store[path] || {};
    const docs = Object.entries(coll).map(([id, data]) => ({
      id, data: () => ({ ...data }), exists: () => true
    }));
    return { docs, forEach: (cb) => docs.forEach(cb), size: docs.length, empty: docs.length === 0 };
  };

  function docPath(p) {
    if (!p) return { col: null, id: null };
    const idx = p.indexOf('/');
    if (idx === -1) return { col: null, id: null };
    return { col: p.slice(0, idx), id: p.slice(idx + 1) };
  }

  getDoc = async (docRef) => {
    const store = getMockData();
    const { col, id } = docPath(docRef.path);
    const coll = store[col];
    const data = coll ? coll[id] : undefined;
    return {
      id: id || docRef.path.split('/').pop(),
      data: () => data ? { ...data } : null,
      exists: () => !!data
    };
  };

  deleteDoc = async (docRef) => {
    const store = getMockData();
    const { col, id } = docPath(docRef.path);
    if (store[col] && store[col][id]) {
      delete store[col][id];
      saveMockData(store);
    }
  };

  updateDoc = async (docRef, data) => {
    const store = getMockData();
    const { col, id } = docPath(docRef.path);
    if (store[col] && store[col][id]) {
      Object.assign(store[col][id], data);
      saveMockData(store);
    }
  };

  setDoc = async (docRef, data, opts) => {
    const store = getMockData();
    const { col, id } = docPath(docRef.path);
    if (!store[col]) store[col] = {};
    if (opts && opts.merge) {
      store[col][id] = { ...(store[col][id] || {}), ...data, id };
    } else {
      store[col][id] = { ...data, id };
    }
    saveMockData(store);
  };

  query = (colRef, ...constraints) => ({ ...colRef, constraints, isQuery: true });
  orderBy = (field, dir) => ({ type: 'orderBy', field, dir: dir || 'asc' });
  where = (field, op, val) => ({ type: 'where', field, op, val });
  serverTimestamp = () => new Date().toISOString();
  onSnapshot = (src, cb) => { getDocs(src).then(cb); return () => {}; };

  ref = (storageRef, path) => ({ path, mock: true });
  uploadBytes = async () => { throw new Error('File upload not available in mock mode. Configure Firebase to upload files.'); };
  getDownloadURL = async () => { throw new Error('File download not available in mock mode.'); };
  deleteObject = async () => {};

  app = null;
  auth = { mock: true };
  db = { mock: true };
  storage = { mock: true };

  seedSampleData();
} else {
  (async () => {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js');
    const appInst = initializeApp(firebaseConfig);
    const authMod = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js');
    const firestoreMod = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
    const storageMod = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js');

    app = appInst;
    auth = authMod.getAuth(appInst);
    db = firestoreMod.getFirestore(appInst);
    storage = storageMod.getStorage(appInst);

    signInWithEmailAndPassword = authMod.signInWithEmailAndPassword.bind(null, auth);
    onAuthStateChanged = authMod.onAuthStateChanged.bind(null, auth);
    signOut = authMod.signOut.bind(null, auth);
    getAdminDoc = async (uid) => {
      const dr = firestoreMod.doc(db, 'admins', uid);
      return await firestoreMod.getDoc(dr);
    };

    collection = (dbRef, path) => firestoreMod.collection(db, path);
    doc = (dbRef, path, ...segments) => firestoreMod.doc(db, path, ...segments);
    addDoc = (colRef, data) => firestoreMod.addDoc(colRef, data);
    getDocs = (src) => firestoreMod.getDocs(src);
    getDoc = (docRef) => firestoreMod.getDoc(docRef);
    deleteDoc = (docRef) => firestoreMod.deleteDoc(docRef);
    updateDoc = (docRef, data) => firestoreMod.updateDoc(docRef, data);
    setDoc = (docRef, data, opts) => firestoreMod.setDoc(docRef, data, opts);
    query = (colRef, ...constraints) => firestoreMod.query(colRef, ...constraints);
    orderBy = (field, dir) => firestoreMod.orderBy(field, dir);
    where = (field, op, val) => firestoreMod.where(field, op, val);
    serverTimestamp = firestoreMod.serverTimestamp;
    onSnapshot = (src, cb) => firestoreMod.onSnapshot(src, cb);
    ref = (storageRef, path) => storageMod.ref(storage, path);
    uploadBytes = (ref, file) => storageMod.uploadBytes(ref, file);
    getDownloadURL = (ref) => storageMod.getDownloadURL(ref);
    deleteObject = (ref) => storageMod.deleteObject(ref);
  })();
}

function seedSampleData() {
  const store = getMockData();
  let changed = false;

  if (!store['trips'] || Object.keys(store['trips']).length === 0) {
    store['trips'] = {
      paradise: {
        id: 'paradise', title: 'Paradise Island', category: 'Island',
        price: 45, currency: 'USD', duration: '6 hours',
        description: 'Enjoy a full day on Paradise Island with crystal clear waters, white sand beaches, and amazing snorkeling spots. Lunch and transfers included.',
        image: '', createdAt: new Date().toISOString()
      },
      dolphin: {
        id: 'dolphin', title: 'Dolphin House Trip', category: 'Sea',
        price: 30, currency: 'USD', duration: '4 hours',
        description: 'Swim with dolphins in their natural habitat. An unforgettable experience for all ages. Includes snorkeling equipment and lunch.',
        image: '', createdAt: new Date().toISOString()
      },
      quad: {
        id: 'quad', title: 'Quad Bike Safari', category: 'Safari',
        price: 30, currency: 'USD', duration: '3 hours',
        description: 'Ride quad bikes through the desert landscape. Visit Bedouin villages and enjoy traditional tea. Sunset option available.',
        image: '', createdAt: new Date().toISOString()
      },
      orange: {
        id: 'orange-bay', title: 'Orange Bay', category: 'Island',
        price: 40, currency: 'USD', duration: '5 hours',
        description: 'Visit the stunning Orange Bay Island. White sand, turquoise water, and a relaxing beach day with BBQ lunch.',
        image: '', createdAt: new Date().toISOString()
      },
      mahmya: {
        id: 'mahmya', title: 'Mahmya Island', category: 'Island',
        price: 55, currency: 'USD', duration: '7 hours',
        description: 'Mahmya Island offers pristine beaches and excellent snorkeling. Enjoy a buffet lunch and relax in paradise.',
        image: '', createdAt: new Date().toISOString()
      }
    };
    changed = true;
  }

  if (!store['posts'] || Object.keys(store['posts']).length === 0) {
    store['posts'] = {
      p1: {
        id: 'p1', title: 'Top 10 Things to Do in Hurghada',
        content: 'Hurghada is a paradise for water sports lovers. From snorkeling in the Red Sea to desert safaris, there is something for everyone. Here are our top 10 recommendations...',
        createdAt: new Date().toISOString()
      },
      p2: {
        id: 'p2', title: 'Best Snorkeling Spots in the Red Sea',
        content: 'The Red Sea is home to some of the most beautiful coral reefs in the world. Discover the best spots for snorkeling including Giftun Island, Dolphin House, and more...',
        createdAt: new Date().toISOString()
      },
      p3: {
        id: 'p3', title: 'When to Visit Hurghada',
        content: 'Hurghada enjoys year-round sunshine. The best time to visit is from March to November when the weather is warm and perfect for water activities...',
        createdAt: new Date().toISOString()
      }
    };
    changed = true;
  }

  if (!store['settings'] || !store['settings']['site']) {
    store['settings'] = store['settings'] || {};
    store['settings']['site'] = {
      name: 'Red Sea Excursions Hub',
      email: 'hasanhosam518@gmail.com',
      whatsapp: '201092236166'
    };
    changed = true;
  }

  if (changed) saveMockData(store);
}
