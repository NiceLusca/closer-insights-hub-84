
import React from 'react';
import { Button } from '@/components/ui/button';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  leadsPerPage: number;
  totalLeads: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({ 
  currentPage, 
  totalPages, 
  leadsPerPage, 
  totalLeads, 
  onPageChange 
}: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const startIndex = (currentPage - 1) * leadsPerPage;

  return (
    <div className="flex justify-between items-center mt-6">
      <div className="text-sm text-gray-700">
        Mostrando {startIndex + 1} a {Math.min(startIndex + leadsPerPage, totalLeads)} de {totalLeads} leads
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = i + 1;
          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}
