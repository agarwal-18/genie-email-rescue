
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  Calendar, 
  MapPin, 
  Mail, 
  Edit, 
  Clock, 
  Bookmark,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, UserItinerary } from '@/integrations/supabase/client';
import { useItinerary } from '@/hooks/useItinerary';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfileData {
  id: string;
  username: string;
  name: string;
  email: string;
  location: string;
  memberSince: string;
  bio: string;
  savedItineraries: number;
  forumPosts: number;
  hoursExplored: number;
  avatarUrl?: string;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId?: string }>();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { itineraries } = useItinerary();
  const isCurrentUserProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    const fetchUserProfileData = async () => {
      setLoading(true);
      
      try {
        const targetUserId = userId || currentUser?.id;
        
        if (!targetUserId) {
          setLoading(false);
          return;
        }

        // Get itineraries count
        const { count: itinerariesCount, error: itinerariesError } = await supabase
          .from('user_itineraries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', targetUserId);

        if (itinerariesError) {
          console.error('Error fetching itineraries count:', itinerariesError);
        }
        
        // Get forum posts count (would need to implement if forum table exists)
        // This is a placeholder since we don't have the actual forum posts table
        const forumPostsCount = 8; // Default value

        // Calculate hours explored based on itineraries
        const { data: activities, error: activitiesError } = await supabase
          .from('itinerary_activities')
          .select('itinerary_id')
          .in('itinerary_id', itineraries.map(i => i.id));
          
        const hoursExplored = activities ? Math.round(activities.length * 1.5) : 36; // Estimate 1.5 hours per activity

        if (activitiesError) {
          console.error('Error fetching activities:', activitiesError);
        }

        // Construct user profile with real data where possible
        const profileData: UserProfileData = {
          id: targetUserId,
          username: currentUser?.email?.split('@')[0] || 'ganeshaditya125',
          name: currentUser?.user_metadata?.name || 'Ganesh Aditya',
          email: currentUser?.email || 'ganeshaditya125@gmail.com',
          location: 'Navi Mumbai',
          memberSince: currentUser?.created_at || '2023-05-20',
          bio: 'Loves exploring local food and hidden gems in Navi Mumbai.',
          savedItineraries: itinerariesCount || itineraries.length || 3,
          forumPosts: forumPostsCount,
          hoursExplored: hoursExplored,
          avatarUrl: currentUser?.user_metadata?.avatar_url
        };

        setUserProfile(profileData);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfileData();
  }, [userId, currentUser, itineraries]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <Card>
            <CardContent className="text-center py-12">
              <UserIcon className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
              <p className="text-muted-foreground">The user profile you're looking for doesn't exist or you don't have permission to view it.</p>
              <Button asChild className="mt-6">
                <Link to="/">Return to Home</Link>
              </Button>
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
            <div>
              <CardTitle className="text-2xl font-medium flex items-center">
                <UserIcon className="mr-2 h-5 w-5" />
                {userProfile.username}
              </CardTitle>
              <CardDescription>
                {userProfile.bio}
              </CardDescription>
            </div>
            {isCurrentUserProfile && (
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent className="grid gap-6">
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
              <Card className="bg-primary/5 border-none">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Bookmark className="h-8 w-8 text-primary mb-2" />
                  <div className="text-2xl font-semibold">{userProfile.savedItineraries}</div>
                  <div className="text-sm text-muted-foreground">Saved Itineraries</div>
                </CardContent>
                <CardFooter className="p-3 pt-0 justify-center">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/saved-itineraries">
                      View All <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-primary/5 border-none">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <MessageSquare className="h-8 w-8 text-primary mb-2" />
                  <div className="text-2xl font-semibold">{userProfile.forumPosts}</div>
                  <div className="text-sm text-muted-foreground">Forum Posts</div>
                </CardContent>
                <CardFooter className="p-3 pt-0 justify-center">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/forum">
                      View All <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-primary/5 border-none">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Clock className="h-8 w-8 text-primary mb-2" />
                  <div className="text-2xl font-semibold">{userProfile.hoursExplored}</div>
                  <div className="text-sm text-muted-foreground">Hours Explored</div>
                </CardContent>
                <CardFooter className="p-3 pt-0 justify-center">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/itinerary">
                      Plan More <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
