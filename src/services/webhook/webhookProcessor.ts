
import { supabaseLogger } from '../supabaseLogger';
import { processRawDataToLeads } from '@/utils/lead';

export class WebhookProcessor {
  async processData(rawData: any[], sessionId: string) {
    console.log(`📊 Processando ${rawData.length} registros do webhook...`);
    
    const leads = await processRawDataToLeads(rawData, sessionId);
    
    await supabaseLogger.log({
      level: 'info',
      message: '🎯 DADOS PROCESSADOS COM SUCESSO',
      data: {
        totalRawRecords: rawData.length,
        leadsProcessados: leads.length,
        leadsComData: leads.filter(l => l.parsedDate).length,
        leadsSemData: leads.filter(l => !l.parsedDate).length,
        statusEncontrados: [...new Set(leads.map(l => l.Status).filter(Boolean))],
        origensEncontradas: [...new Set(leads.map(l => l.origem).filter(Boolean))],
        closersEncontrados: [...new Set(leads.map(l => l.Closer).filter(Boolean))]
      },
      source: 'webhook-processor',
      sessionId
    });

    return leads;
  }
}
