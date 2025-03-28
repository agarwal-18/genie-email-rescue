import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User as UserIcon, 
  Calendar, 
  MapPin, 
  Mail, 
  Edit, 
  Clock, 
  Bookmark,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

const UserProfile = () => {
  const { userId } = useParams<{ userId?: string }>();
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user: currentUser } = useAuth();
  const isCurrentUserProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    // Mock user data for demonstration
    const mockUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        location: 'Navi Mumbai',
        memberSince: '2023-01-15',
        bio: 'Travel enthusiast exploring Navi Mumbai and sharing experiences.',
        savedItineraries: 5,
        forumPosts: 12,
      },
      {
        id: currentUser?.id || '2',
        name: currentUser?.email?.split('@')[0] || 'Guest User',
        email: currentUser?.email || 'guest@example.com',
        location: 'Navi Mumbai',
        memberSince: '2023-05-20',
        bio: 'Loves exploring local food and hidden gems in Navi Mumbai.',
        savedItineraries: 3,
        forumPosts: 8,
      },
    ];

    const user = mockUsers.find(u => u.id === (userId || currentUser?.id));
    setUserProfile(user);
  }, [userId, currentUser]);

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <Card>
            <CardContent className="text-center">
              <p>User not found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-medium">
              <div className="flex items-center">
                <UserIcon className="mr-2 h-5 w-5" />
                {userProfile.name}
              </div>
            </CardTitle>
            {isCurrentUserProfile && (
              <Button variant="ghost" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardDescription>
            {userProfile.bio}
          </CardDescription>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 opacity-70" />
                <span>{userProfile.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 opacity-70" />
                <span>{userProfile.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 opacity-70" />
                <span>Member since {new Date(userProfile.memberSince).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass">
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <Bookmark className="h-6 w-6 text-primary mb-2" />
                  <div className="text-xl font-semibold">{userProfile.savedItineraries}</div>
                  <div className="text-sm text-muted-foreground">Saved Itineraries</div>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <MessageSquare className="h-6 w-6 text-primary mb-2" />
                  <div className="text-xl font-semibold">{userProfile.forumPosts}</div>
                  <div className="text-sm text-muted-foreground">Forum Posts</div>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <Clock className="h-6 w-6 text-primary mb-2" />
                  <div className="text-xl font-semibold">36</div>
                  <div className="text-sm text-muted-foreground">Hours Explored</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
