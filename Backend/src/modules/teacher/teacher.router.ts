import { Router } from 'express';
import { teacherDashboardHandler, teacherMaterialUploadHandler } from './teacher.controller';
import { upload } from '../../utils/upload';

export const teacherRouter = Router();

teacherRouter.get('/:teacherId/dashboard', teacherDashboardHandler);
teacherRouter.post('/:teacherId/materials', upload.single('file'), teacherMaterialUploadHandler);

