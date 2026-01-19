import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { chatRouter } from './routes/chat';
import { conversationsRouter } from './routes/conversations';
import { codeSnippetsRouter } from './routes/code-snippets';
import { teamsRouter } from './routes/teams';
import { academyRouter } from './routes/academy';
import { dashboardRouter } from './routes/dashboard';
import { usersRouter } from './routes/users';
import { tbaRouter } from './routes/tba';
import { adminRouter } from './routes/admin';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://192.168.1.7:3000', 'capacitor://localhost', 'ionic://localhost'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/code-snippets', codeSnippetsRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/academy', academyRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/users', usersRouter);
app.use('/api/tba', tbaRouter);
app.use('/api/admin', adminRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
