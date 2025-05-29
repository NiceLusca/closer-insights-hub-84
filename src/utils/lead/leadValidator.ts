
import { supabaseLogger } from '@/services/supabaseLogger';
import type { Lead } from '@/types/lead';

export function validateLead(lead: Lead, sessionId?: string): boolean {
  const hasBasicData = lead.Nome || lead['e-mail'] || lead.Whatsapp || lead.Status;
  
  if (!hasBasicData) {
    supabaseLogger.log({
      level: 'warn',
      message: '❌ Lead rejeitado por não ter dados básicos',
      data: lead,
      source: 'lead-processor',
      sessionId
    });
    return false;
  }
  
  return true;
}
