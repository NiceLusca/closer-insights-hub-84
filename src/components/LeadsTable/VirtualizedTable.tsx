
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { TableRow } from './TableRow';
import type { Lead } from '@/types/lead';

interface VirtualizedTableProps {
  leads: Lead[];
  height: number;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: Lead[];
}

const Row = React.memo(({ index, style, data }: RowProps) => (
  <div style={style}>
    <TableRow lead={data[index]} />
  </div>
));

Row.displayName = 'VirtualizedRow';

export const VirtualizedTable = React.memo(({ leads, height }: VirtualizedTableProps) => {
  const itemCount = leads.length;
  const itemSize = 60; // altura de cada linha

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <List
        height={height}
        width="100%"
        itemCount={itemCount}
        itemSize={itemSize}
        itemData={leads}
        overscanCount={5}
      >
        {Row}
      </List>
    </div>
  );
});

VirtualizedTable.displayName = 'VirtualizedTable';
