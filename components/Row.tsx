import * as React from 'react';


export interface RowProps {
  label: string;
  id: string;
  children: React.ReactNode;
}

export function Row({ label, id, children }: RowProps) {
  return (
    <div className="row">
      <label htmlFor={id} style={{ minWidth: 110 }}>{label}</label>
      {children}
    </div>
  );
}
