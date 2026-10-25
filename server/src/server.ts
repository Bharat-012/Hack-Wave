import { app } from './app.js';
import { ENV } from './config/env.js';

const PORT = ENV.PORT;

const server = app.listen(PORT, () => {
  console.log(`🏙️ PatchMyCity Server running at http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api/v1`);
  console.log(`🤖 Gemini Status: ${ENV.IS_MOCK_GEMINI ? 'DEMO MOCK MODE (Key not detected)' : 'LIVE GEMINI API CONNECTED'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});
