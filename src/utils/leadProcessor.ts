
import type { Lead } from '@/types/lead';
import { parseDate } from './dateParser';
import { findFieldValue, parseNumber, FIELD_MAPPINGS } from './fieldMapper';

export function processRawDataToLeads(data: any[]): Lead[] {
  console.log('🔄 Processando dados brutos para leads:', { totalItens: data.length });
  
  if (data.length > 0) {
    console.log('📋 Exemplo do primeiro item:', data[0]);
    console.log('🔑 Chaves disponíveis no primeiro item:', Object.keys(data[0]));
  }

  const processedLeads = data.map((item: any, index: number) => {
    console.log(`\n📊 Processando lead ${index + 1}:`);
    
    const dateValue = findFieldValue(item, FIELD_MAPPINGS.data, '');
    const parsedDate = dateValue ? parseDate(dateValue.toString()) : undefined;
    
    console.log('📅 Processamento de data:', {
      valorOriginal: dateValue,
      dataParsada: parsedDate?.toISOString() || 'não parseada'
    });

    const nomeValue = findFieldValue(item, FIELD_MAPPINGS.nome, `Lead ${index + 1}`);
    const statusValue = findFieldValue(item, FIELD_MAPPINGS.status, '');
    
    console.log('📝 Dados básicos do lead:', {
      nome: nomeValue,
      status: statusValue,
      temDataValida: !!parsedDate
    });

    const lead: Lead = {
      row_number: index + 1,
      data: dateValue.toString() || '',
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

    console.log('✅ Lead processado:', {
      nome: lead.Nome,
      status: lead.Status,
      data: lead.data,
      parsedDate: lead.parsedDate?.toISOString() || 'sem data'
    });

    return lead;
  });

  // Relaxar filtros temporariamente - apenas remover leads completamente vazios
  const filteredLeads = processedLeads.filter(lead => {
    const hasAnyData = lead.Nome || lead['e-mail'] || lead.Whatsapp || lead.Status;
    if (!hasAnyData) {
      console.log('❌ Lead rejeitado por estar completamente vazio');
      return false;
    }
    return true;
  });

  console.log('📊 Resumo do processamento:', {
    totalRecebidos: data.length,
    totalProcessados: processedLeads.length,
    totalFiltrados: filteredLeads.length,
    comDataValida: filteredLeads.filter(l => l.parsedDate).length,
    comStatus: filteredLeads.filter(l => l.Status && l.Status.trim() !== '').length
  });

  return filteredLeads;
}
