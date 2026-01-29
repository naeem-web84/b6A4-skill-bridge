// controllers/tutor.controller.ts
import { Request, Response } from 'express'; 
import { tutorService } from './tutor.service';

/* Create Tutor Profile */
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

        return res.status(201).json({
            success: true,
            message: 'Tutor profile created successfully',
            data: (result as any).tutorProfile
        });
    } catch (error: any) {
        console.error('Controller error creating tutor profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/* Get Tutor Profile */
const getTutorProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const result = await tutorService.getTutorProfileByUserId(userId);
        
        if (!result.success) {
            return res.status(404).json({
                success: false,
                message: 'Tutor profile not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: (result as any).profile
        });
    } catch (error: any) {
        console.error('Controller error getting tutor profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/* Export */
export const tutorController = {
    createTutorProfile,
    getTutorProfile
};