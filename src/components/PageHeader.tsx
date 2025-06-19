
import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  className?: string;
}

export function PageHeader({ title, description, className = '' }: PageHeaderProps) {
  return (
    <div className={`mb-8 animate-fade-in-up ${className}`}>
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          {title}
        </h1>
        <p className="text-gray-300 text-lg">{description}</p>
      </div>
    </div>
  );
}
