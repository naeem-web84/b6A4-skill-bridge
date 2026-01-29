 import { Request, Response } from 'express'; 
import { availabilityService } from './management.service';

/* Create Availability Slot */
const createAvailabilitySlot = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      date,
      startTime,
      endTime,
      isRecurring,
      recurringPattern,
      validFrom,
      validUntil
    } = req.body;

    // Validate required fields
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Date, startTime, and endTime are required'
      });
    }

    // Validate date format and logic
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const slotDate = new Date(date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(slotDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Validate that end time is after start time
    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Build input object with explicit typing
    const input: any = {
      date: slotDate,
      startTime: startDate,
      endTime: endDate
    };

    // Only add optional fields if they are provided
    if (isRecurring !== undefined) {
      input.isRecurring = Boolean(isRecurring);
    }

    if (recurringPattern !== undefined) {
      input.recurringPattern = recurringPattern;
    }

    if (validFrom !== undefined) {
      const validFromDate = new Date(validFrom);
      if (!isNaN(validFromDate.getTime())) {
        input.validFrom = validFromDate;
      }
    }

    if (validUntil !== undefined) {
      const validUntilDate = new Date(validUntil);
      if (!isNaN(validUntilDate.getTime())) {
        input.validUntil = validUntilDate;
      }
    }

    const result = await availabilityService.createAvailabilitySlot(userId, input);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.availabilitySlot
    });
  } catch (error: any) {
    console.error('Controller error creating availability slot:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* Export */
export const availabilityController = {
  createAvailabilitySlot, 
};