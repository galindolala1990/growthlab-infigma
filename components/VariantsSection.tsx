import * as React from 'react';
import { Variant, VariantCard } from './VariantCard';

export interface VariantsSectionProps {
  variants: Variant[];
  onChange: (idx: number, field: string, value: any) => void;
}

export function VariantsSection({ variants, onChange }: VariantsSectionProps) {
  return (
    <section className="Section Card Stack">
      <span className="SectionLabel">Variants</span>
      <div className="variant-cards-list Stack" id="variantsCardsList" style={{ gap: 24 }}>
        {variants.map((v, i) => (
          <VariantCard key={v.key} variant={v} idx={i} onChange={onChange} />
        ))}
      </div>
    </section>
  );
}
