
import { supabaseLogger } from '@/services/supabaseLogger';

export async function handleProcessingError(
  error: any,
  index: number,
  item: any,
  webhookDataId?: string,
  sessionId?: string
) {
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

  return { index, error: error.message, item };
}

export async function handleDateParsingError(
  dateValue: string,
  dateSearchResults: any,
  index: number,
  item: any,
  webhookDataId?: string
) {
  if (webhookDataId) {
    await supabaseLogger.logProcessingError({
      webhookRawDataId: webhookDataId,
      rowIndex: index,
      rawRowData: item,
      errorType: 'date_parsing_failed',
      errorMessage: `Falha ao parsear data: ${dateValue}`,
      fieldAnalysis: dateSearchResults
    });
  }
  
  return { index, error: 'date_parsing_failed', data: dateValue };
}
