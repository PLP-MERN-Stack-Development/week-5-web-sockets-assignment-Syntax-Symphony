import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Message, User } from '@/hooks/useSocket';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, ThumbsUp, Smile, MoreHorizontal, Reply } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageListProps {
  messages: Message[];
  currentUser: string;
  users: User[];
  onReaction: (messageId: string, reaction: string) => void;
  onMarkAsRead: (messageId: string) => void;
  onLoadMore: (before: Date) => void;
}

export const MessageList = ({ 
  messages, 
  currentUser, 
  users, 
  onReaction, 
  onMarkAsRead,
  onLoadMore 
}: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasMore && messages.length > 0) {
      onLoadMore(messages[0].timestamp);
    }
  };

  const getUser = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  const reactions = [
    { emoji: '👍', key: 'like', icon: ThumbsUp },
    { emoji: '❤️', key: 'love', icon: Heart },
    { emoji: '😂', key: 'laugh', icon: Smile },
  ];

  return (
    <ScrollArea 
      className="flex-1 p-4" 
      onScrollCapture={handleScroll}
      ref={scrollRef}
    >
      <div className="space-y-4">
        {messages.map((message) => {
          const user = getUser(message.sender);
          const isCurrentUser = message.sender === currentUser;
          
          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isCurrentUser && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[70%] ${isCurrentUser ? 'order-first' : ''}`}>
                {!isCurrentUser && (
                  <div className="text-sm text-muted-foreground mb-1">
                    {user?.username || 'Unknown User'}
                  </div>
                )}
                
                <div
                  className={`relative group rounded-lg p-3 ${
                    isCurrentUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.type === 'image' ? (
                    <img 
                      src={message.content} 
                      alt="Shared image" 
                      className="max-w-full rounded-md"
                    />
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {format(new Date(message.timestamp), 'HH:mm')}
                    </span>
                    
                    {message.readBy && message.readBy.length > 0 && (
                      <span className="text-xs opacity-70">
                        Read by {message.readBy.length}
                      </span>
                    )}
                  </div>

                  {/* Reaction buttons (hidden, shown on hover) */}
                  <div className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1 bg-background border rounded-full p-1 shadow-md">
                      {reactions.map((reaction) => (
                        <Button
                          key={reaction.key}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => onReaction(message.id, reaction.key)}
                        >
                          <span className="text-xs">{reaction.emoji}</span>
                        </Button>
                      ))}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onMarkAsRead(message.id)}>
                            <Reply className="mr-2 h-4 w-4" />
                            Reply
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Display reactions */}
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {Object.entries(message.reactions).map(([reaction, userIds]) => {
                      if (userIds.length === 0) return null;
                      const reactionEmoji = reactions.find(r => r.key === reaction)?.emoji || '👍';
                      return (
                        <Badge
                          key={reaction}
                          variant="secondary"
                          className="text-xs cursor-pointer"
                          onClick={() => onReaction(message.id, reaction)}
                        >
                          {reactionEmoji} {userIds.length}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              {isCurrentUser && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {currentUser.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};