
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
  let successfulLeads = 0;

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
          dataParsada: parsedDate?.toISOString() || 'SEM DATA VÁLIDA',
          foiParseadaComSucesso: !!parsedDate,
          metodoEncontrado: dateSearchResults.method
        },
        source: 'lead-processor',
        sessionId
      });

      const lead: Lead = buildLead(item, index, dateSearchResults.dateValue?.toString() || '', parsedDate);

      // Validar lead ANTES de adicioná-lo
      if (validateLead(lead, sessionId)) {
        processedLeads.push(lead);
        successfulLeads++;
        
        await supabaseLogger.log({
          level: 'debug',
          message: '✅ Lead processado e aceito',
          data: {
            nome: lead.Nome,
            status: lead.Status,
            dataOriginal: lead.data,
            parsedDate: lead.parsedDate?.toISOString() || 'SEM DATA VÁLIDA'
          },
          source: 'lead-processor',
          sessionId
        });
      } else {
        await supabaseLogger.log({
          level: 'warn',
          message: '⚠️ Lead rejeitado na validação',
          data: { lead },
          source: 'lead-processor',
          sessionId
        });
      }

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
      await supabaseLogger.log({
        level: 'error',
        message: `❌ Erro crítico no lead ${index + 1} - CONTINUANDO processamento`,
        data: { error: error.message, item },
        source: 'lead-processor',
        sessionId
      });
      
      const errorDetails = await handleProcessingError(error, index, item, webhookDataId, sessionId);
      processingErrors.push(errorDetails);
      // NÃO PARAR O PROCESSAMENTO - continuar com próximo lead
    }
  }

  await supabaseLogger.log({
    level: 'info',
    message: '📊 RESUMO FINAL DO PROCESSAMENTO',
    data: {
      totalRecebidos: data.length,
      totalProcessados: successfulLeads,
      comDataValida: processedLeads.filter(l => l.parsedDate).length,
      semDataValida: processedLeads.filter(l => !l.parsedDate).length,
      comStatus: processedLeads.filter(l => l.Status && l.Status.trim() !== '').length,
      statusEncontrados: [...new Set(processedLeads.map(l => l.Status).filter(Boolean))],
      errosProcessamento: processingErrors.length,
      successfulDateParses: successfulParses,
      percentualSucesso: ((successfulParses / data.length) * 100).toFixed(1),
      percentualLeadsValidos: ((successfulLeads / data.length) * 100).toFixed(1)
    },
    source: 'lead-processor',
    sessionId
  });

  // Informar sobre leads sem data, mas de forma positiva
  const leadsWithoutDate = processedLeads.filter(l => !l.parsedDate).length;
  if (leadsWithoutDate > 0) {
    await supabaseLogger.log({
      level: 'info', // Mudado de 'warn' para 'info'
      message: `ℹ️ PROCESSAMENTO CONCLUÍDO: ${leadsWithoutDate} de ${processedLeads.length} leads sem data válida (mas incluídos nos resultados)`,
      data: { 
        leadsWithoutDate, 
        totalLeads: processedLeads.length,
        percentualComDataValida: (((processedLeads.length - leadsWithoutDate) / processedLeads.length) * 100).toFixed(1)
      },
      source: 'lead-processor',
      sessionId
    });
  }

  return processedLeads;
}
