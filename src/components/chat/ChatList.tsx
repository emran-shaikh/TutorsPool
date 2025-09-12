import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Search, Plus } from 'lucide-react';
import { chatApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Conversation {
  partnerId: string;
  lastMessage: {
    message: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
}

interface ChatListProps {
  onSelectChat: (recipientId: string, recipientName: string, recipientAvatar?: string) => void;
  onCreateNewChat?: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, onCreateNewChat }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: () => chatApi.getConversations(),
    refetchInterval: 5000 // Refetch every 5 seconds
  });

  const { data: unreadCount = { count: 0 } } = useQuery({
    queryKey: ['chat-unread-count'],
    queryFn: () => chatApi.getUnreadCount(),
    refetchInterval: 10000 // Refetch every 10 seconds
  });

  const filteredConversations = conversations.filter((conv: Conversation) => {
    // For now, we'll filter by partner ID since we don't have partner names in the API
    // In a real app, you'd want to include partner info in the conversations API
    return conv.partnerId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatLastMessage = (message: string, maxLength: number = 50) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleChatSelect = (conversation: Conversation) => {
    // In a real app, you'd fetch the partner's details
    // For now, we'll use the partner ID as the name
    const partnerName = `User ${conversation.partnerId.split('-')[1] || conversation.partnerId}`;
    onSelectChat(conversation.partnerId, partnerName);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Messages</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading conversations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Messages</span>
            {unreadCount.count > 0 && (
              <Badge variant="destructive">{unreadCount.count}</Badge>
            )}
          </CardTitle>
          {onCreateNewChat && (
            <Button variant="outline" size="sm" onClick={onCreateNewChat}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm">Start a chat with your tutors or students</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation: Conversation) => (
              <div
                key={conversation.partnerId}
                className="flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleChatSelect(conversation)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {getInitials(`User ${conversation.partnerId.split('-')[1] || conversation.partnerId}`)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">
                      User {conversation.partnerId.split('-')[1] || conversation.partnerId}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.lastMessage.timestamp)}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage.senderId === user?.id ? (
                      <span className="text-muted-foreground">You: </span>
                    ) : null}
                    {formatLastMessage(conversation.lastMessage.message)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatList;
