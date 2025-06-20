
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

// CORREÇÃO CRÍTICA: Função para determinar ano correto
function determineCorrectYear(month: number, day: number): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
  const currentDay = now.getDate();
  
  // Se a data seria no futuro, usar ano anterior
  if (month > currentMonth || (month === currentMonth && day > currentDay)) {
    return currentYear - 1;
  }
  
  return currentYear;
}

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
    const [, dayStr, monthStr] = match;
    const day = parseInt(dayStr);
    
    // Tentar com ponto e sem ponto
    let monthKey = monthStr.toLowerCase();
    if (!monthKey.endsWith('.')) {
      monthKey = monthKey + '.';
    }
    
    const monthNumber = MESES_BRASILEIROS[monthKey];
    
    if (monthNumber) {
      const month = parseInt(monthNumber);
      const year = determineCorrectYear(month, day);
      const convertedDate = `${year}-${monthNumber}-${dayStr.padStart(2, '0')}`;
      
      console.log(`🇧🇷 [CORREÇÃO CRÍTICA] Convertendo data brasileira: "${dateValue}" → "${convertedDate}" (ano determinado: ${year})`);
      return convertedDate;
    } else {
      console.log(`❌ Mês brasileiro não reconhecido: "${monthStr}" (chave: "${monthKey}")`);
    }
  }
  
  // Tentar outros padrões comuns brasileiros
  // Formato: "dia/mês" assumindo ANO CORRETO
  const shortPattern = /^(\d{1,2})\/(\d{1,2})$/;
  const shortMatch = cleanValue.match(shortPattern);
  
  if (shortMatch) {
    const [, dayStr, monthStr] = shortMatch;
    const day = parseInt(dayStr);
    const month = parseInt(monthStr);
    
    // CORREÇÃO CRÍTICA: Validar mês válido (1-12)
    if (month < 1 || month > 12) {
      console.log(`❌ Mês inválido: ${month}`);
      return null;
    }
    
    const year = determineCorrectYear(month, day);
    const convertedDate = `${year}-${monthStr.padStart(2, '0')}-${dayStr.padStart(2, '0')}`;
    
    console.log(`🇧🇷 [CORREÇÃO CRÍTICA] Convertendo data curta: "${dateValue}" → "${convertedDate}" (ano determinado: ${year})`);
    return convertedDate;
  }
  
  return null;
}
