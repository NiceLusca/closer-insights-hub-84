
// Mapeamento consistente de cores para cada status
export const STATUS_COLORS = {
  'Agendado': '#3b82f6', // blue
  'Fechou': '#10b981', // green
  'Não Apareceu': '#ef4444', // red
  'Desmarcou': '#f59e0b', // amber
  'Não Fechou': '#8b5cf6', // purple
  'Remarcou': '#06b6d4', // cyan
  'Confirmado': '#84cc16', // lime
  'Aguardando resposta': '#6b7280', // gray
  'Número errado': '#dc2626', // dark red
  'Mentorado': '#f97316', // orange
  '': '#64748b' // slate for empty status
} as const;

export const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS[''];
};

export const getStatusColorsArray = (): string[] => {
  return Object.values(STATUS_COLORS);
};
