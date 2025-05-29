
export function findFieldValue(item: any, possibleKeys: readonly string[], defaultValue: any = ''): any {
  console.log('🔍 Procurando campo:', { 
    possibleKeys: possibleKeys.slice(0, 3),
    totalPossibleKeys: possibleKeys.length,
    availableKeys: Object.keys(item).slice(0, 10)
  });
  
  for (const key of possibleKeys) {
    // Case-sensitive match
    if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
      console.log('✅ Campo encontrado (case-sensitive):', { key, value: item[key] });
      return item[key];
    }
    
    // Case-insensitive match
    const foundKey = Object.keys(item).find(k => k.toLowerCase() === key.toLowerCase());
    if (foundKey && item[foundKey] !== undefined && item[foundKey] !== null && item[foundKey] !== '') {
      console.log('✅ Campo encontrado (case-insensitive):', { originalKey: foundKey, searchKey: key, value: item[foundKey] });
      return item[foundKey];
    }
  }
  
  console.log('⚠️ Campo não encontrado, usando valor padrão:', { possibleKeys: possibleKeys.slice(0, 3), defaultValue });
  return defaultValue;
}
