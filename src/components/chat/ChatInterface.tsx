import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Users, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className }) => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<{
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  // Fetch users for new chat (students for tutors, tutors for students)
  const { data: availableUsers = [] } = useQuery({
    queryKey: ['available-chat-users', user?.role],
    queryFn: async () => {
      if (user?.role === 'TUTOR') {
        // Get students
        const response = await apiClient.searchTutors({ limit: 1000 }); // This gets all users
        return response.users?.filter((u: any) => u.role === 'STUDENT') || [];
      } else if (user?.role === 'STUDENT') {
        // Get tutors
        const response = await apiClient.searchTutors({ limit: 1000 });
        return response.tutors || [];
      }
      return [];
    },
    enabled: !!user?.role
  });

  const handleSelectChat = (recipientId: string, recipientName: string, recipientAvatar?: string) => {
    setSelectedChat({ recipientId, recipientName, recipientAvatar });
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  const handleNewChat = (userId: string, userName: string, userAvatar?: string) => {
    setSelectedChat({ recipientId: userId, recipientName: userName, recipientAvatar: userAvatar });
    setShowNewChatDialog(false);
    setIsOpen(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className={className}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="relative">
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat
            {/* You could add unread count badge here */}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-6xl h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Messages</span>
              </DialogTitle>
              <div className="flex space-x-2">
                <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      New Chat
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Start New Chat</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Select onValueChange={(value) => {
                        const selectedUser = availableUsers.find((u: any) => u.id === value);
                        if (selectedUser) {
                          handleNewChat(selectedUser.id, selectedUser.name, selectedUser.avatarUrl);
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${user?.role === 'TUTOR' ? 'student' : 'tutor'} to chat with`} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                  {getInitials(user.name)}
                                </div>
                                <span>{user.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex overflow-hidden">
            <div className="w-1/3 border-r">
              <ChatList 
                onSelectChat={handleSelectChat}
                onCreateNewChat={() => setShowNewChatDialog(true)}
              />
            </div>
            
            <div className="flex-1">
              {selectedChat ? (
                <ChatWindow
                  recipientId={selectedChat.recipientId}
                  recipientName={selectedChat.recipientName}
                  recipientAvatar={selectedChat.recipientAvatar}
                  onClose={handleCloseChat}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                    <p>Choose a conversation from the list to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatInterface;
