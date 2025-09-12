import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Plus, X, Clock, Calendar, Save } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const TIME_SLOTS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00',
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00'
];

interface AvailabilityBlock {
  dayOfWeek: number;
  startTimeUTC: string;
  endTimeUTC: string;
  isRecurring: boolean;
}

interface AvailabilityManagerProps {
  availabilityBlocks: AvailabilityBlock[];
  onUpdate?: (blocks: AvailabilityBlock[]) => void;
  readOnly?: boolean;
}

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
  availabilityBlocks = [],
  onUpdate,
  readOnly = false
}) => {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>(availabilityBlocks);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (updatedBlocks: AvailabilityBlock[]) => 
      apiClient.updateTutorProfile({ availabilityBlocks: updatedBlocks }),
    onSuccess: () => {
      toast({
        title: 'Availability updated',
        description: 'Your availability has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['tutor-profile'] });
      setIsEditing(false);
      onUpdate?.(blocks);
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update availability. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const addAvailabilityBlock = () => {
    const newBlock: AvailabilityBlock = {
      dayOfWeek: 0,
      startTimeUTC: '09:00',
      endTimeUTC: '17:00',
      isRecurring: true,
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateAvailabilityBlock = (index: number, field: keyof AvailabilityBlock, value: any) => {
    const updatedBlocks = blocks.map((block, i) => 
      i === index ? { ...block, [field]: value } : block
    );
    setBlocks(updatedBlocks);
  };

  const removeAvailabilityBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (blocks.length === 0) {
      toast({
        title: 'No availability set',
        description: 'Please add at least one availability block.',
        variant: 'destructive',
      });
      return;
    }

    // Validate that end time is after start time
    const invalidBlocks = blocks.filter(block => 
      block.startTimeUTC >= block.endTimeUTC
    );

    if (invalidBlocks.length > 0) {
      toast({
        title: 'Invalid time range',
        description: 'End time must be after start time for all availability blocks.',
        variant: 'destructive',
      });
      return;
    }

    updateMutation.mutate(blocks);
  };

  const handleCancel = () => {
    setBlocks(availabilityBlocks);
    setIsEditing(false);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAvailabilitySummary = () => {
    if (blocks.length === 0) return 'No availability set';
    
    const groupedByDay = blocks.reduce((acc, block) => {
      const day = DAYS_OF_WEEK[block.dayOfWeek];
      if (!acc[day]) acc[day] = [];
      acc[day].push(block);
      return acc;
    }, {} as Record<string, AvailabilityBlock[]>);

    return Object.entries(groupedByDay)
      .map(([day, dayBlocks]) => {
        const times = dayBlocks
          .map(block => `${formatTime(block.startTimeUTC)} - ${formatTime(block.endTimeUTC)}`)
          .join(', ');
        return `${day}: ${times}`;
      })
      .join('; ');
  };

  if (readOnly) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Availability</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {blocks.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{getAvailabilitySummary()}</p>
              <div className="flex flex-wrap gap-2">
                {blocks.map((block, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {DAYS_OF_WEEK[block.dayOfWeek]} {formatTime(block.startTimeUTC)}-{formatTime(block.endTimeUTC)}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No availability set</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Availability</span>
            </CardTitle>
            <CardDescription>
              Set your available hours for tutoring sessions
            </CardDescription>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Edit Availability
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                size="sm"
                disabled={updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Availability Blocks</Label>
              <Button onClick={addAvailabilityBlock} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Block
              </Button>
            </div>

            {blocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No availability blocks set</p>
                <p className="text-sm">Click "Add Block" to set your availability</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Day of Week</Label>
                        <Select
                          value={block.dayOfWeek.toString()}
                          onValueChange={(value) => updateAvailabilityBlock(index, 'dayOfWeek', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day, dayIndex) => (
                              <SelectItem key={dayIndex} value={dayIndex.toString()}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Select
                          value={block.startTimeUTC}
                          onValueChange={(value) => updateAvailabilityBlock(index, 'startTimeUTC', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {formatTime(time)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Select
                          value={block.endTimeUTC}
                          onValueChange={(value) => updateAvailabilityBlock(index, 'endTimeUTC', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {formatTime(time)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Recurring</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={block.isRecurring}
                            onCheckedChange={(checked) => updateAvailabilityBlock(index, 'isRecurring', checked)}
                          />
                          <span className="text-sm text-gray-600">
                            {block.isRecurring ? 'Weekly' : 'One-time'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => removeAvailabilityBlock(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{getAvailabilitySummary()}</p>
            <div className="flex flex-wrap gap-2">
              {blocks.map((block, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {DAYS_OF_WEEK[block.dayOfWeek]} {formatTime(block.startTimeUTC)}-{formatTime(block.endTimeUTC)}
                  {block.isRecurring && ' (Weekly)'}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
