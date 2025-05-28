
import { parseISO, parse, isValid } from 'date-fns';
import type { Lead } from '@/types/lead';

export async function fetchLeadsFromWebhook(): Promise<Lead[]> {
  console.log('🔌 Buscando dados do webhook...');
  
  try {
    const response = await fetch('https://hook.us2.make.com/yb7lq8eme0hpc4w0aemej2m7k5ovhp5t');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📦 Dados brutos recebidos:', data);
    
    if (!Array.isArray(data)) {
      console.log('⚠️ Dados não são um array, retornando vazio');
      return [];
    }

    const processedLeads = data.map((item: any, index: number) => {
      // Processar a data com múltiplos formatos possíveis
      let parsedDate: Date | undefined;
      
      if (item.data) {
        // Tentar diferentes formatos de data
        const dateFormats = [
          'dd/MM/yyyy',
          'yyyy-MM-dd',
          'MM/dd/yyyy',
          'dd-MM-yyyy'
        ];
        
        for (const format of dateFormats) {
          try {
            const testDate = parse(item.data, format, new Date());
            if (isValid(testDate)) {
              parsedDate = testDate;
              break;
            }
          } catch (e) {
            // Continuar tentando outros formatos
          }
        }
        
        // Se nenhum formato funcionou, tentar parseISO
        if (!parsedDate) {
          try {
            const isoDate = parseISO(item.data);
            if (isValid(isoDate)) {
              parsedDate = isoDate;
            }
          } catch (e) {
            console.warn(`❌ Não foi possível parsear a data: ${item.data}`);
          }
        }
      }

      const lead: Lead = {
        id: item.id || `webhook-${index}`,
        Nome: item.Nome || item.nome || `Lead ${index + 1}`,
        Status: item.Status || item.status || '',
        Closer: item.Closer || item.closer || '',
        origem: item.origem || item.Origem || '',
        data: item.data || '',
        parsedDate: parsedDate,
        'Venda Completa': parseFloat(item['Venda Completa'] || item.vendaCompleta || '0') || 0,
        recorrente: parseFloat(item.recorrente || '0') || 0,
      };

      return lead;
    });

    console.log('✅ Leads processados:', processedLeads.length);
    console.log('📅 Exemplo de lead processado:', processedLeads[0]);
    
    return processedLeads;
  } catch (error) {
    console.error('❌ Erro ao buscar dados do webhook:', error);
    throw error;
  }
}
