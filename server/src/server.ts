import { app } from './app';
import { env } from './config/env';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : env.PORT;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(` Scholarship Finder Backend API Server Running`);
  console.log(` Host: ${HOST}`);
  console.log(` Port: ${PORT}`);
  console.log(` Environment: ${env.NODE_ENV}`);
  console.log(` Base URL: http://${HOST}:${PORT}/api/v1`);
  console.log(` Healthcheck: http://${HOST}:${PORT}/health`);
  console.log(`=======================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
