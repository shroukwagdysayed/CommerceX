import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

// Connect to Database and start server
connectDB()
  .then(() => {
    startServer();
  })
  .catch((err) => {
    console.warn('Database connection failed. Starting server in degraded mode...', err.message);
    startServer();
  });
