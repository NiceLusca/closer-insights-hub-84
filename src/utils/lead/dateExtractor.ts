
import { supabaseLogger } from '@/services/supabaseLogger';
import { findFieldValue, FIELD_MAPPINGS, detectDateColumn } from '../field';

export async function findDateInItem(item: any, sessionId?: string, fieldCache?: Map<string, string>) {
  // Usar cache se disponível
  const cacheKey = JSON.stringify(Object.keys(item).sort());
  if (fieldCache?.has(cacheKey)) {
    const cachedField = fieldCache.get(cacheKey);
    if (cachedField && item[cachedField]) {
      return { 
        dateValue: item[cachedField], 
        method: 'cache',
        cachedField 
      };
    }
  }

  // Método 1: Usar mapeamentos conhecidos
  let dateValue = findFieldValue(item, FIELD_MAPPINGS.data, '');
  let method = 'mapeamentos_conhecidos';
  let foundField = null;
  
  // Encontrar qual campo foi usado
  if (dateValue) {
    for (const key of FIELD_MAPPINGS.data) {
      if (item[key] === dateValue) {
        foundField = key;
        break;
      }
    }
  }
  
  // Método 2: Se não encontrou, tentar detecção automática
  if (!dateValue) {
    const detectedColumn = detectDateColumn(item);
    if (detectedColumn) {
      dateValue = item[detectedColumn];
      method = 'deteccao_automatica';
      foundField = detectedColumn;
    }
  }
  
  // Método 3: Se ainda não encontrou, tentar chaves que contenham 'data', 'date', etc
  if (!dateValue) {
    const possibleDateKeys = Object.keys(item).filter(key => 
      /data|date|created|timestamp|time|criacao|cadastro|registro/i.test(key)
    );
    
    for (const key of possibleDateKeys) {
      if (item[key]) {
        dateValue = item[key];
        method = 'busca_por_nome_campo';
        foundField = key;
        break;
      }
    }
  }
  
  // Salvar no cache se encontrou um campo válido
  if (foundField && fieldCache) {
    fieldCache.set(cacheKey, foundField);
  }
  
  // Log apenas se não encontrou data (reduzir spam de logs)
  if (!dateValue && sessionId) {
    await supabaseLogger.log({
      level: 'warn',
      message: '❌ Campo de data não encontrado',
      data: { 
        chavesDisponiveis: Object.keys(item).slice(0, 10),
        totalChaves: Object.keys(item).length
      },
      source: 'date-finder',
      sessionId
    });
    method = 'nao_encontrado';
  }
  
  return { dateValue, method, foundField, allFields: dateValue ? undefined : item };
}
