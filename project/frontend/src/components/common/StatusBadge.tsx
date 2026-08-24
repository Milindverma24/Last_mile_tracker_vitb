import React from 'react';
import { OrderStatus } from '../../types';
import { STATUS_CONFIG } from '../../utils/formatters';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.CREATED;

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClass} ${className}`}
      title={config.description}
    >
      {showDot && (
        <span className="relative flex items-center justify-center">
          <span className={`${dotSize} rounded-full ${config.dot}`} />
          {status === 'OUT_FOR_DELIVERY' && (
            <span className={`absolute -inset-0.5 rounded-full ${config.dot} animate-ping opacity-60`} />
          )}
        </span>
      )}
      <span className="tracking-wide">{config.label}</span>
    </span>
  );
};
