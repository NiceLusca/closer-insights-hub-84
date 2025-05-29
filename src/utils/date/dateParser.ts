
import { parseISO, parse, isValid } from 'date-fns';
import { supabaseLogger } from '@/services/supabaseLogger';
import { convertBrazilianDateFormat } from './brazilianDateConverter';
import { DATE_FORMATS } from './dateFormats';
import { validateParsedDate } from './dateValidator';

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

  // PRIMEIRO: Tentar converter formato brasileiro específico
  const brazilianConverted = convertBrazilianDateFormat(dateValue.toString());
  if (brazilianConverted) {
    await supabaseLogger.log({
      level: 'info',
      message: '🇧🇷 DETECTADO FORMATO BRASILEIRO',
      data: { 
        original: dateValue, 
        convertido: brazilianConverted,
        metodo: 'conversao_brasileira'
      },
      source: 'date-parser',
      sessionId
    });
    
    try {
      const testDate = parseISO(brazilianConverted);
      if (validateParsedDate(testDate)) {
        await supabaseLogger.log({
          level: 'info',
          message: '✅ DATA BRASILEIRA PARSEADA COM SUCESSO!',
          data: {
            dataOriginal: dateValue,
            dataConvertida: brazilianConverted,
            dataParsada: testDate.toISOString(),
            dataLocal: testDate.toLocaleDateString()
          },
          source: 'date-parser',
          sessionId
        });
        return testDate;
      }
    } catch (e) {
      await supabaseLogger.log({
        level: 'warn',
        message: '⚠️ Falha ao parsear data brasileira convertida',
        data: { original: dateValue, convertido: brazilianConverted, erro: e.message },
        source: 'date-parser',
        sessionId
      });
    }
  }

  // Tentar cada formato com logs detalhados
  const tentativas = [];
  
  for (let i = 0; i < DATE_FORMATS.length; i++) {
    const formatStr = DATE_FORMATS[i];
    try {
      const testDate = parse(dateValue.toString(), formatStr, new Date());
      
      const tentativa = {
        formato: formatStr,
        resultado: testDate.toISOString(),
        isValid: isValid(testDate),
        ano: testDate.getFullYear(),
        anoValido: validateParsedDate(testDate)
      };
      
      tentativas.push(tentativa);
      
      if (validateParsedDate(testDate)) {
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
    
    if (validateParsedDate(isoDate)) {
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
      const date = new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000);
      
      const tentativaTimestamp = {
        metodo: 'timestamp',
        timestamp,
        resultado: date.toISOString(),
        isValid: isValid(date),
        ano: date.getFullYear()
      };
      
      tentativas.push(tentativaTimestamp);
      
      if (validateParsedDate(date)) {
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
