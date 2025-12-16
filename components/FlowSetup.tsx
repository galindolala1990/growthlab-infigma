import * as React from 'react';
import { Row } from './Row';

export interface FlowSetupProps {
  form: {
    experimentName: string;
    experimentDescription: string;
    roundNumber: number;
    entryLabel: string;
    exitLabel: string;
    figmaLink: string;
    jiraLink: string;
    miroLink: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function FlowSetup({ form, onChange }: FlowSetupProps) {
  return (
    <section className="flow-setup">
      <Row label="Name" id="experimentName">
        <input type="text" id="experimentName" required placeholder="e.g. Button Color Test" value={form.experimentName} onChange={onChange} />
      </Row>
      <Row label="Description" id="experimentDescription">
        <input type="text" id="experimentDescription" placeholder="Short description (optional)" value={form.experimentDescription} onChange={onChange} />
      </Row>
      <Row label="Round" id="roundNumber">
        <input type="number" id="roundNumber" min={1} value={form.roundNumber} required onChange={onChange} />
      </Row>
      <Row label="Entry node" id="entryLabel">
        <input type="text" id="entryLabel" value={form.entryLabel} required onChange={onChange} />
      </Row>
      <Row label="Exit node" id="exitLabel">
        <input type="text" id="exitLabel" value={form.exitLabel} required onChange={onChange} />
      </Row>
      <Row label="Figma link" id="figmaLink">
        <input type="url" id="figmaLink" className="integration-input" placeholder="https://www.figma.com/file/..." value={form.figmaLink} onChange={onChange} />
      </Row>
      <Row label="Jira link" id="jiraLink">
        <input type="url" id="jiraLink" className="integration-input" placeholder="https://jira.company.com/browse/..." value={form.jiraLink} onChange={onChange} />
      </Row>
      <Row label="Miro link" id="miroLink">
        <input type="url" id="miroLink" className="integration-input" placeholder="https://miro.com/app/board/..." value={form.miroLink} onChange={onChange} />
      </Row>
    </section>
  );
}
