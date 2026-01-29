// modules/tutor/dashboard/dashboard.service.ts
import { prisma } from "../../../lib/prisma"; 

/* ========== TYPES ========== */
interface UpcomingSessionsFilters {
  days?: number;
  limit?: number;
}

// Helper function to safely get date key
const getDateKey = (date: Date | null | undefined)  => {
  if (!date) return 'no-date';
  return date.toISOString().split('T')[0];
};

/* ========== GET DASHBOARD STATISTICS ========== */
const getDashboardStats = async (userId: string) => {
  try {
    // Get tutor profile first
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      return {
        success: false,
        message: 'Tutor profile not found'
      };
    }

    // Get current date for calculations
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Total earnings (from completed bookings)
    const earningsResult = await prisma.booking.aggregate({
      where: {
        tutorProfileId: tutorProfile.id,
        status: 'COMPLETED',
        isPaid: true
      },
      _sum: {
        amount: true
      }
    });

    // 2. Today's earnings
    const todayEarningsResult = await prisma.booking.aggregate({
      where: {
        tutorProfileId: tutorProfile.id,
        status: 'COMPLETED',
        isPaid: true,
        bookingDate: {
          gte: startOfToday
        }
      },
      _sum: {
        amount: true
      }
    });

    // 3. Session statistics
    const sessionStats = await prisma.booking.groupBy({
      by: ['status'],
      where: {
        tutorProfileId: tutorProfile.id
      },
      _count: {
        id: true
      }
    });

    // Convert to object for easy access
    const sessionsByStatus: Record<string, number> = {};
    sessionStats.forEach(stat => {
      // Check if status exists before using it as a key
      if (stat.status) {
        sessionsByStatus[stat.status] = stat._count.id;
      }
    });

    // 4. Upcoming sessions count
    const upcomingSessions = await prisma.booking.count({
      where: {
        tutorProfileId: tutorProfile.id,
        status: 'CONFIRMED',
        bookingDate: {
          gte: startOfToday
        }
      }
    });

    // 5. Pending booking requests
    const pendingRequests = await prisma.booking.count({
      where: {
        tutorProfileId: tutorProfile.id,
        status: 'PENDING'
      }
    });

    // 6. Recent reviews statistics
    const recentReviews = await prisma.review.aggregate({
      where: {
        tutorProfileId: tutorProfile.id,
        createdAt: {
          gte: startOfMonth
        }
      },
      _avg: {
        rating: true
      },
      _count: {
        id: true
      }
    });

    // 7. Available time slots
    const availableSlots = await prisma.availabilitySlot.count({
      where: {
        tutorProfileId: tutorProfile.id,
        isBooked: false,
        date: {
          gte: startOfToday
        }
      }
    });

    // 8. Student count (unique students)
    const uniqueStudents = await prisma.booking.groupBy({
      by: ['studentUserId'],
      where: {
        tutorProfileId: tutorProfile.id
      }
    });

    // 9. Weekly earnings trend (last 4 weeks)
    const fourWeeksAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28);
    
    const weeklyEarnings = await prisma.booking.groupBy({
      by: ['bookingDate'],
      where: {
        tutorProfileId: tutorProfile.id,
        status: 'COMPLETED',
        isPaid: true,
        bookingDate: {
          gte: fourWeeksAgo
        }
      },
      _sum: {
        amount: true
      }
    });

    // Format weekly earnings data
    const weeklyEarningsData = weeklyEarnings.map(item => ({
      date: item.bookingDate,
      earnings: item._sum.amount || 0
    }));

    // Calculate completion rate
    const totalSessions = Object.values(sessionsByStatus).reduce((a, b) => a + b, 0);
    const completedSessions = sessionsByStatus['COMPLETED'] || 0;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Compile dashboard statistics
    const stats = {
      // Earnings
      totalEarnings: earningsResult._sum.amount || 0,
      todayEarnings: todayEarningsResult._sum.amount || 0,
      averageSessionPrice: completedSessions > 0 ? (earningsResult._sum.amount || 0) / completedSessions : 0,
      
      // Sessions
      totalSessions,
      completedSessions,
      upcomingSessions,
      pendingRequests,
      availableSlots,
      completionRate: Math.round(completionRate),
      
      // Session status breakdown
      sessionsByStatus: {
        completed: sessionsByStatus['COMPLETED'] || 0,
        confirmed: sessionsByStatus['CONFIRMED'] || 0,
        pending: sessionsByStatus['PENDING'] || 0,
        cancelled: sessionsByStatus['CANCELLED'] || 0,
        rescheduled: sessionsByStatus['RESCHEDULED'] || 0
      },
      
      // Reviews
      averageRating: tutorProfile.rating,
      totalReviews: tutorProfile.totalReviews,
      recentReviews: recentReviews._count.id,
      recentAverageRating: recentReviews._avg.rating || 0,
      
      // Students
      totalStudents: uniqueStudents.length,
      
      // Trends
      weeklyEarnings: weeklyEarningsData,
      
      // Profile
      hourlyRate: tutorProfile.hourlyRate,
      experienceYears: tutorProfile.experienceYears
    };

    return {
      success: true,
      data: stats
    };
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    return {
      success: false,
      message: 'Failed to get dashboard statistics',
      data: {
        totalEarnings: 0,
        todayEarnings: 0,
        totalSessions: 0,
        completedSessions: 0,
        upcomingSessions: 0,
        pendingRequests: 0,
        availableSlots: 0,
        completionRate: 0,
        sessionsByStatus: {
          completed: 0,
          confirmed: 0,
          pending: 0,
          cancelled: 0,
          rescheduled: 0
        },
        averageRating: 0,
        totalReviews: 0,
        recentReviews: 0,
        recentAverageRating: 0,
        totalStudents: 0,
        weeklyEarnings: [],
        hourlyRate: 0,
        experienceYears: 0,
        averageSessionPrice: 0
      }
    };
  }
};

/* ========== GET UPCOMING SESSIONS ========== */
const getUpcomingSessions = async (userId: string, filters?: UpcomingSessionsFilters) => {
  try {
    // Get tutor profile first
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      return {
        success: false,
        message: 'Tutor profile not found'
      };
    }

    // Calculate date range
    const now = new Date();
    const days = filters?.days || 7;
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
    
    const limit = filters?.limit || 10;

    // Get upcoming confirmed bookings
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        tutorProfileId: tutorProfile.id,
        status: 'CONFIRMED',
        startTime: {
          gte: now,
          lte: endDate
        }
      },
      include: {
        studentProfile: {
          select: {
            id: true,
            userId: true,
            grade: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        availabilitySlot: {
          select: {
            date: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      },
      take: limit
    });

    // Get student user info for each booking
    const bookingsWithUserInfo = await Promise.all(
      upcomingBookings.map(async (booking) => {
        const studentUser = await prisma.user.findUnique({
          where: { id: booking.studentUserId },
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        });

        // Use startTime for calculations (assuming it's never null)
        const sessionTime = booking.startTime;
        const timeUntil = sessionTime.getTime() - now.getTime();
        const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
        const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

        // Determine session status
        let status = 'upcoming';
        if (hoursUntil < 24) status = 'tomorrow';
        if (hoursUntil < 2) status = 'soon';
        if (hoursUntil < 0) status = 'past';

        return {
          id: booking.id,
          bookingDate: booking.bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          duration: booking.duration,
          amount: booking.amount,
          status: booking.status,
          notes: booking.notes,
          meetingLink: booking.meetingLink,
          timeUntil: {
            hours: hoursUntil,
            minutes: minutesUntil,
            totalMinutes: Math.floor(timeUntil / (1000 * 60))
          },
          sessionStatus: status,
          student: {
            id: studentUser?.id,
            name: studentUser?.name,
            email: studentUser?.email,
            image: studentUser?.image,
            grade: booking.studentProfile?.grade
          },
          category: booking.category,
          availabilitySlot: booking.availabilitySlot
        };
      })
    );

    // Group by date for better display
    const sessionsByDate: Record<string, any[]> = {};
    bookingsWithUserInfo.forEach(booking => {
      // Use the helper function to safely get date key
      const dateKey = getDateKey(booking.bookingDate);
      
      if (!sessionsByDate[dateKey]) {
        sessionsByDate[dateKey] = [];
      }
      sessionsByDate[dateKey].push(booking);
    });

    // Get today's sessions
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    const todaysSessions = bookingsWithUserInfo.filter(booking => {
      const dateToCheck = booking.bookingDate || booking.startTime;
      return dateToCheck >= startOfToday && dateToCheck < endOfToday;
    });

    // Get tomorrow's sessions
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const endOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
    
    const tomorrowsSessions = bookingsWithUserInfo.filter(booking => {
      const dateToCheck = booking.bookingDate || booking.startTime;
      return dateToCheck >= startOfTomorrow && dateToCheck < endOfTomorrow;
    });

    // Filter for this week sessions
    const thisWeekSessions = bookingsWithUserInfo.filter(booking => {
      const dateToCheck = booking.bookingDate || booking.startTime;
      return dateToCheck <= endDate;
    });

    return {
      success: true,
      data: {
        sessions: bookingsWithUserInfo,
        groupedByDate: sessionsByDate,
        todaysSessions,
        tomorrowsSessions,
        summary: {
          total: bookingsWithUserInfo.length,
          today: todaysSessions.length,
          tomorrow: tomorrowsSessions.length,
          thisWeek: thisWeekSessions.length
        }
      }
    };
  } catch (error: any) {
    console.error('Get upcoming sessions error:', error);
    return {
      success: false,
      message: 'Failed to get upcoming sessions',
      data: {
        sessions: [],
        groupedByDate: {},
        todaysSessions: [],
        tomorrowsSessions: [],
        summary: {
          total: 0,
          today: 0,
          tomorrow: 0,
          thisWeek: 0
        }
      }
    };
  }
};

/* ========== EXPORT ========== */
export const dashboardService = {
  getDashboardStats,
  getUpcomingSessions
};