import { Router } from 'express';
import { Response, Request } from 'express';

const router = Router();

// GET /api/tba (Public)
router.get('/', async (req: Request, res: Response) => {
  res.status(501).json({ error: 'TBA route henüz implement edilmedi.' });
});

export { router as tbaRouter };
