import { Request, Response } from 'express'; 
import { tutorService } from './tutor.service';
 
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
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
 
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
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


const checkEligibility = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const result = await tutorService.checkTutorEligibility(userId);
        
        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error: any) { 
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAvailableCategories = async (req: Request, res: Response) => {
    try {
        const result = await tutorService.getAvailableCategories();
        
        if (!result.success) {
            return res.status(500).json(result);
        }

        return res.status(200).json({
            success: true,
            data: result.categories
        });
    } catch (error: any) { 
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
 
const updateTutorProfile = async (req: Request, res: Response) => {
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
 
        const updateData: any = {};
        if (headline !== undefined) updateData.headline = headline;
        if (bio !== undefined) updateData.bio = bio;
        if (hourlyRate !== undefined) updateData.hourlyRate = Number(hourlyRate);
        if (experienceYears !== undefined) updateData.experienceYears = Number(experienceYears);
        if (education !== undefined) updateData.education = education;
        if (certifications !== undefined) updateData.certifications = certifications;
        if (categories !== undefined) updateData.categories = categories;
 
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        const result = await tutorService.updateTutorProfile(userId, updateData);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json({
            success: true,
            message: 'Tutor profile updated successfully',
            data: (result as any).tutorProfile
        });
    } catch (error: any) { 
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


 
export const tutorController = {
    createTutorProfile,
    getTutorProfile,
    checkEligibility,
    getAvailableCategories,
    updateTutorProfile,
};