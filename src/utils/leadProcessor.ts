
import type { Lead } from '@/types/lead';
import { parseDate } from './dateParser';
import { findFieldValue, parseNumber, FIELD_MAPPINGS, detectDateColumn } from './fieldMapper';

export function processRawDataToLeads(data: any[]): Lead[] {
  console.log('🔄 Processando dados brutos para leads:', { totalItens: data.length });
  
  if (data.length > 0) {
    console.log('📋 Exemplo do primeiro item:', data[0]);
    console.log('🔑 Chaves disponíveis no primeiro item:', Object.keys(data[0]));
    
    // NOVO: Log MUITO detalhado de cada campo do primeiro item
    console.log('🔍 ANÁLISE CAMPO POR CAMPO DO PRIMEIRO ITEM:');
    Object.entries(data[0]).forEach(([key, value]) => {
      console.log(`  📌 ${key}: "${value}" (${typeof value})`);
    });
    
    // NOVO: Tentar detectar coluna de data automaticamente
    const detectedDateColumn = detectDateColumn(data[0]);
    if (detectedDateColumn) {
      console.log('🎯 Coluna de data detectada automaticamente:', detectedDateColumn);
    } else {
      console.log('❌ NENHUMA coluna de data detectada automaticamente');
    }
  }

  const processedLeads = data.map((item: any, index: number) => {
    console.log(`\n📊 ========== Processando lead ${index + 1} ==========`);
    console.log('📋 Dados do item completo:', item);
    
    // MUDANÇA: Tentar TODOS os métodos de encontrar data
    console.log('🔍 Tentando encontrar campo de data...');
    
    // Método 1: Usar mapeamentos conhecidos
    let dateValue = findFieldValue(item, FIELD_MAPPINGS.data, '');
    console.log('📅 Método 1 (mapeamentos): dateValue =', dateValue);
    
    // Método 2: Se não encontrou, tentar detecção automática
    if (!dateValue) {
      const detectedColumn = detectDateColumn(item);
      if (detectedColumn) {
        dateValue = item[detectedColumn];
        console.log('📅 Método 2 (detecção auto): dateValue =', dateValue, 'da coluna:', detectedColumn);
      }
    }
    
    // Método 3: Se ainda não encontrou, tentar chaves que contenham 'data', 'date', etc
    if (!dateValue) {
      const possibleDateKeys = Object.keys(item).filter(key => 
        /data|date|created|timestamp|time|criacao|cadastro|registro/i.test(key)
      );
      console.log('📅 Método 3 - Chaves que podem ser data:', possibleDateKeys);
      
      for (const key of possibleDateKeys) {
        if (item[key]) {
          dateValue = item[key];
          console.log('📅 Método 3 encontrou data na chave:', key, '=', dateValue);
          break;
        }
      }
    }
    
    // Método 4: Se AINDA não encontrou, mostrar TODAS as chaves e valores
    if (!dateValue) {
      console.log('❌ NENHUM campo de data encontrado! Todas as chaves e valores:');
      Object.entries(item).forEach(([key, value]) => {
        console.log(`  🔍 ${key}: "${value}"`);
      });
    }
    
    let parsedDate = dateValue ? parseDate(dateValue.toString()) : undefined;
    
    console.log('📅 RESULTADO do processamento de data:', {
      valorOriginal: dateValue,
      valorString: dateValue?.toString(),
      dataParsada: parsedDate?.toISOString() || 'FALHOU AO PARSEAR',
      foiParseadaComSucesso: !!parsedDate
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
      data: dateValue?.toString() || '',
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

    console.log('✅ Lead processado final:', {
      nome: lead.Nome,
      status: lead.Status,
      dataOriginal: lead.data,
      parsedDate: lead.parsedDate?.toISOString() || 'SEM DATA VÁLIDA ❌'
    });

    return lead;
  });

  // Manter leads com dados básicos
  const filteredLeads = processedLeads.filter(lead => {
    const hasBasicData = lead.Nome || lead['e-mail'] || lead.Whatsapp || lead.Status;
    
    if (!hasBasicData) {
      console.log('❌ Lead rejeitado por não ter dados básicos:', lead);
      return false;
    }
    
    console.log('✅ Lead aceito:', lead.Nome || 'sem nome', lead.Status || 'sem status');
    return true;
  });

  console.log('📊 ========== RESUMO FINAL DO PROCESSAMENTO ==========');
  console.log('📊 Total recebidos:', data.length);
  console.log('📊 Total processados:', processedLeads.length);
  console.log('📊 Total filtrados (aceitos):', filteredLeads.length);
  console.log('📊 Com data válida:', filteredLeads.filter(l => l.parsedDate).length);
  console.log('📊 SEM data válida:', filteredLeads.filter(l => !l.parsedDate).length);
  console.log('📊 Com status:', filteredLeads.filter(l => l.Status && l.Status.trim() !== '').length);
  console.log('📊 Status encontrados:', [...new Set(filteredLeads.map(l => l.Status).filter(Boolean))]);

  // IMPORTANTE: Alertar sobre problemas de data
  const leadsWithoutDate = filteredLeads.filter(l => !l.parsedDate).length;
  if (leadsWithoutDate > 0) {
    console.warn(`⚠️ ATENÇÃO: ${leadsWithoutDate} de ${filteredLeads.length} leads não possuem data válida!`);
    console.warn('🔧 Isso significa que o parsing de data precisa ser ajustado para o formato do seu webhook');
  }

  return filteredLeads;
}
