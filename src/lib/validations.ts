import { z } from 'zod'

// User validation schemas
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  role: z.enum(['STUDENT', 'TUTOR', 'ADMIN']).default('STUDENT'),
})

export const updateUserSchema = createUserSchema.partial()

// Student profile schemas
export const createStudentProfileSchema = z.object({
  userId: z.string().uuid(),
  gradeLevel: z.string().optional(),
  learningGoals: z.string().optional(),
  preferredMode: z.enum(['ONLINE', 'OFFLINE']).optional(),
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
  specialRequirements: z.string().optional(),
})

// Tutor profile schemas
export const createTutorProfileSchema = z.object({
  userId: z.string().uuid(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  hourlyRateCents: z.number().int().min(0).optional(),
  currency: z.string().default('USD'),
  yearsExperience: z.number().int().min(0).optional(),
  subjects: z.array(z.string()).optional(),
  levels: z.array(z.string()).optional(),
  demoVideoUrl: z.string().url().optional(),
})

// Booking schemas
export const createBookingSchema = z.object({
  studentId: z.string().uuid(),
  tutorId: z.string().uuid(),
  subjectId: z.string().uuid(),
  startAtUTC: z.string().datetime(),
  endAtUTC: z.string().datetime(),
  priceCents: z.number().int().min(0),
  currency: z.string().default('USD'),
})

export const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED']).optional(),
  meetingLink: z.string().url().optional(),
})

// Review schemas
export const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  tutorId: z.string().uuid(),
  studentId: z.string().uuid(),
  ratingInt: z.number().int().min(1).max(5),
  text: z.string().optional(),
})

// Subject schemas
export const createSubjectSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1, 'Subject name is required'),
  slug: z.string().min(1, 'Slug is required'),
  levelTags: z.array(z.string()),
})

export const createCustomSubjectRequestSchema = z.object({
  studentId: z.string().uuid(),
  name: z.string().min(1, 'Subject name is required'),
  description: z.string().optional(),
})

// Availability schemas
export const createAvailabilityBlockSchema = z.object({
  tutorId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTimeUTC: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTimeUTC: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  isRecurring: z.boolean().default(true),
})

// Search and filter schemas
export const tutorSearchSchema = z.object({
  q: z.string().optional(),
  subject: z.string().optional(),
  level: z.string().optional(),
  priceMin: z.number().int().min(0).optional(),
  priceMax: z.number().int().min(0).optional(),
  ratingMin: z.number().min(0).max(5).optional(),
  availableFrom: z.string().datetime().optional(),
  availableTo: z.string().datetime().optional(),
  mode: z.enum(['ONLINE', 'OFFLINE']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// Payment schemas
export const createPaymentIntentSchema = z.object({
  bookingId: z.string().uuid(),
  amountCents: z.number().int().min(0),
  currency: z.string().default('USD'),
})

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(['image', 'document', 'video']),
  maxSize: z.number().int().min(0).default(10 * 1024 * 1024), // 10MB default
})

// Utility functions
export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success
}

export const validatePhone = (phone: string): boolean => {
  return z.string().regex(/^\+?[1-9]\d{1,14}$/).safeParse(phone).success
}

export const formatCurrency = (cents: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export const formatTime = (timeUTC: string): string => {
  return new Date(`2000-01-01T${timeUTC}Z`).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}
