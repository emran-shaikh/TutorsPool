// Mock data for blog and search when API is unavailable

export const mockBlogPosts = [
  {
    id: '1',
    slug: 'effective-study-techniques',
    title: 'Top 10 Effective Study Techniques for Students',
    excerpt: 'Discover proven study methods that can help you learn faster and retain information better. From the Pomodoro Technique to active recall.',
    content: 'Full content here...',
    category: 'Study Tips',
    tags: ['study', 'productivity', 'learning', 'education'],
    authorName: 'Sarah Johnson',
    authorId: 'author1',
    featuredImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    readTime: 8,
    viewCount: 1245,
    status: 'published',
  },
  {
    id: '2',
    slug: 'online-learning-tips',
    title: 'Mastering Online Learning: A Complete Guide',
    excerpt: 'Learn how to make the most of online education with these practical tips for staying focused, organized, and motivated.',
    content: 'Full content here...',
    category: 'Education',
    tags: ['online learning', 'remote education', 'tips', 'motivation'],
    authorName: 'Michael Chen',
    authorId: 'author2',
    featuredImage: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    readTime: 12,
    viewCount: 2103,
    status: 'published',
  },
  {
    id: '3',
    slug: 'exam-preparation-strategies',
    title: 'Ace Your Exams: Proven Preparation Strategies',
    excerpt: 'Get ready for your exams with these battle-tested strategies that have helped thousands of students achieve their best scores.',
    content: 'Full content here...',
    category: 'Exam Prep',
    tags: ['exams', 'preparation', 'study tips', 'success'],
    authorName: 'Emily Rodriguez',
    authorId: 'author3',
    featuredImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    readTime: 10,
    viewCount: 1876,
    status: 'published',
  },
  {
    id: '4',
    slug: 'choosing-right-tutor',
    title: 'How to Choose the Right Tutor for Your Needs',
    excerpt: 'Finding the perfect tutor can make all the difference. Learn what to look for and questions to ask when selecting a tutor.',
    content: 'Full content here...',
    category: 'Career Advice',
    tags: ['tutoring', 'education', 'guidance', 'learning'],
    authorName: 'David Thompson',
    authorId: 'author4',
    featuredImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    readTime: 7,
    viewCount: 1532,
    status: 'published',
  },
  {
    id: '5',
    slug: 'time-management-students',
    title: 'Time Management Skills Every Student Needs',
    excerpt: 'Master the art of time management with these essential skills and techniques designed specifically for busy students.',
    content: 'Full content here...',
    category: 'Study Tips',
    tags: ['time management', 'productivity', 'organization', 'student life'],
    authorName: 'Lisa Anderson',
    authorId: 'author5',
    featuredImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    readTime: 9,
    viewCount: 2341,
    status: 'published',
  },
  {
    id: '6',
    slug: 'stem-education-future',
    title: 'The Future of STEM Education',
    excerpt: 'Explore how STEM education is evolving and what it means for students preparing for careers in science, technology, engineering, and math.',
    content: 'Full content here...',
    category: 'Technology',
    tags: ['STEM', 'education', 'future', 'technology', 'careers'],
    authorName: 'Robert Kim',
    authorId: 'author6',
    featuredImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    readTime: 11,
    viewCount: 1687,
    status: 'published',
  },
];

export const mockTutors = [
  {
    id: '1',
    userId: 'user1',
    headline: 'Expert Math Tutor - Algebra to Calculus',
    bio: 'Passionate mathematics educator with 8+ years of experience helping students excel in algebra, geometry, trigonometry, and calculus. Specializing in making complex concepts simple and engaging.',
    subjects: ['Mathematics', 'Algebra', 'Calculus', 'Geometry'],
    hourlyRateCents: 4500,
    currency: 'USD',
    yearsExperience: 8,
    rating: 4.9,
    reviewCount: 127,
    totalSessions: 450,
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    name: 'John Smith',
    email: 'john.smith@tutorspool.com',
    verified: true,
    availability: 'Available',
  },
  {
    id: '2',
    userId: 'user2',
    headline: 'English Literature & Writing Specialist',
    bio: 'Published author and experienced English tutor. I help students improve their writing skills, literary analysis, and exam preparation for SAT, ACT, and AP English.',
    subjects: ['English', 'Literature', 'Writing', 'Grammar'],
    hourlyRateCents: 3800,
    currency: 'USD',
    yearsExperience: 6,
    rating: 4.8,
    reviewCount: 98,
    totalSessions: 320,
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    name: 'Emma Wilson',
    email: 'emma.wilson@tutorspool.com',
    verified: true,
    availability: 'Available',
  },
  {
    id: '3',
    userId: 'user3',
    headline: 'Physics & Chemistry Expert',
    bio: 'PhD in Physics with a passion for teaching. Specializing in high school and college-level physics and chemistry. Making science fun and understandable!',
    subjects: ['Physics', 'Chemistry', 'Science'],
    hourlyRateCents: 5500,
    currency: 'USD',
    yearsExperience: 10,
    rating: 4.95,
    reviewCount: 156,
    totalSessions: 580,
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    name: 'Dr. James Chen',
    email: 'james.chen@tutorspool.com',
    verified: true,
    availability: 'Available',
  },
  {
    id: '4',
    userId: 'user4',
    headline: 'Computer Science & Programming Tutor',
    bio: 'Software engineer with 5 years of tutoring experience. Teaching Python, Java, JavaScript, web development, and computer science fundamentals.',
    subjects: ['Computer Science', 'Programming', 'Python', 'JavaScript', 'Web Development'],
    hourlyRateCents: 6000,
    currency: 'USD',
    yearsExperience: 5,
    rating: 4.85,
    reviewCount: 89,
    totalSessions: 275,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    name: 'Alex Martinez',
    email: 'alex.martinez@tutorspool.com',
    verified: true,
    availability: 'Available',
  },
  {
    id: '5',
    userId: 'user5',
    headline: 'Spanish Language & Culture Teacher',
    bio: 'Native Spanish speaker with teaching certification. Offering conversational Spanish, grammar, and cultural immersion for all levels.',
    subjects: ['Spanish', 'Languages', 'Culture'],
    hourlyRateCents: 3500,
    currency: 'USD',
    yearsExperience: 7,
    rating: 4.9,
    reviewCount: 112,
    totalSessions: 410,
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    name: 'Maria Garcia',
    email: 'maria.garcia@tutorspool.com',
    verified: true,
    availability: 'Available',
  },
  {
    id: '6',
    userId: 'user6',
    headline: 'Biology & Life Sciences Educator',
    bio: 'Former university professor specializing in biology, anatomy, and life sciences. Helping students prepare for medical school and science exams.',
    subjects: ['Biology', 'Anatomy', 'Life Sciences'],
    hourlyRateCents: 5000,
    currency: 'USD',
    yearsExperience: 12,
    rating: 4.92,
    reviewCount: 143,
    totalSessions: 520,
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@tutorspool.com',
    verified: true,
    availability: 'Available',
  },
];

export const mockCategories = [
  'Education',
  'Study Tips',
  'Career Advice',
  'Technology',
  'Exam Prep',
  'Online Learning',
  'Student Life',
  'Teaching Methods',
];

// Helper function to filter blog posts
export function filterBlogPosts(posts: typeof mockBlogPosts, filters: {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  let filtered = [...posts];

  // Filter by search term
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(post =>
      post.title.toLowerCase().includes(searchLower) ||
      post.excerpt.toLowerCase().includes(searchLower) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter(post => post.category === filters.category);
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = filtered.slice(start, end);

  return {
    posts: paginated,
    total: filtered.length,
    page,
    totalPages: Math.ceil(filtered.length / limit),
  };
}

// Helper function to filter tutors
export function filterTutors(tutors: typeof mockTutors, filters: {
  q?: string;
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  page?: number;
  limit?: number;
}) {
  let filtered = [...tutors];

  // Filter by search query
  if (filters.q) {
    const qLower = filters.q.toLowerCase();
    filtered = filtered.filter(tutor =>
      tutor.name.toLowerCase().includes(qLower) ||
      tutor.headline.toLowerCase().includes(qLower) ||
      tutor.subjects.some(subject => subject.toLowerCase().includes(qLower))
    );
  }

  // Filter by price range
  if (filters.priceMin !== undefined) {
    filtered = filtered.filter(tutor => tutor.hourlyRateCents >= filters.priceMin! * 100);
  }
  if (filters.priceMax !== undefined) {
    filtered = filtered.filter(tutor => tutor.hourlyRateCents <= filters.priceMax! * 100);
  }

  // Filter by rating
  if (filters.ratingMin !== undefined) {
    filtered = filtered.filter(tutor => tutor.rating >= filters.ratingMin!);
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = filtered.slice(start, end);

  return {
    items: paginated,
    tutors: paginated, // Support both formats
    total: filtered.length,
    page,
    totalPages: Math.ceil(filtered.length / limit),
    limit,
  };
}
