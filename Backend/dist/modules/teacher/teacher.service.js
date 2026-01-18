"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeacherDashboard = getTeacherDashboard;
exports.uploadTeacherMaterial = uploadTeacherMaterial;
const sequelize_1 = require("sequelize");
const User_1 = require("../../models/User");
const ClassAssignment_1 = require("../../models/ClassAssignment");
const AttendanceRecord_1 = require("../../models/AttendanceRecord");
const Material_1 = require("../../models/Material");
const Notice_1 = require("../../models/Notice");
const Exam_1 = require("../../models/Exam");
const errorHandler_1 = require("../../middleware/errorHandler");
const cloudinary_service_1 = require("../../services/cloudinary.service");
function ensureTeacher(teacher) {
    if (!teacher || teacher.role !== 'teacher') {
        throw new errorHandler_1.HttpError(404, 'Teacher not found');
    }
}
async function getTeacherDashboard(teacherId) {
    const teacher = await User_1.User.findByPk(teacherId);
    ensureTeacher(teacher);
    const [classes, materials, notices] = await Promise.all([
        ClassAssignment_1.ClassAssignment.findAll({ where: { teacherId } }),
        Material_1.Material.findAll({ where: { teacherId }, order: [['uploadedOn', 'DESC']] }),
        Notice_1.Notice.findAll({ order: [['date', 'DESC']], limit: 5 }),
    ]);
    const classNames = classes.map((cls) => cls.name);
    const students = await User_1.User.findAll({
        where: {
            role: 'student',
            class: {
                [sequelize_1.Op.in]: classNames,
            },
        },
    });
    const studentIds = students.map((student) => student.id);
    const [attendanceRecords, exams] = await Promise.all([
        AttendanceRecord_1.AttendanceRecord.findAll({
            where: {
                studentId: {
                    [sequelize_1.Op.in]: studentIds,
                },
            },
            order: [['date', 'DESC']],
        }),
        Exam_1.Exam.findAll({
            where: {
                studentId: {
                    [sequelize_1.Op.in]: studentIds,
                },
            },
            order: [['date', 'DESC']],
        }),
    ]);
    const studentsById = new Map(students.map((student) => [student.id, student]));
    const attendanceByStudent = new Map();
    attendanceRecords.forEach((record) => {
        var _a;
        const list = (_a = attendanceByStudent.get(record.studentId)) !== null && _a !== void 0 ? _a : [];
        list.push(record);
        attendanceByStudent.set(record.studentId, list);
    });
    const examsByStudent = new Map();
    exams.forEach((exam) => {
        var _a;
        const list = (_a = examsByStudent.get(exam.studentId)) !== null && _a !== void 0 ? _a : [];
        list.push(exam);
        examsByStudent.set(exam.studentId, list);
    });
    const studentSummaries = students.map((student) => {
        var _a, _b, _c;
        const attendance = (_a = attendanceByStudent.get(student.id)) !== null && _a !== void 0 ? _a : [];
        const total = attendance.length;
        const present = attendance.filter((record) => record.status === 'Present').length;
        const percentage = total ? Math.round((present / total) * 100) : 0;
        const latestExam = ((_b = examsByStudent.get(student.id)) !== null && _b !== void 0 ? _b : [])[0];
        const latestPercentage = (_c = latestExam === null || latestExam === void 0 ? void 0 : latestExam.percentage) !== null && _c !== void 0 ? _c : null;
        let status = 'Needs Attention';
        if (percentage >= 90)
            status = 'Excellent';
        else if (percentage >= 80)
            status = 'Good';
        else if (percentage >= 65)
            status = 'Average';
        return {
            id: student.id,
            name: student.name,
            rollNo: student.rollNumber,
            class: student.class,
            attendance: percentage,
            lastExam: latestPercentage,
            status,
        };
    });
    const attendanceDetails = studentSummaries.map((summary) => {
        var _a;
        const records = ((_a = attendanceByStudent.get(summary.id)) !== null && _a !== void 0 ? _a : []).slice(0, 5).map((record) => ({
            date: record.date,
            status: record.status,
        }));
        const totalPresent = Math.round((summary.attendance / 100) * (records.length || 1));
        const totalAbsent = (records.length || 1) - totalPresent;
        return {
            studentName: summary.name,
            rollNo: summary.rollNo,
            class: summary.class,
            records,
            totalPresent,
            totalAbsent,
            percentage: summary.attendance,
        };
    });
    const existingMarksMap = new Map();
    exams.forEach((exam) => {
        const student = studentsById.get(exam.studentId);
        if (!student)
            return;
        exam.results.forEach((result) => {
            var _a, _b;
            const key = `${exam.exam}-${student.class}-${result.subject}`;
            if (!existingMarksMap.has(key)) {
                existingMarksMap.set(key, {
                    exam: exam.exam,
                    class: (_a = student.class) !== null && _a !== void 0 ? _a : 'Class 10',
                    subject: result.subject,
                    year: new Date(exam.date).getFullYear().toString(),
                    totalMarks: result.fullMarks,
                    students: [],
                });
            }
            (_b = existingMarksMap.get(key)) === null || _b === void 0 ? void 0 : _b.students.push({
                rollNo: student.rollNumber,
                name: student.name,
                marks: result.obtained,
            });
        });
    });
    const overviewStats = [
        { label: 'Total Classes', value: classes.length.toString() },
        { label: 'Total Students', value: students.length.toString() },
        { label: 'Pending Attendance', value: '0' },
        { label: 'Materials Uploaded', value: materials.length.toString() },
    ];
    const upcomingClasses = classes.map((cls) => {
        const [days, time] = cls.schedule.split('-').map((part) => part.trim());
        return {
            class: cls.name,
            subject: cls.subject,
            room: cls.room,
            time: time !== null && time !== void 0 ? time : cls.schedule,
            days,
        };
    });
    const noticesWithPriority = notices.map((notice) => ({
        id: notice.id,
        title: notice.title,
        content: notice.content,
        date: notice.date,
        priority: notice.type === 'Event' ? 'High' : 'Medium',
    }));
    const classesSummary = classes.map((cls) => ({
        id: cls.id,
        name: cls.name,
        subject: cls.subject,
        students: cls.students,
        schedule: cls.schedule,
    }));
    const attendanceStudents = students.map((student) => {
        var _a, _b;
        const records = (_a = attendanceByStudent.get(student.id)) !== null && _a !== void 0 ? _a : [];
        const latestStatus = ((_b = records[0]) === null || _b === void 0 ? void 0 : _b.status) === 'Absent' ? 'absent' : 'present';
        return {
            id: student.id,
            name: student.name,
            rollNo: student.rollNumber,
            class: student.class,
            status: latestStatus,
        };
    });
    const teacherClasses = Array.from(new Set(classes.map((cls) => cls.name)));
    const materialClasses = Array.from(new Set(materials.map((material) => material.class)));
    const materialSubjects = Array.from(new Set(materials.map((material) => material.subject)));
    const examNames = Array.from(new Set(exams.map((exam) => exam.exam)));
    const examSubjects = new Set();
    exams.forEach((exam) => {
        exam.results.forEach((result) => examSubjects.add(result.subject));
    });
    return {
        overview: {
            stats: overviewStats,
            schedule: upcomingClasses,
            notices: noticesWithPriority,
        },
        classes: {
            assigned: classesSummary,
            students: studentSummaries,
        },
        attendance: {
            classes: teacherClasses,
            students: attendanceStudents,
            pendingRequests: [],
            details: attendanceDetails,
        },
        materials: {
            classes: materialClasses,
            subjects: materialSubjects,
            uploads: materials,
        },
        exams: {
            classes: teacherClasses,
            exams: examNames,
            subjects: Array.from(examSubjects),
            students: studentSummaries.map((student) => ({
                id: student.id,
                name: student.name,
                rollNo: student.rollNo,
            })),
            existingMarks: Array.from(existingMarksMap.values()),
        },
    };
}
async function uploadTeacherMaterial(teacherId, payload) {
    const teacher = await User_1.User.findByPk(teacherId);
    ensureTeacher(teacher);
    if (!payload.file) {
        throw new errorHandler_1.HttpError(400, 'File is required');
    }
    const upload = await (0, cloudinary_service_1.uploadImageFromBuffer)(payload.file.buffer, payload.file.mimetype, 'sushil-school/materials', 'auto');
    const material = await Material_1.Material.create({
        title: payload.title,
        subject: payload.subject,
        class: payload.className,
        type: payload.file.mimetype,
        size: payload.size,
        uploadedByName: teacher.name,
        uploadedOn: new Date(),
        url: upload.secure_url,
        teacherId: teacher.id,
    });
    return material;
}
//# sourceMappingURL=teacher.service.js.map