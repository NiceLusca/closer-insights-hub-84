
export const MINIMUM_VOLUME_PERCENTAGE = 5; // 5% do total mínimo para análises

export function hasSignificantVolume(count: number, total: number, minPercentage = MINIMUM_VOLUME_PERCENTAGE): boolean {
  if (total === 0) return false;
  const percentage = (count / total) * 100;
  return percentage >= minPercentage;
}

export function getVolumeIndicator(count: number, total: number): {
  isSignificant: boolean;
  percentage: number;
  message: string;
} {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const isSignificant = hasSignificantVolume(count, total);
  
  return {
    isSignificant,
    percentage,
    message: isSignificant 
      ? `Baseado em ${count} leads (${percentage.toFixed(1)}% do total)`
      : `⚠️ Dados insuficientes: ${count} leads (${percentage.toFixed(1)}% do total) - mínimo 5%`
  };
}

export function filterSignificantData<T extends { leads: number }>(
  data: T[], 
  total: number
): T[] {
  return data.filter(item => hasSignificantVolume(item.leads, total));
}
