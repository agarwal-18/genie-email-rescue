
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  MessageSquare, 
  ThumbsUp, 
  User,
  Edit,
  Settings
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import ForumPost from '@/components/ForumPost';
import { useAuth } from '@/contexts/AuthContext';

// Mock user profiles
const mockProfiles: Record<string, any> = {
  'user1': {
    id: 'user1',
    name: 'TravelBug',
    avatar: 'https://i.pravatar.cc/150?img=1',
    location: 'Vashi, Navi Mumbai',
    joinDate: '2023-04-15T12:00:00Z',
    bio: 'Avid explorer of hidden gems in Navi Mumbai. Food enthusiast and photography lover.',
    interests: ['food', 'photography', 'culture'],
    postsCount: 15,
    commentsCount: 42
  },
  'user2': {
    id: 'user2',
    name: 'AdventureSeeker',
    avatar: 'https://i.pravatar.cc/150?img=2',
    location: 'Kharghar, Navi Mumbai',
    joinDate: '2023-06-22T12:00:00Z',
    bio: 'Outdoor enthusiast always looking for the next adventure. Trekking and nature exploration are my passion.',
    interests: ['trekking', 'adventure', 'hiking', 'outdoors'],
    postsCount: 8,
    commentsCount: 23
  },
  'user3': {
    id: 'user3',
    name: 'FamilyTraveler',
    avatar: 'https://i.pravatar.cc/150?img=3',
    location: 'Belapur, Navi Mumbai',
    joinDate: '2023-02-10T12:00:00Z',
    bio: 'Traveling with kids and making family memories. Expert in finding kid-friendly attractions and activities.',
    interests: ['family', 'kid-friendly', 'parks', 'education'],
    postsCount: 22,
    commentsCount: 67
  },
  'current-user': {
    id: 'current-user',
    name: 'CurrentUser',
    avatar: 'https://i.pravatar.cc/150?img=8',
    location: 'Nerul, Navi Mumbai',
    joinDate: new Date().toISOString(),
    bio: 'New to Navi Mumbai and excited to explore!',
    interests: ['travel', 'food', 'photography'],
    postsCount: 1,
    commentsCount: 3
  }
};

// Mock user posts
const mockUserPosts = {
  'user1': [
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
    }
  ],
  'user2': [
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
    }
  ],
  'user3': [
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
    }
  ],
  'current-user': []
};

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  
  // Get profile data - in a real app you would fetch this from your backend
  const profileId = userId || (user?.id || 'current-user');
  const profile = mockProfiles[profileId] || mockProfiles['current-user'];
  const posts = mockUserPosts[profileId] || [];
  
  const isOwnProfile = !userId || userId === (user?.id || 'current-user');
  
  // Format join date
  const joinDate = new Date(profile.joinDate);
  const formattedJoinDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(joinDate);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile header */}
          <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
            
            <div className="relative px-6 pb-6">
              <Avatar className="h-24 w-24 absolute -top-12 ring-4 ring-background">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback>{profile.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="pt-16 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Joined {formattedJoinDate}
                    </div>
                  </div>
                  
                  <p className="mt-3 text-sm">{profile.bio}</p>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {profile.interests.map((interest: string) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {isOwnProfile ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Profile
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Settings
                    </Button>
                  </div>
                ) : (
                  <Button>
                    <User className="h-4 w-4 mr-1" />
                    Follow
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>
                    <strong>{profile.postsCount}</strong> posts
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>
                    <strong>{profile.commentsCount}</strong> comments
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile content */}
          <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-0">
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map(post => (
                    <ForumPost key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                  <User className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No posts yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {isOwnProfile
                      ? "You haven't created any posts yet."
                      : `${profile.name} hasn't created any posts yet.`}
                  </p>
                  
                  {isOwnProfile && (
                    <Link to="/forum/create">
                      <Button className="mt-4">
                        Create Your First Post
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="comments" className="mt-0">
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No comments to show</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isOwnProfile
                    ? "Your comments on forum posts will appear here."
                    : `${profile.name}'s comments on forum posts will appear here.`}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="saved" className="mt-0">
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Bookmark className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No saved posts</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isOwnProfile
                    ? "Posts you save will appear here for easy access."
                    : "This information is private."}
                </p>
                
                {isOwnProfile && (
                  <Link to="/forum">
                    <Button variant="outline" className="mt-4">
                      Browse Forum
                    </Button>
                  </Link>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
