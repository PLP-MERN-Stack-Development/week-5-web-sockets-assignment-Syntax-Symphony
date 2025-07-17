import { User } from '@/hooks/useSocket';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface UserListProps {
  users: User[];
  currentUser: string;
  onPrivateMessage: (userId: string) => void;
}

export const UserList = ({ users, currentUser, onPrivateMessage }: UserListProps) => {
  const onlineUsers = users.filter(user => user.isOnline && user.id !== currentUser);
  const offlineUsers = users.filter(user => !user.isOnline && user.id !== currentUser);

  return (
    <div className="w-64 border-l bg-muted/50">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Users ({users.length})</h3>
      </div>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-4 space-y-4">
          {/* Online Users */}
          {onlineUsers.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Online ({onlineUsers.length})
              </h4>
              <div className="space-y-2">
                {onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.username}</p>
                        <Badge variant="secondary" className="text-xs">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                          Online
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onPrivateMessage(user.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offline Users */}
          {offlineUsers.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Offline ({offlineUsers.length})
              </h4>
              <div className="space-y-2">
                {offlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 opacity-60">
                        <AvatarFallback>
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium opacity-60">{user.username}</p>
                        <Badge variant="outline" className="text-xs">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-1" />
                          Offline
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onPrivateMessage(user.id)}
                      disabled
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};