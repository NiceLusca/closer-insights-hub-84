
import { supabaseLogger } from '@/services/supabaseLogger';

// Mapeamento COMPLETO de meses brasileiros abreviados
const MESES_BRASILEIROS = {
  'jan.': '01', 'jan': '01', 'janeiro': '01',
  'fev.': '02', 'fev': '02', 'fevereiro': '02',
  'mar.': '03', 'mar': '03', 'março': '03',
  'abr.': '04', 'abr': '04', 'abril': '04',
  'mai.': '05', 'mai': '05', 'maio': '05',
  'jun.': '06', 'jun': '06', 'junho': '06',
  'jul.': '07', 'jul': '07', 'julho': '07',
  'ago.': '08', 'ago': '08', 'agosto': '08',
  'set.': '09', 'set': '09', 'setembro': '09',
  'out.': '10', 'out': '10', 'outubro': '10',
  'nov.': '11', 'nov': '11', 'novembro': '11',
  'dez.': '12', 'dez': '12', 'dezembro': '12'
};

// CORREÇÃO CRÍTICA: Função para determinar ano correto baseada no contexto atual
function determineCorrectYear(month: number, day: number): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  
  // LÓGICA MELHORADA: Considerar que estamos em 2024/2025
  // Se a data está no futuro próximo (próximos 2 meses), usar ano atual
  if (month > currentMonth && month <= currentMonth + 2) {
    return currentYear;
  }
  
  // Se estamos no início do ano (jan-fev) e a data é de final do ano (nov-dez), usar ano anterior
  if (currentMonth <= 2 && month >= 11) {
    return currentYear - 1;
  }
  
  // Se estamos no final do ano (nov-dez) e a data é de início do ano (jan-fev), usar próximo ano
  if (currentMonth >= 11 && month <= 2) {
    return currentYear + 1;
  }
  
  // Para outros casos, usar ano atual
  return currentYear;
}

export function convertBrazilianDateFormat(dateValue: string): string | null {
  if (!dateValue || dateValue.trim().length < 2) {
    return null;
  }

  // Rejeitar se for apenas um número
  if (/^\d+$/.test(dateValue.trim())) {
    return null;
  }

  const cleanValue = dateValue.trim().toLowerCase();

  // PADRÃO MELHORADO: Detectar vários formatos brasileiros
  const patterns = [
    /^(\d{1,2})\s+([a-záêç.]+)\.?$/i, // "12 fev.", "24 abr."
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/i, // "12/05/2024"
    /^(\d{1,2})\/(\d{1,2})$/i, // "12/05"
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/i, // "12-05-2024"
    /^(\d{1,2})-(\d{1,2})$/i // "12-05"
  ];

  // Tentar padrão com nome do mês
  const brazilianMatch = cleanValue.match(patterns[0]);
  if (brazilianMatch) {
    const [, dayStr, monthStr] = brazilianMatch;
    const day = parseInt(dayStr);
    
    let monthKey = monthStr.toLowerCase();
    if (!monthKey.endsWith('.') && MESES_BRASILEIROS[monthKey + '.']) {
      monthKey = monthKey + '.';
    }
    
    const monthNumber = MESES_BRASILEIROS[monthKey];
    
    if (monthNumber) {
      const month = parseInt(monthNumber);
      const year = determineCorrectYear(month, day);
      
      // Validação: anos entre 2020-2030
      if (year >= 2020 && year <= 2030) {
        const convertedDate = `${year}-${monthNumber}-${dayStr.padStart(2, '0')}`;
        console.log(`🇧🇷 Convertendo data brasileira: "${dateValue}" → "${convertedDate}"`);
        return convertedDate;
      }
    }
  }

  // Tentar outros padrões
  for (let i = 1; i < patterns.length; i++) {
    const match = cleanValue.match(patterns[i]);
    if (match) {
      let day: number, month: number, year: number;
      
      if (match.length === 4) { // Com ano
        [, day, month, year] = match.map(Number);
      } else { // Sem ano
        [, day, month] = match.map(Number);
        year = determineCorrectYear(month, day);
      }
      
      // Validações
      if (month < 1 || month > 12 || day < 1 || day > 31) {
        continue;
      }
      
      if (year >= 2020 && year <= 2030) {
        const convertedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        console.log(`🇧🇷 Convertendo data: "${dateValue}" → "${convertedDate}"`);
        return convertedDate;
      }
    }
  }
  
  return null;
}

// NOVA FUNÇÃO: Extrair data de múltiplos campos
export function extractDateFromLeadData(leadData: any): string | null {
  const possibleDateFields = ['data', 'Data', 'date', 'timestamp', 'created_at'];
  
  for (const field of possibleDateFields) {
    if (leadData[field] && leadData[field].toString().trim()) {
      const converted = convertBrazilianDateFormat(leadData[field].toString());
      if (converted) {
        return converted;
      }
    }
  }
  
  return null;
}
