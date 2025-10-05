import DOMPurify from 'dompurify';
import { z } from 'zod';

/**
 * Sanitizes user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Create a clean version of the input that strips HTML and harmful content
  const cleaned = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [] // No attributes allowed
  });
  
  return cleaned.trim();
}

/**
 * Customer information validation schema using zod
 * Provides type-safe validation with comprehensive rules
 */
export const customerInfoSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre debe tener menos de 100 caracteres')
    .refine((val) => sanitizeInput(val).length >= 2, {
      message: 'El nombre contiene caracteres no válidos'
    }),
  phone: z.string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{10,20}$/, 'Por favor, introduce un número de teléfono válido')
    .refine((val) => {
      const cleaned = val.replace(/\D/g, '');
      return cleaned.length >= 10 && cleaned.length <= 15;
    }, {
      message: 'El teléfono debe tener entre 10 y 15 dígitos'
    }),
  address: z.string()
    .trim()
    .min(10, 'La dirección debe tener al menos 10 caracteres')
    .max(500, 'La dirección es demasiado larga')
    .refine((val) => sanitizeInput(val).length >= 10, {
      message: 'La dirección contiene caracteres no válidos'
    }),
  notes: z.string()
    .max(500, 'Las notas deben tener menos de 500 caracteres')
    .optional()
    .default('')
});

export type CustomerInfo = z.infer<typeof customerInfoSchema>;

/**
 * Validates customer information using zod schema
 * Returns sanitized data or validation errors
 */
export function validateCustomerInfo(info: {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}): { isValid: boolean; errors: string[]; data?: CustomerInfo } {
  const result = customerInfoSchema.safeParse(info);
  
  if (result.success) {
    // Apply additional sanitization to the validated data
    return {
      isValid: true,
      errors: [],
      data: {
        name: sanitizeInput(result.data.name),
        phone: result.data.phone.trim(),
        address: sanitizeInput(result.data.address),
        notes: result.data.notes ? sanitizeInput(result.data.notes) : ''
      }
    };
  }
  
  return {
    isValid: false,
    errors: result.error.errors.map(err => err.message)
  };
}