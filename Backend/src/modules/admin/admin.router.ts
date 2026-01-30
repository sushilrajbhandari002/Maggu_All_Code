import { Router } from 'express';
import {
  adminDashboardHandler,
  reportsHandler,
  createNoticeHandler,
  updateNoticeHandler,
  deleteNoticeHandler,
  createEventHandler,
  updateEventHandler,
  deleteEventHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  listClassesHandler,
  createOrUpdateClassHandler,
  deleteClassHandler,
  listSubjectsHandler,
  createSubjectHandler,
  updateSubjectHandler,
  deleteSubjectHandler,
  listRolesHandler,
  createRoleHandler,
  deleteRoleHandler,
  listRoleAssignmentsHandler,
  updateRoleAssignmentsHandler,
  teacherIdAvailabilityHandler,
} from './admin.controller';

export const adminRouter = Router();

adminRouter.get('/dashboard', adminDashboardHandler);
adminRouter.get('/reports', reportsHandler);

// Notices CRUD
adminRouter.post('/notices', createNoticeHandler);
adminRouter.put('/notices/:id', updateNoticeHandler);
adminRouter.delete('/notices/:id', deleteNoticeHandler);

// Events CRUD
adminRouter.post('/events', createEventHandler);
adminRouter.put('/events/:id', updateEventHandler);
adminRouter.delete('/events/:id', deleteEventHandler);

// Users CRUD
adminRouter.post('/users', createUserHandler);
adminRouter.put('/users/:id', updateUserHandler);
adminRouter.delete('/users/:id', deleteUserHandler);

// Classes & sections
adminRouter.get('/classes', listClassesHandler);
adminRouter.post('/classes', createOrUpdateClassHandler);
adminRouter.put('/classes/:id', createOrUpdateClassHandler);
adminRouter.delete('/classes/:id', deleteClassHandler);

// Subjects
adminRouter.get('/subjects', listSubjectsHandler);
adminRouter.post('/subjects', createSubjectHandler);
adminRouter.put('/subjects/:id', updateSubjectHandler);
adminRouter.delete('/subjects/:id', deleteSubjectHandler);

// Roles
adminRouter.get('/roles', listRolesHandler);
adminRouter.post('/roles', createRoleHandler);
adminRouter.delete('/roles/:id', deleteRoleHandler);

// Role assignments
adminRouter.get('/role-assignments', listRoleAssignmentsHandler);
adminRouter.put('/role-assignments', updateRoleAssignmentsHandler);

// Teacher ID availability
adminRouter.get('/teacher-id/availability', teacherIdAvailabilityHandler);

