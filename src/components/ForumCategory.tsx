
import { LucideIcon } from 'lucide-react';

interface ForumCategoryProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  postCount: number;
  onClick: () => void;
  isActive: boolean;
}

const ForumCategory = ({
  id,
  title,
  description,
  icon: Icon,
  color,
  postCount,
  onClick,
  isActive
}: ForumCategoryProps) => {
  return (
    <div 
      className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md
        ${isActive 
          ? 'border-2 border-primary bg-primary/5' 
          : 'border border-border bg-card hover:border-primary/50'
        }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`${color} rounded-lg p-2 text-white`}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-base">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
          
          <div className="mt-3 text-xs font-medium text-muted-foreground">
            {postCount} {postCount === 1 ? 'discussion' : 'discussions'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumCategory;
