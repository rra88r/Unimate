const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding UniMate database with Arabic-first university demo data...');

  // Clean existing demo data if any
  await prisma.chatMessage.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.gradeRecord.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create demo user
  const user = await prisma.user.create({
    data: {
      name: 'فيصل العتيبي',
      email: 'demo@unimate.app',
      passwordHash: passwordHash,
      university: 'جامعة الملك سعود / King Saud University',
      major: 'هندسة البرمجيات / Software Engineering',
      semester: 'الفصل الدراسي الأول 1446هـ',
      gpaScale: 5.0,
      targetGpa: 4.85,
      language: 'ar',
      theme: 'light',
    },
  });

  console.log(`Created user: ${user.name} (${user.email})`);

  // 2. Create courses
  const coursesData = [
    {
      code: 'CSC 212',
      nameAr: 'هياكل البيانات والخوارزميات',
      nameEn: 'Data Structures & Algorithms',
      creditHours: 3,
      instructor: 'د. سامي الشريف',
      color: '#10b981', // emerald
      locationRoom: 'مبنى 31 - قاعة 1A 12',
      termSemester: 'خريف 1446',
      syllabusNotes: 'الأشجار الثنائية، جداول الهاش، خوازميات الترتيب والبحث، الرسوم البيانية',
    },
    {
      code: 'SWE 312',
      nameAr: 'هندسة متطلبات البرمجيات',
      nameEn: 'Software Requirements Engineering',
      creditHours: 3,
      instructor: 'د. إبراهيم القحطاني',
      color: '#6366f1', // indigo
      locationRoom: 'مبنى 31 - قاعة 2B 44',
      termSemester: 'خريف 1446',
      syllabusNotes: 'استنباط المتطلبات، كتابة وثيقة SRS، نمذجة حالات الاستخدام، Agile User Stories',
    },
    {
      code: 'MATH 151',
      nameAr: 'الرياضيات المتقطعة',
      nameEn: 'Discrete Mathematics',
      creditHours: 3,
      instructor: 'أ.د. طارق الحامد',
      color: '#f59e0b', // amber
      locationRoom: 'مبنى 4 - قاعة 1B 08',
      termSemester: 'خريف 1446',
      syllabusNotes: 'المنطق الرياضي، البراهين، المجموعات والعلاقات، نظرية الرسوم البيانية والأشجار',
    },
    {
      code: 'AI 301',
      nameAr: 'مقدمة في الذكاء الاصطناعي',
      nameEn: 'Introduction to Artificial Intelligence',
      creditHours: 3,
      instructor: 'د. ليلى السليمان',
      color: '#ec4899', // pink
      locationRoom: 'مبنى 31 - قاعة 3A 22',
      termSemester: 'خريف 1446',
      syllabusNotes: 'خوارزميات البحث الذكي A*، تعلم الآلة، معالجة اللغات الطبيعية، الأخلاقيات',
    },
    {
      code: 'SWE 321',
      nameAr: 'تصميم تجربة وواجهة المستخدم',
      nameEn: 'UI/UX Design for Software',
      creditHours: 3,
      instructor: 'م. ناصر الزهراني',
      color: '#06b6d4', // cyan
      locationRoom: 'مبنى 31 - معمل التصميم 4',
      termSemester: 'خريف 1446',
      syllabusNotes: 'أبحاث المستخدم، مبادئ نيلسن، التصميم التفاعلي، أدوات فيجما والنماذج الأولية',
    },
    {
      code: 'ISLS 101',
      nameAr: 'الثقافة الإسلامية',
      nameEn: 'Islamic Culture',
      creditHours: 2,
      instructor: 'د. صالح العتيق',
      color: '#8b5cf6', // purple
      locationRoom: 'مبنى 2 - قاعة 2A 15',
      termSemester: 'خريف 1446',
      syllabusNotes: 'مفهوم الثقافة الإسلامية، خصائصها، التحديات الفكرية المعاصرة',
    },
  ];

  const courses = [];
  for (const c of coursesData) {
    const created = await prisma.course.create({
      data: {
        ...c,
        userId: user.id,
      },
    });
    courses.push(created);
  }

  const courseMap = Object.fromEntries(courses.map((c) => [c.code, c.id]));

  // 3. Timetable Slots (0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu)
  const timetableSlots = [
    // Sunday (0)
    { courseId: courseMap['CSC 212'], dayOfWeek: 0, startTime: '08:00', endTime: '09:30', room: '1A 12', type: 'lecture' },
    { courseId: courseMap['SWE 312'], dayOfWeek: 0, startTime: '10:00', endTime: '11:30', room: '2B 44', type: 'lecture' },
    { courseId: courseMap['AI 301'], dayOfWeek: 0, startTime: '13:00', endTime: '14:30', room: '3A 22', type: 'lecture' },

    // Monday (1)
    { courseId: courseMap['MATH 151'], dayOfWeek: 1, startTime: '09:00', endTime: '10:30', room: '1B 08', type: 'lecture' },
    { courseId: courseMap['SWE 321'], dayOfWeek: 1, startTime: '11:00', endTime: '12:30', room: 'معمل 4', type: 'lab' },

    // Tuesday (2)
    { courseId: courseMap['CSC 212'], dayOfWeek: 2, startTime: '08:00', endTime: '09:30', room: '1A 12', type: 'lecture' },
    { courseId: courseMap['SWE 312'], dayOfWeek: 2, startTime: '10:00', endTime: '11:30', room: '2B 44', type: 'lecture' },
    { courseId: courseMap['ISLS 101'], dayOfWeek: 2, startTime: '12:00', endTime: '13:30', room: '2A 15', type: 'lecture' },

    // Wednesday (3)
    { courseId: courseMap['MATH 151'], dayOfWeek: 3, startTime: '09:00', endTime: '10:30', room: '1B 08', type: 'tutorial' },
    { courseId: courseMap['AI 301'], dayOfWeek: 3, startTime: '11:00', endTime: '12:30', room: 'معمل AI', type: 'lab' },

    // Thursday (4)
    { courseId: courseMap['CSC 212'], dayOfWeek: 4, startTime: '08:30', endTime: '10:00', room: 'معمل 2', type: 'lab' },
    { courseId: courseMap['SWE 321'], dayOfWeek: 4, startTime: '10:30', endTime: '12:00', room: 'معمل 4', type: 'tutorial' },
  ];

  for (const slot of timetableSlots) {
    await prisma.timetableSlot.create({
      data: {
        ...slot,
        userId: user.id,
      },
    });
  }

  // 4. Assignments
  const now = new Date();
  const addDays = (d, days) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);

  const assignmentsData = [
    {
      courseId: courseMap['SWE 312'],
      title: 'إعداد وثيقة مواصفات متطلبات البرمجيات (SRS)',
      description: 'كتابة مواصفات النظام لتطبيق إدارة حجوزات العيادات الطبية شاملة Functional & Non-functional Requirements',
      dueDate: addDays(now, 3),
      priority: 'high',
      status: 'in_progress',
      gradeMax: 15,
      gradeReceived: null,
      weightPercentage: 15,
    },
    {
      courseId: courseMap['CSC 212'],
      title: 'تنفيذ شجرة البحث الثنائية المتوازنة (AVL Tree)',
      description: 'برمجة عمليات الإدراج والحذف والتدوير (Rotations) بلغة C++ أو جافا مع حساب التعقيد الزمني',
      dueDate: addDays(now, 6),
      priority: 'high',
      status: 'pending',
      gradeMax: 20,
      gradeReceived: null,
      weightPercentage: 20,
    },
    {
      courseId: courseMap['MATH 151'],
      title: 'واجب البراهين الرياضية ونظرية المجموعات',
      description: 'حل تمارين الفصل الثالث حول الاستقراء الرياضي (Mathematical Induction) ومصفوفات العلاقات',
      dueDate: addDays(now, 8),
      priority: 'medium',
      status: 'pending',
      gradeMax: 10,
      gradeReceived: null,
      weightPercentage: 10,
    },
    {
      courseId: courseMap['SWE 321'],
      title: 'تصميم نموذج أولي تفاعلي عالي الدقة (Figma Prototype)',
      description: 'إنشاء النموذج الأولي لتطبيق UniMate متوافق مع معايير الوصولية ودعم اللغة العربية RTL',
      dueDate: addDays(now, 12),
      priority: 'medium',
      status: 'pending',
      gradeMax: 15,
      gradeReceived: null,
      weightPercentage: 15,
    },
    {
      courseId: courseMap['AI 301'],
      title: 'ورقة بحثية: قضايا الخصوصية والأخلاقيات في نماذج LLM',
      description: 'استعراض التحديات الأخلاقية وتزييف الحقائق وحماية بيانات الطلاب في الذكاء الاصطناعي التوليدي',
      dueDate: addDays(now, -2),
      priority: 'low',
      status: 'completed',
      gradeMax: 10,
      gradeReceived: 10,
      weightPercentage: 10,
    },
  ];

  for (const a of assignmentsData) {
    await prisma.assignment.create({
      data: {
        ...a,
        userId: user.id,
      },
    });
  }

  // 5. Exams
  const examsData = [
    {
      courseId: courseMap['CSC 212'],
      title: 'الاختبار الفصلي الأول - هياكل البيانات',
      examDate: addDays(now, 11),
      durationMinutes: 90,
      locationRoom: 'بهو الامتحانات الرئيسي - قاعة 101',
      seatNumber: 'مقعد رقم B-34',
      weightPercentage: 30,
      status: 'upcoming',
      notes: 'يشمل القوائم المترابطة، المكدس، الطوابير، والأشجار الثنائية',
    },
    {
      courseId: courseMap['SWE 312'],
      title: 'الاختبار الفصلي الأول - هندسة المتطلبات',
      examDate: addDays(now, 17),
      durationMinutes: 75,
      locationRoom: 'كلية علوم الحاسب - قاعة 2B 44',
      seatNumber: 'مقعد رقم A-12',
      weightPercentage: 25,
      status: 'upcoming',
      notes: 'التركيز على مصفوفة التتبع واستنباط المتطلبات واستخدام حالات الاستخدام',
    },
    {
      courseId: courseMap['MATH 151'],
      title: 'الاختبار القصير الثاني (Quiz 2)',
      examDate: addDays(now, 5),
      durationMinutes: 45,
      locationRoom: 'مبنى 4 - قاعة 1B 08',
      seatNumber: 'مقعد رقم C-05',
      weightPercentage: 10,
      status: 'upcoming',
      notes: 'يرجى إحضار الآلة الحاسبة المعتمدة ومراجعة قواعد المنطق',
    },
  ];

  for (const e of examsData) {
    await prisma.exam.create({
      data: {
        ...e,
        userId: user.id,
      },
    });
  }

  // 6. Historical Grade Records (Completed past semesters)
  const pastGrades = [
    // Semester 1: Fall 1445
    { termSemester: 'الفصل الأول 1445', customCourseName: 'مقدمة في البرمجة (CSC 111)', creditHours: 4, letterGrade: 'A+', gradePoints: 5.0 },
    { termSemester: 'الفصل الأول 1445', customCourseName: 'حساب التفاضل والتكامل 1 (MATH 101)', creditHours: 3, letterGrade: 'A', gradePoints: 4.75 },
    { termSemester: 'الفصل الأول 1445', customCourseName: 'اللغة الإنجليزية التخصصية (ENG 101)', creditHours: 3, letterGrade: 'A+', gradePoints: 5.0 },
    { termSemester: 'الفصل الأول 1445', customCourseName: 'الفيزياء العامة (PHYS 101)', creditHours: 4, letterGrade: 'B+', gradePoints: 4.5 },
    { termSemester: 'الفصل الأول 1445', customCourseName: 'مهارات الاتصال والتعلم (CI 101)', creditHours: 2, letterGrade: 'A+', gradePoints: 5.0 },

    // Semester 2: Spring 1445
    { termSemester: 'الفصل الثاني 1445', customCourseName: 'البرمجة الكائنية المتقدمة (CSC 113)', creditHours: 4, letterGrade: 'A+', gradePoints: 5.0 },
    { termSemester: 'الفصل الثاني 1445', customCourseName: 'حساب التفاضل والتكامل 2 (MATH 106)', creditHours: 3, letterGrade: 'A', gradePoints: 4.75 },
    { termSemester: 'الفصل الثاني 1445', customCourseName: 'الجبر الخطي وتطبيقاته (MATH 244)', creditHours: 3, letterGrade: 'B+', gradePoints: 4.5 },
    { termSemester: 'الفصل الثاني 1445', customCourseName: 'مبادئ نظم التشغيل (IT 211)', creditHours: 3, letterGrade: 'A+', gradePoints: 5.0 },
    { termSemester: 'الفصل الثاني 1445', customCourseName: 'التحرير العربي (ARAB 101)', creditHours: 2, letterGrade: 'A+', gradePoints: 5.0 },
  ];

  for (const g of pastGrades) {
    await prisma.gradeRecord.create({
      data: {
        ...g,
        userId: user.id,
        isCompleted: true,
      },
    });
  }

  // 7. Study Sessions / Pomodoro logs
  const studySessions = [
    {
      courseId: courseMap['CSC 212'],
      title: 'مراجعة خوارزميات الترتيب السريع QuickSort والمدمج MergeSort',
      durationMinutes: 50,
      type: 'revision',
      isCompleted: true,
      notes: 'فهمت التحليل الزمني لأفضل وأسوأ الحالات O(n log n)',
    },
    {
      courseId: courseMap['SWE 312'],
      title: 'كتابة قصص المستخدمين User Stories لمشروع العيادة',
      durationMinutes: 25,
      type: 'pomodoro',
      isCompleted: true,
      notes: 'تمت صياغة 12 قصة مستخدم مع معايير القبول Acceptance Criteria',
    },
    {
      courseId: courseMap['AI 301'],
      title: 'جلسة تركيز بومودورو: خوارزمية البحث التجريبي A* Search',
      durationMinutes: 25,
      type: 'pomodoro',
      isCompleted: true,
      notes: 'حللت مثال المسار الأقصر في الرسوم البيانية',
    },
  ];

  for (const s of studySessions) {
    await prisma.studySession.create({
      data: {
        ...s,
        userId: user.id,
      },
    });
  }

  // 8. Welcome AI chat messages
  await prisma.chatMessage.createMany({
    data: [
      {
        userId: user.id,
        role: 'assistant',
        content: 'أهلاً بك يا فيصل في يوني ميت (UniMate)! 🎓\nأنا رفيقك الدراسي الذكي، كيف يمكنني مساعدتك اليوم؟\n\nيمكنك أن تطلب مني:\n• إعداد خطة مراجعة مخصصة لاختبار هياكل البيانات القادم\n• تلخيص محاضرات هندسة البرمجيات\n• توليد أسئلة تدريبية واختبارات قصيرة\n• نصائح لتنظيم وقتك ورفع معدلك التراكمي إلى 4.85+',
        category: 'general',
      },
    ],
  });

  console.log('✅ Seed completed successfully with full academic data!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
