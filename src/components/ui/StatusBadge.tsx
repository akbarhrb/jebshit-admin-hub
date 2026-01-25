import React from 'react';
import { ContentStatus } from '@/types/content';

interface StatusBadgeProps {
  status: ContentStatus;
  labels?: { published: string; draft: string };
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, labels }) => {
  const getLabel = () => {
    if (labels) {
      return status === 'published' ? labels.published : labels.draft;
    }
    return status === 'published' ? 'Published' : 'Draft';
  };

  return (
    <span className={`status-badge ${status === 'published' ? 'status-published' : 'status-draft'}`}>
      {getLabel()}
    </span>
  );
};

export default StatusBadge;
