require('dotenv').config();

const express = require('express');
const cors = require('cors');

const {
  initializeApp,
  applicationDefault,
  getApps,
} = require('firebase-admin/app');

const { getAuth } = require('firebase-admin/auth');

const app = express();
const PORT = Number(process.env.PORT) || 8080;

// =====================================
// 1. MIDDLEWARE
// =====================================

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '2mb' }));

// =====================================
// 2. FIREBASE ADMIN INITIALIZATION
// =====================================

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  });
}

console.log('Firebase Admin SDK initialized');

// =====================================
// 3. BASIC TEST ROUTES
// =====================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Campus Supply API is running (Firebase-only mode)',
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API connection successful',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running and healthy',
  });
});

// =====================================
// 4. FIREBASE TOKEN VERIFICATION
// =====================================

async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing Firebase authentication token',
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      });
    }

    const decoded = await getAuth().verifyIdToken(token, true);

    req.user = {
      uid: decoded.uid,
      email: decoded.email || null,
    };

    next();
  } catch (err) {
    console.error('Firebase verification error:', err.message);

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired Firebase token',
    });
  }
}

// Sample protected route using Firebase Auth
app.get('/api/protected-test', verifyFirebaseToken, (req, res) => {
  res.json({
    success: true,
    message: 'Authenticated successfully with Firebase',
    user: req.user,
  });
});

// =====================================
// 5. 404 & ERROR HANDLERS
// =====================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// =====================================
// 6. START SERVER
// =====================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log(`Campus Supply API is running on port ${PORT}`);
  console.log('=================================');
});