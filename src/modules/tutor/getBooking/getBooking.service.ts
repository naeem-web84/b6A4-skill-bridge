 
import { BookingStatus } from "../../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";

interface GetBookingsFilters {
  status?: BookingStatus | 'all';
  categoryId?: string;
  studentName?: string;
  startDate?: Date;
  endDate?: Date;
  isPaid?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  includeStudentDetails?: boolean;
}

interface BookingWithStudent {
  id: string;
  studentUserId: string;
  tutorUserId: string;
  studentProfileId: string;
  tutorProfileId: string;
  categoryId: string;
  availabilitySlotId?: string;
  bookingDate: Date;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: BookingStatus;
  amount: number;
  paymentId?: string;
  isPaid: boolean;
  meetingLink?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    description?: string;
  };
  studentUser: {
    id: string;
    name: string;
    email: string;
  };
  studentProfile: {
    id: string;
    grade?: string;
    subjects: string[];
  };
  availabilitySlot?: {
    id: string;
    date: Date;
    startTime: Date;
    endTime: Date;
  };
  review?: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: Date;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface GetBookingsResponse {
  success: boolean;
  message: string;
  data: BookingWithStudent[];
  pagination: PaginationInfo;
}
 
const getTutorAllBookings = async (
  userId: string,
  filters: GetBookingsFilters = {}
): Promise<GetBookingsResponse> => {
  try {
    console.log("🔍 [GetBookingService] Fetching bookings for user:", userId);
    console.log("📋 Filters:", filters);
 
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) { 
      return {
        success: false,
        message: 'Tutor profile not found. Please complete your tutor profile.',
        data: [],
        pagination: {
          total: 0,
          page: filters.page || 1,
          limit: filters.limit || 10,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
 
    const whereConditions: any = {
      OR: [
        { tutorProfileId: tutorProfile.id },
        { tutorUserId: userId }
      ]
    };
 
    if (filters.status && filters.status !== 'all') {
      whereConditions.status = filters.status;
    }
 
    if (filters.categoryId) {
      whereConditions.categoryId = filters.categoryId;
    }
 
    if (filters.startDate && filters.endDate) {
      whereConditions.bookingDate = {
        gte: filters.startDate,
        lte: filters.endDate
      };
    } else if (filters.startDate) {
      whereConditions.bookingDate = {
        gte: filters.startDate
      };
    } else if (filters.endDate) {
      whereConditions.bookingDate = {
        lte: filters.endDate
      };
    }
 
    if (filters.isPaid !== undefined) {
      whereConditions.isPaid = filters.isPaid;
    }
 
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      whereConditions.OR = [
        ...(whereConditions.OR || []),
        {
          studentUser: {
            name: {
              contains: searchTerm,
              mode: 'insensitive' as const
            }
          }
        },
        {
          category: {
            name: {
              contains: searchTerm,
              mode: 'insensitive' as const
            }
          }
        }
      ];
    }
 
    if (filters.studentName) {
      whereConditions.studentUser = {
        name: {
          contains: filters.studentName,
          mode: 'insensitive' as const
        }
      };
    }
 
 
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
 
    const orderBy: any = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy.bookingDate = 'desc';
    }
 
    const bookings = await prisma.booking.findMany({
      where: whereConditions,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        studentProfile: {
          select: {
            id: true,
            grade: true,
            subjects: true
          }
        },
        availabilitySlot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true
          }
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    });
 
 
    const bookingsWithStudentInfo: BookingWithStudent[] = await Promise.all(
      bookings.map(async (booking) => {
        const studentUser = await prisma.user.findUnique({
          where: { id: booking.studentUserId },
          select: {
            id: true,
            name: true,
            email: true
          }
        });

        return {
          ...booking,
          studentUser: studentUser || {
            id: booking.studentUserId,
            name: 'Unknown Student',
            email: 'No email'
          }
        } as BookingWithStudent;
      })
    );
 
    const total = await prisma.booking.count({
      where: whereConditions
    });

    const totalPages = Math.ceil(total / limit);
 

    return {
      success: true,
      message: 'Bookings fetched successfully',
      data: bookingsWithStudentInfo,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };

  } catch (error: any) { 
     
    try {
      const fallbackTutorProfile = await prisma.tutorProfile.findUnique({
        where: { userId }
      });

      const fallbackWhereConditions: any = {
        tutorUserId: userId
      };

      if (fallbackTutorProfile?.id) {
        fallbackWhereConditions.OR = [
          { tutorUserId: userId },
          { tutorProfileId: fallbackTutorProfile.id }
        ];
      }

      const fallbackBookings = await prisma.booking.findMany({
        where: fallbackWhereConditions,
        take: 10,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          studentProfile: {
            select: {
              id: true,
              grade: true,
              subjects: true
            }
          }
        }
      });

      const fallbackWithUsers: BookingWithStudent[] = await Promise.all(
        fallbackBookings.map(async (booking) => {
          const studentUser = await prisma.user.findUnique({
            where: { id: booking.studentUserId },
            select: {
              id: true,
              name: true,
              email: true
            }
          });

          return {
            ...booking,
            studentUser: studentUser || {
              id: booking.studentUserId,
              name: 'Unknown Student',
              email: 'No email'
            }
          } as BookingWithStudent;
        })
      );

      return {
        success: true,
        message: 'Bookings fetched with fallback',
        data: fallbackWithUsers,
        pagination: {
          total: fallbackBookings.length,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (fallbackError) {
      return {
        success: false,
        message: 'Failed to fetch bookings: ' + error.message,
        data: [],
        pagination: {
          total: 0,
          page: filters.page || 1,
          limit: filters.limit || 10,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }
};
 
const getTutorBookingStats = async (userId: string) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      return {
        success: false,
        message: 'Tutor profile not found'
      };
    }

    const whereConditions = {
      OR: [
        { tutorProfileId: tutorProfile.id },
        { tutorUserId: userId }
      ]
    };

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      rescheduledBookings,
      upcomingBookings,
      totalEarningsResult,
      recentBookings
    ] = await Promise.all([ 
      prisma.booking.count({ where: whereConditions }),
       
      prisma.booking.count({
        where: {
          ...whereConditions,
          status: 'PENDING'
        }
      }),
       
      prisma.booking.count({
        where: {
          ...whereConditions,
          status: 'CONFIRMED'
        }
      }),
       
      prisma.booking.count({
        where: {
          ...whereConditions,
          status: 'COMPLETED'
        }
      }),
       
      prisma.booking.count({
        where: {
          ...whereConditions,
          status: 'CANCELLED'
        }
      }), 
      prisma.booking.count({
        where: {
          ...whereConditions,
          status: 'RESCHEDULED'
        }
      }),
       
      prisma.booking.count({
        where: {
          ...whereConditions,
          status: 'CONFIRMED',
          bookingDate: {
            gte: new Date()
          }
        }
      }),
       
      prisma.booking.aggregate({
        where: {
          ...whereConditions,
          status: 'COMPLETED',
          isPaid: true
        },
        _sum: {
          amount: true
        }
      }),
       
      prisma.booking.count({
        where: {
          ...whereConditions,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    const totalEarnings = totalEarningsResult._sum.amount || 0;
    const completionRate = totalBookings > 0 
      ? Math.round((completedBookings / totalBookings) * 100) 
      : 0;

    return {
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        rescheduledBookings,
        upcomingBookings,
        totalEarnings,
        completionRate,
        recentBookings,
        averageSessionPrice: completedBookings > 0 
          ? totalEarnings / completedBookings 
          : 0,
        todayEarnings: 0,  
        totalStudents: await prisma.booking.groupBy({
          by: ['studentUserId'],
          where: whereConditions,
          _count: true
        }).then(groups => groups.length)
      }
    };

  } catch (error: any) { 
    return {
      success: false,
      message: 'Failed to get booking statistics'
    };
  }
};
 
const getPendingBookingsCount = async (userId: string) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      return {
        success: false,
        message: 'Tutor profile not found',
        data: { count: 0 }
      };
    }

    const whereConditions = {
      OR: [
        { tutorProfileId: tutorProfile.id },
        { tutorUserId: userId }
      ],
      status: 'PENDING' as BookingStatus
    };

    const count = await prisma.booking.count({
      where: whereConditions
    });

    return {
      success: true,
      message: 'Pending count fetched',
      data: { count }
    };

  } catch (error: any) { 
    return {
      success: false,
      message: 'Failed to get pending count',
      data: { count: 0 }
    };
  }
};
 
export const getBookingService = {
  getTutorAllBookings,
  getTutorBookingStats,
  getPendingBookingsCount
};