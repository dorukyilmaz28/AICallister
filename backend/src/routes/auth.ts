import { Router, Request, Response } from 'express';
import { userDb, teamDb } from '../lib/database';
import { generateToken } from '../lib/jwt';
import { z } from 'zod';

const router = Router();

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Register schema
const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  teamNumber: z.string().min(1),
});

// Verify team schema
const verifyTeamSchema = z.object({
  teamNumber: z.string().min(1),
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await userDb.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email veya şifre hatalı.' });
    }

    const isPasswordValid = await userDb.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email veya şifre hatalı.' });
    }

    // Fresh user data al (status ve teamId güncel olmalı)
    const freshUser = await userDb.findById(user.id);
    if (!freshUser) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı.' });
    }

    const token = generateToken({
      id: freshUser.id,
      email: freshUser.email,
      name: freshUser.name,
      role: freshUser.role,
      status: freshUser.status,
      teamId: freshUser.teamId || undefined,
      teamNumber: freshUser.teamNumber || undefined,
    });

    res.json({
      token,
      user: {
        id: freshUser.id,
        email: freshUser.email,
        name: freshUser.name,
        role: freshUser.role,
        status: freshUser.status,
        teamId: freshUser.teamId,
        teamNumber: freshUser.teamNumber,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Geçersiz veri formatı.', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Giriş yapılırken hata oluştu.' });
  }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, teamNumber } = registerSchema.parse(req.body);

    // Team number'ı kontrol et
    const team = await teamDb.findByTeamNumber(teamNumber);
    if (!team) {
      return res.status(400).json({ error: 'Bu takım numarası sistemde kayıtlı değil.' });
    }

    const user = await userDb.create({ name, email, password, teamNumber });
    
    res.status(201).json({
      message: 'Kayıt başarılı. Hesabınız onay bekliyor.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Geçersiz veri formatı.', details: error.errors });
    }
    if (error.message.includes('email')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Kayıt olurken hata oluştu.' });
  }
});

// POST /api/auth/verify-team
router.post('/verify-team', async (req: Request, res: Response) => {
  try {
    const { teamNumber } = verifyTeamSchema.parse(req.body);

    const team = await teamDb.findByTeamNumber(teamNumber);
    if (!team) {
      return res.status(404).json({ error: 'Bu takım numarası sistemde kayıtlı değil.' });
    }

    res.json({
      valid: true,
      team: {
        id: team.id,
        name: team.name,
        teamNumber: team.teamNumber,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Geçersiz veri formatı.', details: error.errors });
    }
    console.error('Verify team error:', error);
    res.status(500).json({ error: 'Takım doğrulanırken hata oluştu.' });
  }
});

export { router as authRouter };
