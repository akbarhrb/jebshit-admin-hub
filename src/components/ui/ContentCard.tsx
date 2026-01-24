import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { ContentStatus } from '@/types/content';

interface ContentCardProps {
  title: string;
  subtitle?: string;
  image?: string;
  status: ContentStatus;
  date: string;
  onEdit: () => void;
  onDelete: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({
  title,
  subtitle,
  image,
  status,
  date,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden card-hover">
      {image && (
        <div className="h-40 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-medium text-card-foreground line-clamp-2">{title}</h3>
          <StatusBadge status={status} />
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{subtitle}</p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">{date}</span>
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
