import * as React from 'react';

export interface ActionsFooterProps {
  onCancel: () => void;
}

export function ActionsFooter({ onCancel }: ActionsFooterProps) {
  return (
    <footer className="actions-footer">
      <div className="ButtonGroup">
        <button className="Button primary" type="submit">Create flow</button>
        <button className="Button secondary" type="button" id="cancel" onClick={onCancel}>Cancel</button>
      </div>
    </footer>
  );
}
