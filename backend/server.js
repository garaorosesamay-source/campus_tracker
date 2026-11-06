require('dotenv').config();

const express = require('express');
const cors = require('cors');
const {
  initializeApp,
  cert,
  applicationDefault,
  getApps,
} = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const app = express();
const PORT = Number(process.env.PORT) || 8080;

const allowedOrigins = (process.env.CLIENT_URL || 'https://campustr.netlify.app,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));

// Render: set FIREBASE_SERVICE_ACCOUNT to the complete service-account JSON.
// Local development may use GOOGLE_APPLICATION_CREDENTIALS instead.
if (!getApps().length) {
  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = cert(serviceAccount);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = applicationDefault();
  } else {
    throw new Error('Set FIREBASE_SERVICE_ACCOUNT on Render or GOOGLE_APPLICATION_CREDENTIALS locally.');
  }
  initializeApp({ credential });
}

const auth = getAuth();
const db = getFirestore();

app.get('/', (_req, res) => res.json({ success: true, message: 'Campus Tracker API is running' }));
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'Server is healthy' }));

async function requireSuperadmin(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing Firebase authentication token.' });
    }
    const decoded = await auth.verifyIdToken(header.slice(7), true);
    const profile = await db.collection('users').doc(decoded.uid).get();
    if (!profile.exists || profile.data().role !== 'Superadmin') {
      return res.status(403).json({ success: false, message: 'Superadmin access required.' });
    }
    req.user = { uid: decoded.uid, email: decoded.email || null };
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}

// User records are stored in the same Firestore collection used by Firebase Authentication.
const users = db.collection('users');

// List registered Campus Tracker users (Superadmin only).
app.get('/api/user', requireSuperadmin, async (_req, res, next) => {
  try {
    const snapshot = await users.get();
    res.json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  } catch (error) { next(error); }
});

// Attach a profile to an existing Firebase Authentication account.
app.post('/api/user', requireSuperadmin, async (req, res, next) => {
  try {
    const uid = String(req.body.uid || '').trim();
    const name = String(req.body.name || '').trim();
    const username = String(req.body.username || '').trim();
    const role = String(req.body.role || 'Admin').trim();

    if (!uid || !name || !['Admin', 'Superadmin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'A valid Firebase uid, name, and role (Admin or Superadmin) are required.' });
    }

    const firebaseUser = await auth.getUser(uid);
    const ref = users.doc(uid);
    const existing = await ref.get();
    if (existing.exists) {
      return res.status(409).json({ success: false, message: 'A profile already exists for this user.' });
    }

    const profile = {
      uid,
      username: username || firebaseUser.email?.split('@')[0] || '',
      role,
      name,
      email: firebaseUser.email || '',
      image: firebaseUser.photoURL || '',
      createdAt: FieldValue.serverTimestamp(),
    };
    await ref.set(profile);
    res.status(201).json({ id: uid, ...profile, createdAt: null });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ success: false, message: 'Firebase Authentication user was not found. Create the account in Firebase Authentication first.' });
    }
    next(error);
  }
});

// Update a user's Firestore profile and Firebase display name.
app.put('/api/user/:id', requireSuperadmin, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const role = String(req.body.role || '').trim();
    const username = req.body.username === undefined ? undefined : String(req.body.username).trim();

    if (!name || !['Admin', 'Superadmin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'A name and valid role (Admin or Superadmin) are required.' });
    }

    const ref = users.doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ success: false, message: 'User profile not found.' });

    const updates = { name, role, updatedAt: FieldValue.serverTimestamp() };
    if (username !== undefined) updates.username = username;
    await ref.update(updates);

    try {
      await auth.updateUser(req.params.id, { displayName: name });
    } catch (error) {
      if (error.code !== 'auth/user-not-found') throw error;
    }

    res.json({ id: req.params.id, ...existing.data(), ...updates, updatedAt: null });
  } catch (error) { next(error); }
});

// Delete both the Firebase Authentication account and its Firestore profile.
app.delete('/api/user/:id', requireSuperadmin, async (req, res, next) => {
  try {
    const ref = users.doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ success: false, message: 'User profile not found.' });

    await auth.deleteUser(req.params.id);
    await ref.delete();
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      try {
        await users.doc(req.params.id).delete();
        return res.json({ success: true, id: req.params.id, note: 'Firestore profile deleted; Firebase Auth account was already absent.' });
      } catch (deleteError) { return next(deleteError); }
    }
    next(error);
  }
});

const admins = db.collection('admins');

app.get('/api/admins', requireSuperadmin, async (_req, res, next) => {
  try {
    const snapshot = await admins.orderBy('createdAt', 'desc').get();
    res.json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  } catch (error) { next(error); }
});

app.post('/api/admins', requireSuperadmin, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const lastName = String(req.body.lastName || '').trim();
    if (!name || !lastName) return res.status(400).json({ success: false, message: 'First name and last name are required.' });
    const ref = admins.doc();
    const record = { name, lastName, status: 'Active', createdAt: FieldValue.serverTimestamp() };
    await ref.set(record);
    res.status(201).json({ id: ref.id, name, lastName, status: 'Active' });
  } catch (error) { next(error); }
});

app.put('/api/admins/:id', requireSuperadmin, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const lastName = String(req.body.lastName || '').trim();
    if (!name || !lastName) return res.status(400).json({ success: false, message: 'First name and last name are required.' });
    const ref = admins.doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ success: false, message: 'Administrator not found.' });
    await ref.update({ name, lastName, updatedAt: FieldValue.serverTimestamp() });
    res.json({ id: ref.id, name, lastName, status: existing.data().status || 'Active' });
  } catch (error) { next(error); }
});

app.delete('/api/admins/:id', requireSuperadmin, async (req, res, next) => {
  try {
    const ref = admins.doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ success: false, message: 'Administrator not found.' });
    await ref.delete();
    res.json({ success: true, id: ref.id });
  } catch (error) { next(error); }
});

app.use((req, res) => res.status(404).json({ success: false, message: `API route not found: ${req.method} ${req.originalUrl}` }));
app.use((error, _req, res, _next) => {
  console.error('Unhandled server error:', error);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Campus Tracker API listening on port ${PORT}`));
