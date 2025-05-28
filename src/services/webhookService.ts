
import type { Lead } from '@/types/lead';
import { processRawDataToLeads } from '@/utils/leadProcessor';

export async function fetchLeadsFromWebhook(): Promise<Lead[]> {
  console.log('🔌 Buscando dados do webhook...');
  
  try {
    const response = await fetch('https://bot-belas-n8n.9csrtv.easypanel.host/webhook/leads-closer-oceanoazul');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📦 Dados recebidos:', { tipo: typeof data, isArray: Array.isArray(data), quantidade: data?.length || 0 });
    
    if (!Array.isArray(data)) {
      console.log('⚠️ Dados não são um array, retornando vazio');
      return [];
    }

    if (data.length === 0) {
      console.log('⚠️ Array vazio recebido');
      return [];
    }

    if (data.length > 0) {
      console.log('🔑 Chaves encontradas no primeiro item:', Object.keys(data[0]));
    }

    const processedLeads = processRawDataToLeads(data);

    console.log('✅ Processamento concluído:', {
      recebidos: data.length,
      processados: processedLeads.length,
      comData: processedLeads.filter(l => l.parsedDate).length
    });
    
    return processedLeads;
  } catch (error) {
    console.error('❌ Erro ao buscar dados do webhook:', error);
    throw error;
  }
}
