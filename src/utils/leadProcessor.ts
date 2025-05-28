
import type { Lead } from '@/types/lead';
import { parseDate } from './dateParser';
import { findFieldValue, parseNumber, FIELD_MAPPINGS } from './fieldMapper';

export function processRawDataToLeads(data: any[]): Lead[] {
  return data.map((item: any, index: number) => {
    const dateValue = findFieldValue(item, FIELD_MAPPINGS.data, '');
    const parsedDate = dateValue ? parseDate(dateValue.toString()) : undefined;

    const lead: Lead = {
      row_number: index + 1,
      data: dateValue.toString() || '',
      Hora: findFieldValue(item, FIELD_MAPPINGS.hora, ''),
      Nome: findFieldValue(item, FIELD_MAPPINGS.nome, `Lead ${index + 1}`),
      'e-mail': findFieldValue(item, FIELD_MAPPINGS.email, ''),
      Whatsapp: findFieldValue(item, FIELD_MAPPINGS.whatsapp, ''),
      Status: findFieldValue(item, FIELD_MAPPINGS.status, ''),
      Closer: findFieldValue(item, FIELD_MAPPINGS.closer, ''),
      origem: findFieldValue(item, FIELD_MAPPINGS.origem, ''),
      'Venda Completa': parseNumber(findFieldValue(item, FIELD_MAPPINGS.vendaCompleta, 0)),
      recorrente: parseNumber(findFieldValue(item, FIELD_MAPPINGS.recorrente, 0)),
      parsedDate: parsedDate,
    };

    return lead;
  }).filter(lead => {
    const hasValidName = lead.Nome && lead.Nome !== '' && !lead.Nome.startsWith('Lead ');
    return hasValidName;
  });
}
