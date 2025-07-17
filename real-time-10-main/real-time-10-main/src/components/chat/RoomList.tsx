import { useState } from 'react';
import { Room } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Hash, Lock, Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface RoomListProps {
  rooms: Room[];
  currentRoom: string;
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: (name: string, type: 'public' | 'private') => void;
}

export const RoomList = ({ rooms, currentRoom, onJoinRoom, onCreateRoom }: RoomListProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [roomType, setRoomType] = useState<'public' | 'private'>('public');

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      onCreateRoom(newRoomName.trim(), roomType);
      setNewRoomName('');
      setIsCreateOpen(false);
    }
  };

  const publicRooms = rooms.filter(room => room.type === 'public');
  const privateRooms = rooms.filter(room => room.type === 'private');

  return (
    <div className="w-64 border-r bg-muted/50">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Rooms</h3>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roomName">Room Name</Label>
                  <Input
                    id="roomName"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Enter room name..."
                  />
                </div>
                <div>
                  <Label>Room Type</Label>
                  <RadioGroup value={roomType} onValueChange={(value: 'public' | 'private') => setRoomType(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public">Public</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private">Private</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button onClick={handleCreateRoom} className="w-full">
                  Create Room
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-4 space-y-4">
          {/* Public Rooms */}
          {publicRooms.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Public Rooms
              </h4>
              <div className="space-y-1">
                {publicRooms.map((room) => (
                  <Button
                    key={room.id}
                    variant={currentRoom === room.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => onJoinRoom(room.id)}
                  >
                    <Hash className="h-4 w-4 mr-2" />
                    <span className="flex-1 text-left">{room.name}</span>
                    {room.unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {room.unreadCount}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Private Rooms */}
          {privateRooms.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Private Rooms
              </h4>
              <div className="space-y-1">
                {privateRooms.map((room) => (
                  <Button
                    key={room.id}
                    variant={currentRoom === room.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => onJoinRoom(room.id)}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    <span className="flex-1 text-left">{room.name}</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className="text-xs">{room.participants.length}</span>
                      {room.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-1">
                          {room.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};