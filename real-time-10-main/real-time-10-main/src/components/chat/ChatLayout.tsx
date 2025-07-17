import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { UserList } from './UserList';
import { RoomList } from './RoomList';
import { TypingIndicator } from './TypingIndicator';
import { ConnectionStatus } from './ConnectionStatus';
import { Button } from '@/components/ui/button';
import { LogOut, Bell, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatLayoutProps {
  username: string;
  onLogout: () => void;
}

export const ChatLayout = ({ username, onLogout }: ChatLayoutProps) => {
  const {
    isConnected,
    messages,
    users,
    rooms,
    currentRoom,
    typingUsers,
    reconnectAttempts,
    sendMessage,
    sendPrivateMessage,
    joinRoom,
    createRoom,
    startTyping,
    stopTyping,
    addReaction,
    markAsRead,
    loadMoreMessages,
  } = useSocket();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === 'granted');
      });
    }
  }, []);

  // Show notifications for new messages
  useEffect(() => {
    if (messages.length > 0 && notificationsEnabled) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender !== username && document.hidden) {
        new Notification(`New message from ${lastMessage.sender}`, {
          body: lastMessage.content,
          icon: '/favicon.ico'
        });
        
        // Play notification sound
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {
          // Ignore audio play errors (user hasn't interacted with page yet)
        });
      }
    }
  }, [messages, notificationsEnabled, username]);

  // Show toast for user join/leave
  useEffect(() => {
    const currentUser = users.find(u => u.username === username);
    if (currentUser) {
      users.forEach(user => {
        if (user.id !== currentUser.id) {
          toast({
            title: user.isOnline ? "User joined" : "User left",
            description: `${user.username} ${user.isOnline ? 'joined' : 'left'} the chat`,
          });
        }
      });
    }
  }, [users, username, toast]);

  const handlePrivateMessage = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      // In a real app, you'd create a private room or open a DM interface
      toast({
        title: "Private Message",
        description: `Starting private chat with ${user.username}`,
      });
    }
  };

  const toggleNotifications = () => {
    if (!notificationsEnabled && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === 'granted');
      });
    } else {
      setNotificationsEnabled(!notificationsEnabled);
    }
  };

  const currentRoomName = rooms.find(r => r.id === currentRoom)?.name || currentRoom;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Chat App</h1>
            <div className="text-sm text-muted-foreground">
              #{currentRoomName}
            </div>
            <ConnectionStatus 
              isConnected={isConnected} 
              reconnectAttempts={reconnectAttempts}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Welcome, {username}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleNotifications}
            >
              {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Room List */}
        <RoomList
          rooms={rooms}
          currentRoom={currentRoom}
          onJoinRoom={joinRoom}
          onCreateRoom={createRoom}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <MessageList
            messages={messages.filter(m => !m.roomId || m.roomId === currentRoom)}
            currentUser={username}
            users={users}
            onReaction={addReaction}
            onMarkAsRead={markAsRead}
            onLoadMore={loadMoreMessages}
          />
          
          <TypingIndicator
            typingUsers={typingUsers}
            users={users}
            currentUser={username}
          />
          
          <MessageInput
            onSendMessage={sendMessage}
            onTyping={startTyping}
            onStopTyping={stopTyping}
            disabled={!isConnected}
          />
        </div>

        {/* User List */}
        <UserList
          users={users}
          currentUser={username}
          onPrivateMessage={handlePrivateMessage}
        />
      </div>
    </div>
  );
};