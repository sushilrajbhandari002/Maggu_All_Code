import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import {
  getStudentAcademics,
  getStudentAttendance,
  getStudentMaterials,
  getStudentOverview,
  submitStudentAttendance,
} from './student.service';

const idParamSchema = z.object({
  studentId: z.coerce.number(),
});

export async function studentOverviewHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { studentId } = idParamSchema.parse(req.params);
    const data = await getStudentOverview(studentId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function studentAttendanceHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { studentId } = idParamSchema.parse(req.params);
    const data = await getStudentAttendance(studentId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

const attendanceBodySchema = z.object({
  location: z.string().min(1),
});

export async function studentAttendanceSubmitHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { studentId } = idParamSchema.parse(req.params);
    const { location } = attendanceBodySchema.parse(req.body);

    const photo = req.file
      ? {
          buffer: req.file.buffer,
          mimetype: req.file.mimetype,
        }
      : undefined;

    const result = await submitStudentAttendance(studentId, { location, photo });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function studentAcademicsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { studentId } = idParamSchema.parse(req.params);
    const data = await getStudentAcademics(studentId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function studentMaterialsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { studentId } = idParamSchema.parse(req.params);
    const data = await getStudentMaterials(studentId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

