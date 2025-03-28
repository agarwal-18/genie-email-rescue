
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Info, AlertTriangle, Smile, Compass, Lightbulb } from 'lucide-react';

interface TripTipsProps {
  locations: string[];
}

// Predefined tips for different locations
const locationTips: Record<string, { bestTime: string, mustVisit: string[], avoid: string, localCustoms: string }> = {
  'Vashi': {
    bestTime: 'October to March is ideal with pleasant temperatures.',
    mustVisit: ['Inorbit Mall', 'Mini Seashore', 'CIDCO Exhibition Centre'],
    avoid: 'Rush hour traffic near the toll plaza can be severe from 8-10 AM and 6-8 PM.',
    localCustoms: 'Carry cash for small shops as not all accept cards.'
  },
  'Nerul': {
    bestTime: 'November to February offers the most comfortable weather.',
    mustVisit: ['DY Patil Stadium', 'Nerul Balaji Temple', 'Wonders Park'],
    avoid: 'Weekends can be crowded at Wonders Park, visit on weekdays if possible.',
    localCustoms: 'Remove footwear before entering temples.'
  },
  'Kharghar': {
    bestTime: 'June to September for the waterfalls and lush greenery.',
    mustVisit: ['Central Park', 'Pandavkada Falls', 'Kharghar Hills'],
    avoid: 'Monsoon treks without proper gear as trails can be slippery.',
    localCustoms: 'Respect nature and avoid littering in the hills and park areas.'
  },
  'Belapur': {
    bestTime: 'October to March for outdoor activities.',
    mustVisit: ['Belapur Fort', 'Parsik Hill', 'Bonsai Garden'],
    avoid: 'The fort area after sunset as it's not well-lit.',
    localCustoms: 'Many local shops close for afternoon breaks from 1-4 PM.'
  },
  'Airoli': {
    bestTime: 'November to February for birdwatching at the Flamingo Sanctuary.',
    mustVisit: ['Flamingo Sanctuary', 'Airoli Knowledge Park', 'Shilp Gram'],
    avoid: 'Weekday rush hours as the area has many IT companies.',
    localCustoms: 'Early mornings are best for flamingo viewing.'
  }
};

// Default tips for any location not listed above
const defaultTips = {
  bestTime: 'October to March offers the most pleasant weather across Navi Mumbai.',
  mustVisit: ['Local markets', 'Parks and gardens', 'Street food stalls'],
  avoid: 'Rush hour traffic can be heavy near major stations and toll plazas.',
  localCustoms: 'Modest dress is appropriate when visiting religious sites.'
};

const TripTips = ({ locations }: TripTipsProps) => {
  const [activeTab, setActiveTab] = useState('bestTime');

  // Combine tips from all selected locations
  const combinedTips = {
    bestTime: '',
    mustVisit: [] as string[],
    avoid: '',
    localCustoms: ''
  };

  // If no locations selected, use default tips
  if (locations.length === 0) {
    combinedTips.bestTime = defaultTips.bestTime;
    combinedTips.mustVisit = [...defaultTips.mustVisit];
    combinedTips.avoid = defaultTips.avoid;
    combinedTips.localCustoms = defaultTips.localCustoms;
  } else {
    // Process selected locations
    const processedLocations = new Set<string>();
    
    locations.forEach(location => {
      const tips = locationTips[location] || defaultTips;
      
      if (!processedLocations.has(location)) {
        // Add best time info (take first location's recommendation)
        if (!combinedTips.bestTime) {
          combinedTips.bestTime = tips.bestTime;
        }
        
        // Add must-visit places
        combinedTips.mustVisit.push(...tips.mustVisit);
        
        // Add avoid info
        if (combinedTips.avoid) {
          combinedTips.avoid += ` ${tips.avoid}`;
        } else {
          combinedTips.avoid = tips.avoid;
        }
        
        // Add local customs
        if (combinedTips.localCustoms) {
          combinedTips.localCustoms += ` ${tips.localCustoms}`;
        } else {
          combinedTips.localCustoms = tips.localCustoms;
        }
        
        processedLocations.add(location);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <span>Travel Tips</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bestTime" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="bestTime" className="flex flex-col items-center py-2">
              <Clock className="h-4 w-4 mb-1" />
              <span className="text-xs">Best Time</span>
            </TabsTrigger>
            <TabsTrigger value="mustVisit" className="flex flex-col items-center py-2">
              <Compass className="h-4 w-4 mb-1" />
              <span className="text-xs">Must Visit</span>
            </TabsTrigger>
            <TabsTrigger value="avoid" className="flex flex-col items-center py-2">
              <AlertTriangle className="h-4 w-4 mb-1" />
              <span className="text-xs">Avoid</span>
            </TabsTrigger>
            <TabsTrigger value="localCustoms" className="flex flex-col items-center py-2">
              <Info className="h-4 w-4 mb-1" />
              <span className="text-xs">Local Tips</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bestTime" className="mt-0">
            <div className="text-sm space-y-2">
              <div className="flex gap-2 items-start">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <p>{combinedTips.bestTime}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="mustVisit" className="mt-0">
            <div className="text-sm space-y-2">
              <p className="font-medium mb-2">Top Attractions:</p>
              <ul className="space-y-1">
                {[...new Set(combinedTips.mustVisit)].map((item, index) => (
                  <li key={index} className="flex gap-2 items-start">
                    <Smile className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="avoid" className="mt-0">
            <div className="text-sm space-y-2">
              <div className="flex gap-2 items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p>{combinedTips.avoid}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="localCustoms" className="mt-0">
            <div className="text-sm space-y-2">
              <div className="flex gap-2 items-start">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <p>{combinedTips.localCustoms}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TripTips;
