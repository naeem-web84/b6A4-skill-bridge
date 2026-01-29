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

    // Build input object
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

/* Get Tutor Availability */
const getTutorAvailability = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Parse query parameters
    const { date, startDate, endDate, isBooked } = req.query;

    const filters: any = {};
    if (date) filters.date = new Date(date as string);
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (isBooked !== undefined) filters.isBooked = isBooked === 'true';

    const result = await availabilityService.getTutorAvailability(userId, filters);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      data: result.availabilitySlots
    });
  } catch (error: any) {
    console.error('Controller error getting availability:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

 
const getAvailabilitySlot = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
 
    const extractSlotId = (idParam: string | string[] | undefined): string | null => {
      if (!idParam) return null;
      
      if (Array.isArray(idParam)) {
        return idParam[0] || null;
      }
      
      return idParam;
    };

    const slotId = extractSlotId(req.params.Id);
    
    if (!slotId || slotId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
    }

    const result = await availabilityService.getAvailabilitySlotById(userId, slotId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json({
      success: true,
      data: result.availabilitySlot
    });
  } catch (error: any) {
    console.error('Controller error getting slot:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


/* Update Availability Slot */
const updateAvailabilitySlot = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { slotId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
    }

    const {
      date,
      startTime,
      endTime,
      isBooked
    } = req.body;

    // Prepare update data
    const updateData: any = {};
    if (date) updateData.date = new Date(date);
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (isBooked !== undefined) updateData.isBooked = isBooked;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update data provided'
      });
    }

    const result = await availabilityService.updateAvailabilitySlot(
      userId, 
      slotId, 
      updateData
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: (result as any).availabilitySlot
    });
  } catch (error: any) {
    console.error('Controller error updating slot:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* Delete Availability Slot */
const deleteAvailabilitySlot = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { slotId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
    }

    const result = await availabilityService.deleteAvailabilitySlot(userId, slotId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    console.error('Controller error deleting slot:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};



/* Export */
export const availabilityController = {
  createAvailabilitySlot, 
  getTutorAvailability,
  getAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot
};