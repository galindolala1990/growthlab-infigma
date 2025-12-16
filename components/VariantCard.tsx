import * as React from 'react';

export interface Variant {
  key: string;
  name: string;
  traffic: number;
  status: string;
  metrics: { CTR: number; CR: number; SU: number };
}

export interface VariantCardProps {
  variant: Variant;
  idx: number;
  onChange: (idx: number, field: string, value: any) => void;
}

export function VariantCard({ variant, idx, onChange }: VariantCardProps) {
  const hasMetrics = variant.metrics.CTR || variant.metrics.CR || variant.metrics.SU;
  return (
    <div className="variant-card">
      <div className="variant-card-header">
        <span className="variant-key-badge">{variant.key}</span>
        <div className="variant-title-group">
          <input type="text" className="variant-name-input" value={variant.name} placeholder="Variant name" onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(idx, 'name', e.target.value)} />
          <input type="number" className="variant-traffic-input" value={variant.traffic} min={0} max={100} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(idx, 'traffic', Number(e.target.value))} />%
        </div>
      </div>
      <div className="variant-status-row">
        <select className="variant-status-select" value={variant.status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(idx, 'status', e.target.value)}>
          {['Running', 'Winner', 'None'].map(opt => (
            <option value={opt} key={opt}>{opt}</option>
          ))}
        </select>
        <span className={`variant-status-pill ${variant.status.toLowerCase()}`}>{variant.status}</span>
      </div>
      <div className={`variant-metrics${hasMetrics ? '' : ' hidden'}`} tabIndex={0}>
        <span className="metrics-chip">CTR: {variant.metrics.CTR || 0}</span>
        <span className="metrics-chip">CR: {variant.metrics.CR || 0}</span>
        <span className="metrics-chip">SU: {variant.metrics.SU || 0}</span>
      </div>
    </div>
  );
}
