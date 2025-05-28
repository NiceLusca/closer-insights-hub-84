
import { parseISO, parse, isValid, format } from 'date-fns';
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
        const dateString = (item.data || item.Data).toString().trim();
        console.log(`📅 Tentando parsear data: "${dateString}"`);
        
        // Tentar diferentes formatos de data
        const dateFormats = [
          'dd/MM/yyyy',
          'yyyy-MM-dd',
          'MM/dd/yyyy',
          'dd-MM-yyyy',
          'dd/MM/yy',
          'yyyy-MM-dd HH:mm:ss',
          'dd/MM/yyyy HH:mm:ss'
        ];
        
        for (const formatStr of dateFormats) {
          try {
            const testDate = parse(dateString, formatStr, new Date());
            if (isValid(testDate) && testDate.getFullYear() >= 2020 && testDate.getFullYear() <= 2030) {
              parsedDate = testDate;
              console.log(`✅ Data parseada com formato ${formatStr}:`, dateString, '->', format(parsedDate, 'dd/MM/yyyy'));
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
            if (isValid(isoDate) && isoDate.getFullYear() >= 2020 && isoDate.getFullYear() <= 2030) {
              parsedDate = isoDate;
              console.log('✅ Data parseada com ISO:', dateString, '->', format(parsedDate, 'dd/MM/yyyy'));
            }
          } catch (e) {
            console.warn(`❌ Não foi possível parsear a data: ${dateString}`);
          }
        }
        
        // Se ainda não conseguiu parsear e parece ser uma data válida, tentar regex
        if (!parsedDate && dateString.match(/\d+/)) {
          const regexPatterns = [
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // dd/mm/yyyy
            /(\d{4})-(\d{1,2})-(\d{1,2})/,   // yyyy-mm-dd
            /(\d{1,2})-(\d{1,2})-(\d{4})/,   // dd-mm-yyyy
          ];
          
          for (const regex of regexPatterns) {
            const match = dateString.match(regex);
            if (match) {
              let day, month, year;
              if (regex === regexPatterns[1]) { // yyyy-mm-dd
                [, year, month, day] = match;
              } else { // dd/mm/yyyy or dd-mm-yyyy
                [, day, month, year] = match;
              }
              
              try {
                const testDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                if (isValid(testDate) && testDate.getFullYear() >= 2020 && testDate.getFullYear() <= 2030) {
                  parsedDate = testDate;
                  console.log(`✅ Data parseada com regex:`, dateString, '->', format(parsedDate, 'dd/MM/yyyy'));
                  break;
                }
              } catch (e) {
                // Continuar
              }
            }
          }
        }
        
        if (!parsedDate) {
          console.warn(`⚠️ Data não parseada: ${dateString} - item será excluído`);
        }
      } else {
        console.warn(`⚠️ Item sem campo de data`);
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

      console.log(`${parsedDate ? '✅' : '❌'} Lead processado:`, {
        nome: lead.Nome,
        status: lead.Status,
        data: lead.data,
        parsedDate: parsedDate ? format(parsedDate, 'dd/MM/yyyy') : 'INVÁLIDA'
      });

      return lead;
    }).filter(lead => lead.parsedDate); // Filtrar apenas leads com data válida

    console.log('✅ Leads processados (com data válida):', processedLeads.length);
    console.log('📊 Amostra de leads processados:', processedLeads.slice(0, 3));
    
    return processedLeads;
  } catch (error) {
    console.error('❌ Erro ao buscar dados do webhook:', error);
    throw error;
  }
}
