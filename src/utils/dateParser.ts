
import { parseISO, parse, isValid } from 'date-fns';
import { supabaseLogger } from '@/services/supabaseLogger';

export async function parseDate(dateValue: string, sessionId?: string): Promise<Date | undefined> {
  if (!dateValue) {
    await supabaseLogger.log({
      level: 'warn',
      message: '❌ dateValue está vazio',
      source: 'date-parser',
      sessionId
    });
    return undefined;
  }

  await supabaseLogger.log({
    level: 'debug',
    message: '🔍 INICIANDO PARSE DE DATA',
    data: { valorRecebido: dateValue, tipo: typeof dateValue },
    source: 'date-parser',
    sessionId
  });

  const dateFormats = [
    // Formatos brasileiros mais comuns
    'dd/MM/yyyy', 'dd/MM/yyyy HH:mm:ss', 'dd/MM/yyyy HH:mm',
    'd/M/yyyy', 'd/M/yyyy HH:mm:ss', 'd/M/yyyy HH:mm',
    'dd-MM-yyyy', 'dd-MM-yyyy HH:mm:ss', 'dd-MM-yyyy HH:mm',
    'd-M-yyyy', 'd-M-yyyy HH:mm:ss', 'd-M-yyyy HH:mm',
    
    // Formatos ISO e internacionais
    'yyyy-MM-dd', 'yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm',
    'yyyy-M-d', 'yyyy-M-d HH:mm:ss', 'yyyy-M-d HH:mm',
    
    // Formatos americanos
    'MM/dd/yyyy', 'MM/dd/yyyy HH:mm:ss', 'MM/dd/yyyy HH:mm',
    'M/d/yyyy', 'M/d/yyyy HH:mm:ss', 'M/d/yyyy HH:mm',
    'MM-dd-yyyy', 'MM-dd-yyyy HH:mm:ss', 'MM-dd-yyyy HH:mm',
    'M-d-yyyy', 'M-d-yyyy HH:mm:ss', 'M-d-yyyy HH:mm',
    
    // Formatos com pontos
    'dd.MM.yyyy', 'dd.MM.yyyy HH:mm:ss', 'dd.MM.yyyy HH:mm',
    'd.M.yyyy', 'd.M.yyyy HH:mm:ss', 'd.M.yyyy HH:mm',
    'yyyy.MM.dd', 'yyyy.MM.dd HH:mm:ss', 'yyyy.MM.dd HH:mm',
    
    // Formatos sem separadores
    'ddMMyyyy', 'yyyyMMdd', 'yyyyMdd', 'ddMyyyy',
    
    // Formatos com texto de mês
    'dd MMM yyyy', 'dd MMMM yyyy', 'MMM dd, yyyy', 'MMMM dd, yyyy',
    'd MMM yyyy', 'd MMMM yyyy', 'MMM d, yyyy', 'MMMM d, yyyy',
    
    // Formatos ISO com T
    'yyyy-MM-dd\'T\'HH:mm:ss', 'yyyy-MM-dd\'T\'HH:mm:ss.SSS',
    'yyyy-MM-dd\'T\'HH:mm:ss.SSSSSS', 'yyyy-MM-dd\'T\'HH:mm:ssXXX',
    
    // Formatos mais exóticos
    'dd MMM, yyyy', 'MMM dd yyyy', 'dd de MMMM de yyyy'
  ];
  
  const tentativas = [];
  
  // Tentar cada formato com logs detalhados
  for (let i = 0; i < dateFormats.length; i++) {
    const formatStr = dateFormats[i];
    try {
      const testDate = parse(dateValue.toString(), formatStr, new Date());
      
      const tentativa = {
        formato: formatStr,
        resultado: testDate.toISOString(),
        isValid: isValid(testDate),
        ano: testDate.getFullYear(),
        anoValido: testDate.getFullYear() >= 2020 && testDate.getFullYear() <= 2030
      };
      
      tentativas.push(tentativa);
      
      if (isValid(testDate) && testDate.getFullYear() >= 2020 && testDate.getFullYear() <= 2030) {
        await supabaseLogger.log({
          level: 'info',
          message: '✅ DATA PARSEADA COM SUCESSO!',
          data: {
            formatoUsado: formatStr,
            dataOriginal: dateValue,
            dataParsada: testDate.toISOString(),
            dataLocal: testDate.toLocaleDateString(),
            tentativasFeitas: i + 1
          },
          source: 'date-parser',
          sessionId
        });
        return testDate;
      }
    } catch (e) {
      tentativas.push({ formato: formatStr, erro: e.message });
    }
  }
  
  // Tentar parseISO como penúltimo recurso
  try {
    const isoDate = parseISO(dateValue.toString());
    
    const tentativaISO = {
      metodo: 'parseISO',
      resultado: isoDate.toISOString(),
      isValid: isValid(isoDate),
      ano: isoDate.getFullYear()
    };
    
    tentativas.push(tentativaISO);
    
    if (isValid(isoDate) && isoDate.getFullYear() >= 2020 && isoDate.getFullYear() <= 2030) {
      await supabaseLogger.log({
        level: 'info',
        message: '✅ DATA ISO PARSEADA COM SUCESSO!',
        data: {
          dataOriginal: dateValue,
          dataParsada: isoDate.toISOString()
        },
        source: 'date-parser',
        sessionId
      });
      return isoDate;
    }
  } catch (e) {
    tentativas.push({ metodo: 'parseISO', erro: e.message });
  }

  // Tentar timestamp como último recurso
  if (!isNaN(Number(dateValue))) {
    try {
      const timestamp = Number(dateValue);
      // Se for timestamp em segundos, converter para milissegundos
      const date = new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000);
      
      const tentativaTimestamp = {
        metodo: 'timestamp',
        timestamp,
        resultado: date.toISOString(),
        isValid: isValid(date),
        ano: date.getFullYear()
      };
      
      tentativas.push(tentativaTimestamp);
      
      if (isValid(date) && date.getFullYear() >= 2020 && date.getFullYear() <= 2030) {
        await supabaseLogger.log({
          level: 'info',
          message: '✅ TIMESTAMP PARSEADO COM SUCESSO!',
          data: {
            timestampOriginal: dateValue,
            dataParsada: date.toISOString()
          },
          source: 'date-parser',
          sessionId
        });
        return date;
      }
    } catch (e) {
      tentativas.push({ metodo: 'timestamp', erro: e.message });
    }
  }

  await supabaseLogger.log({
    level: 'error',
    message: '❌ FALHA COMPLETA NO PARSE DA DATA',
    data: {
      valorQueFalhou: dateValue,
      totalTentativas: tentativas.length,
      todasAsTentativas: tentativas
    },
    source: 'date-parser',
    sessionId
  });
  
  return undefined;
}
