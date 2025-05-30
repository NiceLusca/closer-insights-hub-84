
import type { Lead } from '@/types/lead';
import { parseDate } from '../date';
import { supabaseLogger } from '@/services/supabaseLogger';
import { analyzeRawData } from './leadAnalyzer';
import { findDateInItem } from './dateExtractor';
import { buildLead } from './leadBuilder';
import { validateLead } from './leadValidator';
import { handleProcessingError, handleDateParsingError } from './errorHandler';

export async function processRawDataToLeads(data: any[], sessionId?: string, webhookDataId?: string): Promise<Lead[]> {
  await supabaseLogger.log({
    level: 'info',
    message: '🚀 INICIANDO PROCESSAMENTO DE LEADS',
    data: { 
      totalRecebidos: data.length,
      sessionId,
      webhookDataId
    },
    source: 'lead-processor',
    sessionId
  });

  // Análise inicial dos dados
  await analyzeRawData(data, sessionId);

  const processedLeads = [];
  const processingErrors = [];
  let successfulParses = 0;
  let successfulLeads = 0;
  let processedCount = 0;

  // Processar em lotes para evitar travamento
  const BATCH_SIZE = 50;
  
  for (let batchStart = 0; batchStart < data.length; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, data.length);
    const batch = data.slice(batchStart, batchEnd);
    
    await supabaseLogger.log({
      level: 'debug',
      message: `📦 Processando lote ${Math.floor(batchStart / BATCH_SIZE) + 1}`,
      data: { 
        loteInicio: batchStart, 
        loteFim: batchEnd, 
        tamanhoLote: batch.length 
      },
      source: 'lead-processor',
      sessionId
    });

    for (let index = 0; index < batch.length; index++) {
      const globalIndex = batchStart + index;
      const item = batch[index];
      
      try {
        processedCount++;
        
        // Log apenas a cada 100 items para não sobrecarregar
        if (processedCount % 100 === 0 || processedCount <= 5) {
          await supabaseLogger.log({
            level: 'debug',
            message: `📊 Progresso: ${processedCount}/${data.length} leads processados`,
            data: { 
              progresso: `${((processedCount / data.length) * 100).toFixed(1)}%`,
              item: globalIndex + 1 
            },
            source: 'lead-processor',
            sessionId
          });
        }
        
        // Tentativas de encontrar data (com timeout implícito)
        let dateSearchResults;
        let parsedDate;
        
        try {
          dateSearchResults = await findDateInItem(item, sessionId);
          
          if (dateSearchResults.dateValue) {
            parsedDate = await parseDate(dateSearchResults.dateValue.toString(), sessionId);
            
            if (parsedDate) {
              successfulParses++;
            }
          }
        } catch (dateError) {
          await supabaseLogger.log({
            level: 'debug',
            message: '⚠️ Erro no processamento de data (continuando)',
            data: { erro: dateError.message, item: globalIndex + 1 },
            source: 'lead-processor',
            sessionId
          });
          
          dateSearchResults = { dateValue: null, method: 'erro' };
          parsedDate = undefined;
        }

        // Construir lead sempre, mesmo sem data válida
        const lead: Lead = buildLead(
          item, 
          globalIndex, 
          dateSearchResults?.dateValue?.toString() || '', 
          parsedDate
        );

        // Validar lead
        if (validateLead(lead, sessionId)) {
          processedLeads.push(lead);
          successfulLeads++;
        } else {
          await supabaseLogger.log({
            level: 'debug',
            message: '⚠️ Lead rejeitado na validação (continuando)',
            data: { leadIndex: globalIndex + 1 },
            source: 'lead-processor',
            sessionId
          });
        }

        // Se não conseguiu parsear a data, salvar erro MAS continuar
        if (!parsedDate && dateSearchResults?.dateValue) {
          try {
            const errorDetails = await handleDateParsingError(
              dateSearchResults.dateValue, 
              dateSearchResults, 
              globalIndex, 
              item, 
              webhookDataId
            );
            processingErrors.push(errorDetails);
          } catch (errorHandlingError) {
            // Falha silenciosa no tratamento de erro
            console.warn('Erro ao salvar erro de parsing:', errorHandlingError);
          }
        }

      } catch (error) {
        await supabaseLogger.log({
          level: 'debug',
          message: `⚠️ Erro no lead ${globalIndex + 1} (continuando processamento)`,
          data: { error: error.message },
          source: 'lead-processor',
          sessionId
        });
        
        try {
          const errorDetails = await handleProcessingError(error, globalIndex, item, webhookDataId, sessionId);
          processingErrors.push(errorDetails);
        } catch (errorHandlingError) {
          // Falha silenciosa no tratamento de erro
          console.warn('Erro ao salvar erro de processamento:', errorHandlingError);
        }
        
        // CONTINUAR processamento mesmo com erro
      }
    }
    
    // Pequena pausa entre lotes para não sobrecarregar
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // Log final detalhado
  await supabaseLogger.log({
    level: 'info',
    message: '✅ PROCESSAMENTO CONCLUÍDO COM SUCESSO',
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
      percentualLeadsValidos: ((successfulLeads / data.length) * 100).toFixed(1),
      processadosComSucesso: processedCount
    },
    source: 'lead-processor',
    sessionId
  });

  return processedLeads;
}
