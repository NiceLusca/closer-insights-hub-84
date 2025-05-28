
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
    console.log('📦 Dados brutos recebidos do webhook:', {
      tipo: typeof data,
      isArray: Array.isArray(data),
      quantidade: data?.length || 0,
      primeiroItem: data?.[0] || null
    });
    
    if (!Array.isArray(data)) {
      console.log('⚠️ Dados não são um array, tentando acessar propriedade que pode conter o array...');
      
      // Tentar encontrar array dentro do objeto
      const possibleArrayKeys = ['data', 'leads', 'items', 'results', 'records'];
      for (const key of possibleArrayKeys) {
        if (data[key] && Array.isArray(data[key])) {
          console.log(`✅ Array encontrado na propriedade '${key}'`);
          return await processWebhookData(data[key]);
        }
      }
      
      console.log('❌ Nenhum array encontrado nos dados, retornando vazio');
      return [];
    }

    return await processWebhookData(data);
    
  } catch (error) {
    console.error('❌ Erro ao buscar dados do webhook:', error);
    throw error;
  }
}

async function processWebhookData(data: any[]): Promise<Lead[]> {
  if (data.length === 0) {
    console.log('⚠️ Array vazio recebido');
    return [];
  }

  console.log('🔍 Analisando estrutura dos dados recebidos:');
  console.log('📊 Total de registros:', data.length);
  
  if (data.length > 0) {
    console.log('🔑 Chaves encontradas no primeiro item:', Object.keys(data[0]));
    console.log('📋 Valores do primeiro item:', data[0]);
    
    if (data.length > 1) {
      console.log('🔑 Chaves encontradas no segundo item:', Object.keys(data[1]));
    }
  }

  const processedLeads = processRawDataToLeads(data);

  console.log('✅ Processamento do webhook concluído:', {
    recebidos: data.length,
    processados: processedLeads.length,
    comDataValida: processedLeads.filter(l => l.parsedDate).length,
    comStatus: processedLeads.filter(l => l.Status && l.Status.trim() !== '').length,
    statusEncontrados: [...new Set(processedLeads.map(l => l.Status).filter(Boolean))]
  });
  
  return processedLeads;
}
