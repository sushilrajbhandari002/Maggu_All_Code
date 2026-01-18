"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherRouter = void 0;
const express_1 = require("express");
const teacher_controller_1 = require("./teacher.controller");
const upload_1 = require("../../utils/upload");
exports.teacherRouter = (0, express_1.Router)();
exports.teacherRouter.get('/:teacherId/dashboard', teacher_controller_1.teacherDashboardHandler);
exports.teacherRouter.post('/:teacherId/materials', upload_1.upload.single('file'), teacher_controller_1.teacherMaterialUploadHandler);
//# sourceMappingURL=teacher.router.js.map