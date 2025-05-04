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
import { supabase } from '@/integrations/supabase/client';
import { useItinerary } from '@/hooks/useItinerary';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

interface UserProfileData {
  id: string;
  username: string;
  name: string | null;
  email: string;
  location: string | null;
  memberSince: string;
  bio: string | null;
  savedItineraries: number;
  forumPosts: number;
  hoursExplored: number;
  avatarUrl?: string;
}

interface UserStats {
  saved_itineraries: number;
  forum_posts: number;
  hours_explored: number;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId?: string }>();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, getAccessToken } = useAuth();
  const { getUserItineraries } = useItinerary();
  const [userItineraries, setUserItineraries] = useState([]);
  const isCurrentUserProfile = !userId || userId === currentUser?.id;
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfileData = async () => {
      setLoading(true);
      
      try {
        const targetUserId = userId || currentUser?.id;
        
        if (!targetUserId) {
          setLoading(false);
          return;
        }

        // Get user's itineraries
        const itineraries = await getUserItineraries(targetUserId);
        setUserItineraries(itineraries);

        let userProfileData: UserProfileData;
        let userStats = { saved_itineraries: 0, forum_posts: 0, hours_explored: 0 };
        
        // If viewing current user profile, get profile from API
        if (isCurrentUserProfile) {
          const token = getAccessToken();
          
          if (token) {
            try {
              // Fetch profile data from API
              const profileResponse = await axios.get('/api/profile', {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              // Fetch stats from API
              const statsResponse = await axios.get('/api/profile/stats', {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              const profile = profileResponse.data;
              userStats = statsResponse.data;
              
              userProfileData = {
                id: profile.id,
                username: profile.email?.split('@')[0] || 'user',
                name: profile.name || null,
                email: profile.email || '',
                location: profile.location || 'Navi Mumbai',
                memberSince: profile.created_at,
                bio: profile.bio || 'Loves exploring local food and hidden gems in Navi Mumbai.',
                savedItineraries: userStats.saved_itineraries || itineraries.length,
                forumPosts: userStats.forum_posts || 8,
                hoursExplored: userStats.hours_explored || 36,
                avatarUrl: profile.avatar_url
              };
              
              setUserProfile(userProfileData);
              setLoading(false);
              return;
            } catch (error) {
              console.error('Failed to fetch profile from API:', error);
              // Continue to fallback
            }
          }
        }
        
        // Fallback for other users or if API fails: use current user data or fetch from Supabase
        if (currentUser && isCurrentUserProfile) {
          userProfileData = {
            id: currentUser.id,
            username: currentUser.email?.split('@')[0] || 'user',
            name: currentUser.user_metadata?.name || null,
            email: currentUser.email || '',
            location: currentUser.user_metadata?.location || 'Navi Mumbai',
            memberSince: currentUser.created_at,
            bio: currentUser.user_metadata?.bio || 'Loves exploring local food and hidden gems in Navi Mumbai.',
            savedItineraries: itineraries.length || 3,
            forumPosts: 8, // Default
            hoursExplored: 36, // Default
            avatarUrl: currentUser.user_metadata?.avatar_url
          };
          
          setUserProfile(userProfileData);
        } else {
          // User is viewing someone else's profile
          console.log("Fetching other user profile with ID:", targetUserId);
          
          // For other users, try to get basic user data
          const { data: userData, error } = await supabase.auth.admin.getUserById(targetUserId);
          
          if (error || !userData?.user) {
            console.error('User not found:', error);
            setLoading(false);
            return;
          }
          
          const user = userData.user;
          userProfileData = {
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            name: user.user_metadata?.name || null,
            email: user.email || '',
            location: user.user_metadata?.location || 'Navi Mumbai',
            memberSince: user.created_at || new Date().toISOString(),
            bio: user.user_metadata?.bio || 'Loves exploring local food and hidden gems in Navi Mumbai.',
            savedItineraries: itineraries.length || 3,
            forumPosts: 8, // Default placeholder
            hoursExplored: 36, // Default placeholder
            avatarUrl: user.user_metadata?.avatar_url
          };
          
          setUserProfile(userProfileData);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error loading profile",
          description: "Could not load user profile data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfileData();
  }, [userId, currentUser, getUserItineraries, isCurrentUserProfile, toast, getAccessToken]);

  // Helper function to create user profile from user object
  const createProfileFromUser = (user: any, itinerariesCount: number, stats: UserStats) => {
    return {
      id: user.id,
      username: user.email?.split('@')[0] || 'user',
      name: user.user_metadata?.name || null,
      email: user.email || '',
      location: user.user_metadata?.location || 'Navi Mumbai',
      memberSince: user.created_at || new Date().toISOString(),
      bio: user.user_metadata?.bio || 'Loves exploring local food and hidden gems in Navi Mumbai.',
      savedItineraries: stats.saved_itineraries || itinerariesCount || 3,
      forumPosts: stats.forum_posts || 8,
      hoursExplored: stats.hours_explored || 36,
      avatarUrl: user.user_metadata?.avatar_url
    };
  };

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
                <span>{userProfile.location || 'Location not specified'}</span>
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
