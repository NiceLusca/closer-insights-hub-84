
import { supabaseLogger } from '@/services/supabaseLogger';
import { detectDateColumn } from '../field';

export async function analyzeRawData(data: any[], sessionId?: string) {
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
}
