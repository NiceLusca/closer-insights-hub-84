
import React from 'react';
import { RefreshCw } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8 flex items-center space-x-4">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-100">Carregando Dados</h3>
          <p className="text-gray-400">Buscando leads diretamente do webhook...</p>
        </div>
      </div>
    </div>
  );
}
