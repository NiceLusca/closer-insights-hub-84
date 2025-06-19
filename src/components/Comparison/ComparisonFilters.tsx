
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterSelect } from "@/components/FilterSelect";
import { Filter } from "lucide-react";
import type { Lead } from "@/types/lead";

interface ComparisonFiltersProps {
  allLeads: Lead[];
  comparisonType: string;
  selectedClosers: string[];
  selectedOrigins: string[];
  onClosersChange: (closers: string[]) => void;
  onOriginsChange: (origins: string[]) => void;
}

export const ComparisonFilters = React.memo(({ 
  allLeads,
  comparisonType,
  selectedOrigins,
  onOriginsChange 
}: ComparisonFiltersProps) => {
  const { originOptions } = useMemo(() => {
    const origins = [...new Set(allLeads.map(lead => lead.origem).filter(Boolean))];

    return {
      originOptions: origins
    };
  }, [allLeads]);

  if (comparisonType === 'temporal') {
    return null;
  }

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Seleção para Comparação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comparisonType === 'origem' && (
          <div>
            <FilterSelect
              label="Origens (selecione 2 para comparar):"
              options={originOptions}
              selectedValues={selectedOrigins}
              onChange={onOriginsChange}
              placeholder="Selecione origens..."
            />
            {selectedOrigins.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedOrigins.length}/2 selecionados
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ComparisonFilters.displayName = 'ComparisonFilters';
