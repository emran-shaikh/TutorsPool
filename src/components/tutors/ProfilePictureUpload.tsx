import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string;
  userName?: string;
  onUploadSuccess?: (avatarUrl: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentAvatarUrl,
  userName,
  onUploadSuccess,
}) => {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast({
        title: 'No file selected',
        description: 'Please select an image to upload',
        variant: 'destructive',
      });
      return;
    }

    const file = fileInputRef.current.files[0];
    setUploading(true);

    try {
      // Convert file to base64 for now (in production, upload to cloud storage)
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Update user profile with avatar URL
      await apiClient.updateUserProfile({
        avatarUrl: base64, // In production, this would be a cloud storage URL
      });

      toast({
        title: 'Profile picture updated',
        description: 'Your profile picture has been updated successfully',
      });

      // Update the preview
      setPreview(base64);
      
      if (onUploadSuccess) {
        onUploadSuccess(base64);
      }
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setUploading(true);
      await apiClient.updateUserProfile({
        avatarUrl: null,
      });

      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: 'Profile picture removed',
        description: 'Your profile picture has been removed',
      });

      if (onUploadSuccess) {
        onUploadSuccess('');
      }
    } catch (error: any) {
      console.error('Remove error:', error);
      toast({
        title: 'Remove failed',
        description: error.message || 'Failed to remove profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    if (!userName) return 'T';
    return userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
          <AvatarImage src={preview || ''} alt={userName || 'Profile'} />
          <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            {preview && preview !== currentAvatarUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>

          {preview && preview !== currentAvatarUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          )}

          {preview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center max-w-xs">
          JPG, PNG or GIF. Max size 5MB
        </p>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;

