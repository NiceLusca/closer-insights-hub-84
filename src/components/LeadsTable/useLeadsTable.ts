
import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import type { Lead } from '@/types/lead';

type SortField = keyof Lead;
type SortDirection = 'asc' | 'desc';

export function useLeadsTable(leads: Lead[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('row_number');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 50; // Aumentado de 10 para 50 para melhor performance

  // Debounce da busca para evitar muitos re-renders
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredAndSortedLeads = useMemo(() => {
    console.log('Processando leads na tabela:', leads?.length || 0);
    
    if (!leads || leads.length === 0) {
      return [];
    }

    let filtered = leads;

    // Aplicar filtro apenas se houver termo de busca
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = leads.filter(lead => {
        const nome = lead?.Nome || '';
        const email = lead?.['e-mail'] || '';
        const origem = lead?.origem || '';
        const closer = lead?.Closer || '';
        const status = lead?.Status || '';
        
        return nome.toLowerCase().includes(searchLower) ||
               email.toLowerCase().includes(searchLower) ||
               origem.toLowerCase().includes(searchLower) ||
               closer.toLowerCase().includes(searchLower) ||
               status.toLowerCase().includes(searchLower);
      });
    }

    // Otimização: usar sort estável e cache do sort
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
  }, [leads, debouncedSearchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset para primeira página ao ordenar
  };

  const totalPages = Math.ceil(filteredAndSortedLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const paginatedLeads = filteredAndSortedLeads.slice(startIndex, startIndex + leadsPerPage);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
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
