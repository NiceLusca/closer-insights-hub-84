
import { z } from 'zod';

// Schema for validating webhook data
const WebhookDataSchema = z.object({
  id: z.string().optional(),
  name: z.string().max(500).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  status: z.string().max(100).optional(),
  date: z.string().optional(),
  closer: z.string().max(200).optional(),
  origem: z.string().max(200).optional(),
  value: z.union([z.string(), z.number()]).optional(),
}).passthrough(); // Allow additional fields but validate known ones

const WebhookArraySchema = z.array(WebhookDataSchema);

export class InputValidator {
  static validateWebhookData(data: unknown): { isValid: boolean; errors: string[]; sanitizedData?: any } {
    try {
      // Ensure data is an array
      const dataArray = Array.isArray(data) ? data : [data];
      
      // Validate against schema
      const result = WebhookArraySchema.safeParse(dataArray);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => 
          `Campo ${err.path.join('.')}: ${err.message}`
        );
        return { isValid: false, errors };
      }
      
      // Additional custom validations
      const sanitizedData = result.data.map(item => this.sanitizeWebhookItem(item));
      
      return { isValid: true, errors: [], sanitizedData };
    } catch (error) {
      return { 
        isValid: false, 
        errors: [`Erro de validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`] 
      };
    }
  }

  private static sanitizeWebhookItem(item: any): any {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(item)) {
      if (value === null || value === undefined) {
        sanitized[key] = null;
        continue;
      }
      
      if (typeof value === 'string') {
        // Remove potential XSS attempts
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim()
          .slice(0, 1000); // Limit string length
      } else if (typeof value === 'number') {
        // Validate numbers are within reasonable ranges
        sanitized[key] = Math.max(-1000000000, Math.min(1000000000, value));
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  static sanitizeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}
