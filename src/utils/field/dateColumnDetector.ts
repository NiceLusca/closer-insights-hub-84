
import { supabaseLogger } from '@/services/supabaseLogger';

export function detectDateColumn(item: any): string | null {
  console.log('🔍 ========== DETECTANDO COLUNA DE DATA AUTOMATICAMENTE ==========');
  
  const allKeys = Object.keys(item);
  console.log('🔑 Todas as chaves disponíveis:', allKeys);
  
  // Padrões mais específicos que indicam data
  const datePatterns = [
    /^data$/i, /^date$/i, /^created$/i, /^timestamp$/i,
    /data.*criacao/i, /data.*cadastro/i, /data.*registro/i, /data.*entrada/i,
    /created.*at/i, /created.*date/i, /registration.*date/i,
    /lead.*date/i, /date.*created/i
  ];
  
  // Primeiro, procurar por padrões de nome exatos
  for (const key of allKeys) {
    console.log(`🔍 Analisando chave: "${key}"`);
    
    const isDateKey = datePatterns.some(pattern => {
      const matches = pattern.test(key);
      if (matches) {
        console.log(`✅ Padrão "${pattern}" corresponde à chave "${key}"`);
      }
      return matches;
    });
    
    if (isDateKey) {
      const value = item[key];
      console.log(`🎯 Possível coluna de data encontrada: "${key}" = "${value}"`);
      
      if (value && typeof value === 'string') {
        console.log(`🧪 Testando se o valor "${value}" parece ser uma data...`);
        
        // Padrões que indicam que é uma data
        const dateValuePatterns = [
          /^\d{4}-\d{1,2}-\d{1,2}/, // 2024-01-01, 2024-1-1
          /^\d{1,2}\/\d{1,2}\/\d{4}/, // 01/01/2024, 1/1/2024
          /^\d{1,2}-\d{1,2}-\d{4}/, // 01-01-2024, 1-1-2024
          /^\d{8}$/, // 20240101
          /^\d{10,13}$/, // timestamp
          /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO format
          /\d{1,2}\s+\w{3}\s+\d{4}/, // 01 Jan 2024
          /^\d{1,2}\s+[a-záêç.]+\.?$/i // 12 fev., 24 fev. (formato brasileiro)
        ];
        
        for (let i = 0; i < dateValuePatterns.length; i++) {
          const pattern = dateValuePatterns[i];
          if (pattern.test(value)) {
            console.log(`✅ Valor "${value}" corresponde ao padrão de data ${i + 1}: ${pattern}`);
            if (i === dateValuePatterns.length - 1) {
              console.log('🇧🇷 FORMATO BRASILEIRO DETECTADO!');
            }
            console.log('🎯 ========== COLUNA DE DATA DETECTADA! ==========');
            console.log('🎯 Coluna:', key);
            console.log('🎯 Valor exemplo:', value);
            return key;
          }
        }
        
        console.log(`❌ Valor "${value}" não corresponde a nenhum padrão de data conhecido`);
      } else {
        console.log(`❌ Valor não é string ou está vazio:`, value);
      }
    }
  }
  
  // Se não encontrou por padrões específicos, tentar qualquer chave que contenha palavras-chave
  console.log('🔍 Tentando busca mais ampla por palavras-chave...');
  const broadDateKeywords = ['data', 'date', 'created', 'time', 'timestamp'];
  
  for (const keyword of broadDateKeywords) {
    for (const key of allKeys) {
      if (key.toLowerCase().includes(keyword.toLowerCase())) {
        const value = item[key];
        console.log(`🎯 Chave "${key}" contém palavra-chave "${keyword}", valor: "${value}"`);
        
        if (value && typeof value === 'string' && value.length > 4) {
          console.log(`✅ Usando "${key}" como coluna de data (busca ampla)`);
          return key;
        }
      }
    }
  }
  
  console.log('❌ ========== NENHUMA COLUNA DE DATA DETECTADA ==========');
  return null;
}
