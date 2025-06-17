
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  className?: string;
  showChart?: boolean;
}

export const SkeletonCard = React.memo(({ className = "", showChart = false }: SkeletonCardProps) => {
  return (
    <div className={`bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-lg bg-gray-700/50" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24 bg-gray-700/50" />
          <Skeleton className="h-6 w-32 bg-gray-700/50" />
        </div>
      </div>
      
      {showChart && (
        <div className="space-y-3">
          <Skeleton className="h-48 w-full bg-gray-700/50 rounded" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16 bg-gray-700/50" />
            <Skeleton className="h-3 w-16 bg-gray-700/50" />
          </div>
        </div>
      )}
      
      {!showChart && (
        <div className="space-y-2">
          <Skeleton className="h-3 w-full bg-gray-700/50" />
          <Skeleton className="h-3 w-3/4 bg-gray-700/50" />
        </div>
      )}
    </div>
  );
});

SkeletonCard.displayName = 'SkeletonCard';
