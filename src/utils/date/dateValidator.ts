
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function isValidYear(year: number): boolean {
  return year >= 2020 && year <= 2030;
}

export function validateParsedDate(date: Date): boolean {
  return isValidDate(date) && isValidYear(date.getFullYear());
}

// Função melhorada para validar se uma string pode ser uma data
export function isValidDateString(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') return false;
  
  const trimmed = dateString.trim();
  
  // Rejeitar strings muito curtas
  if (trimmed.length < 3) return false;
  
  // Rejeitar se for apenas um número (como "2", "123", etc.)
  if (/^\d+$/.test(trimmed)) return false;
  
  // Rejeitar strings claramente não-data
  if (/^[a-z]+$/i.test(trimmed)) return false; // apenas letras
  if (trimmed === '' || trimmed === '-' || trimmed === '/') return false;
  
  // Aceitar se contém padrões de data reconhecíveis
  const hasDatePatterns = (
    // Contém números E separadores
    /\d/.test(trimmed) && (
      trimmed.includes('-') || 
      trimmed.includes('/') || 
      trimmed.includes('.') || 
      trimmed.includes(' ') ||
      trimmed.includes('T')
    )
  ) || (
    // Ou formato brasileiro com texto de mês
    /\d+\s+[a-záêç.]+/i.test(trimmed)
  );
  
  return hasDatePatterns;
}
