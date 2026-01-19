import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

router.use(authenticateToken);

// POST /api/chat
router.post('/', async (req: AuthRequest, res: Response) => {
  // TODO: Chat route'u implementasyonu
  // Mevcut Next.js API route'undan kopyalanacak
  res.status(501).json({ error: 'Chat endpoint henüz implement edilmedi. Next.js route\'undan kopyalanacak.' });
});

export { router as chatRouter };
