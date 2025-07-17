import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  roomId?: string;
  reactions?: Record<string, string[]>;
  readBy?: string[];
  replyTo?: string;
}

export interface User {
  id: string;
  username: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Room {
  id: string;
  name: string;
  type: 'public' | 'private';
  participants: string[];
  unreadCount: number;
}

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string>('general');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setReconnectAttempts(0);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('reconnect_attempt', (attempt) => {
      setReconnectAttempts(attempt);
    });

    socket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('messageHistory', (history: Message[]) => {
      setMessages(history);
    });

    socket.on('userJoined', (user: User) => {
      setUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
    });

    socket.on('userLeft', (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
    });

    socket.on('usersList', (usersList: User[]) => {
      setUsers(usersList);
    });

    socket.on('roomsList', (roomsList: Room[]) => {
      setRooms(roomsList);
    });

    socket.on('userTyping', (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (data.isTyping) {
          return [...prev.filter(id => id !== data.userId), data.userId];
        } else {
          return prev.filter(id => id !== data.userId);
        }
      });
    });

    socket.on('messageReaction', (data: { messageId: string; reaction: string; userId: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? {
              ...msg,
              reactions: {
                ...msg.reactions,
                [data.reaction]: [...(msg.reactions?.[data.reaction] || []), data.userId]
              }
            }
          : msg
      ));
    });

    socket.on('messageRead', (data: { messageId: string; userId: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, readBy: [...(msg.readBy || []), data.userId] }
          : msg
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const connect = (username: string) => {
    if (socketRef.current) {
      socketRef.current.auth = { username };
      socketRef.current.connect();
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const sendMessage = (content: string, type: 'text' | 'image' | 'file' = 'text', roomId?: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message', {
        content,
        type,
        roomId: roomId || currentRoom,
        timestamp: new Date()
      });
    }
  };

  const sendPrivateMessage = (content: string, recipientId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('privateMessage', {
        content,
        recipientId,
        timestamp: new Date()
      });
    }
  };

  const joinRoom = (roomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('joinRoom', roomId);
      setCurrentRoom(roomId);
    }
  };

  const createRoom = (name: string, type: 'public' | 'private' = 'public') => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('createRoom', { name, type });
    }
  };

  const startTyping = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('startTyping', currentRoom);
    }
  };

  const stopTyping = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('stopTyping', currentRoom);
    }
  };

  const addReaction = (messageId: string, reaction: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('addReaction', { messageId, reaction });
    }
  };

  const markAsRead = (messageId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('markAsRead', messageId);
    }
  };

  const loadMoreMessages = (before: Date) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('loadMessages', { before, roomId: currentRoom, limit: 20 });
    }
  };

  return {
    isConnected,
    messages,
    users,
    rooms,
    currentRoom,
    typingUsers,
    reconnectAttempts,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    joinRoom,
    createRoom,
    startTyping,
    stopTyping,
    addReaction,
    markAsRead,
    loadMoreMessages,
    setCurrentRoom
  };
};