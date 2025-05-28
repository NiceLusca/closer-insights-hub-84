
import { parseISO, parse, isValid } from 'date-fns';

export function parseDate(dateValue: string): Date | undefined {
  if (!dateValue) return undefined;

  const dateFormats = [
    'dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy',
    'dd/MM/yyyy HH:mm:ss', 'yyyy-MM-dd HH:mm:ss'
  ];
  
  for (const formatStr of dateFormats) {
    try {
      const testDate = parse(dateValue.toString(), formatStr, new Date());
      if (isValid(testDate) && testDate.getFullYear() >= 2020) {
        return testDate;
      }
    } catch (e) {
      // Continue trying other formats
    }
  }
  
  try {
    const isoDate = parseISO(dateValue.toString());
    if (isValid(isoDate)) {
      return isoDate;
    }
  } catch (e) {
    // Data inválida, retornar undefined
  }

  return undefined;
}
