import React from 'react';
import { render, screen } from '@testing-library/react';
import { FlowSetup, FlowSetupProps } from './FlowSetup';
import userEvent from '@testing-library/user-event';

describe('FlowSetup', () => {
  const defaultProps: FlowSetupProps = {
    form: {
      experimentName: '',
      experimentDescription: '',
      roundNumber: 1,
      entryLabel: '',
      exitLabel: '',
      figmaLink: '',
      jiraLink: '',
      miroLink: '',
    },
    onChange: jest.fn(),
  };

  it('renders all input fields', () => {
    render(<FlowSetup {...defaultProps} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Round')).toBeInTheDocument();
    expect(screen.getByLabelText('Entry node')).toBeInTheDocument();
    expect(screen.getByLabelText('Exit node')).toBeInTheDocument();
    expect(screen.getByLabelText('Figma link')).toBeInTheDocument();
    expect(screen.getByLabelText('Jira link')).toBeInTheDocument();
    expect(screen.getByLabelText('Miro link')).toBeInTheDocument();
  });

  it('calls onChange when input changes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<FlowSetup {...defaultProps} onChange={onChange} />);
    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'Test Experiment');
    expect(onChange).toHaveBeenCalled();
  });
});
