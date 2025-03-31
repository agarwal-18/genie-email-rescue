
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare, Eye, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
}

interface ForumPostProps {
  post: Post;
  onTagClick?: (tag: string) => void;
}

const ForumPost = ({ post, onTagClick }: ForumPostProps) => {
  // Get author initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Format the creation date
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  // Get the category label
  const getCategoryLabel = (categoryId: string) => {
    const categories: Record<string, string> = {
      'city-advice': 'City Advice',
      'tourism': 'Tourism',
      'food': 'Food',
      'adventure': 'Adventure'
    };
    
    return categories[categoryId] || categoryId;
  };

  // Handle tag click
  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow bg-card">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.authorAvatar} alt={post.authorName} />
          <AvatarFallback>{getInitials(post.authorName)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <Link to={`/forum/post/${post.id}`} className="font-medium text-lg hover:text-primary transition-colors">
                {post.title}
              </Link>
              
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="text-muted-foreground">by</span>
                <Link to={`/profile/${post.authorId}`} className="font-medium hover:underline">
                  {post.authorName}
                </Link>
                <span className="text-muted-foreground flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formattedDate}
                </span>
              </div>
            </div>
            
            <Badge variant="outline" className="text-xs">
              {getCategoryLabel(post.category)}
            </Badge>
          </div>
          
          <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
            {post.content}
          </p>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {post.tags.map(tag => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs cursor-pointer hover:bg-secondary/80"
                onClick={(e) => handleTagClick(e, tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="mt-3 flex items-center text-xs text-muted-foreground gap-4">
            <div className="flex items-center">
              <ThumbsUp className="h-3 w-3 mr-1" />
              {post.likesCount} likes
            </div>
            <div className="flex items-center">
              <MessageSquare className="h-3 w-3 mr-1" />
              {post.commentsCount} comments
            </div>
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {post.viewsCount} views
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPost;
