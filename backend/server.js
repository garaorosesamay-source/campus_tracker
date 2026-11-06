require('dotenv').config();

const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
=======
const mysql = require('mysql2/promise');

>>>>>>> 8790b48 (Update frontend and backend for campus supply tracker)
const {
  initializeApp,
  cert,
  applicationDefault,
  getApps,
} = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const mysql = require('mysql2/promise');

const app = express();
const PORT = Number(process.env.PORT) || 8080;
<<<<<<< HEAD

const allowedOrigins = (process.env.CLIENT_URL || 'https://campustr.netlify.app,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
=======
const DB_NAME = process.env.DB_NAME || 'campus_tracker_db';
>>>>>>> 8790b48 (Update frontend and backend for campus supply tracker)

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));

<<<<<<< HEAD
// Render: set FIREBASE_SERVICE_ACCOUNT to the complete service-account JSON.
// Local development may use GOOGLE_APPLICATION_CREDENTIALS instead.
=======
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

>>>>>>> 8790b48 (Update frontend and backend for campus supply tracker)
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
const firestore = getFirestore();

<<<<<<< HEAD
// =====================================
// MYSQL DATABASE CONNECTION (XAMPP)
// =====================================
// Local .env defaults are for XAMPP. Do not use localhost for a remote server.
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_tracker_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
=======
let dbPool;

async function initializeDatabase() {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = Number(process.env.DB_PORT) || 3306;
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';

  const tempConnection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
  });

  await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
  await tempConnection.end();

  dbPool = mysql.createPool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS admin (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await dbPool.query(createTableQuery);
  console.log(`MySQL Database ('${DB_NAME}') and 'admin' table verified/created successfully via XAMPP`);
}

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Campus Tracker API is running (Firebase + XAMPP MySQL mode)',
  });
>>>>>>> 8790b48 (Update frontend and backend for campus supply tracker)
});


<<<<<<< HEAD
app.get('/', (_req, res) => res.json({ success: true, message: 'Campus Tracker API is running' }));
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'Server is healthy' }));

// Verify that the API can reach the configured MySQL database.
app.get('/api/db-test', async (_req, res) => {
=======
app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT 1 + 1 AS solution');
    res.json({
      success: true,
      message: `Database query executed successfully on ${DB_NAME}`,
      result: rows[0].solution,
    });
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({
      success: false,
      message: 'Database query failed',
      error: err.message,
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running and healthy',
  });
});

app.get('/api/admins', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT id, name, username AS lastName FROM admin');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins',
      error: err.message,
    });
  }
});

app.post('/api/admins', async (req, res) => {
  try {
    const name = req.body.name || req.body.firstName || req.body.firstname;
    const lastName = req.body.lastName || req.body.lastname || 'Admin';

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'First name is required',
      });
    }

    const [result] = await dbPool.query(
      'INSERT INTO admin (name, username) VALUES (?, ?)',
      [name, lastName]
    );

    res.status(201).json({
      id: result.insertId,
      name: name,
      lastName: lastName,
    });
  } catch (err) {
    console.error('Error adding admin:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add admin',
      error: err.message,
    });
  }
});

app.put('/api/admins/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const name = req.body.name || req.body.firstName || req.body.firstname;
    const lastName = req.body.lastName || req.body.lastname || 'Admin';

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'First name is required',
      });
    }

    const [result] = await dbPool.query(
      'UPDATE admin SET name = ?, username = ? WHERE id = ?',
      [name, lastName, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.json({
      id: Number(id),
      name: name,
      lastName: lastName,
    });
  } catch (err) {
    console.error('Error updating admin:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin',
      error: err.message,
    });
  }
});

app.delete('/api/admins/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await dbPool.query('DELETE FROM admin WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.json({
      success: false, 
      message: 'Admin deleted successfully',
      id: Number(id),
    });
  } catch (err) {
    console.error('Error deleting admin:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin',
      error: err.message,
    });
  }
});

async function verifyFirebaseToken(req, res, next) {
>>>>>>> 8790b48 (Update frontend and backend for campus supply tracker)
  try {
    const [rows] = await db.query('SELECT DATABASE() AS databaseName, 1 AS connected');
    res.json({
      success: true,
      message: 'MySQL connection successful',
      database: rows[0].databaseName,
    });
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
    res.status(503).json({
      success: false,
      message: 'Could not connect to MySQL. Check that XAMPP MySQL is running and your DB settings are correct.',
    });
  }
});

async function requireSuperadmin(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing Firebase authentication token.' });
    }
    const decoded = await auth.verifyIdToken(header.slice(7), true);
    const profile = await firestore.collection('users').doc(decoded.uid).get();
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

<<<<<<< HEAD
// User records are stored in the same Firestore collection used by Firebase Authentication.
const users = firestore.collection('users');

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
=======
app.get('/api/protected-test', verifyFirebaseToken, (req, res) => {
  res.json({
    success: true,
    message: 'Authenticated successfully with Firebase',
    user: req.user,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});
>>>>>>> 8790b48 (Update frontend and backend for campus supply tracker)

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

<<<<<<< HEAD
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

const admins = firestore.collection('admins');

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
=======
async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('=================================');
      console.log(`Campus Tracker API is running on port ${PORT}`);
      console.log('=================================');
    });
  } catch (err) {
    console.error('Failed to start server due to database initialization error:', err.message);
    process.exit(1);
  }
}

startServer();
>>>>>>> 8790b48 (Update frontend and backend for campus supply tracker)
