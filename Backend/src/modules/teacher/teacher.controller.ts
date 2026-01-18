import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { getTeacherDashboard, uploadTeacherMaterial } from './teacher.service';
import { HttpError } from '../../middleware/errorHandler';

const paramsSchema = z.object({
  teacherId: z.coerce.number(),
});

export async function teacherDashboardHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { teacherId } = paramsSchema.parse(req.params);
    const data = await getTeacherDashboard(teacherId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

const uploadBodySchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  className: z.string().min(1),
  size: z.string().min(1),
});

export async function teacherMaterialUploadHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { teacherId } = paramsSchema.parse(req.params);
    const parsed = uploadBodySchema.parse(req.body);
    if (!req.file) {
      throw new HttpError(400, 'File is required');
    }

    const material = await uploadTeacherMaterial(teacherId, {
      ...parsed,
      file: { buffer: req.file.buffer, mimetype: req.file.mimetype },
    });

    res.status(201).json(material);
  } catch (error) {
    next(error);
  }
}

