import { Op } from 'sequelize';
import { User } from '../../models/User';
import { ClassAssignment } from '../../models/ClassAssignment';
import { AttendanceRecord } from '../../models/AttendanceRecord';
import { Material } from '../../models/Material';
import { Notice } from '../../models/Notice';
import { Exam } from '../../models/Exam';
import { HttpError } from '../../middleware/errorHandler';
import { uploadImageFromBuffer } from '../../services/cloudinary.service';

function ensureTeacher(teacher: User | null): asserts teacher is User {
  if (!teacher || teacher.role !== 'teacher') {
    throw new HttpError(404, 'Teacher not found');
  }
}

export async function getTeacherDashboard(teacherId: number) {
  const teacher = await User.findByPk(teacherId);
  ensureTeacher(teacher);

  const [classes, materials, notices] = await Promise.all([
    ClassAssignment.findAll({ where: { teacherId } }),
    Material.findAll({ where: { teacherId }, order: [['uploadedOn', 'DESC']] }),
    Notice.findAll({ order: [['date', 'DESC']], limit: 5 }),
  ]);

  const classNames = classes.map((cls) => cls.name);
  const students = await User.findAll({
    where: {
      role: 'student',
      class: {
        [Op.in]: classNames,
      },
    },
  });
  const studentIds = students.map((student) => student.id);

  const [attendanceRecords, exams] = await Promise.all([
    AttendanceRecord.findAll({
      where: {
        studentId: {
          [Op.in]: studentIds,
        },
      },
      order: [['date', 'DESC']],
    }),
    Exam.findAll({
      where: {
        studentId: {
          [Op.in]: studentIds,
        },
      },
      order: [['date', 'DESC']],
    }),
  ]);

  const studentsById = new Map(students.map((student) => [student.id, student]));

  const attendanceByStudent = new Map<number, AttendanceRecord[]>();
  attendanceRecords.forEach((record) => {
    const list = attendanceByStudent.get(record.studentId) ?? [];
    list.push(record);
    attendanceByStudent.set(record.studentId, list);
  });

  const examsByStudent = new Map<number, Exam[]>();
  exams.forEach((exam) => {
    const list = examsByStudent.get(exam.studentId) ?? [];
    list.push(exam);
    examsByStudent.set(exam.studentId, list);
  });

  const studentSummaries = students.map((student) => {
    const attendance = attendanceByStudent.get(student.id) ?? [];
    const total = attendance.length;
    const present = attendance.filter((record) => record.status === 'Present').length;
    const percentage = total ? Math.round((present / total) * 100) : 0;
    const latestExam = (examsByStudent.get(student.id) ?? [])[0];
    const latestPercentage = latestExam?.percentage ?? null;

    let status: 'Excellent' | 'Good' | 'Average' | 'Needs Attention' = 'Needs Attention';
    if (percentage >= 90) status = 'Excellent';
    else if (percentage >= 80) status = 'Good';
    else if (percentage >= 65) status = 'Average';

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
    const records = (attendanceByStudent.get(summary.id) ?? []).slice(0, 5).map((record) => ({
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

  const existingMarksMap = new Map<
    string,
    {
      exam: string;
      class: string;
      subject: string;
      year: string;
      totalMarks: number;
      students: { rollNo?: string | null; name: string; marks: number }[];
    }
  >();

  exams.forEach((exam) => {
    const student = studentsById.get(exam.studentId);
    if (!student) return;
    
    // Ensure results is an array - parse if it's a string, use empty array if null/undefined
    let results: Exam['results'] = [];
    if (exam.results) {
      if (typeof exam.results === 'string') {
        try {
          results = JSON.parse(exam.results);
        } catch {
          results = [];
        }
      } else if (Array.isArray(exam.results)) {
        results = exam.results;
      }
    }
    
    results.forEach((result) => {
      const key = `${exam.exam}-${student.class}-${result.subject}`;
      if (!existingMarksMap.has(key)) {
        existingMarksMap.set(key, {
          exam: exam.exam,
          class: student.class ?? 'Class 10',
          subject: result.subject,
          year: new Date(exam.date).getFullYear().toString(),
          totalMarks: result.fullMarks,
          students: [],
        });
      }
      existingMarksMap.get(key)?.students.push({
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
      time: time ?? cls.schedule,
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
    const records = attendanceByStudent.get(student.id) ?? [];
    const latestStatus = records[0]?.status === 'Absent' ? 'absent' : 'present';
    return {
      id: student.id,
      name: student.name,
      rollNo: student.rollNumber,
      class: student.class,
      status: latestStatus as 'present' | 'absent',
    };
  });

  const teacherClasses = Array.from(new Set(classes.map((cls) => cls.name)));
  const materialClasses = Array.from(new Set(materials.map((material) => material.class)));
  const materialSubjects = Array.from(new Set(materials.map((material) => material.subject)));

  const examNames = Array.from(new Set(exams.map((exam) => exam.exam)));
  const examSubjects = new Set<string>();
  exams.forEach((exam) => {
    // Ensure results is an array - parse if it's a string, use empty array if null/undefined
    let results: Exam['results'] = [];
    if (exam.results) {
      if (typeof exam.results === 'string') {
        try {
          results = JSON.parse(exam.results);
        } catch {
          results = [];
        }
      } else if (Array.isArray(exam.results)) {
        results = exam.results;
      }
    }
    
    results.forEach((result) => examSubjects.add(result.subject));
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

export async function uploadTeacherMaterial(
  teacherId: number,
  payload: {
    title: string;
    subject: string;
    className: string;
    size: string;
    file?: { buffer: Buffer; mimetype: string };
  }
) {
  const teacher = await User.findByPk(teacherId);
  ensureTeacher(teacher);

  if (!payload.file) {
    throw new HttpError(400, 'File is required');
  }

  const upload = await uploadImageFromBuffer(
    payload.file.buffer,
    payload.file.mimetype,
    'sushil-school/materials',
    'auto'
  );

  const material = await Material.create({
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
