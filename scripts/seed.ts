// Seed script — populates the database with realistic demo data.
// Run: `bun run scripts/seed.ts` (or `bunx tsx scripts/seed.ts`)

import { db } from '../src/lib/db';

const STUDENT_NAMES_CSE_A = [
  'Aarav Kumar', 'Priya Sharma', 'Rahul Reddy', 'Ananya Patel', 'Vignesh Iyer',
  'Sneha Reddy', 'Karthik Rao', 'Divya Nair', 'Arjun Nair', 'Meera Joshi',
];

const STUDENT_NAMES_CSE_B = [
  'Rohit Gupta', 'Kavya Menon', 'Sanjay Verma', 'Pooja Reddy', 'Aditya Singh',
  'Ishita Agarwal', 'Nikhil Bose', 'Riya Malhotra', 'Tarun Pillai', 'Avani Desai',
];

const STUDENT_NAMES_IT_A = [
  'Vivek Anand', 'Trisha Krishnan', 'Manish Yadav', 'Sahana Rao', 'Akash Mehta',
  'Lavanya Reddy', 'Ravi Teja', 'Meghna Shetty', 'Deepak Joshi', 'Sara Khan',
];

const PARENT_SURNAMES = [
  'Kumar', 'Sharma', 'Reddy', 'Patel', 'Iyer', 'Nair', 'Rao', 'Joshi',
  'Menon', 'Verma', 'Singh', 'Agarwal', 'Bose', 'Malhotra', 'Pillai', 'Desai',
  'Anand', 'Krishnan', 'Yadav', 'Mehta', 'Shetty', 'Khan',
];

function rollFor(i: number): string {
  return String(i + 1).padStart(2, '0');
}

function randomPhone(): string {
  const prefix = ['98', '99', '91', '90', '93'];
  let p = prefix[Math.floor(Math.random() * prefix.length)];
  for (let i = 0; i < 8; i++) p += String(Math.floor(Math.random() * 10));
  return p;
}

function makeParentName(studentName: string): string {
  // Parent is "Mr./Mrs. <surname>"
  const parts = studentName.trim().split(' ');
  const surname = parts[parts.length - 1];
  // Randomly choose Mr. or Mrs.
  const honorific = Math.random() > 0.5 ? 'Mr.' : 'Mrs.';
  return `${honorific} ${surname}`;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function seed() {
  console.log('🌱 Seeding database…');

  // Clean existing data
  await db.notification.deleteMany();
  await db.feedback.deleteMany();
  await db.anomaly.deleteMany();
  await db.attendanceRecord.deleteMany();
  await db.attendanceSession.deleteMany();
  await db.mark.deleteMany();
  await db.subject.deleteMany();
  await db.parent.deleteMany();
  await db.student.deleteMany();
  await db.teacher.deleteMany();
  await db.user.deleteMany();
  await db.holiday.deleteMany();
  await db.timetable.deleteMany();
  await db.exam.deleteMany();

  // 1. Create admin user
  const adminUser = await db.user.create({
    data: {
      email: 'admin@school.com',
      password: 'admin123',
      name: 'Dr. Seshadri Rao',
      role: 'ADMIN',
      phone: '9876543210',
    },
  });

  // 2. Create 3 teachers + users
  const teacherData = [
    { name: 'Mr. Rajesh Kumar', email: 'teacher@school.com', subject: 'Mathematics', classes: ['CSE-A', 'CSE-B', 'IT-A'] },
    { name: 'Ms. Lakshmi Devi', email: 'lakshmi@school.com', subject: 'Computer Science', classes: ['CSE-A', 'IT-A'] },
    { name: 'Mr. Suresh Reddy', email: 'suresh@school.com', subject: 'Physics', classes: ['CSE-B'] },
  ];

  const teachers: { id: string; name: string; subject: string; classes: string[]; userId: string }[] = [];
  for (const t of teacherData) {
    const password = t.email === 'teacher@school.com' ? 'teacher123' : 'teacher123';
    const user = await db.user.create({
      data: {
        email: t.email,
        password,
        name: t.name,
        role: 'TEACHER',
        phone: randomPhone(),
      },
    });
    const teacher = await db.teacher.create({
      data: {
        userId: user.id,
        name: t.name,
        email: t.email,
        phone: user.phone,
        subject: t.subject,
        classes: JSON.stringify(t.classes),
      },
    });
    await db.user.update({ where: { id: user.id }, data: { linkedId: teacher.id } });
    teachers.push({ id: teacher.id, name: t.name, subject: t.subject, classes: t.classes, userId: user.id });
  }

  // 3. Create 30 students across 3 classes
  const classData = [
    { className: 'CSE-A', cls: 'CSE', section: 'A', names: STUDENT_NAMES_CSE_A },
    { className: 'CSE-B', cls: 'CSE', section: 'B', names: STUDENT_NAMES_CSE_B },
    { className: 'IT-A', cls: 'IT', section: 'A', names: STUDENT_NAMES_IT_A },
  ];

  const studentsByClass: Record<string, { id: string; name: string; rollNumber: string; className: string }[]> = {};

  for (const cd of classData) {
    studentsByClass[cd.className] = [];
    for (let i = 0; i < cd.names.length; i++) {
      const name = cd.names[i];
      const parentName = makeParentName(name);
      const student = await db.student.create({
        data: {
          rollNumber: rollFor(i),
          name,
          class: cd.cls,
          section: cd.section,
          className: cd.className,
          parentName,
          parentPhone: randomPhone(),
          attendancePercentage: 90 + Math.random() * 9,
          totalAttended: 40,
          totalSessions: 45,
        },
      });
      studentsByClass[cd.className].push({ id: student.id, name: student.name, rollNumber: student.rollNumber, className: cd.className });
    }
  }

  // 4. Assign low attendance to a few students (below 75%)
  const lowAttendancePicks = [
    studentsByClass['CSE-A'][1], // Priya Sharma
    studentsByClass['CSE-B'][2], // Sanjay Verma
    studentsByClass['IT-A'][3],  // Sahana Rao
  ];
  for (const s of lowAttendancePicks) {
    await db.student.update({
      where: { id: s.id },
      data: {
        attendancePercentage: 65 + Math.random() * 8, // 65-73%
        totalAttended: 28,
        totalSessions: 45,
      },
    });
  }

  // 5. Create subjects per class
  const subjectsByClass: Record<string, { id: string; name: string }[]> = {};
  const subjectMaster: Record<string, string[]> = {
    'CSE-A': ['Mathematics', 'Computer Science', 'English'],
    'CSE-B': ['Mathematics', 'Physics', 'English'],
    'IT-A': ['Computer Science', 'Mathematics', 'Data Structures'],
  };

  for (const className of Object.keys(subjectMaster)) {
    subjectsByClass[className] = [];
    for (const subjName of subjectMaster[className]) {
      // Find a teacher that teaches this subject (or default to Rajesh)
      const teacher = teachers.find((t) => t.subject === subjName) || teachers[0];
      const subj = await db.subject.create({
        data: {
          name: subjName,
          code: subjName.slice(0, 3).toUpperCase() + '-' + className.split('-')[1],
          className,
          teacherId: teacher.id,
        },
      });
      subjectsByClass[className].push({ id: subj.id, name: subj.name });
    }
  }

  // 6. Create parent user for Aarav Kumar (CSE-A, roll 01)
  const aarav = studentsByClass['CSE-A'][0];
  const parentUser = await db.user.create({
    data: {
      email: 'parent@school.com',
      password: 'parent123',
      name: 'Mr. Anil Kumar',
      role: 'PARENT',
      phone: randomPhone(),
    },
  });
  const parentRecord = await db.parent.create({
    data: {
      userId: parentUser.id,
      name: 'Mr. Anil Kumar',
      email: 'parent@school.com',
      phone: parentUser.phone,
      studentId: aarav.id,
    },
  });
  await db.user.update({ where: { id: parentUser.id }, data: { linkedId: parentRecord.id } });

  // 6b. Create student user for Aarav Kumar (so they can login as a Student)
  const studentUser = await db.user.create({
    data: {
      email: 'student@school.com',
      password: 'student123',
      name: 'Aarav Kumar',
      role: 'STUDENT',
      phone: randomPhone(),
      linkedId: aarav.id, // points to the Student record
    },
  });

  // Also create parent users for a few other students so notifications can flow
  const additionalParentStudents = [
    studentsByClass['CSE-A'][1], // Priya
    studentsByClass['CSE-A'][2], // Rahul
    studentsByClass['CSE-A'][3], // Ananya
  ];
  const otherParentUsers: { userId: string; parentId: string; studentId: string }[] = [];
  for (const s of additionalParentStudents) {
    const pu = await db.user.create({
      data: {
        email: `parent.${s.name.split(' ')[0].toLowerCase()}@school.com`,
        password: 'parent123',
        name: makeParentName(s.name),
        role: 'PARENT',
        phone: randomPhone(),
      },
    });
    const pr = await db.parent.create({
      data: {
        userId: pu.id,
        name: makeParentName(s.name),
        email: pu.email,
        phone: pu.phone,
        studentId: s.id,
      },
    });
    await db.user.update({ where: { id: pu.id }, data: { linkedId: pr.id } });
    otherParentUsers.push({ userId: pu.id, parentId: pr.id, studentId: s.id });
  }

  // 7. Create attendance sessions + records for last 7 days for CSE-A (Mathematics)
  const today = new Date();
  const teacherForMath = teachers.find((t) => t.subject === 'Mathematics')!;
  const mathSubj = subjectsByClass['CSE-A'].find((s) => s.name === 'Mathematics')!;

  for (let d = 6; d >= 1; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = formatDate(date);
    const students = studentsByClass['CSE-A'];
    const totalStudents = students.length;
    // Random present/absent counts (1-2 absent)
    const absentCount = Math.floor(Math.random() * 2) + (d % 3 === 0 ? 1 : 0);
    const presentCount = totalStudents - absentCount;
    const session = await db.attendanceSession.create({
      data: {
        className: 'CSE-A',
        section: 'A',
        subjectId: mathSubj.id,
        subjectName: mathSubj.name,
        date: dateStr,
        period: ((d % 4) + 1),
        teacherId: teacherForMath.id,
        totalStudents,
        presentCount,
        absentCount,
        gpsVerified: true,
        gpsDistance: 35,
        method: 'AI',
      },
    });

    // Create records for each student
    const absentIndices = new Set<number>();
    while (absentIndices.size < absentCount) {
      absentIndices.add(Math.floor(Math.random() * students.length));
    }
    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      const isAbsent = absentIndices.has(i);
      const confidence = isAbsent ? Math.random() * 30 + 30 : 88 + Math.random() * 11; // absent has low confidence if detected, else high
      const anomalyFlag = !isAbsent && confidence < 80;
      await db.attendanceRecord.create({
        data: {
          sessionId: session.id,
          studentId: s.id,
          studentName: s.name,
          rollNumber: s.rollNumber,
          status: isAbsent ? 'ABSENT' : 'PRESENT',
          method: Math.random() > 0.1 ? 'AI' : 'MANUAL',
          confidence: Math.round(confidence * 10) / 10,
          manuallyModified: Math.random() > 0.85,
          anomalyFlag,
          anomalyReason: anomalyFlag ? 'Low face-recognition confidence' : null,
          date: dateStr,
          className: 'CSE-A',
        },
      });
    }
  }

  // 8. Create marks for all 30 students in 3 subjects (Mid Term exam)
  for (const className of Object.keys(subjectsByClass)) {
    const students = studentsByClass[className];
    for (const subj of subjectsByClass[className]) {
      for (const s of students) {
        const maxMarks = 100;
        // Random marks between 55 and 95
        let obtained = 55 + Math.floor(Math.random() * 41);
        // For low-attendance students, bias marks slightly lower
        const isLow = lowAttendancePicks.some((l) => l.id === s.id);
        if (isLow) obtained = Math.max(50, obtained - 15);
        const percentage = (obtained / maxMarks) * 100;
        await db.mark.create({
          data: {
            studentId: s.id,
            subjectName: subj.name,
            examName: 'Mid Term',
            maxMarks,
            obtainedMarks: obtained,
            percentage: Math.round(percentage * 10) / 10,
            examDate: formatDate(new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)),
          },
        });
      }
    }
  }

  // 9. Create holidays
  await db.holiday.create({
    data: {
      name: 'Annual Day Celebration',
      date: '2026-10-15',
      description: 'School Annual Day celebration. All classes suspended.',
      createdBy: adminUser.id,
    },
  });
  await db.holiday.create({
    data: {
      name: 'Diwali Festival',
      date: '2026-10-21',
      description: 'Diwali festival holiday. School will remain closed for the day.',
      createdBy: adminUser.id,
    },
  });

  // 10. Create notifications for the parent demo user
  await db.notification.create({
    data: {
      userId: parentUser.id,
      type: 'ATTENDANCE',
      title: 'Attendance Update',
      message: `Aarav Kumar was marked PRESENT today.`,
    },
  });
  await db.notification.create({
    data: {
      userId: parentUser.id,
      type: 'HOLIDAY',
      title: 'New Holiday Notification',
      message: 'Diwali Festival — 21 October 2026. School will remain closed.',
    },
  });
  await db.notification.create({
    data: {
      userId: parentUser.id,
      type: 'MARKS',
      title: 'Marks Published',
      message: 'Mid Term marks for Mathematics have been published. Aarav scored 87/100.',
    },
  });

  // 11. Create feedback records
  const feedback1 = await db.feedback.create({
    data: {
      parentId: parentRecord.id,
      parentName: 'Mr. Anil Kumar',
      studentId: aarav.id,
      studentName: 'Aarav Kumar',
      subject: 'About attendance',
      message: 'Please provide more information about the student\'s recent attendance pattern.',
      priority: 'MEDIUM',
      status: 'PENDING',
    },
  });

  const feedback2 = await db.feedback.create({
    data: {
      parentId: parentRecord.id,
      parentName: 'Mr. Anil Kumar',
      studentId: aarav.id,
      studentName: 'Aarav Kumar',
      subject: 'Marks query',
      message: 'Would like to know how Aarav can improve his Mathematics performance.',
      priority: 'LOW',
      status: 'REPLIED',
      teacherReply: 'Your child\'s performance is improving. We will share additional practice materials soon.',
      repliedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      repliedBy: teacherForMath.userId,
    },
  });

  const feedback3 = await db.feedback.create({
    data: {
      parentId: parentRecord.id,
      parentName: 'Mr. Anil Kumar',
      studentId: aarav.id,
      studentName: 'Aarav Kumar',
      subject: 'Holiday clarification',
      message: 'Will there be any extra classes during the Diwali break?',
      priority: 'HIGH',
      status: 'RESOLVED',
      teacherReply: 'No extra classes are scheduled during the Diwali break. School will resume on 22 October.',
      repliedAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      repliedBy: adminUser.id,
    },
  });

  // 12. Create anomalies for low-confidence records (already created in attendance records)
  // Pick a couple of students and create explicit anomaly records for admin dashboard
  const anomStudent = studentsByClass['CSE-A'][4]; // Vignesh Iyer
  await db.anomaly.create({
    data: {
      studentId: anomStudent.id,
      reason: 'Low face-recognition confidence (62%) — possible proxy attendance attempt',
      severity: 'HIGH',
      resolved: false,
    },
  });

  // 13. Create timetables for all 3 classes (Mon-Sat, 8 periods)
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const periodTimes = [
    { start: '09:00', end: '09:50' },
    { start: '10:00', end: '10:50' },
    { start: '11:00', end: '11:50' },
    { start: '12:00', end: '12:50' }, // lunch break typically after this
    { start: '14:00', end: '14:50' },
    { start: '15:00', end: '15:50' },
    { start: '16:00', end: '16:50' },
    { start: '17:00', end: '17:50' },
  ];
  // Subject rotation per class
  const timetablePlan: Record<string, string[]> = {
    'CSE-A': ['Mathematics', 'Computer Science', 'English', 'Mathematics', 'Computer Science', 'English', 'Library', 'Sports'],
    'CSE-B': ['Mathematics', 'Physics', 'English', 'Mathematics', 'Physics', 'English', 'Library', 'Sports'],
    'IT-A': ['Computer Science', 'Mathematics', 'Data Structures', 'Computer Science', 'Mathematics', 'Data Structures', 'Library', 'Sports'],
  };
  const teacherBySubject: Record<string, string> = {
    'Mathematics': 'Mr. Rajesh Kumar',
    'Computer Science': 'Ms. Lakshmi Devi',
    'Physics': 'Mr. Suresh Reddy',
    'English': 'Ms. Kavitha Reddy',
    'Data Structures': 'Mr. Rajesh Kumar',
    'Library': 'Librarian',
    'Sports': 'PT Instructor',
  };
  const roomsBySubject: Record<string, string> = {
    'Mathematics': 'A-101',
    'Computer Science': 'Lab-1',
    'Physics': 'Lab-2',
    'English': 'A-102',
    'Data Structures': 'Lab-1',
    'Library': 'Library',
    'Sports': 'Ground',
  };

  for (const className of Object.keys(timetablePlan)) {
    const plan = timetablePlan[className];
    for (const day of days) {
      for (let p = 0; p < plan.length; p++) {
        const subj = plan[p];
        // Skip periods 4-7 on Saturday (half day)
        if (day === 'SATURDAY' && p >= 4) continue;
        await db.timetable.create({
          data: {
            className,
            day,
            period: p + 1,
            subjectName: subj,
            teacherName: teacherBySubject[subj] || 'TBD',
            startTime: periodTimes[p].start,
            endTime: periodTimes[p].end,
            room: roomsBySubject[subj] || 'TBD',
          },
        });
      }
    }
  }

  // 14. Create exams (upcoming Mid Term + Final + recent Unit Test)
  const examDateMid = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now
  const examDateFinal = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  const examDateUnit = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // last week (already happened)
  const examSchedule = [
    { className: 'CSE-A', examName: 'Mid Term', subjectName: 'Mathematics', date: examDateMid, time: '10:00-12:00', room: 'Hall-A', syllabus: 'Chapters 1-5: Algebra, Trigonometry, Calculus basics' },
    { className: 'CSE-A', examName: 'Mid Term', subjectName: 'Computer Science', date: examDateMid, time: '14:00-16:00', room: 'Lab-1', syllabus: 'Programming fundamentals, data types, control structures' },
    { className: 'CSE-A', examName: 'Mid Term', subjectName: 'English', date: examDateMid, time: '10:00-11:30', room: 'Hall-B', syllabus: 'Grammar, comprehension, essay writing' },
    { className: 'CSE-A', examName: 'Final', subjectName: 'Mathematics', date: examDateFinal, time: '10:00-13:00', room: 'Hall-A', syllabus: 'Full syllabus' },
    { className: 'CSE-A', examName: 'Final', subjectName: 'Computer Science', date: examDateFinal, time: '14:00-17:00', room: 'Lab-1', syllabus: 'Full syllabus' },
    { className: 'CSE-A', examName: 'Unit Test 1', subjectName: 'Mathematics', date: examDateUnit, time: '10:00-11:00', room: 'A-101', syllabus: 'Chapter 1: Algebra' },
  ];
  for (const e of examSchedule) {
    await db.exam.create({
      data: {
        examName: e.examName,
        subjectName: e.subjectName,
        className: e.className,
        date: e.date.toISOString().slice(0, 10),
        startTime: e.time.split('-')[0],
        endTime: e.time.split('-')[1],
        room: e.room,
        maxMarks: 100,
        syllabus: e.syllabus,
      },
    });
  }

  // 15. Create student-specific notifications (for student demo user)
  await db.notification.create({
    data: {
      userId: studentUser.id,
      type: 'ATTENDANCE',
      title: 'Attendance Recorded',
      message: 'Your attendance for Mathematics was recorded: PRESENT.',
    },
  });
  await db.notification.create({
    data: {
      userId: studentUser.id,
      type: 'MARKS',
      title: 'Marks Published',
      message: 'Mid Term Mathematics marks: 87/100. Well done!',
    },
  });
  await db.notification.create({
    data: {
      userId: studentUser.id,
      type: 'HOLIDAY',
      title: 'Upcoming Holiday',
      message: 'Diwali Festival — 21 October 2026. School will remain closed.',
    },
  });
  await db.notification.create({
    data: {
      userId: studentUser.id,
      type: 'ALERT',
      title: 'Upcoming Exam',
      message: 'Mid Term Mathematics exam on ' + examDateMid.toISOString().slice(0, 10) + ' at 10:00 AM in Hall-A.',
    },
  });

  console.log('✅ Seed complete!');
  console.log('  - 1 admin, 3 teachers, 30 students, 1 demo parent + 3 additional parents, 1 student demo');
  console.log('  - Subjects, attendance sessions, marks, holidays, notifications, feedback, anomalies all created');
  console.log('  - Timetables for 3 classes (Mon-Sat) + 6 exams created');
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  });
