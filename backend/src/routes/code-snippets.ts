import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/database';
import { Response } from 'express';

const router = Router();

// GET /api/code-snippets (Public veya authenticated)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category, language, search, public: onlyPublic } = req.query;
    const userId = req.user?.id;

    const where: any = {};

    if (onlyPublic === 'true') {
      where.isPublic = true;
    } else if (userId) {
      where.OR = [
        { userId },
        { isPublic: true }
      ];
    } else {
      where.isPublic = true;
    }

    if (category) where.category = category;
    if (language) where.language = language;
    if (search) {
      where.OR = [
        ...(where.OR || []),
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const snippets = await prisma.codeSnippet.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        favorites: userId ? {
          where: { userId }
        } : false,
        _count: {
          select: { favorites: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedSnippets = snippets.map(snippet => ({
      ...snippet,
      isFavorite: snippet.favorites && snippet.favorites.length > 0,
      favoriteCount: snippet._count?.favorites || 0,
      favorites: undefined,
      _count: undefined
    }));

    res.json({ snippets: formattedSnippets });
  } catch (error: any) {
    console.error('Error fetching snippets:', error);
    res.status(500).json({ error: 'Snippet\'ler yüklenirken hata oluştu.' });
  }
});

// POST /api/code-snippets
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'POST /code-snippets henüz implement edilmedi.' });
});

export { router as codeSnippetsRouter };
