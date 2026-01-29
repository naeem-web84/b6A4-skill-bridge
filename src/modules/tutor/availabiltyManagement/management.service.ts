import { prisma } from "../../../lib/prisma";

/* Types */
interface CreateAvailabilitySlotInput {
  date: Date;
  startTime: Date;
  endTime: Date;
  isRecurring?: boolean;
  recurringPattern?: string;
  validFrom?: Date;
  validUntil?: Date;
}

/* Create Availability Slot */
const createAvailabilitySlot = async (
  userId: string,
  data: CreateAvailabilitySlotInput
) => {
  try {
    // Get tutor profile first
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

    // Check for overlapping slots
    const overlappingSlot = await prisma.availabilitySlot.findFirst({
      where: {
        tutorProfileId: tutorProfile.id,
        date: data.date,
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: data.startTime } },
              { endTime: { lte: data.endTime } }
            ]
          }
        ]
      }
    });

    if (overlappingSlot) {
      throw new Error('Time slot overlaps with existing availability');
    }

    // Calculate duration in minutes
    const duration = Math.round(
      (new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) / (1000 * 60)
    );

    if (duration <= 0) {
      throw new Error('End time must be after start time');
    }

    // Create availability slot - explicitly handle undefined values
    const availabilitySlot = await prisma.availabilitySlot.create({
      data: {
        tutorProfileId: tutorProfile.id,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        isRecurring: data.isRecurring ?? false,
        recurringPattern: data.recurringPattern ?? null, // Use null instead of undefined
        validFrom: data.validFrom ?? null, // Use null instead of undefined
        validUntil: data.validUntil ?? null, // Use null instead of undefined
        isBooked: false
      }
    });

    return {
      success: true,
      message: 'Availability slot created successfully',
      availabilitySlot
    };
  } catch (error: any) {
    console.error('Create availability slot error:', error);
    return {
      success: false,
      message: error.message || 'Failed to create availability slot'
    };
  }
};


/* Get Tutor's Availability Slots */
const getTutorAvailability = async (
  userId: string,
  filters?: {
    date?: Date;
    startDate?: Date;
    endDate?: Date;
    isBooked?: boolean;
  }
) => {
  try {
    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

    // Build where conditions
    const whereConditions: any = {
      tutorProfileId: tutorProfile.id
    };

    if (filters?.date) {
      whereConditions.date = filters.date;
    }

    if (filters?.startDate && filters?.endDate) {
      whereConditions.date = {
        gte: filters.startDate,
        lte: filters.endDate
      };
    }

    if (filters?.isBooked !== undefined) {
      whereConditions.isBooked = filters.isBooked;
    }

    // Get availability slots
    const availabilitySlots = await prisma.availabilitySlot.findMany({
      where: whereConditions,
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return {
      success: true,
      availabilitySlots
    };
  } catch (error: any) {
    console.error('Get tutor availability error:', error);
    return {
      success: false,
      message: 'Failed to get availability slots',
      availabilitySlots: []
    };
  }
};






/* Export */
export const availabilityService = {
  createAvailabilitySlot, 
  getTutorAvailability,
  
};