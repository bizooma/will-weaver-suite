import { z } from 'zod';

// User authentication schemas
export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  displayName: z.string().min(1, 'Display name is required').max(50, 'Display name must be less than 50 characters').optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Will draft schemas
export const createDraftSchema = z.object({
  data: z.unknown(),
  tone: z.string().max(100, 'Tone must be less than 100 characters').nullable().optional(),
  step: z.number().int().min(0).max(100, 'Step must be between 0 and 100').nullable().optional(),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be less than 1000 characters'),
});

// Utility function to sanitize strings
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potential XSS characters
    .slice(0, 1000); // Limit length
};

// Utility function to validate and sanitize email
export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type CreateDraftInput = z.infer<typeof createDraftSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;