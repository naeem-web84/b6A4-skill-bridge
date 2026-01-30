import { prisma } from "../../../lib/prisma";

/* ========== TYPES ========== */
interface BrowseTutorsFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minRating?: number;
  maxHourlyRate?: number;
  experienceYears?: number;
  sortBy?: 'rating' | 'hourlyRate' | 'experienceYears' | 'totalReviews';
  sortOrder?: 'asc' | 'desc';
}

interface AvailabilityFilters {
  startDate?: Date;
  endDate?: Date;
}

// Helper function to safely get date key
const getDateKey = (date: Date | null | undefined): string => {
  if (!date) return 'no-date';
  return date.toISOString().split('T')[0];
};

/* ========== BROWSE/SEARCH TUTORS ========== */
const browseTutors = async (filters: BrowseTutorsFilters) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      minRating = 0,
      maxHourlyRate,
      experienceYears,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;

    // Build the where clause - simplified based on your schema
    const where: any = {};

    // Add search filter (search in headline, bio)
    if (search) {
      where.OR = [
        {
          headline: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          bio: {
            contains: search,
            mode: 'insensitive' as const
          }
        }
      ];
    }

    // Add category filter through tutor_categories
    if (category) {
      where.tutor_categories = {
        some: {
          categoryId: category
        }
      };
    }

    // Add rating filter
    if (minRating) {
      where.rating = {
        gte: minRating
      };
    }

    // Add hourly rate filter
    if (maxHourlyRate) {
      where.hourlyRate = {
        lte: maxHourlyRate
      };
    }

    // Add experience filter
    if (experienceYears) {
      where.experienceYears = {
        gte: experienceYears
      };
    }

    // Determine sort order
    const orderBy: any = {};
    if (sortBy === 'hourlyRate') {
      orderBy.hourlyRate = sortOrder;
    } else if (sortBy === 'experienceYears') {
      orderBy.experienceYears = sortOrder;
    } else if (sortBy === 'totalReviews') {
      orderBy.totalReviews = sortOrder;
    } else {
      orderBy.rating = sortOrder;
    }

    // Get tutors with pagination - simplified based on your schema
    const tutors = await prisma.tutorProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy
    });

    // Get total count for pagination
    const totalTutors = await prisma.tutorProfile.count({ where });

    // Get user details for each tutor
    const tutorsWithUserInfo = await Promise.all(
      tutors.map(async (tutor) => {
        const user = await prisma.user.findUnique({
          where: { id: tutor.userId },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true
          }
        });

        // Get categories for this tutor
        const tutorCategories = await prisma.tutorCategory.findMany({
          where: { tutorProfileId: tutor.id },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        });

        // Get recent reviews for this tutor
        const reviews = await prisma.review.findMany({
          where: { tutorProfileId: tutor.id },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true
          },
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        });

        return {
          id: tutor.id,
          userId: tutor.userId,
          name: user?.name || 'Unknown',
          email: user?.email || '',
          image: user?.image || null,
          headline: tutor.headline,
          bio: tutor.bio,
          hourlyRate: tutor.hourlyRate,
          rating: tutor.rating,
          totalReviews: tutor.totalReviews,
          experienceYears: tutor.experienceYears,
          education: tutor.education,
          certifications: tutor.certifications,
          completedSessions: tutor.completedSessions,
          createdAt: tutor.createdAt,
          updatedAt: tutor.updatedAt,
          categories: tutorCategories.map(tc => tc.category),
          recentReviews: reviews
        };
      })
    );

    return {
      success: true,
      data: {
        tutors: tutorsWithUserInfo,
        pagination: {
          page,
          limit,
          total: totalTutors,
          totalPages: Math.ceil(totalTutors / limit),
          hasNextPage: page * limit < totalTutors,
          hasPrevPage: page > 1
        },
        filters: {
          search,
          category,
          minRating,
          maxHourlyRate,
          experienceYears,
          sortBy,
          sortOrder
        }
      }
    };
  } catch (error: any) {
    console.error('Browse tutors service error:', error);
    return {
      success: false,
      message: 'Failed to browse tutors',
      data: null
    };
  }
};

/* ========== GET SPECIFIC TUTOR PROFILE ========== */
const getTutorProfile = async (tutorId: string) => {
  try {
    // Find tutor profile by ID
    const tutor = await prisma.tutorProfile.findUnique({
      where: {
        id: tutorId
      }
    });

    if (!tutor) {
      return {
        success: false,
        message: 'Tutor not found',
        data: null
      };
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: tutor.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true
      }
    });

    // Get categories for this tutor
    const tutorCategories = await prisma.tutorCategory.findMany({
      where: { tutorProfileId: tutor.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    // Get reviews for this tutor
    const reviews = await prisma.review.findMany({
      where: { tutorProfileId: tutor.id },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get reviews with student info
    const reviewsWithStudentInfo = await Promise.all(
      reviews.map(async (review) => {
        const studentUser = await prisma.user.findUnique({
          where: { id: review.studentUserId },
          select: {
            id: true,
            name: true,
            image: true
          }
        });

        const studentProfile = await prisma.studentProfile.findUnique({
          where: { userId: review.studentUserId },
          select: {
            grade: true
          }
        });

        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          student: {
            id: studentUser?.id,
            name: studentUser?.name,
            image: studentUser?.image,
            grade: studentProfile?.grade
          }
        };
      })
    );

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where: {
        tutorProfileId: tutorId,
        status: 'COMPLETED'
      },
      select: {
        id: true,
        bookingDate: true,
        studentUserId: true
      },
      take: 50
    });

    // Calculate statistics
    const totalStudents = new Set(bookings.map(b => b.studentUserId)).size;
    const totalSessions = bookings.length;

    // Get availability slots count
    const availableSlots = await prisma.availabilitySlot.count({
      where: {
        tutorProfileId: tutorId,
        isBooked: false,
        date: {
          gte: new Date()
        }
      }
    });

    // Format the response
    const formattedTutor = {
      id: tutor.id,
      userId: tutor.userId,
      name: user?.name || 'Unknown',
      email: user?.email || '',
      image: user?.image || null,
      headline: tutor.headline,
      bio: tutor.bio,
      hourlyRate: tutor.hourlyRate,
      rating: tutor.rating,
      totalReviews: tutor.totalReviews,
      experienceYears: tutor.experienceYears,
      education: tutor.education,
      certifications: tutor.certifications,
      completedSessions: tutor.completedSessions,
      createdAt: tutor.createdAt,
      updatedAt: tutor.updatedAt,
      categories: tutorCategories.map(tc => tc.category),
      reviews: reviewsWithStudentInfo,
      statistics: {
        totalStudents,
        totalSessions,
        availableSlots,
        completedSessions: tutor.completedSessions || 0
      }
    };

    return {
      success: true,
      data: formattedTutor
    };
  } catch (error: any) {
    console.error('Get tutor profile service error:', error);
    return {
      success: false,
      message: 'Failed to get tutor profile',
      data: null
    };
  }
};

/* ========== GET TUTOR AVAILABILITY ========== */
const getTutorAvailability = async (tutorId: string, filters: AvailabilityFilters) => {
  try {
    // Verify tutor exists
    const tutor = await prisma.tutorProfile.findUnique({
      where: {
        id: tutorId
      }
    });

    if (!tutor) {
      return {
        success: false,
        message: 'Tutor not found',
        data: null
      };
    }

    // Get tutor name
    const user = await prisma.user.findUnique({
      where: { id: tutor.userId },
      select: {
        name: true
      }
    });

    // Set date range (default: next 30 days)
    const now = new Date();
    const startDate = filters.startDate || now;
    const endDate = filters.endDate || new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);

    // Get availability slots
    const availabilitySlots = await prisma.availabilitySlot.findMany({
      where: {
        tutorProfileId: tutorId,
        isBooked: false,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    // Group slots by date for easier display
    const slotsByDate: Record<string, any[]> = {};
    availabilitySlots.forEach(slot => {
      // Use helper function to safely get date key
      const dateKey = getDateKey(slot.date);
      
      if (!slotsByDate[dateKey]) {
        slotsByDate[dateKey] = [];
      }
      slotsByDate[dateKey].push({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime, 
        isRecurring: slot.isRecurring,
        recurringPattern: slot.recurringPattern
      });
    });

    // Format dates for response
    const formattedDates = Object.keys(slotsByDate).map(date => ({
      date,
      slots: slotsByDate[date]
    }));

    return {
      success: true,
      data: {
        tutorId,
        tutorName: user?.name || 'Unknown',
        startDate,
        endDate,
        totalAvailableSlots: availabilitySlots.length,
        availability: formattedDates,
        slotsByDate
      }
    };
  } catch (error: any) {
    console.error('Get tutor availability service error:', error);
    return {
      success: false,
      message: 'Failed to get tutor availability',
      data: null
    };
  }
};

/* ========== EXPORT ========== */
export const publicTutorService = {
  browseTutors,
  getTutorProfile,
  getTutorAvailability
};