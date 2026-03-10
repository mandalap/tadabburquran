import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { queryAll, queryOne } from '@/lib/db'

// Mock data
const mockCourses = [
  {
    id: '1',
    title: 'Mastering Digital Marketing: Strategi Modern untuk Bisnis',
    shortDescription: 'Pelajari strategi digital marketing terkini untuk mengembangkan bisnis Anda',
    description: 'Kelas komprehensif yang akan mengajarkan Anda semua aspek digital marketing modern. Dari SEO, social media marketing, hingga email marketing dan analytics. Cocok untuk pemula maupun yang ingin meningkatkan skill.',
    instructor: 'Andi Wijaya',
    instructorTitle: 'Digital Marketing Expert',
    instructorBio: 'Andi adalah praktisi digital marketing dengan pengalaman lebih dari 10 tahun. Telah membantu ratusan perusahaan meningkatkan online presence mereka.',
    instructorCourses: 12,
    instructorStudents: 5400,
    category: 'Ecourse',
    price: 499000,
    originalPrice: 999000,
    rating: 4.8,
    reviews: 342,
    students: 1250,
    duration: '8 jam',
    learningPoints: [
      'Menguasai fundamental digital marketing',
      'Membuat strategi SEO yang efektif',
      'Mengelola social media marketing',
      'Menganalisis data dengan Google Analytics',
      'Membuat campaign email marketing',
      'Memahami paid advertising (Google Ads, Facebook Ads)'
    ],
    requirements: [
      'Komputer/laptop dengan koneksi internet',
      'Tidak perlu pengalaman sebelumnya',
      'Kemauan untuk belajar dan praktek'
    ],
    curriculum: [
      { title: 'Pengenalan Digital Marketing', lessons: 5, duration: '1 jam 30 menit' },
      { title: 'SEO dan Content Marketing', lessons: 8, duration: '2 jam 15 menit' },
      { title: 'Social Media Marketing', lessons: 6, duration: '1 jam 45 menit' },
      { title: 'Email Marketing', lessons: 5, duration: '1 jam 30 menit' },
      { title: 'Analytics dan Reporting', lessons: 4, duration: '1 jam' }
    ],
    reviewList: [
      { name: 'Siti Nurhaliza', rating: 5, comment: 'Kelas yang sangat membantu! Materi dijelaskan dengan sangat detail dan mudah dipahami.' },
      { name: 'Budi Santoso', rating: 5, comment: 'Instruktur sangat berpengalaman. Saya berhasil meningkatkan traffic website 300% setelah menerapkan ilmu dari kelas ini.' },
      { name: 'Rina Kusuma', rating: 4, comment: 'Bagus sekali, tapi saya harap ada lebih banyak studi kasus real.' }
    ]
  },
  {
    id: '2',
    title: 'Web Development Full Stack: React & Node.js',
    shortDescription: 'Belajar membangun aplikasi web modern dengan React dan Node.js',
    description: 'Kursus lengkap untuk menjadi full stack developer. Pelajari React untuk frontend dan Node.js untuk backend. Termasuk database, authentication, dan deployment.',
    instructor: 'Dimas Prakoso',
    instructorTitle: 'Senior Software Engineer',
    instructorBio: 'Dimas adalah senior software engineer dengan spesialisasi JavaScript stack. Telah mengembangkan puluhan aplikasi web untuk berbagai klien.',
    instructorCourses: 8,
    instructorStudents: 3200,
    category: 'Ecourse',
    price: 599000,
    originalPrice: 1200000,
    rating: 4.9,
    reviews: 521,
    students: 2100,
    duration: '12 jam',
    learningPoints: [
      'Membangun UI modern dengan React',
      'Membuat REST API dengan Node.js',
      'Database design dengan MongoDB',
      'Authentication dan Authorization',
      'Deploy aplikasi ke production',
      'Best practices dan clean code'
    ],
    requirements: [
      'Pengetahuan dasar HTML, CSS, JavaScript',
      'Komputer dengan minimal 8GB RAM',
      'Text editor (VS Code recommended)'
    ],
    curriculum: [
      { title: 'React Fundamentals', lessons: 10, duration: '3 jam' },
      { title: 'Node.js dan Express', lessons: 8, duration: '2 jam 30 menit' },
      { title: 'Database MongoDB', lessons: 6, duration: '2 jam' },
      { title: 'Authentication & Security', lessons: 5, duration: '2 jam' },
      { title: 'Deployment & DevOps', lessons: 4, duration: '1 jam 30 menit' }
    ],
    reviewList: [
      { name: 'Ahmad Fauzi', rating: 5, comment: 'Kursus terbaik yang pernah saya ikuti! Sekarang saya sudah bisa bikin aplikasi sendiri.' },
      { name: 'Linda Permata', rating: 5, comment: 'Penjelasan sangat jelas dan project-based learning sangat membantu.' },
      { name: 'Rudi Hartono', rating: 4, comment: 'Bagus, tapi pace-nya agak cepat untuk pemula.' }
    ]
  },
  {
    id: '3',
    title: 'UI/UX Design Mastery: Dari Pemula hingga Pro',
    shortDescription: 'Kuasai seni desain UI/UX dengan tools modern seperti Figma',
    description: 'Pelajari prinsip-prinsip desain UI/UX yang baik. Dari research, wireframing, prototyping hingga handoff ke developer. Menggunakan Figma sebagai tool utama.',
    instructor: 'Sarah Kusuma',
    instructorTitle: 'Lead Product Designer',
    instructorBio: 'Sarah adalah lead product designer dengan portfolio klien dari startup hingga perusahaan Fortune 500.',
    instructorCourses: 5,
    instructorStudents: 2800,
    category: 'Ecourse',
    price: 449000,
    originalPrice: 899000,
    rating: 4.7,
    reviews: 289,
    students: 980,
    duration: '10 jam',
    learningPoints: [
      'Prinsip dasar UI/UX design',
      'User research dan persona',
      'Wireframing dan prototyping',
      'Menguasai Figma secara mendalam',
      'Design system dan component library',
      'Usability testing'
    ],
    requirements: [
      'Tidak perlu pengalaman design sebelumnya',
      'Komputer dengan Figma installed',
      'Kreativitas dan passion untuk design'
    ],
    curriculum: [
      { title: 'Fundamental UI/UX', lessons: 7, duration: '2 jam' },
      { title: 'User Research', lessons: 5, duration: '1 jam 30 menit' },
      { title: 'Wireframing & Prototyping', lessons: 8, duration: '2 jam 30 menit' },
      { title: 'Advanced Figma', lessons: 9, duration: '3 jam' },
      { title: 'Design System', lessons: 6, duration: '2 jam' }
    ],
    reviewList: [
      { name: 'Dini Amalia', rating: 5, comment: 'Materi sangat lengkap dan praktis. Sekarang saya sudah bisa bikin portfolio!' },
      { name: 'Eko Prasetyo', rating: 4, comment: 'Bagus, tapi saya harap ada lebih banyak latihan praktek.' }
    ]
  },
  {
    id: '4',
    title: 'Financial Planning untuk Milenial dan Gen Z',
    shortDescription: 'Atur keuangan dengan cerdas dan mulai investasi sejak dini',
    description: 'Kursus praktis untuk memahami personal finance, budgeting, saving, dan investasi. Cocok untuk anak muda yang ingin financial freedom.',
    instructor: 'Michael Tan',
    instructorTitle: 'Certified Financial Planner',
    instructorBio: 'Michael adalah CFP dengan pengalaman 15 tahun membantu klien mencapai tujuan finansial mereka.',
    instructorCourses: 6,
    instructorStudents: 4500,
    category: 'Ecourse',
    price: 299000,
    originalPrice: 599000,
    rating: 4.9,
    reviews: 678,
    students: 3200,
    duration: '6 jam',
    learningPoints: [
      'Mindset keuangan yang sehat',
      'Budgeting dan saving strategies',
      'Mengenal berbagai instrumen investasi',
      'Memulai investasi dengan modal kecil',
      'Proteksi asuransi yang tepat',
      'Perencanaan dana pensiun'
    ],
    requirements: [
      'Tidak perlu background finansial',
      'Kemauan untuk mengatur keuangan lebih baik',
      'Kalkulator atau spreadsheet'
    ],
    curriculum: [
      { title: 'Financial Mindset', lessons: 4, duration: '1 jam' },
      { title: 'Budgeting Mastery', lessons: 5, duration: '1 jam 30 menit' },
      { title: 'Investasi untuk Pemula', lessons: 7, duration: '2 jam' },
      { title: 'Asuransi dan Proteksi', lessons: 4, duration: '1 jam' },
      { title: 'Retirement Planning', lessons: 3, duration: '45 menit' }
    ],
    reviewList: [
      { name: 'Tania Wijaya', rating: 5, comment: 'Game changer! Sekarang saya lebih aware dengan pengeluaran dan sudah mulai investasi.' },
      { name: 'Arif Rahman', rating: 5, comment: 'Sangat praktis dan aplikatif. Recommended banget!' }
    ]
  },
  {
    id: '5',
    title: 'Content Creation: YouTube & TikTok Strategy',
    shortDescription: 'Jadilah content creator sukses di platform video populer',
    description: 'Pelajari strategi membuat konten viral, editing video, monetization, dan membangun audience di YouTube dan TikTok.',
    instructor: 'Jessica Lim',
    instructorTitle: 'Content Creator & Social Media Strategist',
    instructorBio: 'Jessica adalah content creator dengan 500K+ followers. Ahli dalam viral content dan audience building.',
    instructorCourses: 4,
    instructorStudents: 2100,
    category: 'Webinar',
    price: 349000,
    originalPrice: 699000,
    rating: 4.6,
    reviews: 234,
    students: 890,
    duration: '5 jam',
    learningPoints: [
      'Menemukan niche yang profitable',
      'Membuat konten yang engaging',
      'Editing video untuk social media',
      'Algoritma YouTube dan TikTok',
      'Monetization strategies',
      'Collaboration dan networking'
    ],
    requirements: [
      'Smartphone dengan kamera bagus',
      'Aplikasi editing video (CapCut, etc)',
      'Passion untuk membuat konten'
    ],
    curriculum: [
      { title: 'Finding Your Niche', lessons: 3, duration: '45 menit' },
      { title: 'Content Creation Basics', lessons: 6, duration: '1 jam 30 menit' },
      { title: 'Video Editing', lessons: 5, duration: '1 jam 30 menit' },
      { title: 'Growth Strategies', lessons: 4, duration: '1 jam' },
      { title: 'Monetization', lessons: 3, duration: '45 menit' }
    ],
    reviewList: [
      { name: 'Rendra Putra', rating: 5, comment: 'Tips-tipsnya praktis banget! Video saya mulai banyak yang views-nya naik.' },
      { name: 'Nina Sari', rating: 4, comment: 'Bagus, tapi lebih fokus ke YouTube. Harap ada lebih banyak konten TikTok.' }
    ]
  },
  {
    id: '6',
    title: 'Data Analytics dengan Python dan SQL',
    shortDescription: 'Analisis data seperti pro dengan Python, pandas, dan SQL',
    description: 'Kursus praktis untuk belajar data analytics. Dari data cleaning, exploratory analysis, visualisasi hingga insight generation.',
    instructor: 'Dr. Bambang Sutopo',
    instructorTitle: 'Data Scientist',
    instructorBio: 'Dr. Bambang adalah data scientist dengan publikasi internasional dan pengalaman di berbagai industri.',
    instructorCourses: 7,
    instructorStudents: 3600,
    category: 'Ecourse',
    price: 549000,
    originalPrice: 1099000,
    rating: 4.8,
    reviews: 445,
    students: 1800,
    duration: '15 jam',
    learningPoints: [
      'Python fundamentals untuk data',
      'Data manipulation dengan pandas',
      'SQL untuk database queries',
      'Data visualization dengan matplotlib dan seaborn',
      'Statistical analysis',
      'Real-world case studies'
    ],
    requirements: [
      'Pengetahuan dasar programming (helpful)',
      'Komputer dengan Python installed',
      'Logical thinking dan analytical mindset'
    ],
    curriculum: [
      { title: 'Python Basics', lessons: 8, duration: '2 jam' },
      { title: 'Pandas for Data Analysis', lessons: 10, duration: '3 jam' },
      { title: 'SQL Essentials', lessons: 7, duration: '2 jam 30 menit' },
      { title: 'Data Visualization', lessons: 8, duration: '2 jam 30 menit' },
      { title: 'Case Studies', lessons: 6, duration: '2 jam' }
    ],
    reviewList: [
      { name: 'Fajar Nugroho', rating: 5, comment: 'Materi sangat sistematis dan mudah diikuti. Sekarang saya bisa analisis data sendiri!' },
      { name: 'Putri Ayu', rating: 5, comment: 'Instruktur menjelaskan dengan sangat detail. Worth every penny!' }
    ]
  }
]

const mockTestimonials = [
  { name: 'Rahmad', role: 'Pelanggan', message: 'Sangat puas dengan layanan yang diberikan!' },
  { name: 'Aji', role: 'Kreator', message: 'Paling suka karena dashboardnya simpel. Nggak perlu baca manual panjang. Tinggal klik-klik, kelas langsung live. Cocok buat yang nggak mau ribet.' },
  { name: 'Reni', role: 'Pelanggan', message: 'Fitur CHSnya keren banget! sangat mudah digunakan walaupun saya sudah berumur' },
  { name: 'Daus', role: 'Kreator', message: 'Tim ruank.id sangat terbuka dan gercep jika ada kendala dalam platform' },
  { name: 'Melvy', role: 'Pelanggan', message: 'sayang banget belum banyak orang yang tau tentang platform ini, padahal bisa nambah uang jajan hehehe' },
  { name: 'Chelsy', role: 'Kreator', message: 'Seneng banget ada platform yang kreator friendly!' },
  { name: 'Reza', role: 'Kreator', message: 'Yang saya hargai bukan cuma teknologinya, tapi juga komunitasnya. Support timnya cepat, dan mereka terbuka sama masukan fitur baru.' },
  { name: 'Dharma', role: 'Kreator', message: 'Tulisan yang selama ini hanya draft bisa jadi series yang dinikmati orang lain. Makasih Ruank.id!!!' },
  { name: 'Indah', role: 'Pelanggan', message: 'walaupun masih dalam tahap pengembangan, ruank.id udah keren banget! semangat tim ruank.id!!!' }
]

// API Routes Handler
export async function GET(request) {
  const { pathname } = new URL(request.url)
  
  // Root API
  if (pathname === '/api' || pathname === '/api/') {
    return NextResponse.json({ 
      message: 'TadabburQuran.id API - Digital Marketplace Platform',
      version: '1.0.0',
      status: 'active'
    })
  }

  // Get all courses
  if (pathname === '/api/courses') {
    try {
      let courses
      try {
        courses = await queryAll(`
          SELECT
            c.id, c.title, c.short_description, c.description, c.instructor, c.instructor_title,
            c.course_type, c.course_type_id, c.category, c.price, c.original_price, c.rating, c.reviews, c.students,
            c.duration, c.event_date, c.cover, c.modules, c.is_published, c.created_at,
            ct.name as type_name, ct.slug as type_slug,
            cr.avatar as instructor_avatar, cr.title as instructor_creator_title, cr.rating as instructor_rating, cr.reviews as instructor_reviews
          FROM courses c
          LEFT JOIN creators cr ON lower(trim(cr.name)) = lower(trim(c.instructor)) AND cr.is_active = true
          LEFT JOIN course_types ct ON c.course_type_id = ct.id
          WHERE c.is_published = true
          ORDER BY c.created_at DESC
        `)
      } catch (error) {
        courses = await queryAll(`
          SELECT
            c.id, c.title, c.short_description, c.description, c.instructor, c.instructor_title,
            c.category, c.price, c.original_price, c.rating, c.reviews, c.students,
            c.duration, c.event_date, c.cover, c.modules, c.is_published, c.created_at,
            cr.avatar as instructor_avatar, cr.title as instructor_creator_title, cr.rating as instructor_rating, cr.reviews as instructor_reviews
          FROM courses c
          LEFT JOIN creators cr ON lower(trim(cr.name)) = lower(trim(c.instructor)) AND cr.is_active = true
          WHERE c.is_published = true
          ORDER BY c.created_at DESC
        `)
      }
      const mappedCourses = (courses || []).map(course => ({
        ...course,
        course_type: course.course_type || '',
        course_type_id: course.course_type_id || null,
        type_name: course.type_name || '',
        type_slug: course.type_slug || '',
        instructors: [{
          creator_id: null,
          name: course.instructor || '',
          title: course.instructor_creator_title || course.instructor_title || '',
          avatar: course.instructor_avatar || '',
          rating: course.instructor_rating || 0,
          reviews: course.instructor_reviews || 0
        }]
      }))
      return NextResponse.json({ success: true, courses: mappedCourses, total: mappedCourses.length })
    } catch (error) {
      if (supabase) {
        const { data, error: sbError } = await supabase
          .from('courses')
          .select('id,title,shortDescription,description,instructor,instructorTitle,category,price,originalPrice,rating,reviews,students,duration,cover')
        if (sbError) {
          return NextResponse.json({ success: false, message: 'DB error' }, { status: 500 })
        }
        return NextResponse.json({ success: true, courses: data || [], total: (data || []).length })
      }
      return NextResponse.json({ success: false, message: 'DB error' }, { status: 500 })
    }
  }

  // Get course by ID
  if (pathname.startsWith('/api/courses/')) {
    const id = pathname.split('/').pop()
    try {
      const course = await queryOne(
        `SELECT
          c.*,
          ct.name as type_name, ct.slug as type_slug,
          cr.avatar as instructor_avatar, cr.title as instructor_creator_title, cr.rating as instructor_rating, cr.reviews as instructor_reviews
        FROM courses c
        LEFT JOIN creators cr ON lower(trim(cr.name)) = lower(trim(c.instructor)) AND cr.is_active = true
        LEFT JOIN course_types ct ON c.course_type_id = ct.id
        WHERE c.id = $1 AND c.is_published = true`,
        [id]
      )
      if (!course) {
        return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
      }
      let parsedModules = course.modules || []
      if (typeof parsedModules === 'string') {
        try {
          parsedModules = JSON.parse(parsedModules)
        } catch {
          parsedModules = []
        }
      }
      const mappedCourse = {
        ...course,
        modules: Array.isArray(parsedModules) ? parsedModules : [],
        course_type: course.course_type || '',
        course_type_id: course.course_type_id || null,
        type_name: course.type_name || '',
        type_slug: course.type_slug || '',
        instructors: [{
          creator_id: null,
          name: course.instructor || '',
          title: course.instructor_creator_title || course.instructor_title || '',
          avatar: course.instructor_avatar || '',
          rating: course.instructor_rating || 0,
          reviews: course.instructor_reviews || 0
        }]
      }
      return NextResponse.json({ success: true, course: mappedCourse })
    } catch (error) {
      if (supabase) {
        const { data, error: sbError } = await supabase
          .from('courses')
          .select('id,title,shortDescription,description,instructor,instructorTitle,category,price,originalPrice,rating,reviews,students,duration,cover,learningPoints,requirements,curriculum,reviewList')
          .eq('id', id)
          .single()
        if (sbError || !data) {
          return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true, course: data })
      }
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
    }
  }

  // Get testimonials
  if (pathname === '/api/testimonials') {
    if (!supabase) {
      return NextResponse.json({ success: true, testimonials: [] })
    }
    const { data, error } = await supabase.from('testimonials').select('name,role,message')
    if (error) {
      return NextResponse.json({ success: false, message: 'DB error' }, { status: 500 })
    }
    return NextResponse.json({ success: true, testimonials: data || [] })
  }

  // Get dashboard data
  if (pathname === '/api/dashboard') {
    if (!supabase) {
      return NextResponse.json({ success: true, enrolledCourses: [], purchaseHistory: [] })
    }
    const { data: enrolls } = await supabase
      .from('enrollments')
      .select('course:courses(id,title,instructor,price,category)')
      .limit(10)
    const enrolledCourses = (enrolls || []).map(e => ({
      id: e.course?.id,
      title: e.course?.title,
      instructor: e.course?.instructor,
      price: e.course?.price,
      category: e.course?.category
    })).filter(c => c.id)
    const { data: orders } = await supabase
      .from('orders')
      .select('courseName, price, date, status, paymentMethod')
      .order('date', { ascending: false })
      .limit(10)
    return NextResponse.json({ success: true, enrolledCourses, purchaseHistory: orders || [] })
  }

  // Default 404 for unknown routes
  return NextResponse.json({ 
    success: false,
    message: 'Endpoint not found' 
  }, { status: 404 })
}

// POST handler for enrollment and checkout
export async function POST(request) {
  const { pathname } = new URL(request.url)
  
  // Enroll in a course
  if (pathname === '/api/enroll') {
    const body = await request.json()
    const { courseId, userId } = body
    
    return NextResponse.json({ 
      success: true,
      message: 'Enrollment successful',
      enrollmentId: `ENR-${Date.now()}`,
      courseId,
      userId
    })
  }

  // Checkout
  if (pathname === '/api/checkout') {
    const body = await request.json()
    const { courseId, paymentMethod } = body
    
    // Simulate payment processing
    return NextResponse.json({ 
      success: true,
      message: 'Payment processed successfully',
      transactionId: `TRX-${Date.now()}`,
      courseId,
      paymentMethod
    })
  }

  return NextResponse.json({ 
    success: false,
    message: 'Endpoint not found' 
  }, { status: 404 })
}
