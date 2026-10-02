import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`=======================================================`);
  console.log(` Scholarship Finder Backend API Server Running`);
  console.log(` Port: ${env.PORT}`);
  console.log(` Environment: ${env.NODE_ENV}`);
  console.log(` Base URL: http://localhost:${env.PORT}/api/v1`);
  console.log(` Healthcheck: http://localhost:${env.PORT}/api/v1/health`);
  console.log(`=======================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
