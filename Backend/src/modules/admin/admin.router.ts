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
