import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, Phone, Video } from 'lucide-react';
import { chatApi } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

interface ChatWindowProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  onClose?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  recipientId,
  recipientName,
  recipientAvatar,
  onClose
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();

  const { socket, isConnected, messages, typingUsers, sendMessage, startTyping, stopTyping } = useSocket();

  // Fetch chat history
  const { data: chatHistory = [], isLoading } = useQuery({
    queryKey: ['chat-messages', user?.id, recipientId],
    queryFn: () => chatApi.getMessages(user?.id || '', recipientId),
    enabled: !!user?.id && !!recipientId
  });

  // Join chat room when component mounts
  useEffect(() => {
    if (socket && user?.id && recipientId) {
      socket.emit('join-chat', { 
        studentId: user.role === 'STUDENT' ? user.id : recipientId,
        tutorId: user.role === 'TUTOR' ? user.id : recipientId
      });
    }
  }, [socket, user?.id, recipientId, user?.role]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatHistory]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (user?.id && recipientId) {
      chatApi.markMessagesAsRead(recipientId);
      queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] });
    }
  }, [user?.id, recipientId, queryClient]);

  const handleSendMessage = () => {
    if (message.trim() && user?.id) {
      sendMessage(recipientId, message.trim());
      setMessage('');
      stopTyping(recipientId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      startTyping(recipientId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(recipientId);
    }, 1000);
  };

  // Combine chat history with real-time messages
  const allMessages = [...chatHistory, ...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isRecipientTyping = Array.from(typingUsers).includes(recipientId);

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={recipientAvatar} />
            <AvatarFallback>{getInitials(recipientName)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{recipientName}</CardTitle>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Online' : 'Offline'}
              </span>
              {isRecipientTyping && (
                <Badge variant="secondary" className="text-xs">
                  Typing...
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading messages...</div>
            ) : allMessages.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Start a conversation with {recipientName}</p>
              </div>
            ) : (
              allMessages.map((msg) => {
                const isOwnMessage = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex space-x-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={isOwnMessage ? user?.avatarUrl : recipientAvatar} />
                        <AvatarFallback>
                          {getInitials(isOwnMessage ? user?.name || 'You' : recipientName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`rounded-lg px-3 py-2 ${
                        isOwnMessage 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${recipientName}...`}
              className="flex-1"
              disabled={!isConnected}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!message.trim() || !isConnected}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!isConnected && (
            <p className="text-xs text-muted-foreground mt-2">
              Connecting to chat server...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
