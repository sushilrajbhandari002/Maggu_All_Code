"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentOverviewHandler = studentOverviewHandler;
exports.studentAttendanceHandler = studentAttendanceHandler;
exports.studentAttendanceSubmitHandler = studentAttendanceSubmitHandler;
exports.studentAcademicsHandler = studentAcademicsHandler;
exports.studentMaterialsHandler = studentMaterialsHandler;
const zod_1 = require("zod");
const student_service_1 = require("./student.service");
const idParamSchema = zod_1.z.object({
    studentId: zod_1.z.coerce.number(),
});
async function studentOverviewHandler(req, res, next) {
    try {
        const { studentId } = idParamSchema.parse(req.params);
        const data = await (0, student_service_1.getStudentOverview)(studentId);
        res.json(data);
    }
    catch (error) {
        next(error);
    }
}
async function studentAttendanceHandler(req, res, next) {
    try {
        const { studentId } = idParamSchema.parse(req.params);
        const data = await (0, student_service_1.getStudentAttendance)(studentId);
        res.json(data);
    }
    catch (error) {
        next(error);
    }
}
const attendanceBodySchema = zod_1.z.object({
    location: zod_1.z.string().min(1),
});
async function studentAttendanceSubmitHandler(req, res, next) {
    try {
        const { studentId } = idParamSchema.parse(req.params);
        const { location } = attendanceBodySchema.parse(req.body);
        const photo = req.file
            ? {
                buffer: req.file.buffer,
                mimetype: req.file.mimetype,
            }
            : undefined;
        const result = await (0, student_service_1.submitStudentAttendance)(studentId, { location, photo });
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
async function studentAcademicsHandler(req, res, next) {
    try {
        const { studentId } = idParamSchema.parse(req.params);
        const data = await (0, student_service_1.getStudentAcademics)(studentId);
        res.json(data);
    }
    catch (error) {
        next(error);
    }
}
async function studentMaterialsHandler(req, res, next) {
    try {
        const { studentId } = idParamSchema.parse(req.params);
        const data = await (0, student_service_1.getStudentMaterials)(studentId);
        res.json(data);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=student.controller.js.map