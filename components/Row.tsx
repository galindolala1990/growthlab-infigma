import * as React from 'react';


export interface RowProps {
  label: string;
  id: string;
  children: React.ReactNode;
}

export function Row({ label, id, children }: RowProps) {
  return (
    <div className="Row">
      <label className="Label" htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}
