
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Tag, Filter, Users, MapPin, Utensils, Mountain, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Navbar from '@/components/Navbar';
import ForumCategory from '@/components/ForumCategory';
import ForumPost from '@/components/ForumPost';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Mock data for forum categories
const forumCategories = [
  {
    id: 'city-advice',
    title: 'City-Specific Travel Advice',
    description: 'Get and share travel tips for specific locations in Navi Mumbai',
    icon: MapPin,
    color: 'bg-blue-500',
    postCount: 32
  },
  {
    id: 'tourism',
    title: 'Navi Mumbai Tourism',
    description: 'Discuss tourist attractions, events, and experiences',
    icon: Users,
    color: 'bg-green-500',
    postCount: 28
  },
  {
    id: 'food',
    title: 'Regional Food Experiences',
    description: 'Share your favorite eateries, dishes, and food experiences',
    icon: Utensils,
    color: 'bg-orange-500',
    postCount: 45
  },
  {
    id: 'adventure',
    title: 'Trekking & Adventure',
    description: 'Discuss hiking trails, outdoor activities, and adventure sports',
    icon: Mountain,
    color: 'bg-purple-500',
    postCount: 19
  }
];

// Mock data for forum posts
const mockPosts = [
  {
    id: '1',
    title: 'Best street food in Vashi?',
    content: 'I\'m looking for recommendations on street food spots in Vashi. Any suggestions for chaat, vada pav, or other local specialties?',
    authorId: 'user1',
    authorName: 'TravelBug',
    authorAvatar: 'https://i.pravatar.cc/150?img=1',
    category: 'food',
    tags: ['street-food', 'vashi', 'local-cuisine'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likesCount: 12,
    commentsCount: 5,
    viewsCount: 123
  },
  {
    id: '2',
    title: 'Monsoon trekking at Kharghar hills - Safety tips',
    content: 'Planning to trek Kharghar hills during monsoon. What safety precautions should I take? Any specific gear recommendations?',
    authorId: 'user2',
    authorName: 'AdventureSeeker',
    authorAvatar: 'https://i.pravatar.cc/150?img=2',
    category: 'adventure',
    tags: ['trekking', 'monsoon', 'kharghar', 'safety'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    likesCount: 18,
    commentsCount: 7,
    viewsCount: 210
  },
  {
    id: '3',
    title: 'Weekend getaway recommendations around Belapur?',
    content: 'Looking for quiet weekend getaway spots accessible from Belapur. Preferably nature-oriented places for a family with kids.',
    authorId: 'user3',
    authorName: 'FamilyTraveler',
    authorAvatar: 'https://i.pravatar.cc/150?img=3',
    category: 'city-advice',
    tags: ['weekend', 'belapur', 'family', 'nature'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    likesCount: 9,
    commentsCount: 4,
    viewsCount: 156
  },
  {
    id: '4',
    title: 'Cultural events in Navi Mumbai this month',
    content: 'Are there any cultural festivals or events happening in Navi Mumbai this month? Looking to explore local traditions and performances.',
    authorId: 'user4',
    authorName: 'CultureExplorer',
    authorAvatar: 'https://i.pravatar.cc/150?img=4',
    category: 'tourism',
    tags: ['events', 'culture', 'festivals', 'performances'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    likesCount: 15,
    commentsCount: 3,
    viewsCount: 198
  }
];

// Suggested topics to discuss
const suggestedTopics = [
  "Hidden gems you've discovered in Navi Mumbai",
  "Best season to visit specific attractions",
  "Transportation tips for getting around",
  "Local customs visitors should be aware of",
  "Photography spots with amazing views",
  "Kid-friendly activities and places",
  "Dining experiences that showcase local cuisine",
  "Budget-friendly itinerary suggestions",
  "Historical sites and their significance",
  "Nature walks and green spaces to explore"
];

// Interface for Post type
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

const Forum = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);

  // Extract all unique tags from posts
  const allTags = Array.from(
    new Set(
      allPosts.flatMap(post => post.tags)
    )
  ).sort();

  // Load posts from localStorage and combine with mock posts
  useEffect(() => {
    // Get user-created posts from localStorage
    const userPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
    
    // Combine with mock posts, with user posts at the beginning
    const combinedPosts = [...userPosts, ...mockPosts];
    setAllPosts(combinedPosts);
  }, []);

  // Filter posts based on active category, search query, and selected tags
  useEffect(() => {
    let posts = [...allPosts];
    
    // Filter by category
    if (activeCategory && activeCategory !== 'all') {
      posts = posts.filter(post => post.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.content.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      posts = posts.filter(post => 
        selectedTags.every(tag => 
          post.tags.some(postTag => postTag.toLowerCase() === tag.toLowerCase())
        )
      );
    }
    
    setFilteredPosts(posts);
  }, [activeCategory, searchQuery, allPosts, selectedTags]);

  // Create post with specific category
  const handleCreatePostForCategory = (categoryId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to create a post",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    // Navigate to create post with selected category
    navigate(`/forum/create?category=${categoryId}`);
  };

  // Handle tag click from ForumPost component
  const handleTagClick = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  // Handle removing a selected tag
  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  // Handle clearing all selected tags
  const handleClearTags = () => {
    setSelectedTags([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Discussion Forum</h1>
              <p className="text-muted-foreground mt-1">
                Connect with travelers and locals to share experiences
              </p>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search discussions..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Categories Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {forumCategories.map((category) => (
              <div key={category.id} className="relative">
                <ForumCategory 
                  id={category.id}
                  title={category.title}
                  description={category.description}
                  icon={category.icon}
                  color={category.color}
                  postCount={category.postCount}
                  onClick={() => setActiveCategory(category.id)}
                  isActive={activeCategory === category.id}
                />
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="absolute bottom-2 right-2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreatePostForCategory(category.id);
                  }}
                >
                  Post in this category
                </Button>
              </div>
            ))}
          </div>

          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Filtered by tags:</span>
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)} 
                    />
                  </Badge>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs" 
                  onClick={handleClearTags}
                >
                  Clear all
                </Button>
              </div>
            </div>
          )}

          {/* Topics and Discussions */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-3/4">
              <Tabs defaultValue="discussions" className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="discussions">All Discussions</TabsTrigger>
                    <TabsTrigger value="popular">Popular</TabsTrigger>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="cursor-pointer">
                      <Filter className="h-3 w-3 mr-1" />
                      Filters
                    </Badge>
                    
                    <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Badge variant="outline" className="cursor-pointer">
                          <Tag className="h-3 w-3 mr-1" />
                          Tags
                        </Badge>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0" align="end">
                        <Command>
                          <CommandInput placeholder="Search tags..." />
                          <CommandList>
                            <CommandEmpty>No tags found.</CommandEmpty>
                            <CommandGroup>
                              {allTags.map((tag) => (
                                <CommandItem
                                  key={tag}
                                  onSelect={() => {
                                    if (!selectedTags.includes(tag)) {
                                      setSelectedTags(prev => [...prev, tag]);
                                    } else {
                                      setSelectedTags(prev => prev.filter(t => t !== tag));
                                    }
                                  }}
                                >
                                  <div className="flex items-center w-full">
                                    <div 
                                      className={`w-4 h-4 mr-2 border rounded ${
                                        selectedTags.includes(tag) 
                                          ? 'bg-primary border-primary' 
                                          : 'border-input'
                                      }`}
                                    >
                                      {selectedTags.includes(tag) && (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                      )}
                                    </div>
                                    {tag}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <TabsContent value="discussions" className="mt-0">
                  <div className="space-y-4">
                    {filteredPosts.map((post) => (
                      <ForumPost 
                        key={post.id} 
                        post={post} 
                        onTagClick={handleTagClick} 
                      />
                    ))}
                    
                    {filteredPosts.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No discussions found matching your criteria</p>
                        <Button variant="link" onClick={() => {
                          setSearchQuery('');
                          setActiveCategory(null);
                          setSelectedTags([]);
                        }}>
                          Reset filters
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="popular" className="mt-0">
                  <div className="space-y-4">
                    {filteredPosts
                      .sort((a, b) => b.likesCount - a.likesCount)
                      .map((post) => (
                        <ForumPost key={post.id} post={post} onTagClick={handleTagClick} />
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="recent" className="mt-0">
                  <div className="space-y-4">
                    {filteredPosts
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((post) => (
                        <ForumPost key={post.id} post={post} onTagClick={handleTagClick} />
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/4 space-y-6">
              {/* Suggested Topics */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Utensils className="h-4 w-4 mr-2 text-primary" />
                  Suggested Topics
                </h3>
                <ul className="space-y-2">
                  {suggestedTopics.map((topic, index) => (
                    <li key={index} className="text-sm">
                      <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground text-left" onClick={() => setSearchQuery(topic)}>
                        {topic}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Popular Tags */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-primary" />
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['food', 'trekking', 'weekend', 'vashi', 'monsoon', 'family', 'events', 'nature'].map((tag) => (
                    <Badge 
                      key={tag} 
                      variant={selectedTags.includes(tag) ? "default" : "secondary"} 
                      className="cursor-pointer" 
                      onClick={() => {
                        if (!selectedTags.includes(tag)) {
                          setSelectedTags(prev => [...prev, tag]);
                        } else {
                          setSelectedTags(prev => prev.filter(t => t !== tag));
                        }
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Active Users */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  Active Contributors
                </h3>
                <div className="space-y-3">
                  {['TravelBug', 'AdventureSeeker', 'FamilyTraveler', 'CultureExplorer'].map((name, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <img src={`https://i.pravatar.cc/150?img=${i+1}`} alt={name} className="h-8 w-8 rounded-full" />
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;
