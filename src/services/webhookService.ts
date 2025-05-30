import type { Lead } from '@/types/lead';
import { processRawDataToLeads } from '@/utils/lead';
import { supabaseLogger } from './supabaseLogger';

export async function fetchLeadsFromWebhook(): Promise<Lead[]> {
  const sessionId = supabaseLogger.getSessionId();
  
  await supabaseLogger.log({
    level: 'info',
    message: '🔌 Iniciando busca de dados do webhook',
    source: 'webhook-service',
    sessionId
  });
  
  let webhookDataId: string | null = null;
  
  try {
    const response = await fetch('https://bot-belas-n8n.9csrtv.easypanel.host/webhook/leads-closer-oceanoazul');
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      await supabaseLogger.log({
        level: 'error',
        message: 'Erro HTTP na requisição do webhook',
        data: { status: response.status, statusText: response.statusText },
        source: 'webhook-service',
        sessionId
      });
      throw error;
    }
    
    const data = await response.json();
    
    await supabaseLogger.log({
      level: 'info',
      message: '📦 Dados brutos recebidos do webhook',
      data: {
        tipo: typeof data,
        isArray: Array.isArray(data),
        quantidade: data?.length || 0,
        primeiroItem: data?.[0] || null
      },
      source: 'webhook-service',
      sessionId
    });

    // Salvar dados brutos no Supabase
    webhookDataId = await supabaseLogger.logWebhookRawData({
      rawData: data,
      totalRecords: Array.isArray(data) ? data.length : 0,
      sessionId
    });

    if (webhookDataId) {
      await supabaseLogger.updateWebhookStatus(webhookDataId, 'processing');
    }

    // ANÁLISE DETALHADA DOS DADOS
    if (Array.isArray(data) && data.length > 0) {
      await supabaseLogger.log({
        level: 'debug',
        message: '🔍 ANÁLISE DETALHADA DO PRIMEIRO ITEM',
        data: {
          todasAsChaves: Object.keys(data[0]),
          valoresCompletos: data[0],
          analiseDetalhada: await analyzeDataFields(data[0], sessionId)
        },
        source: 'webhook-service',
        sessionId
      });
    }
    
    if (!Array.isArray(data)) {
      await supabaseLogger.log({
        level: 'warn',
        message: '⚠️ Dados não são um array, tentando acessar propriedade que pode conter o array',
        source: 'webhook-service',
        sessionId
      });
      
      // Tentar encontrar array dentro do objeto
      const possibleArrayKeys = ['data', 'leads', 'items', 'results', 'records'];
      for (const key of possibleArrayKeys) {
        if (data[key] && Array.isArray(data[key])) {
          await supabaseLogger.log({
            level: 'info',
            message: `✅ Array encontrado na propriedade '${key}'`,
            source: 'webhook-service',
            sessionId
          });
          
          const processedLeads = await processWebhookDataWithErrorHandling(data[key], sessionId, webhookDataId);
          return processedLeads;
        }
      }
      
      await supabaseLogger.log({
        level: 'error',
        message: '❌ Nenhum array encontrado nos dados',
        source: 'webhook-service',
        sessionId
      });
      
      if (webhookDataId) {
        await supabaseLogger.updateWebhookStatus(webhookDataId, 'failed', 0, 0, { error: 'No array found in data' });
      }
      
      return [];
    }

    const processedLeads = await processWebhookDataWithErrorHandling(data, sessionId, webhookDataId);
    return processedLeads;
    
  } catch (error) {
    await supabaseLogger.log({
      level: 'error',
      message: '❌ Erro crítico ao buscar dados do webhook',
      data: { error: error.message, stack: error.stack },
      source: 'webhook-service',
      sessionId
    });
    
    // Garantir que o status seja atualizado mesmo em caso de erro
    if (webhookDataId) {
      try {
        await supabaseLogger.updateWebhookStatus(webhookDataId, 'failed', 0, 0, { 
          error: error.message,
          timestamp: new Date().toISOString()
        });
      } catch (updateError) {
        console.error('Erro ao atualizar status do webhook:', updateError);
      }
    }
    
    throw error;
  }
}

async function processWebhookDataWithErrorHandling(data: any[], sessionId: string, webhookDataId: string | null): Promise<Lead[]> {
  try {
    if (data.length === 0) {
      await supabaseLogger.log({
        level: 'warn',
        message: '⚠️ Array vazio recebido',
        source: 'webhook-service',
        sessionId
      });
      
      if (webhookDataId) {
        await supabaseLogger.updateWebhookStatus(webhookDataId, 'completed', 0, 0);
      }
      
      return [];
    }

    await supabaseLogger.log({
      level: 'info',
      message: '🔍 Iniciando processamento dos dados do webhook',
      data: {
        totalRegistros: data.length,
        chavesDoTopo: data[0] ? Object.keys(data[0]) : [],
        valoresDoTopo: data[0] || null
      },
      source: 'webhook-service',
      sessionId
    });

    // Processar dados com tratamento de erro robusto
    const processedLeads = await processRawDataToLeads(data, sessionId, webhookDataId);

    await supabaseLogger.log({
      level: 'info',
      message: '✅ Processamento do webhook concluído com sucesso',
      data: {
        recebidos: data.length,
        processados: processedLeads.length,
        comDataValida: processedLeads.filter(l => l.parsedDate).length,
        comStatus: processedLeads.filter(l => l.Status && l.Status.trim() !== '').length,
        statusEncontrados: [...new Set(processedLeads.map(l => l.Status).filter(Boolean))]
      },
      source: 'webhook-service',
      sessionId
    });
    
    // SEMPRE atualizar o status para completed após processamento
    if (webhookDataId) {
      const failedRecords = data.length - processedLeads.length;
      await supabaseLogger.updateWebhookStatus(
        webhookDataId, 
        'completed',
        processedLeads.length,
        failedRecords,
        {
          completedAt: new Date().toISOString(),
          successRate: ((processedLeads.length / data.length) * 100).toFixed(1) + '%'
        }
      );
      
      await supabaseLogger.log({
        level: 'info',
        message: '✅ Status do webhook atualizado para COMPLETED',
        data: {
          webhookDataId,
          processedLeads: processedLeads.length,
          failedRecords
        },
        source: 'webhook-service',
        sessionId
      });
    }
    
    return processedLeads;
    
  } catch (error) {
    await supabaseLogger.log({
      level: 'error',
      message: '❌ Erro durante processamento dos dados',
      data: { error: error.message },
      source: 'webhook-service',
      sessionId
    });
    
    // Atualizar status para failed em caso de erro
    if (webhookDataId) {
      try {
        await supabaseLogger.updateWebhookStatus(webhookDataId, 'failed', 0, data.length, {
          error: error.message,
          failedAt: new Date().toISOString()
        });
      } catch (updateError) {
        console.error('Erro ao atualizar status do webhook para failed:', updateError);
      }
    }
    
    // Retornar array vazio em vez de throw para não quebrar a interface
    return [];
  }
}

async function analyzeDataFields(item: any, sessionId: string) {
  const analysis = {};
  
  for (const [key, value] of Object.entries(item)) {
    const valueStr = String(value);
    analysis[key] = {
      value: valueStr,
      type: typeof value,
      isPossibleDate: /\d{4}/.test(valueStr) && (valueStr.includes('-') || valueStr.includes('/') || valueStr.includes('T'))
    };
    
    if (analysis[key].isPossibleDate) {
      await supabaseLogger.log({
        level: 'debug',
        message: `🎯 POSSÍVEL CAMPO DE DATA DETECTADO: "${key}" = "${value}"`,
        source: 'webhook-service',
        sessionId
      });
    }
  }
  
  return analysis;
}
