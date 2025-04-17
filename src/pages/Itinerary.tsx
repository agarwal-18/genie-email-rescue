
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useItinerary, type ItineraryDay } from '@/hooks/useItinerary';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Copy, Calendar, MapPin, Clock, Download, Share2, AlertCircle, CheckCircle, Loader2, Map } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ItineraryMap from '@/components/ItineraryMap';
import { toast } from 'sonner';
import type { UserItinerary, ItineraryActivity } from '@/integrations/supabase/client';

interface ItineraryDataType {
  itinerary: UserItinerary;
  days: ItineraryDay[];
}

const Itinerary = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchItineraryById, downloadItineraryAsPdf } = useItinerary();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itineraryData, setItineraryData] = useState<ItineraryDataType | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  
  const pdfRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!id) {
      navigate('/404');
      return;
    }
    
    fetchItineraryData();
  }, [id]);
  
  const fetchItineraryData = async () => {
    setLoading(true);
    try {
      const data = await fetchItineraryById(id);
      setItineraryData(data);
      
      // Save to localStorage for offline access
      localStorage.setItem(`itinerary-${id}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      
      // Try to load from localStorage as fallback
      const cachedData = localStorage.getItem(`itinerary-${id}`);
      if (cachedData) {
        try {
          setItineraryData(JSON.parse(cachedData));
          setError('Using cached itinerary data. Some information may be outdated.');
        } catch (e) {
          setError('Failed to load itinerary data.');
        }
      } else {
        setError('Failed to load itinerary data.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleShareClick = () => {
    const url = `${window.location.origin}/itinerary/${id}`;
    setShareUrl(url);
    setShowShareDialog(true);
    setLinkCopied(false);
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        toast.error('Failed to copy link to clipboard');
      });
  };

  const handleOpenMap = () => {
    setShowMapDialog(true);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-lg text-muted-foreground">Loading your itinerary...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              {itineraryData && (
                <>
                  <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
                    <div>
                      <h1 className="text-3xl font-bold">{itineraryData.itinerary.title}</h1>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{itineraryData.itinerary.start_date ? new Date(itineraryData.itinerary.start_date).toLocaleDateString() : 'No start date'}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{itineraryData.itinerary.days} {itineraryData.itinerary.days === 1 ? 'day' : 'days'}</span>
                        </div>
                        {itineraryData.itinerary.pace && (
                          <div className="text-sm text-muted-foreground">
                            Pace: {itineraryData.itinerary.pace}
                          </div>
                        )}
                        {itineraryData.itinerary.transportation && (
                          <div className="text-sm text-muted-foreground">
                            Transportation: {itineraryData.itinerary.transportation}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={handleShareClick}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => downloadItineraryAsPdf(
                          itineraryData.itinerary.title,
                          pdfRef.current
                        )}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleOpenMap}>
                        <Map className="h-4 w-4 mr-2" />
                        Full Map View
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8 mb-8">
                    <div className="md:col-span-2">
                      <Tabs defaultValue="day-1">
                        <TabsList className="mb-4 w-full overflow-x-auto flex-nowrap justify-start">
                          {itineraryData.days.map((day) => (
                            <TabsTrigger key={day.day} value={`day-${day.day}`}>
                              Day {day.day}
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        {itineraryData.days.map((day) => (
                          <TabsContent key={day.day} value={`day-${day.day}`} className="space-y-4">
                            <div ref={pdfRef} className="space-y-4 pb-4">
                              {day.activities.map((activity, index) => (
                                <Card key={index}>
                                  <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <CardTitle className="text-lg">{activity.title}</CardTitle>
                                        <CardDescription className="flex items-center">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {activity.time}
                                        </CardDescription>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex items-start mb-2">
                                      <MapPin className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
                                      <span>{activity.location}</span>
                                    </div>
                                    {activity.description && (
                                      <p className="text-sm text-muted-foreground mt-2">{activity.description}</p>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>

                    <div>
                      <Card>
                        <CardHeader>
                          <CardTitle>Map View</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <ItineraryMap 
                            activities={itineraryData.days.flatMap(day => 
                              day.activities.map(activity => ({
                                location: activity.location,
                                title: activity.title,
                                description: activity.description || ''
                              }))
                            )}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Itinerary</DialogTitle>
            <DialogDescription>
              Copy the link below to share your itinerary with others.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mt-4">
            <Input
              value={shareUrl}
              readOnly
              onClick={(e) => e.currentTarget.select()}
            />
            <Button size="icon" onClick={handleCopyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {linkCopied && (
            <div className="flex items-center text-sm text-green-600 mt-2">
              <CheckCircle className="h-4 w-4 mr-1" />
              Link copied to clipboard!
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Map Dialog */}
      {itineraryData && (
        <ItineraryMap
          activities={itineraryData.days.flatMap(day => 
            day.activities.map(activity => ({
              location: activity.location,
              title: activity.title,
              description: activity.description || ''
            }))
          )}
          isOpen={showMapDialog}
          onClose={() => setShowMapDialog(false)}
        />
      )}
    </div>
  );
};

export default Itinerary;
