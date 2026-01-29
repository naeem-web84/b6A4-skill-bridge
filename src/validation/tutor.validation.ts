 
import { z } from 'zod';

export const createTutorProfileSchema = z.object({
    headline: z.string().min(5, 'Headline must be at least 5 characters').max(100, 'Headline too long'),
    bio: z.string().optional(),
    hourlyRate: z.number().min(0, 'Hourly rate must be positive').max(1000, 'Hourly rate too high'),
    experienceYears: z.number().int().min(0, 'Experience years cannot be negative').max(50, 'Experience years too high'),
    education: z.string().optional(),
    certifications: z.string().optional(),
    categories: z.array(
        z.object({
            categoryId: z.string().uuid('Invalid category ID'),
            proficiencyLevel: z.string().optional()
        })
    ).optional().default([])
});

export type CreateTutorProfileInput = z.infer<typeof createTutorProfileSchema>;