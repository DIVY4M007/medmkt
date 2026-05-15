'use client';

import { STATUS_LABELS } from '@/lib/format';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-[#EAE5D9] text-[#5C635F]',
  pending_approval: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  paid: 'bg-sky-100 text-sky-800',
  delivered: 'bg-[#4A675B]/10 text-[#4A675B]',
  rejected: 'bg-red-100 text-red-800',
};

interface StatusBadgeProps {
  status: string;
  dimmed?: boolean;
  className?: string;
  testid?: string;
}

export default function StatusBadge({ status, dimmed, className, testid }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] || status;
  const colorClass = STATUS_COLORS[status] || 'bg-[#EAE5D9] text-[#5C635F]';

  return (
    <span
      data-testid={testid}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity',
        colorClass,
        dimmed && 'opacity-30',
        className
      )}
    >
      {label}
    </span>
  );
}
