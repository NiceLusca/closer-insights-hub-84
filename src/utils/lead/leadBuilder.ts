
import type { Lead } from '@/types/lead';
import { findFieldValue, parseNumber, FIELD_MAPPINGS } from '../field';

export function buildLead(item: any, index: number, dateValue: string, parsedDate?: Date): Lead {
  const nomeValue = findFieldValue(item, FIELD_MAPPINGS.nome, `Lead ${index + 1}`);
  const statusValue = findFieldValue(item, FIELD_MAPPINGS.status, '');
  
  return {
    row_number: index + 1,
    data: dateValue || '',
    Hora: findFieldValue(item, FIELD_MAPPINGS.hora, ''),
    Nome: nomeValue,
    'e-mail': findFieldValue(item, FIELD_MAPPINGS.email, ''),
    Whatsapp: findFieldValue(item, FIELD_MAPPINGS.whatsapp, ''),
    Status: statusValue,
    Closer: findFieldValue(item, FIELD_MAPPINGS.closer, ''),
    origem: findFieldValue(item, FIELD_MAPPINGS.origem, ''),
    'Venda Completa': parseNumber(findFieldValue(item, FIELD_MAPPINGS.vendaCompleta, 0)),
    recorrente: parseNumber(findFieldValue(item, FIELD_MAPPINGS.recorrente, 0)),
    parsedDate: parsedDate,
  };
}
