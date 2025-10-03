import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, ExternalLink, RefreshCw } from 'lucide-react';

interface LocationData {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  meetingPoint?: string;
  additionalInfo?: string;
}

interface GoogleMapsProps {
  tutorName: string;
  location?: LocationData;
  className?: string;
  showDirections?: boolean;
}

// Mock Google Maps component for demonstration
const GoogleMaps: React.FC<GoogleMapsProps> = ({ 
  tutorName, 
  location, 
  className = "", 
  showDirections = true 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock coordinates for demo (New York City)
  const defaultCoords = {
    latitude: 40.7128,
    longitude: -74.0060
  };

  const coords = location?.coordinates || {
    latitude: defaultCoords.latitude,
    longitude: defaultCoords.longitude
  };

  const address = location ? 
    `${location.address || ''}, ${location.city || ''}, ${location.state || ''}, ${location.country || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '') :
    'New York, NY, USA';

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDirections = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  };

  const handleRefresh = () => {
    setMapLoaded(false);
    setTimeout(() => setMapLoaded(true), 500);
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-[#8B5CF6]" />
              <h3 className="font-semibold">Teaching Location</h3>
              <Badge variant="outline" className="text-xs">
                {location?.meetingPoint ? 'Specific Meeting Point' : 'General Area'}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={!mapLoaded}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Map Container */}
          <div className="relative">
            <div 
              ref={mapRef}
              className="w-full h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden"
            >
              {!mapLoaded ? (
                <div className="text-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b- border-[#8B5CF6] mx-auto"></div>
                  <p className="text-sm text-gray-600">Loading map...</p>
                </div>
              ) : (
                <div className="text-center space-y-3 p-4">
                  <div className="w-16 h-16 bg-[#8B5CF6] rounded-full flex items-center justify-center mx-auto">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{tutorName}</p>
                    <p className="text-sm text-gray-600">{address}</p>
                    {location?.meetingPoint && (
                      <p className="text-xs text-[#8B5CF6] font-medium mt-1">
                        📍 {location.meetingPoint}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCoordinates(coords.latitude, coords.longitude)}
                  </div>
                </div>
              )}
            </div>

            {/* Map Overlay Info */}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs">
              <div className="flex items-center space-x-1 text-[#8B5CF6]">
                <span>🎯</span>
                <span className="font-medium">Teaching Location</span>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-3 bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-900">📍 Meeting Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="text-gray-900 text-right">{address}</span>
              </div>
              
              {location?.meetingPoint && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Meeting Point:</span>
                  <span className="text-[#8B5CF6] font-medium">{location.meetingPoint}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Coordinates:</span>
                <span className="text-gray-900 font-mono">{formatCoordinates(coords.latitude, coords.longitude)}</span>
              </div>
            </div>

            {location?.additionalInfo && (
              <div className="mt-3 p-2 bg-blue-50 rounded">
                <h5 className="font-medium text-blue-900 text-xs">ℹ️ Additional Information</h5>
                <p className="text-xs text-blue-800 mt-1">{location.additionalInfo}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {showDirections && (
            <div className="flex space-x-2">
              <Button 
                onClick={handleDirections}
                className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}`;
                  window.open(mapsUrl, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Safety Note */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="font-medium text-green-900 text-sm">🛡️ Safety First</h5>
            <p className="text-xs text-green-800 mt-1">
              Meet in public places. Double-check the meeting point before your session.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMaps;
