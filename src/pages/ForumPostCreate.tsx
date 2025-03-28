
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

const ForumPostCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your post",
        variant: "destructive"
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter content for your post",
        variant: "destructive"
      });
      return;
    }
    
    if (!category) {
      toast({
        title: "Category required",
        description: "Please select a category for your post",
        variant: "destructive"
      });
      return;
    }
    
    // Create the new post object
    const newPost = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      authorId: user?.id || 'current-user',
      authorName: user?.displayName || 'CurrentUser',
      authorAvatar: user?.photoURL || 'https://i.pravatar.cc/150?img=8',
      category,
      tags,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0
    };
    
    // Get existing posts from localStorage or create empty array
    const existingPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
    
    // Add new post to the array
    const updatedPosts = [newPost, ...existingPosts];
    
    // Save back to localStorage
    localStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
    
    toast({
      title: "Post created!",
      description: "Your post has been submitted successfully"
    });
    
    // Navigate back to the forum
    navigate('/forum');
  };
  
  const handleCancel = () => {
    if (title || content || category || tags.length > 0) {
      if (confirm("Are you sure you want to discard your post?")) {
        navigate('/forum');
      }
    } else {
      navigate('/forum');
    }
  };
  
  // Suggested prompts to help users create meaningful posts
  const contentPrompts = [
    "Share a specific experience you had visiting this location",
    "What was unexpected or surprising about your visit?",
    "What tips would you give to someone planning to visit?",
    "How does this place compare to others you've visited?",
    "What made this experience memorable?",
    "Are there any local customs or etiquette visitors should know about?",
    "What's the best time of day/year to visit?",
    "Any recommendations for food, accommodation, or transportation?"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold flex items-center">
              <Pencil className="h-5 w-5 mr-2" />
              Create New Discussion
            </h1>
            <p className="text-muted-foreground mt-1">
              Share your experiences and connect with other travelers
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your discussion about?"
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium">
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="city-advice">City-Specific Travel Advice</SelectItem>
                  <SelectItem value="tourism">Navi Mumbai Tourism</SelectItem>
                  <SelectItem value="food">Regional Food Experiences</SelectItem>
                  <SelectItem value="adventure">Trekking & Adventure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="content" className="block text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience or ask a question..."
                className="min-h-[200px] w-full"
                required
              />
              
              {/* Writing prompts */}
              <div className="bg-muted/30 p-3 rounded-md mt-2">
                <p className="text-sm font-medium mb-2">Looking for inspiration? Consider addressing:</p>
                <ul className="space-y-1">
                  {contentPrompts.map((prompt, index) => (
                    <li 
                      key={index} 
                      className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                      onClick={() => setContent(prev => prev ? `${prev}\n\n${prompt}:` : `${prompt}:`)}
                    >
                      • {prompt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="tags" className="block text-sm font-medium">
                Tags
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add tags (press Enter after each)"
                    className="pl-9"
                  />
                </div>
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Popular tags: food, trekking, weekend, vashi, monsoon, family, events, nature
              </p>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Post Discussion
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForumPostCreate;
