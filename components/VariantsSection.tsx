import * as React from 'react';
import { Variant, VariantCard } from './VariantCard';

export interface VariantsSectionProps {
  variants: Variant[];
  onChange: (idx: number, field: string, value: any) => void;
}

export function VariantsSection({ variants, onChange }: VariantsSectionProps) {
  return (
    <section className="variants-section">
      <label>Variants</label>
      <div className="variant-cards-list" id="variantsCardsList">
        {variants.map((v, i) => (
          <VariantCard key={v.key} variant={v} idx={i} onChange={onChange} />
        ))}
      </div>
    </section>
  );
}
