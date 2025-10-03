import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Building, Navigation, Phone, MessageSquare } from 'lucide-react';
import GoogleMaps from '@/components/ui/GoogleMaps';

interface TutorLocation {
  enabled: boolean;
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

interface TutorLocationCardProps {
  tutorName: string;
  tutorLocation?: TutorLocation;
  onContact?: () => void;
  showDirections?: boolean;
}

const TutorLocationCard: React.FC<TutorLocationCardProps> = ({
  tutorName,
  tutorLocation,
  onContact,
  showDirections = true
}) => {
  // Don't render if location is not enabled
  if (!tutorLocation?.enabled) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Building className="h-5 w-5 text-gray-400" />
            <span>In-Person Tutoring</span>
            <Badge variant="secondary" className="ml-auto">Not Available</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">
              This tutor currently offers only online sessions
            </p>
            <Button 
              variant="outline" 
              onClick={onContact}
              className="bg-[#8B5CF6]/10 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/20"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact About Online Sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const address = tutorLocation ? 
    `${tutorLocation.address || ''}, ${tutorLocation.city || ''}, ${tutorLocation.state || ''}, ${tutorLocation.country || ''}`.replace(/,\s*,/g, ',').replace(/\[,]\s*$/g, '') :
    'Location not specified';

  return (
    <Card className="border-[#8B5CF6]/20 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <MapPin className="h-5 w-5 text-[#8B5CF6]" />
          <span>In-Person Location</span>
          <Badge className="ml-auto bg-[#8B5CF6] text-white">
            Available
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">City:</span>
            <p className="font-medium">{tutorLocation.city || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-gray-600">State:</span>
            <p className="font-medium">{tutorLocation.state || 'Not specified'}</p>
          </div>
        </div>

        {tutorLocation.meetingPoint && (
          <div className="bg-[#8B5CF6]/10 rounded-lg p-3">
            <h4 className="font-medium text-[#8B5CF6] flex items-center mb-2">
              <MapPin className="h-4 w-4 mr-2" />
              Meeting Point
            </h4>
            <p className="text-sm text-gray-700">{tutorLocation.meetingPoint}</p>
          </div>
        )}

        {tutorLocation.additionalInfo && (
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-2">ℹ️ Additional Information</h4>
            <p className="text-sm text-blue-800">{tutorLocation.additionalInfo}</p>
          </div>
        )}

        {/* Google Maps Component */}
        <GoogleMaps
          tutorName={tutorName}
          location={tutorLocation}
          className="mt-4"
          showDirections={showDirections}
        />

        {/* Contact Button */}
        {onContact && (
          <div className="pt-2">
            <Button 
              onClick={onContact}
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Tutor
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TutorLocationCard;
