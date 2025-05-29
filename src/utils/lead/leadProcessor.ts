
import type { Lead } from '@/types/lead';
import { parseDate } from '../date';
import { supabaseLogger } from '@/services/supabaseLogger';
import { analyzeRawData } from './leadAnalyzer';
import { findDateInItem } from './dateExtractor';
import { buildLead } from './leadBuilder';
import { validateLead } from './leadValidator';
import { handleProcessingError, handleDateParsingError } from './errorHandler';

export async function processRawDataToLeads(data: any[], sessionId?: string, webhookDataId?: string): Promise<Lead[]> {
  // Análise inicial dos dados
  await analyzeRawData(data, sessionId);

  const processedLeads = [];
  const processingErrors = [];
  let successfulParses = 0;

  for (let index = 0; index < data.length; index++) {
    const item = data[index];
    
    try {
      await supabaseLogger.log({
        level: 'debug',
        message: `📊 Processando lead ${index + 1}`,
        data: { dadosDoItem: item },
        source: 'lead-processor',
        sessionId
      });
      
      // Tentativas de encontrar data
      const dateSearchResults = await findDateInItem(item, sessionId);
      
      let parsedDate = dateSearchResults.dateValue ? await parseDate(dateSearchResults.dateValue.toString(), sessionId) : undefined;
      
      // Se parseou com sucesso, incrementar contador
      if (parsedDate) {
        successfulParses++;
      }
      
      await supabaseLogger.log({
        level: 'debug',
        message: '📅 RESULTADO do processamento de data',
        data: {
          valorOriginal: dateSearchResults.dateValue,
          valorString: dateSearchResults.dateValue?.toString(),
          dataParsada: parsedDate?.toISOString() || 'FALHOU AO PARSEAR',
          foiParseadaComSucesso: !!parsedDate,
          metodoEncontrado: dateSearchResults.method
        },
        source: 'lead-processor',
        sessionId
      });

      const lead: Lead = buildLead(item, index, dateSearchResults.dateValue?.toString() || '', parsedDate);

      await supabaseLogger.log({
        level: 'debug',
        message: '✅ Lead processado',
        data: {
          nome: lead.Nome,
          status: lead.Status,
          dataOriginal: lead.data,
          parsedDate: lead.parsedDate?.toISOString() || 'SEM DATA VÁLIDA ❌'
        },
        source: 'lead-processor',
        sessionId
      });

      processedLeads.push(lead);

      // Se não conseguiu parsear a data, salvar erro no Supabase MAS continuar processamento
      if (!parsedDate && dateSearchResults.dateValue) {
        const errorDetails = await handleDateParsingError(
          dateSearchResults.dateValue, 
          dateSearchResults, 
          index, 
          item, 
          webhookDataId
        );
        processingErrors.push(errorDetails);
      }

    } catch (error) {
      const errorDetails = await handleProcessingError(error, index, item, webhookDataId, sessionId);
      processingErrors.push(errorDetails);
    }
  }

  // Filtrar leads com dados básicos
  const filteredLeads = processedLeads.filter(lead => validateLead(lead, sessionId));

  await supabaseLogger.log({
    level: 'info',
    message: '📊 RESUMO FINAL DO PROCESSAMENTO',
    data: {
      totalRecebidos: data.length,
      totalProcessados: processedLeads.length,
      totalFiltrados: filteredLeads.length,
      comDataValida: filteredLeads.filter(l => l.parsedDate).length,
      semDataValida: filteredLeads.filter(l => !l.parsedDate).length,
      comStatus: filteredLeads.filter(l => l.Status && l.Status.trim() !== '').length,
      statusEncontrados: [...new Set(filteredLeads.map(l => l.Status).filter(Boolean))],
      errosProcessamento: processingErrors.length,
      successfulDateParses: successfulParses,
      percentualSucesso: ((successfulParses / data.length) * 100).toFixed(1)
    },
    source: 'lead-processor',
    sessionId
  });

  // Alertar sobre problemas de data de forma mais construtiva
  const leadsWithoutDate = filteredLeads.filter(l => !l.parsedDate).length;
  if (leadsWithoutDate > 0) {
    await supabaseLogger.log({
      level: 'warn',
      message: `⚠️ ATENÇÃO: ${leadsWithoutDate} de ${filteredLeads.length} leads não possuem data válida, mas processamento continua!`,
      data: { 
        leadsWithoutDate, 
        totalLeads: filteredLeads.length,
        percentualComDataValida: (((filteredLeads.length - leadsWithoutDate) / filteredLeads.length) * 100).toFixed(1)
      },
      source: 'lead-processor',
      sessionId
    });
  }

  return filteredLeads;
}
