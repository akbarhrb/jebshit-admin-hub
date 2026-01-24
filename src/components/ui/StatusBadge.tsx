import React from 'react';
import { ContentStatus } from '@/types/content';

interface StatusBadgeProps {
  status: ContentStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`status-badge ${status === 'published' ? 'status-published' : 'status-draft'}`}>
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  );
};

export default StatusBadge;
