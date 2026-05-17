import { STATUS_LABELS } from '../lib/format';

// Reusable order status badge — driven by status string for consistent styling.
export default function StatusBadge({ status, testid }) {
  return (
    <span className={`badge-status badge-${status}`} data-testid={testid || `status-${status}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
