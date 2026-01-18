import { Router } from 'express';
import {
  studentOverviewHandler,
  studentAttendanceHandler,
  studentAcademicsHandler,
  studentMaterialsHandler,
  studentAttendanceSubmitHandler,
} from './student.controller';
import { upload } from '../../utils/upload';

export const studentRouter = Router();

studentRouter.get('/:studentId/overview', studentOverviewHandler);
studentRouter.get('/:studentId/attendance', studentAttendanceHandler);
studentRouter.post(
  '/:studentId/attendance',
  upload.single('photo'),
  studentAttendanceSubmitHandler
);
studentRouter.get('/:studentId/academics', studentAcademicsHandler);
studentRouter.get('/:studentId/materials', studentMaterialsHandler);

