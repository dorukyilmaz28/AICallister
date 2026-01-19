import { Router } from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/*
router.get('*', async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'Admin route henüz implement edilmedi.' });
});

export { router as adminRouter };
