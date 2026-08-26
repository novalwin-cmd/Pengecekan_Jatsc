import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initializeDatabase, sequelize } from './models.js';
import { setupRoutes } from './routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ============================================================================
// ROUTES
// ============================================================================

setupRoutes(app);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'JATSC Backend is running' });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error',
    status: 'error'
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();

    // Start server on all network interfaces (0.0.0.0) for AirNav network access
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('╔════════════════════════════════════════╗');
      console.log('║   🚀 JATSC Backend Server Started      ║');
      console.log('╚════════════════════════════════════════╝');
      console.log('');
      console.log(`📍 Local:   http://127.0.0.1:${PORT}`);
      console.log(`📍 Network: http://192.168.110.221:${PORT}`);
      console.log(`📍 AirNav:  http://192.168.110.221:${PORT}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await sequelize.close();
  process.exit(0);
});

startServer();
