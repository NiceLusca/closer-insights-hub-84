
import { supabase } from '@/integrations/supabase/client';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
  level: LogLevel;
  message: string;
  data?: any;
  source: string;
  sessionId?: string;
}

interface WebhookRawData {
  rawData: any;
  totalRecords: number;
  processedRecords?: number;
  failedRecords?: number;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  errorDetails?: any;
  sessionId?: string;
}

interface ProcessingLogData {
  webhookRawDataId: string;
  rowIndex: number;
  rawRowData: any;
  errorType: string;
  errorMessage?: string;
  fieldAnalysis?: any;
  dateParsingAttempts?: any;
}

class SupabaseLogger {
  private sessionId: string;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async log(logData: LogData) {
    try {
      // Log no console primeiro
      console.log(`[${logData.level.toUpperCase()}] [${logData.source}] ${logData.message}`, logData.data || '');
      
      // Salvar no Supabase
      const { error } = await supabase
        .from('webhook_logs')
        .insert({
          log_level: logData.level,
          message: logData.message,
          data: logData.data,
          source: logData.source,
          session_id: logData.sessionId || this.sessionId
        });

      if (error) {
        console.error('Erro ao salvar log no Supabase:', error);
      }
    } catch (err) {
      console.error('Erro crítico no sistema de log:', err);
    }
  }

  async logWebhookRawData(data: WebhookRawData): Promise<string | null> {
    try {
      const { data: result, error } = await supabase
        .from('webhook_raw_data')
        .insert({
          raw_data: data.rawData,
          total_records: data.totalRecords,
          processed_records: data.processedRecords || 0,
          failed_records: data.failedRecords || 0,
          processing_status: data.processingStatus || 'pending',
          error_details: data.errorDetails,
          session_id: data.sessionId || this.sessionId
        })
        .select('id')
        .single();

      if (error) {
        console.error('Erro ao salvar dados brutos do webhook:', error);
        return null;
      }

      await this.log({
        level: 'info',
        message: 'Dados brutos do webhook salvos',
        data: { id: result.id, totalRecords: data.totalRecords },
        source: 'webhook-logger'
      });

      return result.id;
    } catch (err) {
      console.error('Erro ao salvar dados brutos:', err);
      return null;
    }
  }

  async logProcessingError(data: ProcessingLogData) {
    try {
      const { error } = await supabase
        .from('processing_logs')
        .insert({
          webhook_raw_data_id: data.webhookRawDataId,
          row_index: data.rowIndex,
          raw_row_data: data.rawRowData,
          error_type: data.errorType,
          error_message: data.errorMessage,
          field_analysis: data.fieldAnalysis,
          date_parsing_attempts: data.dateParsingAttempts
        });

      if (error) {
        console.error('Erro ao salvar log de processamento:', error);
      } else {
        await this.log({
          level: 'error',
          message: `Erro de processamento: ${data.errorType}`,
          data: {
            rowIndex: data.rowIndex,
            errorMessage: data.errorMessage
          },
          source: 'processing-logger'
        });
      }
    } catch (err) {
      console.error('Erro ao salvar log de processamento:', err);
    }
  }

  async updateWebhookStatus(id: string, status: 'processing' | 'completed' | 'failed', processedRecords?: number, failedRecords?: number, errorDetails?: any) {
    try {
      const { error } = await supabase
        .from('webhook_raw_data')
        .update({
          processing_status: status,
          processed_records: processedRecords,
          failed_records: failedRecords,
          error_details: errorDetails
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar status do webhook:', error);
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

export const supabaseLogger = new SupabaseLogger();
