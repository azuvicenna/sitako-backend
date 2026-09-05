import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Format email salah'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});