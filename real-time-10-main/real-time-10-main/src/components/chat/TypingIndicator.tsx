import { User } from '@/hooks/useSocket';

interface TypingIndicatorProps {
  typingUsers: string[];
  users: User[];
  currentUser: string;
}

export const TypingIndicator = ({ typingUsers, users, currentUser }: TypingIndicatorProps) => {
  const typingOthers = typingUsers.filter(userId => userId !== currentUser);
  
  if (typingOthers.length === 0) return null;

  const getUsername = (userId: string) => {
    return users.find(u => u.id === userId)?.username || 'Someone';
  };

  const renderTypingText = () => {
    if (typingOthers.length === 1) {
      return `${getUsername(typingOthers[0])} is typing...`;
    } else if (typingOthers.length === 2) {
      return `${getUsername(typingOthers[0])} and ${getUsername(typingOthers[1])} are typing...`;
    } else {
      return `${getUsername(typingOthers[0])}, ${getUsername(typingOthers[1])} and ${typingOthers.length - 2} others are typing...`;
    }
  };

  return (
    <div className="px-4 py-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span>{renderTypingText()}</span>
      </div>
    </div>
  );
};