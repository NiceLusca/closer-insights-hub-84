
export const DATE_FORMATS = [
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
