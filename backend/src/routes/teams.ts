import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

// GET /api/teams
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'Teams route henüz implement edilmedi.' });
});

export { router as teamsRouter };
