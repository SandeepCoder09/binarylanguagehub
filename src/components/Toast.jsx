import { useEffect } from 'react';
import { Check, AlertTriangle } from 'lucide-react';

/**
 * Toast — lightweight notification overlay.
 * Props:
 *   message  : string   — text to display
 *   type     : 'success' | 'error'
 *   onClear  : () => void — called after auto-dismiss
 */
export default function Toast({ message, type = 'success', onClear }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClear, 2400);
    return () => clearTimeout(t);
  }, [message, onClear]);

  if (!message) return null;

  return (
    <div
      className={`toast toast-${type}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {type === 'error'
        ? <AlertTriangle size={16} aria-hidden="true" />
        : <Check size={16} aria-hidden="true" />}
      <span>{message}</span>
    </div>
  );
}
