
import { parseISO, parse, isValid } from 'date-fns';
import { supabaseLogger } from '@/services/supabaseLogger';
import { convertBrazilianDateFormat } from './brazilianDateConverter';
import { DATE_FORMATS } from './dateFormats';
import { validateParsedDate, isValidDateString } from './dateValidator';

export async function parseDate(dateValue: string, sessionId?: string): Promise<Date | undefined> {
  if (!dateValue) {
    await supabaseLogger.log({
      level: 'debug',
      message: '⚠️ dateValue está vazio',
      source: 'date-parser',
      sessionId
    });
    return undefined;
  }

  // Validação inicial da string
  if (!isValidDateString(dateValue)) {
    await supabaseLogger.log({
      level: 'debug',
      message: '⚠️ String de data inválida rejeitada (continuando processamento)',
      data: { valorRejeitado: dateValue, motivo: 'formato_invalido' },
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
        level: 'debug',
        message: '⚠️ Falha ao parsear data brasileira convertida (tentando outros métodos)',
        data: { original: dateValue, convertido: brazilianConverted, erro: e.message },
        source: 'date-parser',
        sessionId
      });
    }
  }

  // Tentar cada formato com tratamento de erro individual
  for (let i = 0; i < DATE_FORMATS.length; i++) {
    const formatStr = DATE_FORMATS[i];
    try {
      const testDate = parse(dateValue.toString(), formatStr, new Date());
      
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
      // Continuar tentando outros formatos silenciosamente
      continue;
    }
  }
  
  // Tentar parseISO como penúltimo recurso
  try {
    const isoDate = parseISO(dateValue.toString());
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
    // Continuar para timestamp
  }

  // Tentar timestamp como último recurso
  if (!isNaN(Number(dateValue))) {
    try {
      const timestamp = Number(dateValue);
      const date = new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000);
      
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
      // Falha silenciosa
    }
  }

  // Log apenas se for um valor que esperávamos conseguir parsear
  if (dateValue.length > 5 && /\d/.test(dateValue)) {
    await supabaseLogger.log({
      level: 'debug',
      message: '⚠️ FALHA NO PARSE DA DATA (continuando processamento)',
      data: {
        valorQueFalhou: dateValue,
        tamanho: dateValue.length
      },
      source: 'date-parser',
      sessionId
    });
  }
  
  return undefined;
}
