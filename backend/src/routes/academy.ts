import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

router.use(authenticateToken);

// GET /api/academy/courses
router.get('/courses', async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'Academy route henüz implement edilmedi.' });
});

export { router as academyRouter };
