
import { parseISO, parse, isValid } from 'date-fns';

export function parseDate(dateValue: string): Date | undefined {
  if (!dateValue) {
    console.log('❌ dateValue está vazio');
    return undefined;
  }

  console.log('🔍 ========== INICIANDO PARSE DE DATA ==========');
  console.log('🔍 Valor recebido:', `"${dateValue}"`, 'tipo:', typeof dateValue);

  // NOVO: Expandir formatos de data ainda mais e testar cada um
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
  
  // Tentar cada formato com logs detalhados
  for (let i = 0; i < dateFormats.length; i++) {
    const formatStr = dateFormats[i];
    try {
      console.log(`🧪 Testando formato ${i + 1}/${dateFormats.length}: "${formatStr}"`);
      const testDate = parse(dateValue.toString(), formatStr, new Date());
      
      console.log(`📊 Resultado do parse:`, {
        formato: formatStr,
        resultado: testDate,
        isValid: isValid(testDate),
        ano: testDate.getFullYear(),
        anoValido: testDate.getFullYear() >= 2020 && testDate.getFullYear() <= 2030
      });
      
      if (isValid(testDate) && testDate.getFullYear() >= 2020 && testDate.getFullYear() <= 2030) {
        console.log('✅ ========== DATA PARSEADA COM SUCESSO! ==========');
        console.log('✅ Formato usado:', formatStr);
        console.log('✅ Data original:', dateValue);
        console.log('✅ Data parseada:', testDate.toISOString());
        console.log('✅ Data local:', testDate.toLocaleDateString());
        return testDate;
      }
    } catch (e) {
      console.log(`❌ Erro no formato "${formatStr}":`, e);
    }
  }
  
  // Tentar parseISO como penúltimo recurso
  console.log('🧪 Tentando parseISO...');
  try {
    const isoDate = parseISO(dateValue.toString());
    console.log('📊 Resultado parseISO:', {
      resultado: isoDate,
      isValid: isValid(isoDate),
      ano: isoDate.getFullYear()
    });
    
    if (isValid(isoDate) && isoDate.getFullYear() >= 2020 && isoDate.getFullYear() <= 2030) {
      console.log('✅ ========== DATA ISO PARSEADA COM SUCESSO! ==========');
      console.log('✅ Data original:', dateValue);
      console.log('✅ Data parseada:', isoDate.toISOString());
      return isoDate;
    }
  } catch (e) {
    console.log('❌ Erro no parseISO:', e);
  }

  // Tentar timestamp como último recurso
  console.log('🧪 Tentando como timestamp...');
  if (!isNaN(Number(dateValue))) {
    try {
      const timestamp = Number(dateValue);
      console.log('📊 Timestamp detectado:', timestamp);
      
      // Se for timestamp em segundos, converter para milissegundos
      const date = new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000);
      console.log('📊 Data do timestamp:', {
        timestamp,
        date,
        isValid: isValid(date),
        ano: date.getFullYear()
      });
      
      if (isValid(date) && date.getFullYear() >= 2020 && date.getFullYear() <= 2030) {
        console.log('✅ ========== TIMESTAMP PARSEADO COM SUCESSO! ==========');
        console.log('✅ Timestamp original:', dateValue);
        console.log('✅ Data parseada:', date.toISOString());
        return date;
      }
    } catch (e) {
      console.log('❌ Erro no timestamp:', e);
    }
  }

  console.log('❌ ========== FALHA COMPLETA NO PARSE DA DATA ==========');
  console.log('❌ Valor que falhou:', `"${dateValue}"`);
  console.log('❌ Nenhum formato funcionou');
  
  // IMPORTANTE: Retornar undefined para que o lead seja marcado como sem data válida
  return undefined;
}
