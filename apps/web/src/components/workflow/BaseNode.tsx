import { ReactNode } from 'react';

interface BaseNodeProps {
  label: string;
  children: ReactNode;
}

export function BaseNode({ label, children }: BaseNodeProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="text-sm font-medium text-gray-700">{label}</h3>
      </div>
      {children}
    </div>
  );
} 
