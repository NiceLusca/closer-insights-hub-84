
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

  // Cache para field mappings para evitar buscas repetitivas
  const fieldCache = new Map();

  // Processar em lotes maiores para melhor performance
  const BATCH_SIZE = 100; // Aumentado de 50 para 100
  const PROGRESS_LOG_INTERVAL = 200; // Log a cada 200 items ao invés de 100
  
  for (let batchStart = 0; batchStart < data.length; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, data.length);
    const batch = data.slice(batchStart, batchEnd);
    
    // Log apenas se for o primeiro lote ou a cada 5 lotes para reduzir logs
    if (batchStart === 0 || Math.floor(batchStart / BATCH_SIZE) % 5 === 0) {
      await supabaseLogger.log({
        level: 'debug',
        message: `📦 Processando lote ${Math.floor(batchStart / BATCH_SIZE) + 1}/${Math.ceil(data.length / BATCH_SIZE)}`,
        data: { 
          loteInicio: batchStart, 
          loteFim: batchEnd, 
          tamanhoLote: batch.length,
          progresso: `${((batchEnd / data.length) * 100).toFixed(1)}%`
        },
        source: 'lead-processor',
        sessionId
      });
    }

    // Processar lote com Promise.all para melhor performance
    const batchPromises = batch.map(async (item, index) => {
      const globalIndex = batchStart + index;
      
      try {
        processedCount++;
        
        // Log de progresso apenas a cada 200 items para reduzir spam de logs
        if (processedCount % PROGRESS_LOG_INTERVAL === 0) {
          await supabaseLogger.log({
            level: 'info',
            message: `📊 Progresso: ${processedCount}/${data.length} (${((processedCount / data.length) * 100).toFixed(1)}%)`,
            data: { 
              processados: processedCount,
              total: data.length,
              percentual: ((processedCount / data.length) * 100).toFixed(1)
            },
            source: 'lead-processor-progress',
            sessionId
          });
        }
        
        // Tentativas de encontrar data (otimizada com timeout)
        let dateSearchResults;
        let parsedDate;
        
        try {
          dateSearchResults = await findDateInItem(item, sessionId, fieldCache);
          
          if (dateSearchResults.dateValue) {
            parsedDate = await parseDate(dateSearchResults.dateValue.toString(), sessionId);
            
            if (parsedDate) {
              successfulParses++;
            }
          }
        } catch (dateError) {
          // Log de erro de data apenas em debug level para reduzir spam
          console.warn(`⚠️ Erro na data do item ${globalIndex + 1}:`, dateError.message);
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
          successfulLeads++;
          return { success: true, lead, error: null };
        } else {
          console.warn(`⚠️ Lead ${globalIndex + 1} rejeitado na validação`);
          return { success: false, lead: null, error: 'validation_failed' };
        }

      } catch (error) {
        console.error(`❌ Erro no lead ${globalIndex + 1}:`, error.message);
        
        try {
          const errorDetails = await handleProcessingError(error, globalIndex, item, webhookDataId, sessionId);
          return { success: false, lead: null, error: errorDetails };
        } catch (errorHandlingError) {
          console.warn('Erro ao salvar erro de processamento:', errorHandlingError);
          return { success: false, lead: null, error: 'error_handling_failed' };
        }
      }
    });

    // Aguardar processamento do lote
    const batchResults = await Promise.all(batchPromises);
    
    // Processar resultados do lote
    batchResults.forEach(result => {
      if (result.success && result.lead) {
        processedLeads.push(result.lead);
      } else if (result.error && typeof result.error === 'object') {
        processingErrors.push(result.error);
      }
    });
    
    // Pequena pausa entre lotes para não sobrecarregar
    if (batchEnd < data.length) {
      await new Promise(resolve => setTimeout(resolve, 5));
    }
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
      tempoProcessamento: 'otimizado'
    },
    source: 'lead-processor',
    sessionId
  });

  console.log(`✅ Processamento concluído: ${successfulLeads}/${data.length} leads válidos (${((successfulLeads / data.length) * 100).toFixed(1)}%)`);
  return processedLeads;
}
