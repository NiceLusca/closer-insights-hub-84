
import type { Lead } from '@/types/lead';
import { parseDate } from './dateParser';
import { findFieldValue, parseNumber, FIELD_MAPPINGS, detectDateColumn } from './fieldMapper';
import { supabaseLogger } from '@/services/supabaseLogger';

export async function processRawDataToLeads(data: any[], sessionId?: string, webhookDataId?: string): Promise<Lead[]> {
  await supabaseLogger.log({
    level: 'info',
    message: '🔄 Processando dados brutos para leads',
    data: { totalItens: data.length },
    source: 'lead-processor',
    sessionId
  });
  
  if (data.length > 0) {
    await supabaseLogger.log({
      level: 'debug',
      message: '📋 Análise do primeiro item',
      data: {
        primeiroItem: data[0],
        chavesDisponiveis: Object.keys(data[0])
      },
      source: 'lead-processor',
      sessionId
    });
    
    // Análise campo por campo
    const fieldAnalysis = {};
    Object.entries(data[0]).forEach(([key, value]) => {
      fieldAnalysis[key] = { value, type: typeof value };
    });
    
    await supabaseLogger.log({
      level: 'debug',
      message: '🔍 ANÁLISE CAMPO POR CAMPO DO PRIMEIRO ITEM',
      data: fieldAnalysis,
      source: 'lead-processor',
      sessionId
    });
    
    // Tentar detectar coluna de data automaticamente
    const detectedDateColumn = detectDateColumn(data[0]);
    if (detectedDateColumn) {
      await supabaseLogger.log({
        level: 'info',
        message: '🎯 Coluna de data detectada automaticamente',
        data: { colunaDetectada: detectedDateColumn },
        source: 'lead-processor',
        sessionId
      });
    } else {
      await supabaseLogger.log({
        level: 'warn',
        message: '❌ NENHUMA coluna de data detectada automaticamente',
        source: 'lead-processor',
        sessionId
      });
    }
  }

  const processedLeads = [];
  const processingErrors = [];

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

      const nomeValue = findFieldValue(item, FIELD_MAPPINGS.nome, `Lead ${index + 1}`);
      const statusValue = findFieldValue(item, FIELD_MAPPINGS.status, '');
      
      const lead: Lead = {
        row_number: index + 1,
        data: dateSearchResults.dateValue?.toString() || '',
        Hora: findFieldValue(item, FIELD_MAPPINGS.hora, ''),
        Nome: nomeValue,
        'e-mail': findFieldValue(item, FIELD_MAPPINGS.email, ''),
        Whatsapp: findFieldValue(item, FIELD_MAPPINGS.whatsapp, ''),
        Status: statusValue,
        Closer: findFieldValue(item, FIELD_MAPPINGS.closer, ''),
        origem: findFieldValue(item, FIELD_MAPPINGS.origem, ''),
        'Venda Completa': parseNumber(findFieldValue(item, FIELD_MAPPINGS.vendaCompleta, 0)),
        recorrente: parseNumber(findFieldValue(item, FIELD_MAPPINGS.recorrente, 0)),
        parsedDate: parsedDate,
      };

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

      // Se não conseguiu parsear a data, salvar erro no Supabase
      if (!parsedDate && dateSearchResults.dateValue) {
        if (webhookDataId) {
          await supabaseLogger.logProcessingError({
            webhookRawDataId: webhookDataId,
            rowIndex: index,
            rawRowData: item,
            errorType: 'date_parsing_failed',
            errorMessage: `Falha ao parsear data: ${dateSearchResults.dateValue}`,
            fieldAnalysis: dateSearchResults,
            dateParsingAttempts: dateSearchResults.attempts || []
          });
        }
        processingErrors.push({ index, error: 'date_parsing_failed', data: dateSearchResults.dateValue });
      }

    } catch (error) {
      await supabaseLogger.log({
        level: 'error',
        message: `❌ Erro ao processar lead ${index + 1}`,
        data: { error: error.message, item },
        source: 'lead-processor',
        sessionId
      });

      if (webhookDataId) {
        await supabaseLogger.logProcessingError({
          webhookRawDataId: webhookDataId,
          rowIndex: index,
          rawRowData: item,
          errorType: 'processing_error',
          errorMessage: error.message
        });
      }
      processingErrors.push({ index, error: error.message, item });
    }
  }

  // Filtrar leads com dados básicos
  const filteredLeads = processedLeads.filter(lead => {
    const hasBasicData = lead.Nome || lead['e-mail'] || lead.Whatsapp || lead.Status;
    
    if (!hasBasicData) {
      supabaseLogger.log({
        level: 'warn',
        message: '❌ Lead rejeitado por não ter dados básicos',
        data: lead,
        source: 'lead-processor',
        sessionId
      });
      return false;
    }
    
    return true;
  });

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
      errosProcessamento: processingErrors.length
    },
    source: 'lead-processor',
    sessionId
  });

  // IMPORTANTE: Alertar sobre problemas de data
  const leadsWithoutDate = filteredLeads.filter(l => !l.parsedDate).length;
  if (leadsWithoutDate > 0) {
    await supabaseLogger.log({
      level: 'warn',
      message: `⚠️ ATENÇÃO: ${leadsWithoutDate} de ${filteredLeads.length} leads não possuem data válida!`,
      data: { leadsWithoutDate, totalLeads: filteredLeads.length },
      source: 'lead-processor',
      sessionId
    });
  }

  return filteredLeads;
}

async function findDateInItem(item: any, sessionId?: string) {
  // Método 1: Usar mapeamentos conhecidos
  let dateValue = findFieldValue(item, FIELD_MAPPINGS.data, '');
  let method = 'mapeamentos_conhecidos';
  
  await supabaseLogger.log({
    level: 'debug',
    message: '📅 Método 1 (mapeamentos conhecidos)',
    data: { dateValue, metodo: method },
    source: 'date-finder',
    sessionId
  });
  
  // Método 2: Se não encontrou, tentar detecção automática
  if (!dateValue) {
    const detectedColumn = detectDateColumn(item);
    if (detectedColumn) {
      dateValue = item[detectedColumn];
      method = 'deteccao_automatica';
      await supabaseLogger.log({
        level: 'debug',
        message: '📅 Método 2 (detecção automática)',
        data: { dateValue, coluna: detectedColumn, metodo: method },
        source: 'date-finder',
        sessionId
      });
    }
  }
  
  // Método 3: Se ainda não encontrou, tentar chaves que contenham 'data', 'date', etc
  if (!dateValue) {
    const possibleDateKeys = Object.keys(item).filter(key => 
      /data|date|created|timestamp|time|criacao|cadastro|registro/i.test(key)
    );
    
    await supabaseLogger.log({
      level: 'debug',
      message: '📅 Método 3 - Chaves que podem ser data',
      data: { chavesEncontradas: possibleDateKeys },
      source: 'date-finder',
      sessionId
    });
    
    for (const key of possibleDateKeys) {
      if (item[key]) {
        dateValue = item[key];
        method = 'busca_por_nome_campo';
        await supabaseLogger.log({
          level: 'debug',
          message: '📅 Método 3 encontrou data',
          data: { chave: key, dateValue, metodo: method },
          source: 'date-finder',
          sessionId
        });
        break;
      }
    }
  }
  
  // Método 4: Se AINDA não encontrou, mostrar TODAS as chaves e valores
  if (!dateValue) {
    const todasAsChaves = {};
    Object.entries(item).forEach(([key, value]) => {
      todasAsChaves[key] = value;
    });
    
    await supabaseLogger.log({
      level: 'error',
      message: '❌ NENHUM campo de data encontrado! Todas as chaves e valores',
      data: todasAsChaves,
      source: 'date-finder',
      sessionId
    });
    method = 'nao_encontrado';
  }
  
  return { dateValue, method, allFields: item };
}
