import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import inviteRoutes from './routes/inviteRoutes';
import promptRoutes from './routes/promptRoutes';
import collectionRoutes from './routes/collectionRoutes';
import teamRoutes from './routes/teamRoutes';
import adminRoutes from './routes/adminRoutes';
import organizationRoutes from './routes/organizationRoutes';
import userRoutes from './routes/userRoutes';
import trendingRoutes from './routes/trendingRoutes';
import searchRoutes from './routes/searchRoutes';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api', (_req, res) => {
  res.json({ message: 'Aizu API', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/user', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/search', searchRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export default app;

