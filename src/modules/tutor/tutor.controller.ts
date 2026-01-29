// controllers/tutor.controller.ts
import { Request, Response } from 'express'; 
import { tutorService } from './tutor.service';

// Controller functions
const createTutorProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const {
            headline,
            bio,
            hourlyRate,
            experienceYears,
            education,
            certifications,
            categories
        } = req.body;

        // Validate required fields
        if (!headline || hourlyRate === undefined || experienceYears === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Headline, hourlyRate, and experienceYears are required'
            });
        }

        const result = await tutorService.createTutorProfile(userId, {
            headline,
            bio,
            hourlyRate: Number(hourlyRate),
            experienceYears: Number(experienceYears),
            education,
            certifications,
            categories
        });

        if (!result.success) {
            return res.status(400).json(result);
        }

        if (!result.success) {
            return res.status(400).json(result);
        }

        const successResult = result as { success: true; message: string; tutorProfile: any };

        return res.status(201).json({
            success: true,
            message: 'Tutor profile created successfully',
            data: successResult.tutorProfile
        });
    } catch (error: any) {
        console.error('Controller error creating tutor profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};



// Export as object exactly like the example
export const tutorController = {
    createTutorProfile, 
};