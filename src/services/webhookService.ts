
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

    // NOVO: Analisar estrutura dos primeiros itens
    if (data.length > 0) {
      console.log('🔍 ANÁLISE DA ESTRUTURA DOS DADOS:');
      console.log('📋 Primeiro item completo:', JSON.stringify(data[0], null, 2));
      console.log('🔑 Chaves disponíveis no primeiro item:', Object.keys(data[0]));
      
      if (data.length > 1) {
        console.log('🔑 Chaves do segundo item:', Object.keys(data[1]));
      }
      
      if (data.length > 2) {
        console.log('🔑 Chaves do terceiro item:', Object.keys(data[2]));
      }
      
      // Verificar tipos de dados das colunas mais importantes
      const firstItem = data[0];
      console.log('📊 ANÁLISE DOS VALORES:');
      Object.keys(firstItem).forEach(key => {
        const value = firstItem[key];
        console.log(`  ${key}: "${value}" (tipo: ${typeof value})`);
      });
    }

    const processedLeads = data.map((item: any, index: number) => {
      console.log(`🔍 Processando item ${index}:`, item);
      
      // NOVO: Mostrar todas as chaves disponíveis para cada item
      console.log(`📋 Chaves disponíveis no item ${index}:`, Object.keys(item));
      
      // Processar a data com múltiplos formatos possíveis
      let parsedDate: Date | undefined;
      
      // NOVO: Verificar todas as possíveis variações de campo de data
      const possibleDateFields = ['data', 'Data', 'date', 'Date', 'DATA', 'created_at', 'timestamp'];
      let dateValue = '';
      let usedDateField = '';
      
      for (const field of possibleDateFields) {
        if (item[field] && item[field].toString().trim()) {
          dateValue = item[field].toString().trim();
          usedDateField = field;
          console.log(`📅 Encontrado campo de data "${field}": "${dateValue}"`);
          break;
        }
      }
      
      if (dateValue) {
        console.log(`📅 Tentando parsear data do campo "${usedDateField}": "${dateValue}"`);
        
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
            const testDate = parse(dateValue, formatStr, new Date());
            if (isValid(testDate) && testDate.getFullYear() >= 2020 && testDate.getFullYear() <= 2030) {
              parsedDate = testDate;
              console.log(`✅ Data parseada com formato ${formatStr}:`, dateValue, '->', format(parsedDate, 'dd/MM/yyyy'));
              break;
            }
          } catch (e) {
            // Continuar tentando outros formatos
          }
        }
        
        // Se nenhum formato funcionou, tentar parseISO
        if (!parsedDate) {
          try {
            const isoDate = parseISO(dateValue);
            if (isValid(isoDate) && isoDate.getFullYear() >= 2020 && isoDate.getFullYear() <= 2030) {
              parsedDate = isoDate;
              console.log('✅ Data parseada com ISO:', dateValue, '->', format(parsedDate, 'dd/MM/yyyy'));
            }
          } catch (e) {
            console.warn(`❌ Não foi possível parsear a data: ${dateValue}`);
          }
        }
        
        // Se ainda não conseguiu parsear e parece ser uma data válida, tentar regex
        if (!parsedDate && dateValue.match(/\d+/)) {
          const regexPatterns = [
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // dd/mm/yyyy
            /(\d{4})-(\d{1,2})-(\d{1,2})/,   // yyyy-mm-dd
            /(\d{1,2})-(\d{1,2})-(\d{4})/,   // dd-mm-yyyy
          ];
          
          for (const regex of regexPatterns) {
            const match = dateValue.match(regex);
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
                  console.log(`✅ Data parseada com regex:`, dateValue, '->', format(parsedDate, 'dd/MM/yyyy'));
                  break;
                }
              } catch (e) {
                // Continuar
              }
            }
          }
        }
        
        if (!parsedDate) {
          console.warn(`⚠️ Data não parseada: ${dateValue} - item será excluído`);
        }
      } else {
        console.warn(`⚠️ Item sem campo de data reconhecido`);
      }

      // NOVO: Mapeamento flexível baseado nas chaves reais encontradas
      const flexibleMapping = (possibleKeys: string[], defaultValue: any = '') => {
        for (const key of possibleKeys) {
          if (item[key] !== undefined && item[key] !== null) {
            return item[key];
          }
        }
        return defaultValue;
      };

      const lead: Lead = {
        row_number: flexibleMapping(['row_number', 'id', 'index'], index + 1),
        data: dateValue || '',
        Hora: flexibleMapping(['Hora', 'hora', 'time', 'Time', 'HORA'], ''),
        Nome: flexibleMapping(['Nome', 'nome', 'name', 'Name', 'NOME'], `Lead ${index + 1}`),
        'e-mail': flexibleMapping(['e-mail', 'email', 'Email', 'EMAIL', 'mail'], ''),
        Whatsapp: flexibleMapping(['Whatsapp', 'whatsapp', 'WhatsApp', 'WHATSAPP', 'telefone', 'phone'], ''),
        Status: flexibleMapping(['Status', 'status', 'STATUS', 'estado'], ''),
        Closer: flexibleMapping(['Closer', 'closer', 'CLOSER', 'vendedor', 'Vendedor'], ''),
        origem: flexibleMapping(['origem', 'Origem', 'ORIGEM', 'source', 'Source', 'canal'], ''),
        'Venda Completa': parseFloat(flexibleMapping(['Venda Completa', 'vendaCompleta', 'venda_completa', 'valor', 'Valor', 'price'], '0')) || 0,
        recorrente: parseFloat(flexibleMapping(['recorrente', 'Recorrente', 'RECORRENTE', 'recurring'], '0')) || 0,
        parsedDate: parsedDate,
      };

      console.log(`${parsedDate ? '✅' : '❌'} Lead processado:`, {
        nome: lead.Nome,
        status: lead.Status,
        data: lead.data,
        parsedDate: parsedDate ? format(parsedDate, 'dd/MM/yyyy') : 'INVÁLIDA',
        originalKeys: Object.keys(item)
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
