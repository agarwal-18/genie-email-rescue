
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Flag, 
  ArrowLeft, 
  Calendar, 
  Send, 
  Eye,
  Heart,
  Bookmark
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Mock post data (in a real app, you'd fetch this by ID)
const mockPost = {
  id: '2',
  title: 'Monsoon trekking at Kharghar hills - Safety tips',
  content: `Planning to trek Kharghar hills during monsoon. What safety precautions should I take? Any specific gear recommendations?

I've heard the views are spectacular in monsoon, but also that the trails can get slippery and dangerous. I'm wondering if anyone has experience trekking there during the rainy season and can share some advice.

Specific questions:
- What footwear is recommended for the muddy trails?
- Are there any particularly dangerous spots to avoid?
- What time of day is best to start the trek?
- Should I hire a local guide?
- What essential items should I pack?

Thanks for your help - really looking forward to experiencing the hills during the rainy season!`,
  authorId: 'user2',
  authorName: 'AdventureSeeker',
  authorAvatar: 'https://i.pravatar.cc/150?img=2',
  category: 'adventure',
  tags: ['trekking', 'monsoon', 'kharghar', 'safety'],
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  likesCount: 18,
  commentsCount: 7,
  viewsCount: 210
};

// Mock comments data
const mockComments = [
  {
    id: 'c1',
    content: "I've done this trek multiple times during monsoon. Definitely bring hiking shoes with good grip - regular sneakers won't cut it on the slippery paths. Start early around 7 AM to avoid afternoon downpours. The trickiest section is near the waterfall, be extra careful there.",
    authorId: 'user3',
    authorName: 'HillClimber',
    authorAvatar: 'https://i.pravatar.cc/150?img=3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    likesCount: 7
  },
  {
    id: 'c2',
    content: "Don't attempt this alone during monsoon. Always take someone experienced with you or join a group. Pack a rain cover for your backpack, waterproof your phone, and carry some energy bars. The view of the waterfall is totally worth it though!",
    authorId: 'user5',
    authorName: 'NatureLover',
    authorAvatar: 'https://i.pravatar.cc/150?img=5',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    likesCount: 5
  },
  {
    id: 'c3',
    content: "I'd recommend these essential items: raincoat (poncho type), trekking pole, small first aid kit, extra pair of socks, torch, power bank, and 1-2 liters of water. The trails are marked but can get confusing in heavy rain, so the Maps.me app with offline trails is helpful.",
    authorId: 'user6',
    authorName: 'TrekExpert',
    authorAvatar: 'https://i.pravatar.cc/150?img=6',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    likesCount: 9
  }
];

const ForumPostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [post] = useState(mockPost); // In a real app, fetch post by ID
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Get category label
  const getCategoryLabel = (categoryId: string) => {
    const categories: Record<string, string> = {
      'city-advice': 'City Advice',
      'tourism': 'Tourism',
      'food': 'Food',
      'adventure': 'Adventure'
    };
    
    return categories[categoryId] || categoryId;
  };
  
  const handlePostComment = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to post a comment",
        variant: "destructive"
      });
      return;
    }
    
    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment before posting",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you'd save this to your database
    const newCommentObj = {
      id: `c${comments.length + 1}`,
      content: newComment,
      authorId: user.id || 'current-user',
      authorName: user.email?.split('@')[0] || 'Current User',
      authorAvatar: 'https://i.pravatar.cc/150?img=8',
      createdAt: new Date().toISOString(),
      likesCount: 0
    };
    
    setComments([...comments, newCommentObj]);
    setNewComment('');
    
    toast({
      title: "Comment posted",
      description: "Your comment has been added to the discussion"
    });
  };
  
  const handleSharePost = () => {
    // In a real app, implement proper sharing functionality
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Post URL copied to clipboard"
    });
  };
  
  const handleToggleLike = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to like posts",
        variant: "destructive"
      });
      return;
    }
    
    setIsLiked(!isLiked);
  };
  
  const handleToggleSave = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to save posts",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaved(!isSaved);
    
    toast({
      title: isSaved ? "Post removed from saved" : "Post saved",
      description: isSaved ? "This post has been removed from your saved items" : "This post has been added to your saved items"
    });
  };
  
  const handleReportPost = () => {
    toast({
      title: "Report submitted",
      description: "Thank you for helping keep our community safe"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link to="/forum" className="inline-flex items-center text-sm font-medium mb-6 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to discussions
          </Link>
          
          {/* Post header */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                  <AvatarFallback>{post.authorName[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                
                <div>
                  <Link to={`/profile/${post.authorId}`} className="font-medium hover:underline">
                    {post.authorName}
                  </Link>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
              
              <Badge variant="outline">
                {getCategoryLabel(post.category)}
              </Badge>
            </div>
            
            <h1 className="text-2xl font-bold mb-3">{post.title}</h1>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {post.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center gap-1 ${isLiked ? 'text-primary' : ''}`}
                  onClick={handleToggleLike}
                >
                  {isLiked ? <Heart className="h-4 w-4 fill-primary text-primary" /> : <ThumbsUp className="h-4 w-4" />}
                  <span>{isLiked ? post.likesCount + 1 : post.likesCount}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => document.getElementById('comment-input')?.focus()}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{comments.length}</span>
                </Button>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{post.viewsCount}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleSharePost}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={isSaved ? 'text-primary' : ''}
                  onClick={handleToggleSave}
                >
                  <Bookmark className={`h-4 w-4 mr-1 ${isSaved ? 'fill-primary' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
                
                <Button variant="ghost" size="sm" onClick={handleReportPost}>
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Comments section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-6">
              Comments ({comments.length})
            </h2>
            
            {/* New comment input */}
            <div className="mb-8">
              <Textarea
                id="comment-input"
                placeholder="Add your comment..."
                className="resize-none mb-2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={handlePostComment}>
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </div>
            
            {/* Comments list */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="relative">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                      <AvatarFallback>{comment.authorName[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <Link to={`/profile/${comment.authorId}`} className="font-medium text-sm hover:underline">
                          {comment.authorName}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="mt-1 text-sm">{comment.content}</p>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {comment.likesCount}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {comment.id !== comments[comments.length - 1].id && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPostDetail;
