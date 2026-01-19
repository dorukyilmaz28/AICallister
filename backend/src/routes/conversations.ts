import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { conversationDb } from '../lib/database';
import { Response } from 'express';

const router = Router();

router.use(authenticateToken);

// GET /api/conversations
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await conversationDb.findByUserId(req.user!.id);
    res.json({ conversations });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Konuşmalar yüklenirken hata oluştu.' });
  }
});

// GET /api/conversations/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const conversation = await conversationDb.findById(id);
    
    if (!conversation || conversation.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Konuşma bulunamadı.' });
    }
    
    res.json({ conversation, messages: conversation.messages || [] });
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Konuşma yüklenirken hata oluştu.' });
  }
});

// DELETE /api/conversations/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await conversationDb.delete(id, req.user!.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: error.message || 'Konuşma silinirken hata oluştu.' });
  }
});

export { router as conversationsRouter };
