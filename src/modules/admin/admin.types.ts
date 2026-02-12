export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'role';
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  type?: string;
  isRead?: boolean;
  isDeleted?: boolean;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface TutorFilters {
  page?: number;
  limit?: number;
  search?: string;
  minRating?: number;
  maxHourlyRate?: number;
  experienceYears?: number;
  sortBy?: 'rating' | 'hourlyRate' | 'experienceYears' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface BookingFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'bookingDate' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  search?: string;
  minRating?: number;
  maxRating?: number;
  isVerified?: boolean;
  sortBy?: 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateUserData {
  name?: string;
  role?: string;
  status?: string;
  emailVerified?: boolean;
}

export interface UpdateTutorData {
  headline?: string;
  bio?: string;
  hourlyRate?: number;
  experienceYears?: number;
  education?: string;
  certifications?: string;
  rating?: number;
  totalReviews?: number;
  completedSessions?: number;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string | null;
}

export interface UpdateBookingData {
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | null;
  amount?: number;
  isPaid?: boolean;
  meetingLink?: string;
  notes?: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
  isVerified?: boolean;
}

export interface CreateCategoryData {
  name: string;
  description?: string | null;
}

export interface CreateNotificationData {
  userId: string;
  title: string;
  message?: string;
  type: string;
  relatedId?: string;
  relatedType?: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalTutors: number;
  totalStudents: number;
  totalAdmins: number;
  totalBookings: number;
  totalRevenue: number;
  activeBookings: number;
  pendingBookings: number;
  totalCategories: number;
  totalReviews: number;
  averageRating: number;
  recentUsers: Array<{ date: string; count: number }>;
  recentBookings: Array<{ date: string; count: number }>;
  recentRevenue: Array<{ date: string; amount: number }>;
}

export interface ServiceSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ServiceErrorResponse {
  success: false;
  message: string;
}

export type ServiceResponse<T = any> = ServiceSuccessResponse<T> | ServiceErrorResponse;