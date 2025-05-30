
import { supabaseLogger } from '@/services/supabaseLogger';

// Mapeamento COMPLETO de meses brasileiros abreviados
const MESES_BRASILEIROS = {
  'jan.': '01', 'jan': '01',
  'fev.': '02', 'fev': '02',
  'mar.': '03', 'mar': '03',
  'abr.': '04', 'abr': '04',  // CORRIGIDO: Adicionado abril
  'mai.': '05', 'mai': '05',
  'jun.': '06', 'jun': '06',
  'jul.': '07', 'jul': '07',
  'ago.': '08', 'ago': '08',
  'set.': '09', 'set': '09',
  'out.': '10', 'out': '10',
  'nov.': '11', 'nov': '11',
  'dez.': '12', 'dez': '12'
};

export function convertBrazilianDateFormat(dateValue: string): string | null {
  // Validação básica: rejeitar strings muito curtas ou que são apenas números
  if (!dateValue || dateValue.trim().length < 3) {
    console.log(`❌ Data rejeitada por ser muito curta: "${dateValue}"`);
    return null;
  }

  // Rejeitar se for apenas um número (como "2")
  if (/^\d+$/.test(dateValue.trim())) {
    console.log(`❌ Data rejeitada por ser apenas número: "${dateValue}"`);
    return null;
  }

  // Limpar e normalizar o valor
  const cleanValue = dateValue.trim().toLowerCase();

  // Padrão para detectar formato brasileiro: "12 fev.", "24 abr.", etc.
  const brazilianPattern = /^(\d{1,2})\s+([a-záêç.]+)\.?$/i;
  const match = cleanValue.match(brazilianPattern);
  
  if (match) {
    const [, day, monthStr] = match;
    
    // Tentar com ponto e sem ponto
    let monthKey = monthStr.toLowerCase();
    if (!monthKey.endsWith('.')) {
      monthKey = monthKey + '.';
    }
    
    const month = MESES_BRASILEIROS[monthKey];
    
    if (month) {
      const currentYear = new Date().getFullYear();
      const convertedDate = `${currentYear}-${month}-${day.padStart(2, '0')}`;
      console.log(`🇧🇷 Convertendo data brasileira: "${dateValue}" → "${convertedDate}"`);
      return convertedDate;
    } else {
      console.log(`❌ Mês brasileiro não reconhecido: "${monthStr}" (chave: "${monthKey}")`);
      console.log(`Meses disponíveis:`, Object.keys(MESES_BRASILEIROS));
    }
  }
  
  // Tentar outros padrões comuns brasileiros
  // Formato: "dia/mês" assumindo ano atual
  const shortPattern = /^(\d{1,2})\/(\d{1,2})$/;
  const shortMatch = cleanValue.match(shortPattern);
  
  if (shortMatch) {
    const [, day, month] = shortMatch;
    const currentYear = new Date().getFullYear();
    const convertedDate = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    console.log(`🇧🇷 Convertendo data curta: "${dateValue}" → "${convertedDate}"`);
    return convertedDate;
  }
  
  return null;
}
