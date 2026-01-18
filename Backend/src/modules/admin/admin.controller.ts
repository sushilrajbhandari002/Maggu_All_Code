import type { Request, Response, NextFunction } from 'express';
import {
  getAdminDashboardData,
  getReportsData,
  createNotice,
  updateNotice,
  deleteNotice,
  createEvent,
  updateEvent,
  deleteEvent,
  createUser,
  updateUser,
  deleteUser,
} from './admin.service';
import { z } from 'zod';

const noticeSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  date: z.string(),
  type: z.string(),
});

const eventSchema = z.object({
  title: z.string().min(1),
  date: z.string(),
  time: z.string(),
  venue: z.string(),
});

export async function adminDashboardHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getAdminDashboardData();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function reportsHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getReportsData();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function createNoticeHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = noticeSchema.parse(req.body);
    const notice = await createNotice(body);
    res.status(201).json(notice);
  } catch (error) {
    next(error);
  }
}

export async function updateNoticeHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid notice ID' });
    }
    const body = noticeSchema.partial().parse(req.body);
    const notice = await updateNotice(id, body);
    res.json(notice);
  } catch (error) {
    next(error);
  }
}

export async function deleteNoticeHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid notice ID' });
    }
    await deleteNotice(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function createEventHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = eventSchema.parse(req.body);
    const event = await createEvent(body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
}

export async function updateEventHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    const body = eventSchema.partial().parse(req.body);
    const event = await updateEvent(id, body);
    res.json(event);
  } catch (error) {
    next(error);
  }
}

export async function deleteEventHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    await deleteEvent(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['teacher', 'student']),
  phone: z.string().optional(),
  address: z.string().optional(),
  class: z.string().optional(),
  rollNumber: z.string().optional(),
  teacherId: z.string().optional(),
  assignedClasses: z.array(z.string()).optional(),
});

export async function createUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = createUserSchema.parse(req.body);
    const user = await createUser(body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

export async function updateUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const body = createUserSchema.partial().omit({ password: true, role: true }).parse(req.body);
    const user = await updateUser(id, body);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function deleteUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    await deleteUser(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
