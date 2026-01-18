import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { login } from './auth.service';
import { HttpError } from '../../middleware/errorHandler';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['admin', 'teacher', 'student']),
});

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, 'Invalid request body', parsed.error.flatten());
    }

    const result = await login(parsed.data);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

