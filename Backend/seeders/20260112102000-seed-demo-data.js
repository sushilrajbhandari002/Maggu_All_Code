'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const hash = (pwd) => bcrypt.hash(pwd, 10);

    // Users
    const additionalStudents = [
      {
        email: 'aditya.sharma@student.sushilschool.edu',
        passwordHash: await hash('student123'),
        role: 'student',
        name: 'Aditya Sharma',
        username: 'aditya.sharma',
        class: 'Class 10A',
        rollNumber: '103',
        phone: '+1234567894',
        address: '456 Cedar St, City',
        needsPasswordChange: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        email: 'priya.patel@student.sushilschool.edu',
        passwordHash: await hash('student123'),
        role: 'student',
        name: 'Priya Patel',
        username: 'priya.patel',
        class: 'Class 10A',
        rollNumber: '104',
        phone: '+1234567895',
        address: '789 Willow Rd, City',
        needsPasswordChange: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        email: 'rahul.kumar@student.sushilschool.edu',
        passwordHash: await hash('student123'),
        role: 'student',
        name: 'Rahul Kumar',
        username: 'rahul.kumar',
        class: 'Class 10A',
        rollNumber: '105',
        phone: '+1234567896',
        address: '321 Oak Ln, City',
        needsPasswordChange: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        email: 'sneha.singh@student.sushilschool.edu',
        passwordHash: await hash('student123'),
        role: 'student',
        name: 'Sneha Singh',
        username: 'sneha.singh',
        class: 'Class 10A',
        rollNumber: '106',
        phone: '+1234567897',
        address: '654 Pine St, City',
        needsPasswordChange: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        email: 'arjun.verma@student.sushilschool.edu',
        passwordHash: await hash('student123'),
        role: 'student',
        name: 'Arjun Verma',
        username: 'arjun.verma',
        class: 'Class 10A',
        rollNumber: '107',
        phone: '+1234567898',
        address: '987 Birch Ave, City',
        needsPasswordChange: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        email: 'ananya.gupta@student.sushilschool.edu',
        passwordHash: await hash('student123'),
        role: 'student',
        name: 'Ananya Gupta',
        username: 'ananya.gupta',
        class: 'Class 10A',
        rollNumber: '108',
        phone: '+1234567899',
        address: '159 Maple Ave, City',
        needsPasswordChange: false,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert('users', [
      {
        email: 'admin@sushilschool.edu',
        passwordHash: await hash('admin123'),
        role: 'admin',
        name: 'Super Admin',
        needsPasswordChange: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        email: 'john.doe@sushilschool.edu',
        passwordHash: await hash('teacher123'),
        role: 'teacher',
        name: 'John Doe',
        username: 'john.doe',
        teacherId: 'T001',
        phone: '+1234567890',
        address: '123 Main St, City',
        classTeacherOf: 'Class 10A',
        assignedClasses: JSON.stringify(['Class 10A', 'Class 9B', 'Class 8C']),
        needsPasswordChange: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        email: 'sarah.smith@sushilschool.edu',
        passwordHash: await hash('teacher123'),
        role: 'teacher',
        name: 'Sarah Smith',
        username: 'sarah.smith',
        teacherId: 'T002',
        phone: '+1234567891',
        address: '456 Oak Ave, City',
        assignedClasses: JSON.stringify(['Class 7A', 'Class 6B']),
        needsPasswordChange: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        email: 'alice.johnson@student.sushilschool.edu',
        passwordHash: await hash('student123'),
        role: 'student',
        name: 'Alice Johnson',
        username: 'alice.johnson',
        phone: '+1234567892',
        address: '789 Pine Rd, City',
        class: 'Class 10A',
        rollNumber: '101',
        needsPasswordChange: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        email: 'bob.wilson@student.sushilschool.edu',
        passwordHash: await hash('student123'),
        role: 'student',
        name: 'Bob Wilson',
        username: 'bob.wilson',
        phone: '+1234567893',
        address: '321 Elm St, City',
        class: 'Class 10A',
        rollNumber: '102',
        needsPasswordChange: false,
        createdAt: now,
        updatedAt: now,
      },
      ...additionalStudents,
    ]);

    const [users] = await queryInterface.sequelize.query(
      "SELECT id, email FROM users WHERE email IN ('admin@sushilschool.edu','john.doe@sushilschool.edu','sarah.smith@sushilschool.edu','alice.johnson@student.sushilschool.edu','bob.wilson@student.sushilschool.edu');"
    );
    const userIds = Object.fromEntries(users.map((u) => [u.email, u.id]));

    // Notices
    await queryInterface.bulkInsert('notices', [
      {
        title: 'Annual Sports Day',
        content:
          'Annual Sports Day will be held on December 20th, 2025. All students must participate.',
        date: '2025-12-10',
        type: 'Event',
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Winter Break Announcement',
        content:
          'School will remain closed from December 25th to January 5th for winter break.',
        date: '2025-12-08',
        type: 'Notice',
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Parent-Teacher Meeting',
        content:
          'Parent-Teacher meeting scheduled for December 18th. Parents are requested to attend.',
        date: '2025-12-07',
        type: 'Meeting',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Events
    await queryInterface.bulkInsert('events', [
      {
        title: 'Science Exhibition',
        date: '2025-12-15',
        time: '10:00 AM',
        venue: 'School Auditorium',
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Annual Sports Day',
        date: '2025-12-20',
        time: '8:00 AM',
        venue: 'School Ground',
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Cultural Program',
        date: '2025-12-22',
        time: '2:00 PM',
        venue: 'School Auditorium',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Attendance records for Alice
    const decemberRecords = [
      { date: '2025-12-12', status: 'Present', time: '08:15 AM', location: 'School Campus' },
      { date: '2025-12-11', status: 'Present', time: '08:10 AM', location: 'School Campus' },
      { date: '2025-12-10', status: 'Present', time: '08:20 AM', location: 'School Campus' },
      { date: '2025-12-09', status: 'Absent', time: '-', location: '-' },
      { date: '2025-12-08', status: 'Present', time: '08:05 AM', location: 'School Campus' },
      { date: '2025-12-07', status: 'Present', time: '08:12 AM', location: 'School Campus' },
      { date: '2025-12-06', status: 'Present', time: '08:18 AM', location: 'School Campus' },
      { date: '2025-12-05', status: 'Absent', time: '-', location: '-' },
    ];

    const novemberRecords = [
      { date: '2025-11-22', status: 'Present', time: '08:05 AM', location: 'School Campus' },
      { date: '2025-11-21', status: 'Present', time: '08:12 AM', location: 'School Campus' },
      { date: '2025-11-20', status: 'Absent', time: '-', location: '-' },
      { date: '2025-11-19', status: 'Present', time: '08:09 AM', location: 'School Campus' },
      { date: '2025-11-18', status: 'Present', time: '08:03 AM', location: 'School Campus' },
    ];

    const octoberRecords = [
      { date: '2025-10-15', status: 'Present', time: '08:07 AM', location: 'School Campus' },
      { date: '2025-10-14', status: 'Present', time: '08:11 AM', location: 'School Campus' },
      { date: '2025-10-13', status: 'Present', time: '08:16 AM', location: 'School Campus' },
      { date: '2025-10-12', status: 'Absent', time: '-', location: '-' },
      { date: '2025-10-11', status: 'Present', time: '08:10 AM', location: 'School Campus' },
    ];

    const attendanceRecords = [...decemberRecords, ...novemberRecords, ...octoberRecords].map((record) => ({
      ...record,
      studentId: userIds['alice.johnson@student.sushilschool.edu'],
      createdAt: now,
      updatedAt: now,
    }));
    await queryInterface.bulkInsert('attendance_records', attendanceRecords);

    // Exams
    await queryInterface.bulkInsert('exams', [
      {
        studentId: userIds['alice.johnson@student.sushilschool.edu'],
        exam: 'Half Yearly Examination 2025',
        date: '2025-11-15',
        results: JSON.stringify([
          { subject: 'Mathematics', fullMarks: 100, obtained: 92, grade: 'A+' },
          { subject: 'English', fullMarks: 100, obtained: 88, grade: 'A+' },
          { subject: 'Science', fullMarks: 100, obtained: 85, grade: 'A' },
          { subject: 'Social Studies', fullMarks: 100, obtained: 90, grade: 'A+' },
          { subject: 'Hindi', fullMarks: 100, obtained: 82, grade: 'A' },
          { subject: 'Computer', fullMarks: 50, obtained: 45, grade: 'A+' },
        ]),
        totalObtained: 482,
        totalMarks: 550,
        percentage: 87.6,
        rank: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        studentId: userIds['alice.johnson@student.sushilschool.edu'],
        exam: 'First Term Examination 2025',
        date: '2025-09-20',
        results: JSON.stringify([
          { subject: 'Mathematics', fullMarks: 100, obtained: 88, grade: 'A+' },
          { subject: 'English', fullMarks: 100, obtained: 85, grade: 'A' },
          { subject: 'Science', fullMarks: 100, obtained: 90, grade: 'A+' },
          { subject: 'Social Studies', fullMarks: 100, obtained: 87, grade: 'A+' },
          { subject: 'Hindi', fullMarks: 100, obtained: 80, grade: 'A' },
          { subject: 'Computer', fullMarks: 50, obtained: 42, grade: 'A' },
        ]),
        totalObtained: 472,
        totalMarks: 550,
        percentage: 85.8,
        rank: 5,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Materials
    const materials = [
      {
        title: 'Quadratic Equations - Chapter Notes',
        subject: 'Mathematics',
        class: 'Class 10',
        type: 'PDF',
        size: '2.5 MB',
        uploadedByName: 'Mr. Sharma',
        uploadedOn: '2025-12-10',
        url: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
        teacherId: userIds['john.doe@sushilschool.edu'],
      },
      {
        title: 'Periodic Table and Chemical Bonding',
        subject: 'Science',
        class: 'Class 10',
        type: 'PDF',
        size: '3.2 MB',
        uploadedByName: 'Dr. Kumar',
        uploadedOn: '2025-12-09',
        url: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
        teacherId: userIds['john.doe@sushilschool.edu'],
      },
      {
        title: 'Shakespeare - Merchant of Venice Summary',
        subject: 'English',
        class: 'Class 10',
        type: 'DOCX',
        size: '1.8 MB',
        uploadedByName: 'Ms. Patel',
        uploadedOn: '2025-12-08',
        url: 'https://res.cloudinary.com/demo/image/upload/sample.docx',
        teacherId: userIds['sarah.smith@sushilschool.edu'],
      },
    ].map((material) => ({
      ...material,
      createdAt: now,
      updatedAt: now,
    }));
    await queryInterface.bulkInsert('materials', materials);

    // Routine slots
    const routineSlots = [
      { day: 'Monday', time: '8:00-9:00', subject: 'Mathematics' },
      { day: 'Monday', time: '9:00-10:00', subject: 'English' },
      { day: 'Monday', time: '10:30-11:30', subject: 'Science' },
      { day: 'Tuesday', time: '8:00-9:00', subject: 'Science' },
      { day: 'Tuesday', time: '9:00-10:00', subject: 'Mathematics' },
    ].map((slot) => ({
      className: 'Class 10A',
      teacher: 'Multiple',
      ...slot,
      createdAt: now,
      updatedAt: now,
    }));
    await queryInterface.bulkInsert('routine_slots', routineSlots);

    // Class assignments
    const classAssignments = [
      {
        name: 'Class 10-A',
        subject: 'Mathematics',
        students: 35,
        schedule: 'Mon, Wed, Fri - 8:00 AM',
        room: 'Room 201',
      },
      {
        name: 'Class 10-B',
        subject: 'Mathematics',
        students: 32,
        schedule: 'Mon, Wed, Fri - 9:00 AM',
        room: 'Room 202',
      },
      {
        name: 'Class 9-A',
        subject: 'Mathematics',
        students: 38,
        schedule: 'Tue, Thu - 10:30 AM',
        room: 'Room 201',
      },
    ].map((assignment) => ({
      ...assignment,
      teacherId: userIds['john.doe@sushilschool.edu'],
      createdAt: now,
      updatedAt: now,
    }));
    await queryInterface.bulkInsert('class_assignments', classAssignments);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('class_assignments', null, {});
    await queryInterface.bulkDelete('routine_slots', null, {});
    await queryInterface.bulkDelete('materials', null, {});
    await queryInterface.bulkDelete('exams', null, {});
    await queryInterface.bulkDelete('attendance_records', null, {});
    await queryInterface.bulkDelete('events', null, {});
    await queryInterface.bulkDelete('notices', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
