
import { supabase } from '@/integrations/supabase/client';
import { supabaseLogger, LogLevel } from './supabaseLogger';

class SecureSupabaseLogger {
  private sessionId: string;

  constructor() {
    this.sessionId = `secure_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async log(logData: {
    level: LogLevel;
    message: string;
    data?: any;
    source: string;
  }) {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Tentativa de log sem autenticação:', logData.message);
        return;
      }

      // Validate and sanitize log data
      const sanitizedData = this.sanitizeLogData(logData.data);
      
      // Use existing logger with additional security context
      await supabaseLogger.log({
        ...logData,
        data: {
          ...sanitizedData,
          userId: user.id,
          userEmail: user.email,
          securityContext: 'authenticated'
        },
        sessionId: this.sessionId
      });

      // Create audit trail for sensitive operations
      if (logData.level === 'error' || logData.source.includes('webhook')) {
        await this.createAuditLog({
          userId: user.id,
          action: 'LOG_ENTRY',
          details: {
            level: logData.level,
            source: logData.source,
            message: logData.message
          }
        });
      }
    } catch (err) {
      console.error('Erro no sistema de log seguro:', err);
      // Fallback to console logging
      console.log(`[${logData.level.toUpperCase()}] [${logData.source}] ${logData.message}`, logData.data || '');
    }
  }

  private sanitizeLogData(data: any): any {
    if (!data) return data;
    
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'auth'];
    
    const sanitize = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitize(value);
        }
      }
      return sanitized;
    };
    
    return sanitize(data);
  }

  private async createAuditLog(auditData: {
    userId: string;
    action: string;
    details: any;
  }) {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: auditData.userId,
          action: auditData.action,
          new_values: auditData.details,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erro ao criar log de auditoria:', error);
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

export const secureSupabaseLogger = new SecureSupabaseLogger();
