
import { supabaseLogger } from '@/services/supabaseLogger';
import { findFieldValue, FIELD_MAPPINGS, detectDateColumn } from '../field';

export async function findDateInItem(item: any, sessionId?: string) {
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
