import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import uploadsRouter from './routes/uploads';
import diagramsRouter from './routes/diagrams';
import pyqsRouter from './routes/pyqs';
import lessonsRouter from './routes/lessons';
import practiceRouter from './routes/practice';
import biologyRouter from './routes/biology';
import materialsRouter from './routes/materials';
import aiRouter from './routes/ai';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

// Default NODE_ENV to production if running on Render
if (!process.env.NODE_ENV && process.env.RENDER) {
  process.env.NODE_ENV = 'production';
}

const app = express();
const PORT = process.env.PORT || 5000;
const configuredOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (process.env.RENDER_EXTERNAL_URL) {
  configuredOrigins.push(process.env.RENDER_EXTERNAL_URL);
}

// Security & Logging Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (
      configuredOrigins.includes(origin) ||
      configuredOrigins.includes('*') ||
      origin.endsWith('.onrender.com') ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    ) {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(morgan('dev'));

// Health & Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    service: 'ConceptLens 2.0 API Gateway',
    timestamp: new Date().toISOString()
  });
});

// Route Registrations
app.use('/api/uploads', uploadsRouter);
app.use('/api/diagrams', diagramsRouter);
app.use('/api/pyqs', pyqsRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/practice', practiceRouter);
app.use('/api/biology', biologyRouter);
app.use('/api/materials', materialsRouter);
app.use('/api/ai', aiRouter);

// Frontend Static Assets & SPA Fallback
const candidatePaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist')
];

const clientDist = candidatePaths.find((p) => fs.existsSync(path.join(p, 'index.html')));

if (clientDist) {
  console.log(`📦 Serving static client from: ${clientDist}`);
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
} else {
  console.warn('⚠️ No client/dist/index.html found. Frontend static serving is disabled.');
  console.warn('Checked candidates:', candidatePaths);
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      service: 'ConceptLens 2.0 API Gateway',
      message: 'Server is running. Client build was not found.',
      health: '/api/health'
    });
  });
}

// Centralized Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = typeof err.status === 'number' ? err.status : 500;
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  console.error(`[SERVER ERROR] ${req.method} ${req.path}:`, message);
  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : message
  });
});

// Start Server & Connect Database
async function bootstrap() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 ConceptLens 2.0 Backend running on port ${PORT}`);
    console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
  });
}

bootstrap();

export default app;
