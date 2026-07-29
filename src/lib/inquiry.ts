import { z } from 'zod';

export const inquirySchema = z.object({
  name: z.string().trim().min(1).max(100), company: z.string().trim().max(120).optional().or(z.literal('')),
  email: z.string().trim().email().max(254), country: z.string().trim().max(120).optional().or(z.literal('')),
  service: z.string().trim().min(2).max(120), priority: z.string().trim().min(2).max(120),
  details: z.string().trim().min(10).max(5000), source: z.enum(['contact', 'questionnaire', 'product', 'resource']),
  product: z.string().trim().max(180).optional(), resource: z.string().trim().max(180).optional(),
  questionnaire: z.record(z.string(), z.string().max(180)).optional(), turnstileToken: z.string().max(4000).optional(), honeypot: z.string().max(0).optional(),
});
export type Inquiry = z.infer<typeof inquirySchema>;
