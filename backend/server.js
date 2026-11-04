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
    // ITO ANG MAGLALABAS NG TUNAY NA RASON SA RENDER LOGS
    console.error('CRITICAL STARTUP ERROR:', err.message);
    console.error('Full Error Object:', err);
    process.exit(1);
  }
}

startServer();