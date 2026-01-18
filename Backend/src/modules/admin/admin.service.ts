import { User } from '../../models/User';
import { Notice } from '../../models/Notice';
import { Event } from '../../models/Event';
import { ClassAssignment } from '../../models/ClassAssignment';
import { AttendanceRecord } from '../../models/AttendanceRecord';
import { Exam } from '../../models/Exam';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';

export async function getAdminDashboardData() {
  const [students, teachers, notices, events, classes] = await Promise.all([
    User.findAll({ where: { role: 'student' } }),
    User.findAll({ where: { role: 'teacher' } }),
    Notice.findAll({ order: [['date', 'DESC']] }),
    Event.findAll({ order: [['date', 'ASC']] }),
    ClassAssignment.findAll(),
  ]);

  const stats = [
    { label: 'Total Students', value: students.length },
    { label: 'Total Teachers', value: teachers.length },
    { label: 'Total Classes', value: classes.length },
    { label: 'Active Notices', value: notices.length },
  ];

  const studentList = students.map((student) => ({
    id: student.id,
    name: student.name,
    class: student.class,
    rollNo: student.rollNumber,
    phone: student.phone,
    email: student.email,
    guardian: 'Parent/Guardian',
    status: 'Active',
    address: student.address,
  }));

  const teacherList = teachers.map((teacher) => {
    const assignedClasses = teacher.assignedClasses ?? [];
    return {
      id: teacher.id,
      name: teacher.name,
      teacherId: teacher.teacherId,
      subject: assignedClasses[0] ?? 'Mathematics',
      phone: teacher.phone,
      email: teacher.email,
      classes: assignedClasses,
      status: 'Active',
    };
  });

  return {
    stats,
    students: studentList,
    teachers: teacherList,
    notices,
    events,
    classes,
  };
}

export async function getReportsData() {
  const [students, attendanceRecords, exams] = await Promise.all([
    User.findAll({ where: { role: 'student' } }),
    AttendanceRecord.findAll({
      include: [{ model: User, as: 'student', attributes: ['class'] }],
    }),
    Exam.findAll(),
  ]);

  // Group students by class
  const studentsByClass = new Map<string, User[]>();
  students.forEach((student) => {
    const className = student.class ?? 'Unknown';
    if (!studentsByClass.has(className)) {
      studentsByClass.set(className, []);
    }
    studentsByClass.get(className)!.push(student);
  });

  // Calculate attendance by class
  const attendanceData = Array.from(studentsByClass.entries()).map(([className, classStudents]) => {
    const studentIds = classStudents.map((s) => s.id);
    const classAttendance = attendanceRecords.filter((ar) => studentIds.includes(ar.studentId));
    const present = classAttendance.filter((ar) => ar.status === 'Present').length;
    const absent = classAttendance.filter((ar) => ar.status === 'Absent').length;
    const total = present + absent;
    const percentage = total > 0 ? Math.round((present / total) * 100 * 10) / 10 : 0;

    return {
      class: className,
      present,
      absent,
      percentage,
    };
  });

  // Calculate performance by subject
  const performanceBySubject = new Map<string, { total: number; sum: number; pass: number; fail: number }>();
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
    
    results.forEach((result) => {
      if (!performanceBySubject.has(result.subject)) {
        performanceBySubject.set(result.subject, { total: 0, sum: 0, pass: 0, fail: 0 });
      }
      const stats = performanceBySubject.get(result.subject)!;
      stats.total += 1;
      stats.sum += result.obtained;
      if (result.obtained >= 40) {
        stats.pass += 1;
      } else {
        stats.fail += 1;
      }
    });
  });

  const performanceData = Array.from(performanceBySubject.entries()).map(([subject, stats]) => ({
    subject,
    average: stats.total > 0 ? Math.round((stats.sum / stats.total) * 10) / 10 : 0,
    pass: stats.total > 0 ? Math.round((stats.pass / stats.total) * 100) : 0,
    fail: stats.total > 0 ? Math.round((stats.fail / stats.total) * 100) : 0,
  }));

  // Calculate monthly trends (last 5 months)
  const now = new Date();
  const monthlyTrends = [];
  for (let i = 4; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = monthDate.toLocaleString('en-US', { month: 'short' });
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    const monthAttendance = attendanceRecords.filter((ar) => {
      const arDate = new Date(ar.date);
      return arDate >= monthStart && arDate <= monthEnd;
    });
    const monthPresent = monthAttendance.filter((ar) => ar.status === 'Present').length;
    const monthTotal = monthAttendance.length;
    const attendanceRate = monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 100 * 10) / 10 : 0;

    const monthExams = exams.filter((exam) => {
      const examDate = new Date(exam.date);
      return examDate >= monthStart && examDate <= monthEnd;
    });
    const avgPerformance = monthExams.length > 0
      ? Math.round((monthExams.reduce((sum, e) => sum + e.percentage, 0) / monthExams.length) * 10) / 10
      : 0;

    monthlyTrends.push({
      month: monthKey,
      attendance: attendanceRate,
      performance: avgPerformance,
    });
  }

  // Summary stats
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.filter((ar) => ar.date === today);
  const todayPresent = todayAttendance.filter((ar) => ar.status === 'Present').length;
  const todayAbsent = todayAttendance.filter((ar) => ar.status === 'Absent').length;
  const totalToday = todayPresent + todayAbsent;
  const attendanceRate = totalToday > 0 ? Math.round((todayPresent / totalToday) * 100 * 10) / 10 : 0;

  return {
    attendance: {
      summary: {
        totalStudents: students.length,
        presentToday: todayPresent,
        absentToday: todayAbsent,
        attendanceRate: `${attendanceRate}%`,
      },
      byClass: attendanceData,
      monthlyTrend: monthlyTrends,
    },
    performance: {
      bySubject: performanceData,
      monthlyTrend: monthlyTrends,
    },
    feedback: {
      distribution: [
        { name: 'Excellent', value: 45, color: '#10b981' },
        { name: 'Good', value: 35, color: '#3b82f6' },
        { name: 'Average', value: 15, color: '#f59e0b' },
        { name: 'Poor', value: 5, color: '#ef4444' },
      ],
    },
  };
}

export async function createNotice(data: { title: string; content: string; date: string; type: string }) {
  return await Notice.create(data);
}

export async function updateNotice(id: number, data: Partial<{ title: string; content: string; date: string; type: string }>) {
  const notice = await Notice.findByPk(id);
  if (!notice) {
    throw new Error('Notice not found');
  }
  await notice.update(data);
  return notice;
}

export async function deleteNotice(id: number) {
  const notice = await Notice.findByPk(id);
  if (!notice) {
    throw new Error('Notice not found');
  }
  await notice.destroy();
  return { success: true };
}

export async function createEvent(data: { title: string; date: string; time: string; venue: string }) {
  return await Event.create(data);
}

export async function updateEvent(id: number, data: Partial<{ title: string; date: string; time: string; venue: string }>) {
  const event = await Event.findByPk(id);
  if (!event) {
    throw new Error('Event not found');
  }
  await event.update(data);
  return event;
}

export async function deleteEvent(id: number) {
  const event = await Event.findByPk(id);
  if (!event) {
    throw new Error('Event not found');
  }
  await event.destroy();
  return { success: true };
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'teacher' | 'student';
  phone?: string;
  address?: string;
  class?: string;
  rollNumber?: string;
  teacherId?: string;
  assignedClasses?: string[];
}) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  
  const userData: any = {
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role,
    phone: data.phone,
    address: data.address,
    needsPasswordChange: true,
  };
  
  if (data.role === 'student') {
    userData.class = data.class;
    userData.rollNumber = data.rollNumber;
  } else if (data.role === 'teacher') {
    userData.teacherId = data.teacherId;
    userData.assignedClasses = data.assignedClasses ?? [];
  }
  
  const user = await User.create(userData);
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    class: user.class,
    rollNumber: user.rollNumber,
    teacherId: user.teacherId,
    assignedClasses: user.assignedClasses,
  };
}

export async function updateUser(id: number, data: Partial<{
  name: string;
  email: string;
  phone: string;
  address: string;
  class: string;
  rollNumber: string;
  teacherId: string;
  assignedClasses: string[];
}>) {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error('User not found');
  }
  await user.update(data);
  return user;
}

export async function deleteUser(id: number) {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error('User not found');
  }
  await user.destroy();
  return { success: true };
}
