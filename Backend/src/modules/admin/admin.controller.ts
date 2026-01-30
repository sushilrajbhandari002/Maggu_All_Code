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
  listClassesWithSections,
  createOrUpdateClassWithSections,
  deleteClassWithSections,
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  listRoles,
  createRole,
  deleteRole,
  listRoleAssignments,
  updateRoleAssignments,
  isTeacherIdAvailable,
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

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

// Accepts:
// - +97798XXXXXXXX or +97797XXXXXXXX or +97796XXXXXXXX
// - 98XXXXXXXX, 97XXXXXXXX, 96XXXXXXXX (10 digits)
const nepalPhoneRegex = /^(\+977(?:98|97|96)\d{8}|(?:98|97|96)\d{8})$/;

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z
    .string()
    .regex(
      strongPasswordRegex,
      'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
    ),
  role: z.enum(['teacher', 'student']),
  phone: z
    .string()
    .regex(nepalPhoneRegex, 'Invalid Nepal phone number')
    .optional(),
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
    const partialSchema = createUserSchema
      .partial()
      .omit({ password: true, role: true });
    const body = partialSchema.parse(req.body);
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

export async function listClassesHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await listClassesWithSections();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function createOrUpdateClassHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const idParam = req.params.id;
    const id = idParam ? Number(idParam) : undefined;
    if (idParam && isNaN(Number(idParam))) {
      return res.status(400).json({ message: 'Invalid class ID' });
    }

    const body = z
      .object({
        name: z.string().min(1),
        isActive: z.boolean().optional(),
        sections: z.array(z.object({ id: z.number().optional(), name: z.string().min(1) })).optional(),
      })
      .parse(req.body);

    const result = await createOrUpdateClassWithSections(id, body);
    res.status(id ? 200 : 201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteClassHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid class ID' });
    }
    await deleteClassWithSections(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function listSubjectsHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await listSubjects();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function createSubjectHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = z
      .object({
        name: z.string().min(1),
        isActive: z.boolean().optional(),
      })
      .parse(req.body);
    const subject = await createSubject(body);
    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
}

export async function updateSubjectHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }
    const body = z
      .object({
        name: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
      })
      .parse(req.body);
    const subject = await updateSubject(id, body);
    res.json(subject);
  } catch (error) {
    next(error);
  }
}

export async function deleteSubjectHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }
    await deleteSubject(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function listRolesHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const roles = await listRoles();
    res.json(roles);
  } catch (error) {
    next(error);
  }
}

export async function createRoleHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = z.object({ name: z.string().min(1) }).parse(req.body);
    const role = await createRole(body);
    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
}

export async function deleteRoleHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid role ID' });
    }
    await deleteRole(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function listRoleAssignmentsHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await listRoleAssignments();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function updateRoleAssignmentsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = z
      .object({
        assignments: z.array(
          z.object({
            userId: z.number(),
            roleIds: z.array(z.number()),
          })
        ),
      })
      .parse(req.body);
    await updateRoleAssignments(body.assignments);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function teacherIdAvailabilityHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const teacherId = String(req.query.teacherId ?? '').trim();
    if (!teacherId) {
      return res.status(400).json({ message: 'teacherId is required' });
    }
    const result = await isTeacherIdAvailable(teacherId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

