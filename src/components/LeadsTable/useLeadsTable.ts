
import { useState, useMemo } from 'react';
import type { Lead } from '@/types/lead';

type SortField = keyof Lead;
type SortDirection = 'asc' | 'desc';

export function useLeadsTable(leads: Lead[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('row_number');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;

  const filteredAndSortedLeads = useMemo(() => {
    console.log('Processando leads na tabela:', leads?.length || 0);
    
    if (!leads || leads.length === 0) {
      return [];
    }

    let filtered = leads.filter(lead => {
      const nome = lead?.Nome || '';
      const email = lead?.['e-mail'] || '';
      const origem = lead?.origem || '';
      const closer = lead?.Closer || '';
      const status = lead?.Status || '';
      
      const searchLower = searchTerm.toLowerCase();
      
      return nome.toLowerCase().includes(searchLower) ||
             email.toLowerCase().includes(searchLower) ||
             origem.toLowerCase().includes(searchLower) ||
             closer.toLowerCase().includes(searchLower) ||
             status.toLowerCase().includes(searchLower);
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [leads, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const totalPages = Math.ceil(filteredAndSortedLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const paginatedLeads = filteredAndSortedLeads.slice(startIndex, startIndex + leadsPerPage);

  return {
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    currentPage,
    setCurrentPage,
    leadsPerPage,
    filteredAndSortedLeads,
    paginatedLeads,
    totalPages,
    handleSort
  };
}
