import * as React from 'react';

export interface ActionsFooterProps {
  onCancel: () => void;
}

export function ActionsFooter({ onCancel }: ActionsFooterProps) {
  return (
    <footer className="actions-footer">
      <div className="actions">
        <button type="submit">Create flow</button>
        <button className="secondary" type="button" id="cancel" onClick={onCancel}>Cancel</button>
      </div>
    </footer>
  );
}
