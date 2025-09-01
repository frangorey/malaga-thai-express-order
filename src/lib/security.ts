import DOMPurify from 'dompurify';

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
 * Validates phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid length (typically 10-15 digits)
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Validates customer information for security
 */
export function validateCustomerInfo(info: {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Sanitize and validate name
  const sanitizedName = sanitizeInput(info.name);
  if (!sanitizedName || sanitizedName.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  // Validate phone
  if (!validatePhoneNumber(info.phone)) {
    errors.push('Please enter a valid phone number');
  }
  
  // Sanitize and validate address
  const sanitizedAddress = sanitizeInput(info.address);
  if (!sanitizedAddress || sanitizedAddress.length < 10) {
    errors.push('Address must be at least 10 characters long');
  }
  
  // Validate notes length if provided
  if (info.notes && info.notes.length > 500) {
    errors.push('Notes must be less than 500 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}