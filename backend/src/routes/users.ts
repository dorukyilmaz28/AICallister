import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

router.use(authenticateToken);

export { router as usersRouter };
