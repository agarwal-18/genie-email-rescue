
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Tag, Filter, Users, MapPin, Utensils, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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

const Forum = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState(mockPosts);

  useEffect(() => {
    // Filter posts based on active category and search query
    let posts = [...mockPosts];
    
    if (activeCategory && activeCategory !== 'all') {
      posts = posts.filter(post => post.category === activeCategory);
    }
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.content.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredPosts(posts);
  }, [activeCategory, searchQuery]);

  const handleCreatePost = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to create a post",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    navigate('/forum/create');
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
            
            <div className="flex items-center gap-3 w-full md:w-auto">
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
              
              <Button onClick={handleCreatePost}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>
          </div>
          
          {/* Categories Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {forumCategories.map((category) => (
              <ForumCategory 
                key={category.id}
                id={category.id}
                title={category.title}
                description={category.description}
                icon={category.icon}
                color={category.color}
                postCount={category.postCount}
                onClick={() => setActiveCategory(category.id)}
                isActive={activeCategory === category.id}
              />
            ))}
          </div>

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
                    <Badge variant="outline" className="cursor-pointer">
                      <Tag className="h-3 w-3 mr-1" />
                      Tags
                    </Badge>
                  </div>
                </div>
                
                <TabsContent value="discussions" className="mt-0">
                  <div className="space-y-4">
                    {filteredPosts.map((post) => (
                      <ForumPost key={post.id} post={post} />
                    ))}
                    
                    {filteredPosts.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No discussions found matching your criteria</p>
                        <Button variant="link" onClick={() => {
                          setSearchQuery('');
                          setActiveCategory(null);
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
                        <ForumPost key={post.id} post={post} />
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="recent" className="mt-0">
                  <div className="space-y-4">
                    {filteredPosts
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((post) => (
                        <ForumPost key={post.id} post={post} />
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
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery('food')}>food</Badge>
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery('trekking')}>trekking</Badge>
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery('weekend')}>weekend</Badge>
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery('vashi')}>vashi</Badge>
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery('monsoon')}>monsoon</Badge>
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery('family')}>family</Badge>
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery('events')}>events</Badge>
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery('nature')}>nature</Badge>
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
