import React from 'react';
import { getStatusBadgeColor } from '../../utils/formatters';

const Badge = ({ children, status, className = '' }) => {
  const badgeStyle = getStatusBadgeColor(status || children);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border tracking-wide transition-colors ${badgeStyle} ${className}`}>
      {children || status}
    </span>
  );
};

export default Badge;
