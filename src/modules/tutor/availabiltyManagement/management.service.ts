import { prisma } from "../../../lib/prisma";

interface UpdateAvailabilitySlotInput {
  date?: Date;
  startTime?: Date;
  endTime?: Date;
  isBooked?: boolean;
}

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

/* Get Single Availability Slot */
const getAvailabilitySlotById = async (
  userId: string,
  slotId: string
) => {
  try {
    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

    // Get slot and verify ownership
    const availabilitySlot = await prisma.availabilitySlot.findFirst({
      where: {
        id: slotId,
        tutorProfileId: tutorProfile.id
      }
    });

    if (!availabilitySlot) {
      throw new Error('Availability slot not found or access denied');
    }

    return {
      success: true,
      availabilitySlot
    };
  } catch (error: any) {
    console.error('Get availability slot error:', error);
    return {
      success: false,
      message: error.message || 'Failed to get availability slot'
    };
  }
};


/* Update Availability Slot */
const updateAvailabilitySlot = async (
  userId: string,
  slotId: string,
  data: UpdateAvailabilitySlotInput
) => {
  try {
    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

    // Verify slot exists and belongs to tutor
    const existingSlot = await prisma.availabilitySlot.findFirst({
      where: {
        id: slotId,
        tutorProfileId: tutorProfile.id,
        isBooked: false // Can't update booked slots
      }
    });

    if (!existingSlot) {
      throw new Error('Availability slot not found, booked, or access denied');
    }

    // Check for overlapping slots if time is being updated
    if (data.startTime || data.endTime || data.date) {
      const checkDate = data.date || existingSlot.date;
      const checkStartTime = data.startTime || existingSlot.startTime;
      const checkEndTime = data.endTime || existingSlot.endTime;

      const overlappingSlot = await prisma.availabilitySlot.findFirst({
        where: {
          tutorProfileId: tutorProfile.id,
          id: { not: slotId },
          date: checkDate,
          OR: [
            {
              AND: [
                { startTime: { lte: checkStartTime } },
                { endTime: { gt: checkStartTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: checkEndTime } },
                { endTime: { gte: checkEndTime } }
              ]
            },
            {
              AND: [
                { startTime: { gte: checkStartTime } },
                { endTime: { lte: checkEndTime } }
              ]
            }
          ]
        }
      });

      if (overlappingSlot) {
        throw new Error('Updated time slot overlaps with existing availability');
      }
    }

    // Update slot - handle undefined values
    const updateData: any = {};
    
    if (data.date !== undefined) updateData.date = data.date;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.isBooked !== undefined) updateData.isBooked = data.isBooked;

    const updatedSlot = await prisma.availabilitySlot.update({
      where: { id: slotId },
      data: updateData
    });

    return {
      success: true,
      message: 'Availability slot updated successfully',
      availabilitySlot: updatedSlot
    };
  } catch (error: any) {
    console.error('Update availability slot error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update availability slot'
    };
  }
};

/* Delete Availability Slot */
const deleteAvailabilitySlot = async (
  userId: string,
  slotId: string
) => {
  try {
    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

    // Verify slot exists and belongs to tutor
    const existingSlot = await prisma.availabilitySlot.findFirst({
      where: {
        id: slotId,
        tutorProfileId: tutorProfile.id,
        isBooked: false // Can't delete booked slots
      }
    });

    if (!existingSlot) {
      throw new Error('Availability slot not found, booked, or access denied');
    }

    // Delete slot
    await prisma.availabilitySlot.delete({
      where: { id: slotId }
    });

    return {
      success: true,
      message: 'Availability slot deleted successfully'
    };
  } catch (error: any) {
    console.error('Delete availability slot error:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete availability slot'
    };
  }
};






/* Export */
export const availabilityService = {
  createAvailabilitySlot, 
  getTutorAvailability,
  getAvailabilitySlotById,
  updateAvailabilitySlot,
  deleteAvailabilitySlot

};