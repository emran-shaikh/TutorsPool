import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Minimize2, Maximize2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';

interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface ChatConversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const FloatingChat: React.FC = () => {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;
  const { socket, isConnected } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Initialize messages state safely
  useEffect(() => {
    if (!Array.isArray(messages)) {
      setMessages([]);
    }
  }, []);
  const prevMessagesRef = useRef<ChatMessage[]>([]);

  // Only fetch conversations if user is authenticated and not loading
  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: () => apiClient.request('/chat/conversations'),
    enabled: isAuthenticated && !!user && !loading,
    refetchInterval: 30000,
  });

  // Fetch messages for selected chat
  const { data: chatMessages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['chat-messages', selectedChat],
    queryFn: () => {
      if (!selectedChat || !user) return [];
      return apiClient.request(`/chat/messages/${user.id}/${selectedChat}`);
    },
    enabled: !!selectedChat && !!user && isAuthenticated && !loading,
    refetchInterval: 5000,
  });

  // Update messages when data changes - with proper dependency
  useEffect(() => {
    if (chatMessages && Array.isArray(chatMessages)) {
      // Filter out any invalid messages and ensure they have the required structure
      const validMessages = chatMessages.filter(msg => 
        msg && 
        typeof msg === 'object' && 
        msg.id && 
        msg.senderId && 
        msg.recipientId && 
        msg.message && 
        msg.timestamp
      );
      
      // Only update if the messages have actually changed
      const messagesChanged = JSON.stringify(validMessages) !== JSON.stringify(prevMessagesRef.current);
      if (messagesChanged) {
        setMessages(validMessages);
        prevMessagesRef.current = validMessages;
      }
    }
  }, [chatMessages]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      if (message.senderId === selectedChat || message.recipientId === selectedChat) {
        // Validate message structure before adding
        if (message && typeof message === 'object' && message.id && message.message && message.timestamp) {
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => msg.id === message.id);
            if (exists) return prev;
            return [...prev, message];
          });
        }
      }
    };

    socket.on('message', handleNewMessage);

    return () => {
      socket.off('message', handleNewMessage);
    };
  }, [socket, selectedChat]); // Remove refetchConversations from dependencies

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user || !socket) return;

    const messageData = {
      recipientId: selectedChat,
      message: newMessage.trim(),
    };

    // Optimistically add message to UI
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      recipientId: selectedChat,
      message: String(newMessage.trim()),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages(prev => {
      // Ensure prev is an array
      if (!Array.isArray(prev)) return [tempMessage];
      return [...prev, tempMessage];
    });
    setNewMessage('');

    // Send via socket
    socket.emit('send_message', messageData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const selectedConversation = conversations.find((conv: ChatConversation) => conv.partnerId === selectedChat);

  // Don't render if user is not authenticated or still loading
  if (!isAuthenticated || !user || loading) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full h-14 w-14 p-0"
          size="lg"
        >
          <MessageSquare className="h-6 w-6" />
          {conversations.some((conv: ChatConversation) => conv.unreadCount > 0) && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold"
            >
              {conversations.reduce((sum: number, conv: ChatConversation) => sum + conv.unreadCount, 0)}
            </Badge>
          )}
        </Button>
      </div>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
        }`}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">TutorsPool Chat</h3>
                  <p className="text-xs text-white/80">Connect with your learning community</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedChat(null);
                    setIsMinimized(false);
                  }}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <div className="flex h-[420px]">
                {/* Chat List */}
                <div className="w-1/2 border-r border-gray-200">
                  <ScrollArea className="h-full">
                    <div className="p-2">
                      {conversations.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No conversations yet</p>
                        </div>
                      ) : (
                        conversations.map((conversation: ChatConversation) => {
                          // Safety check to ensure conversation has required properties
                          if (!conversation || typeof conversation !== 'object' || !conversation.partnerId || !conversation.partnerName) {
                            return null;
                          }
                          
                          return (
                            <div
                              key={conversation.partnerId}
                              onClick={() => setSelectedChat(conversation.partnerId)}
                              className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                                selectedChat === conversation.partnerId 
                                  ? 'bg-purple-50 border border-purple-200' 
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={conversation.partnerAvatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                                    {getInitials(conversation.partnerName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm text-gray-900 truncate">
                                      {String(conversation.partnerName)}
                                    </h4>
                                    <span className="text-xs text-gray-500">
                                      {formatTime(conversation.lastMessageTime || new Date().toISOString())}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 truncate mt-1">
                                    {String(conversation.lastMessage || '')}
                                  </p>
                                </div>
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </div>
                
                {/* Chat Window */}
                <div className="flex-1 flex flex-col">
                  {selectedChat ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedConversation?.partnerAvatar} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                              {selectedConversation ? getInitials(selectedConversation.partnerName) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-sm text-gray-900">
                              {selectedConversation?.partnerName || 'Unknown User'}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {isConnected ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <ScrollArea className="flex-1 p-3">
                        <div className="space-y-3">
                          {messages.map((message) => {
                            // Safety check to ensure message has required properties
                            if (!message || typeof message !== 'object' || !message.id || !message.message) {
                              return null;
                            }
                            
                            return (
                              <div
                                key={message.id}
                                className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[80%] p-3 rounded-lg ${
                                    message.senderId === user?.id
                                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                      : 'bg-gray-100 text-gray-900'
                                  }`}
                                >
                                  <p className="text-sm">{String(message.message)}</p>
                                  <p className={`text-xs mt-1 ${
                                    message.senderId === user?.id ? 'text-white/70' : 'text-gray-500'
                                  }`}>
                                    {formatTime(message.timestamp || new Date().toISOString())}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="p-3 border-t border-gray-200">
                        <div className="flex space-x-2">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="flex-1"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            size="sm"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                      <h4 className="font-medium text-gray-700 mb-2">Welcome to TutorsPool Chat</h4>
                      <p className="text-sm text-gray-500">
                        Select a conversation from the list to start chatting with your tutors or students.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChat;
