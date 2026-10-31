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

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Security & Logging Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  }
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

const clientDist = path.resolve(__dirname, '../../client/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      next();
      return;
    }
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) next();
    });
  });
}

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
