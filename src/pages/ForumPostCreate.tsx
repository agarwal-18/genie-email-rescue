
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

const ForumPostCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get category from URL search params on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    
    if (categoryParam) {
      setCategory(categoryParam);
    } else {
      // If no category is provided, redirect back to forum page
      navigate('/forum');
      toast({
        title: "Category required",
        description: "Please select a category from the forum page.",
        variant: "destructive"
      });
    }
  }, [location, navigate, toast]);
  
  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
      toast({
        title: "Authentication required",
        description: "You need to log in to create a post.",
        variant: "destructive"
      });
    }
  }, [user, navigate, toast]);

  // If no user, return null to prevent rendering
  if (!user) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || !category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Create post object
    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      author: {
        id: user?.id || 'unknown',
        name: user?.email?.split('@')[0] || 'Anonymous',
        avatar: null
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: []
    };
    
    try {
      // Get existing posts from localStorage
      const existingPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
      
      // Add new post
      const updatedPosts = [newPost, ...existingPosts];
      
      // Save back to localStorage
      localStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
      
      toast({
        title: "Post created",
        description: "Your post has been successfully published.",
      });
      
      navigate('/forum');
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "There was an error creating your post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Forum Post</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Give your post a meaningful title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required disabled={true}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city-advice">City-specific Travel Advice</SelectItem>
                    <SelectItem value="tourism">Navi Mumbai Tourism</SelectItem>
                    <SelectItem value="food">Regional Food Experiences</SelectItem>
                    <SelectItem value="adventure">Trekking & Adventure</SelectItem>
                  </SelectContent>
                </Select>
                {category && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Category is pre-selected based on where you clicked "Post in this category"
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea 
                  id="content" 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder="Share your experiences, questions, or tips..."
                  className="min-h-[200px]"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input 
                  id="tags" 
                  value={tags} 
                  onChange={(e) => setTags(e.target.value)} 
                  placeholder="e.g. food, beaches, hiking"
                />
                <p className="text-sm text-muted-foreground">Separate tags with commas</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/forum')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Publishing...' : 'Publish Post'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ForumPostCreate;
