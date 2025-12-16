import type * as JSX from 'react/jsx-runtime';
import * as React from 'react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Variant, VariantCard } from './components/VariantCard';
import { FlowSetup } from './components/FlowSetup';
import { VariantsSection } from './components/VariantsSection';
import { ActionsFooter } from './components/ActionsFooter';

const defaultVariants: Variant[] = [
  { key: 'A', name: 'Black btn', traffic: 50, status: 'Running', metrics: { CTR: 0, CR: 0, SU: 0 } },
  { key: 'B', name: 'Blue btn', traffic: 25, status: 'Winner', metrics: { CTR: 1, CR: 1, SU: 31 } },
  { key: 'C', name: 'Green btn', traffic: 25, status: 'None', metrics: { CTR: 0, CR: 0, SU: 0 } },
];


interface FormState {
  experimentName: string;
  experimentDescription: string;
  roundNumber: number;
  entryLabel: string;
  exitLabel: string;
  figmaLink: string;
  jiraLink: string;
  miroLink: string;
}

function App(): React.ReactElement {
  const [variants, setVariants] = useState<Variant[]>([...defaultVariants]);
  const [form, setForm] = useState<FormState>({
    experimentName: '',
    experimentDescription: '',
    roundNumber: 1,
    entryLabel: 'Login',
    exitLabel: 'Welcome',
    figmaLink: '',
    jiraLink: '',
    miroLink: '',
  });

  const handleVariantChange = (idx: number, field: string, value: any): void => {
    setVariants((vs: Variant[]) => {
      const updated = [...vs];
      if ((['name', 'traffic', 'status'] as string[]).includes(field)) {
        updated[idx] = { ...updated[idx], [field]: value };
      }
      return updated;
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { id, value } = e.target;
    setForm(f => ({ ...f, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    parent.postMessage({ pluginMessage: {
      type: 'create-flow',
      payload: {
        ...form,
        roundNumber: Number(form.roundNumber),
        variants: JSON.parse(JSON.stringify(variants)),
      }
    } }, '*');
  };

  const handleCancel = (): void => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
  };

  return (
    <div className="app" id="container">
      <h2>Growthlab Flow Builder</h2>
      <form id="exp-form" autoComplete="off" onSubmit={handleSubmit}>
        <FlowSetup form={form} onChange={handleFormChange} />
        <VariantsSection variants={variants} onChange={handleVariantChange} />
        <ActionsFooter onCancel={handleCancel} />
      </form>
    </div>
  );
}

const container = document.getElementById('container');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
