
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
  selectedClosers,
  selectedOrigins,
  onClosersChange,
  onOriginsChange 
}: ComparisonFiltersProps) => {
  const { closerOptions, originOptions } = useMemo(() => {
    const closers = [...new Set(allLeads.map(lead => lead.Closer).filter(Boolean))];
    const origins = [...new Set(allLeads.map(lead => lead.origem).filter(Boolean))];

    return {
      closerOptions: closers.map(closer => ({ value: closer, label: closer })),
      originOptions: origins.map(origin => ({ value: origin, label: origin }))
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
        {comparisonType === 'closer' && (
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Closers (selecione 2 para comparar):
            </label>
            <FilterSelect
              options={closerOptions}
              selectedValues={selectedClosers}
              onSelectionChange={onClosersChange}
              placeholder="Selecione closers..."
              maxSelections={2}
            />
            {selectedClosers.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedClosers.length}/2 selecionados
              </p>
            )}
          </div>
        )}

        {comparisonType === 'origem' && (
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Origens (selecione 2 para comparar):
            </label>
            <FilterSelect
              options={originOptions}
              selectedValues={selectedOrigins}
              onSelectionChange={onOriginsChange}
              placeholder="Selecione origens..."
              maxSelections={2}
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
