
import { supabaseLogger } from '../supabaseLogger';

const WEBHOOK_URL = 'https://bot-belas-n8n.9csrtv.easypanel.host/webhook/leads-closer-oceanoazul';
const REQUEST_TIMEOUT = 15000; // 15 segundos

export class WebhookFetcher {
  async fetchData(sessionId: string): Promise<any[]> {
    await supabaseLogger.log({
      level: 'info',
      message: '🌐 INICIANDO CHAMADA PARA WEBHOOK EXTERNO',
      data: { 
        webhookUrl: WEBHOOK_URL,
        timeout: REQUEST_TIMEOUT
      },
      source: 'webhook-fetcher',
      sessionId
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();
      
      await supabaseLogger.log({
        level: 'info',
        message: '✅ WEBHOOK RESPONDEU COM SUCESSO',
        data: { 
          statusCode: response.status,
          contentType: response.headers.get('content-type'),
          dataType: typeof rawData,
          isArray: Array.isArray(rawData),
          totalRecords: Array.isArray(rawData) ? rawData.length : 1
        },
        source: 'webhook-fetcher',
        sessionId
      });

      return Array.isArray(rawData) ? rawData : [rawData];
    } catch (error) {
      clearTimeout(timeoutId);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      await supabaseLogger.log({
        level: 'error',
        message: '❌ ERRO NA CHAMADA DO WEBHOOK',
        data: { 
          erro: errorMessage,
          webhookUrl: WEBHOOK_URL,
          isAbortError: error.name === 'AbortError',
          isNetworkError: error instanceof TypeError
        },
        source: 'webhook-fetcher',
        sessionId
      });

      throw error;
    }
  }
}
