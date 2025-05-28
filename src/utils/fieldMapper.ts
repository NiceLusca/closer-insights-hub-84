
export function findFieldValue(item: any, possibleKeys: string[], defaultValue: any = ''): any {
  for (const key of possibleKeys) {
    if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
      return item[key];
    }
  }
  return defaultValue;
}

export function parseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

export const FIELD_MAPPINGS = {
  data: ['data', 'Data', 'DATE', 'date', 'created_at', 'createdAt', 'timestamp', 'data_criacao', 'dt_criacao'],
  hora: ['Hora', 'hora', 'time', 'horario', 'hour'],
  nome: ['Nome', 'nome', 'name', 'cliente', 'lead_name', 'full_name'],
  email: ['e-mail', 'email', 'Email', 'mail', 'endereco_email'],
  whatsapp: ['Whatsapp', 'whatsapp', 'telefone', 'phone', 'celular', 'numero'],
  status: ['Status', 'status', 'estado', 'situacao', 'stage'],
  closer: ['Closer', 'closer', 'vendedor', 'consultor', 'responsavel'],
  origem: ['origem', 'Origem', 'source', 'canal', 'campaign', 'midia'],
  vendaCompleta: ['Venda Completa', 'vendaCompleta', 'valor', 'price', 'total', 'amount'],
  recorrente: ['recorrente', 'Recorrente', 'recurring', 'valor_recorrente', 'monthly']
} as const;
