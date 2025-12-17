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
  const showMetrics = (variant.status === 'Running' || variant.status === 'Winner') && hasMetrics;
  const isOutcome = variant.status === 'Winner' || variant.status === 'Launched';
  const stateClass = `variant-card ${variant.status ? variant.status.toLowerCase() : ''} Card Stack`;
  return (
    <div className={stateClass}>
      <div className="Row" style={{ gap: 20, alignItems: 'center' }}>
        <span className="variant-key-badge typography-h3" style={{ fontWeight: 700 }}>{variant.key}</span>
        <input
          type="text"
          className="Input variant-name-input typography-h3"
          value={variant.name}
          placeholder="Variant name"
          style={{ fontWeight: 600, flex: 1 }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(idx, 'name', e.target.value)}
        />
        <span className="traffic-input-group">
          <input type="number" className="variant-traffic-input" value={variant.traffic} min={0} max={100} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(idx, 'traffic', Number(e.target.value))} />
          <span className="traffic-percent">%</span>
        </span>
        <select className="variant-status-select" value={variant.status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(idx, 'status', e.target.value)} style={{ fontWeight: isOutcome ? 700 : 400, color: isOutcome ? '#217a4d' : '#4a5a70', background: isOutcome ? '#eaf7f0' : '#fff' }}>
          {['Running', 'Winner', 'None', 'Launched'].map(opt => (
            <option value={opt} key={opt}>{opt}</option>
          ))}
        </select>
        {isOutcome && (
          <span className={`variant-status-pill ${variant.status.toLowerCase()} typography-h3`} style={{ fontWeight: 700, color: '#217a4d', background: '#eaf7f0', borderColor: '#b6e2c6' }}>{variant.status}</span>
        )}
      </div>
      {showMetrics && (
        <div className="variant-metrics Row typography-meta" tabIndex={0} style={{ color: '#4a5a70', opacity: 0.85 }}>
          <span className="metrics-chip">CTR: {variant.metrics.CTR || 0}</span>
          <span className="metrics-chip">CR: {variant.metrics.CR || 0}</span>
          <span className="metrics-chip">SU: {variant.metrics.SU || 0}</span>
        </div>
      )}
    </div>
  );
}
