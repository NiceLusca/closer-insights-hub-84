
import { parseISO, parse, isValid } from 'date-fns';
import type { Lead } from '@/types/lead';

export async function fetchLeadsFromWebhook(): Promise<Lead[]> {
  console.log('🔌 Buscando dados do webhook...');
  
  try {
    const response = await fetch('https://bot-belas-n8n.9csrtv.easypanel.host/webhook/leads-closer-oceanoazul');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📦 Dados brutos recebidos:', data);
    console.log('📦 Tipo dos dados:', typeof data);
    console.log('📦 É array?', Array.isArray(data));
    
    if (!Array.isArray(data)) {
      console.log('⚠️ Dados não são um array, retornando vazio');
      return [];
    }

    const processedLeads = data.map((item: any, index: number) => {
      console.log(`🔍 Processando item ${index}:`, item);
      
      // Processar a data com múltiplos formatos possíveis
      let parsedDate: Date | undefined;
      
      if (item.data || item.Data) {
        const dateString = item.data || item.Data;
        console.log(`📅 Tentando parsear data: "${dateString}"`);
        
        // Tentar diferentes formatos de data
        const dateFormats = [
          'dd/MM/yyyy',
          'yyyy-MM-dd',
          'MM/dd/yyyy',
          'dd-MM-yyyy',
          'dd/MM/yy',
          'yyyy-MM-dd HH:mm:ss'
        ];
        
        for (const format of dateFormats) {
          try {
            const testDate = parse(dateString, format, new Date());
            if (isValid(testDate)) {
              parsedDate = testDate;
              console.log(`✅ Data parseada com formato ${format}:`, dateString, '->', parsedDate);
              break;
            }
          } catch (e) {
            // Continuar tentando outros formatos
          }
        }
        
        // Se nenhum formato funcionou, tentar parseISO
        if (!parsedDate) {
          try {
            const isoDate = parseISO(dateString);
            if (isValid(isoDate)) {
              parsedDate = isoDate;
              console.log('✅ Data parseada com ISO:', dateString, '->', parsedDate);
            }
          } catch (e) {
            console.warn(`❌ Não foi possível parsear a data: ${dateString}`);
          }
        }
        
        // Se ainda não conseguiu parsear, usar data atual como fallback
        if (!parsedDate) {
          parsedDate = new Date();
          console.warn(`⚠️ Usando data atual como fallback para: ${dateString}`);
        }
      } else {
        // Se não tem data, usar data atual
        parsedDate = new Date();
        console.warn(`⚠️ Item sem campo de data, usando data atual`);
      }

      const lead: Lead = {
        row_number: item.row_number || index + 1,
        data: item.data || item.Data || '',
        Hora: item.Hora || item.hora || '',
        Nome: item.Nome || item.nome || `Lead ${index + 1}`,
        'e-mail': item['e-mail'] || item.email || '',
        Whatsapp: item.Whatsapp || item.whatsapp || '',
        Status: item.Status || item.status || '',
        Closer: item.Closer || item.closer || '',
        origem: item.origem || item.Origem || '',
        'Venda Completa': parseFloat(item['Venda Completa'] || item.vendaCompleta || '0') || 0,
        recorrente: parseFloat(item.recorrente || '0') || 0,
        parsedDate: parsedDate,
      };

      console.log(`✅ Lead processado:`, {
        nome: lead.Nome,
        status: lead.Status,
        data: lead.data,
        parsedDate: lead.parsedDate
      });

      return lead;
    });

    console.log('✅ Leads processados:', processedLeads.length);
    console.log('📊 Amostra de leads processados:', processedLeads.slice(0, 3));
    
    return processedLeads;
  } catch (error) {
    console.error('❌ Erro ao buscar dados do webhook:', error);
    throw error;
  }
}
