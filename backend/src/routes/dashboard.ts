import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

router.use(authenticateToken);

// GET /api/dashboard/stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'Dashboard route henüz implement edilmedi.' });
});

export { router as dashboardRouter };
