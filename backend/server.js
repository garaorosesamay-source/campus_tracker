require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

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
// 3. MYSQL CONNECTION (ITO ANG NAWALA KAYA NAG-ERROR)
// =====================================

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sis_db',

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// =====================================
// 4. BASIC TEST ROUTES
// =====================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Campus Supply API is running',
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API connection successful',
  });
});

app.get('/api/debug-check', (req, res) => {
  res.json({
    server: 'CAMPUS-SUPPLY-UPDATED',
    route: '/api/debug-check',
    port: PORT,
    message: 'Correct server.js is running',
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    res.json({
      success: true,
      message: 'Server and MySQL are connected',
    });
  } catch (err) {
    console.error('Health check error:', err.message);

    res.status(500).json({
      success: false,
      message: 'MySQL connection failed',
    });
  }
});

// =====================================
// 5. FIREBASE TOKEN VERIFICATION
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

// =====================================
// 6. SUPERADMIN AUTHORIZATION
// =====================================

async function requireSuperadmin(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, firebase_uid, email, role, status
       FROM admin_accounts
       WHERE firebase_uid = ?
       LIMIT 1`,
      [req.user.uid]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No admin account is registered for this user',
      });
    }

    const account = rows[0];

    if (
      account.role !== 'Superadmin' ||
      account.status !== 'Active'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Superadmin access required',
      });
    }

    req.adminAccount = account;
    next();
  } catch (err) {
    console.error('Authorization error:', err.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to verify admin permissions',
    });
  }
}

// =====================================
// 7. ADMIN DIRECTORY ROUTER
// =====================================

const adminRouter = express.Router();

adminRouter.use(verifyFirebaseToken);
adminRouter.use(requireSuperadmin);

adminRouter.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
         p.id,
         p.username,
         p.name,
         p.last_name AS lastName,
         p.image,
         a.email,
         a.role,
         COALESCE(a.status, 'Inactive') AS status,
         a.firebase_uid AS firebaseUid,
         p.created_at AS createdAt
       FROM admin_profiles p
       LEFT JOIN admin_accounts a
         ON p.account_id = a.id
       ORDER BY p.id DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error('GET admins error:', err.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin records',
    });
  }
});

adminRouter.post('/', async (req, res) => {
  try {
    const { name, lastName, username, image } = req.body;

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      (lastName !== undefined &&
        lastName !== null &&
        typeof lastName !== 'string') ||
      (username !== undefined &&
        username !== null &&
        typeof username !== 'string') ||
      (image !== undefined &&
        image !== null &&
        typeof image !== 'string')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin details',
      });
    }

    const cleanName = name.trim();
    const cleanLastName = lastName?.trim() || null;
    const cleanUsername = username?.trim() || null;
    const cleanImage = image || null;

    const [result] = await pool.execute(
      `INSERT INTO admin_profiles
        (account_id, username, name, last_name, image)
       VALUES (?, ?, ?, ?, ?)`,
      [
        null,
        cleanUsername,
        cleanName,
        cleanLastName,
        cleanImage,
      ]
    );

    const [rows] = await pool.execute(
      `SELECT
         id,
         username,
         name,
         last_name AS lastName,
         image,
         NULL AS email,
         NULL AS role,
         'Inactive' AS status,
         NULL AS firebaseUid,
         created_at AS createdAt
       FROM admin_profiles
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Admin directory record added',
      admin: rows[0],
    });
  } catch (err) {
    console.error('POST admins error:', err.message);

    res.status(500).json({
      success: false,
      message: 'Failed to add admin record',
    });
  }
});

adminRouter.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin ID',
      });
    }

    const { name, lastName, username, image } = req.body;

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      (lastName !== undefined &&
        lastName !== null &&
        typeof lastName !== 'string') ||
      (username !== undefined &&
        username !== null &&
        typeof username !== 'string') ||
      (image !== undefined &&
        image !== null &&
        typeof image !== 'string')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin details',
      });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM admin_profiles WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin record not found',
      });
    }

    await pool.execute(
      `UPDATE admin_profiles
       SET name = ?,
           last_name = ?,
           username = COALESCE(?, username),
           image = COALESCE(?, image)
       WHERE id = ?`,
      [
        name.trim(),
        lastName?.trim() || null,
        username?.trim() || null,
        image || null,
        id,
      ]
    );

    const [rows] = await pool.execute(
      `SELECT
         p.id,
         p.username,
         p.name,
         p.last_name AS lastName,
         p.image,
         a.email,
         a.role,
         COALESCE(a.status, 'Inactive') AS status,
         a.firebase_uid AS firebaseUid,
         p.created_at AS createdAt
       FROM admin_profiles p
       LEFT JOIN admin_accounts a
         ON p.account_id = a.id
       WHERE p.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Admin record updated',
      admin: rows[0],
    });
  } catch (err) {
    console.error('PUT admins error:', err.message);

    res.status(500).json({
      success: false,
      message: 'Failed to update admin record',
    });
  }
});

adminRouter.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin ID',
      });
    }

    const [result] = await pool.execute(
      `DELETE FROM admin_profiles
       WHERE id = ? AND account_id IS NULL`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message:
          'Record not found or linked to a login account',
      });
    }

    res.json({
      success: true,
      message: 'Admin directory record deleted',
    });
  } catch (err) {
    console.error('DELETE admins error:', err.message);

    res.status(500).json({
      success: false,
      message: 'Failed to delete admin record',
    });
  }
});

app.use('/api/admins', adminRouter);

// =====================================
// 8. 404 & ERROR HANDLERS
// =====================================

app.use((req, res) => {
  console.warn(
    `Route not found: ${req.method} ${req.originalUrl}`
  );

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
// 9. START SERVER
// =====================================

async function startServer() {
  try {
    console.log('Attempting to connect to MySQL...');
    await pool.query('SELECT 1');

    console.log('MySQL connected successfully');
    console.log('Database:', process.env.DB_NAME || 'sis_db');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('=================================');
      console.log('Campus Supply API is running');
      console.log(`Server: http://0.0.0.0:${PORT}`);
      console.log('=================================');
    });

    server.on('error', (err) => {
      console.error('HTTP server error:', err.message);
      process.exit(1);
    });
  } catch (err) {
    console.error('CRITICAL STARTUP ERROR:', err.message);
    console.error('Full Error Object:', err);
    process.exit(1);
  }
}

startServer();