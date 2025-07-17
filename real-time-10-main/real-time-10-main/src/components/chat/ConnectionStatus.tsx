import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  reconnectAttempts: number;
}

export const ConnectionStatus = ({ isConnected, reconnectAttempts }: ConnectionStatusProps) => {
  if (isConnected) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        <Wifi className="h-3 w-3 mr-1" />
        Connected
      </Badge>
    );
  }

  if (reconnectAttempts > 0) {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
        <RotateCcw className="h-3 w-3 mr-1 animate-spin" />
        Reconnecting... ({reconnectAttempts}/5)
      </Badge>
    );
  }

  return (
    <Badge variant="destructive">
      <WifiOff className="h-3 w-3 mr-1" />
      Disconnected
    </Badge>
  );
};