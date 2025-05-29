
import { supabaseLogger } from '@/services/supabaseLogger';

// Mapeamento COMPLETO de meses brasileiros abreviados
const MESES_BRASILEIROS = {
  'jan.': '01', 'jan': '01',
  'fev.': '02', 'fev': '02',
  'mar.': '03', 'mar': '03',
  'abr.': '04', 'abr': '04',
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
  // Padrão para detectar formato brasileiro: "12 fev.", "24 abr.", etc.
  const brazilianPattern = /^(\d{1,2})\s+([a-záêç.]+)\.?$/i;
  const match = dateValue.trim().match(brazilianPattern);
  
  if (match) {
    const [, day, monthStr] = match;
    const monthKey = monthStr.toLowerCase().endsWith('.') ? monthStr.toLowerCase() : monthStr.toLowerCase() + '.';
    const month = MESES_BRASILEIROS[monthKey];
    
    if (month) {
      const currentYear = new Date().getFullYear();
      const convertedDate = `${currentYear}-${month}-${day.padStart(2, '0')}`;
      console.log(`🇧🇷 Convertendo data brasileira: "${dateValue}" → "${convertedDate}"`);
      return convertedDate;
    } else {
      console.log(`❌ Mês brasileiro não reconhecido: "${monthStr}" (chave: "${monthKey}")`);
    }
  }
  
  return null;
}
