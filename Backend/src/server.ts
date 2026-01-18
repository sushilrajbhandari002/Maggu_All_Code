import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/errorHandler';
import { testDatabaseConnection } from './config/database';
import { authRouter } from './modules/auth/auth.router';
import { studentRouter } from './modules/student/student.router';
import { teacherRouter } from './modules/teacher/teacher.router';
import { adminRouter } from './modules/admin/admin.router';

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routers
app.use('/api/auth', authRouter);
app.use('/api/students', studentRouter);
app.use('/api/teachers', teacherRouter);
app.use('/api/admin', adminRouter);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await testDatabaseConnection();
    app.listen(env.port, () => {
      console.log(`Backend listening on port ${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

void start();

