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
    <section className="Section Card Stack">
      <div className="Stack" style={{ gap: 8 }}>
        <div className="Row">
          <label className="Label" htmlFor="experimentName">Name</label>
          <input className="Input" type="text" id="experimentName" required placeholder="e.g. Button Color Test" value={form.experimentName} onChange={onChange} />
        </div>
        <div className="Row">
          <label className="Label" htmlFor="experimentDescription">Description</label>
          <input className="Input" type="text" id="experimentDescription" placeholder="Short description (optional)" value={form.experimentDescription} onChange={onChange} />
        </div>
        <div className="Row" style={{ gap: 16 }}>
          <label className="Label" htmlFor="roundNumber" style={{ minWidth: 60 }}>Round</label>
          <input className="Input" type="number" id="roundNumber" min={1} value={form.roundNumber} required onChange={onChange} style={{ width: 60 }} />
          <label className="Label" htmlFor="entryLabel" style={{ minWidth: 80 }}>Entry node</label>
          <input className="Input" type="text" id="entryLabel" value={form.entryLabel} required onChange={onChange} style={{ minWidth: 80 }} />
          <span className="arrow-icon" style={{ fontSize: '1.2em', color: '#b0b8c9', userSelect: 'none' }}>&#8594;</span>
          <label className="Label" htmlFor="exitLabel" style={{ minWidth: 70 }}>Exit node</label>
          <input className="Input" type="text" id="exitLabel" value={form.exitLabel} required onChange={onChange} style={{ minWidth: 80 }} />
        </div>
        <div className="Row">
          <label className="Label" htmlFor="figmaLink">Figma link</label>
          <input className="Input integration-input" type="url" id="figmaLink" placeholder="https://www.figma.com/file/..." value={form.figmaLink} onChange={onChange} />
        </div>
        <div className="Row">
          <label className="Label" htmlFor="jiraLink">Jira link</label>
          <input className="Input integration-input" type="url" id="jiraLink" placeholder="https://jira.company.com/browse/..." value={form.jiraLink} onChange={onChange} />
        </div>
        <div className="Row">
          <label className="Label" htmlFor="miroLink">Miro link</label>
          <input className="Input integration-input" type="url" id="miroLink" placeholder="https://miro.com/app/board/..." value={form.miroLink} onChange={onChange} />
        </div>
      </div>
    </section>
  );
}
