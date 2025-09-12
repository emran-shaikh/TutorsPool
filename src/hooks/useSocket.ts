import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  message: string;
  timestamp: string;
  chatRoomId?: string;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socketInstance = io('http://localhost:5174', {
      auth: {
        token: token
      }
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      options.onConnect?.();
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
      options.onDisconnect?.();
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      options.onError?.(error);
    });

    socketInstance.on('receive-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socketInstance.on('user-typing', (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = (recipientId: string, message: string, chatRoomId?: string) => {
    if (socket && isConnected) {
      socket.emit('send-message', {
        recipientId,
        message,
        chatRoomId
      });
    }
  };

  const joinChat = (studentId: string, tutorId: string) => {
    if (socket && isConnected) {
      socket.emit('join-chat', { studentId, tutorId });
    }
  };

  const startTyping = (recipientId: string, chatRoomId?: string) => {
    if (socket && isConnected) {
      socket.emit('typing-start', { recipientId, chatRoomId });
    }
  };

  const stopTyping = (recipientId: string, chatRoomId?: string) => {
    if (socket && isConnected) {
      socket.emit('typing-stop', { recipientId, chatRoomId });
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    socket,
    isConnected,
    messages,
    typingUsers,
    sendMessage,
    joinChat,
    startTyping,
    stopTyping,
    clearMessages
  };
};
