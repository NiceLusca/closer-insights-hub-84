
export function findFieldValue(item: any, possibleKeys: readonly string[], defaultValue: any = ''): any {
  // Primeiro, tentar case-sensitive match (mais rápido)
  for (const key of possibleKeys) {
    if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
      return item[key];
    }
  }
  
  // Depois, case-insensitive match se necessário
  for (const key of possibleKeys) {
    const foundKey = Object.keys(item).find(k => k.toLowerCase() === key.toLowerCase());
    if (foundKey && item[foundKey] !== undefined && item[foundKey] !== null && item[foundKey] !== '') {
      return item[foundKey];
    }
  }
  
  // Retornar valor padrão silenciosamente para evitar spam de logs
  return defaultValue;
}
