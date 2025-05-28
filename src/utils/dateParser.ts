
import { parseISO, parse, isValid } from 'date-fns';

export function parseDate(dateValue: string): Date | undefined {
  if (!dateValue) return undefined;

  console.log('🔍 Tentando parsear data:', dateValue);

  // Expandir formatos de data suportados
  const dateFormats = [
    // Formatos brasileiros
    'dd/MM/yyyy', 'dd/MM/yyyy HH:mm:ss', 'dd/MM/yyyy HH:mm',
    'dd-MM-yyyy', 'dd-MM-yyyy HH:mm:ss', 'dd-MM-yyyy HH:mm',
    // Formatos internacionais
    'yyyy-MM-dd', 'yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm',
    'MM/dd/yyyy', 'MM/dd/yyyy HH:mm:ss', 'MM/dd/yyyy HH:mm',
    'MM-dd-yyyy', 'MM-dd-yyyy HH:mm:ss', 'MM-dd-yyyy HH:mm',
    // Formatos com pontos
    'dd.MM.yyyy', 'dd.MM.yyyy HH:mm:ss', 'dd.MM.yyyy HH:mm',
    'yyyy.MM.dd', 'yyyy.MM.dd HH:mm:ss', 'yyyy.MM.dd HH:mm',
    // Formatos sem separadores
    'ddMMyyyy', 'yyyyMMdd',
    // Formatos com texto
    'dd MMM yyyy', 'MMM dd, yyyy', 'MMMM dd, yyyy'
  ];
  
  // Tentar cada formato
  for (const formatStr of dateFormats) {
    try {
      const testDate = parse(dateValue.toString(), formatStr, new Date());
      if (isValid(testDate) && testDate.getFullYear() >= 2020 && testDate.getFullYear() <= 2030) {
        console.log('✅ Data parseada com sucesso:', {
          original: dateValue,
          formato: formatStr,
          resultado: testDate.toISOString()
        });
        return testDate;
      }
    } catch (e) {
      // Continue tentando outros formatos
    }
  }
  
  // Tentar ISO date como último recurso
  try {
    const isoDate = parseISO(dateValue.toString());
    if (isValid(isoDate) && isoDate.getFullYear() >= 2020 && isoDate.getFullYear() <= 2030) {
      console.log('✅ Data ISO parseada com sucesso:', {
        original: dateValue,
        resultado: isoDate.toISOString()
      });
      return isoDate;
    }
  } catch (e) {
    // Data inválida
  }

  console.log('❌ Falha ao parsear data:', dateValue);
  return undefined;
}
