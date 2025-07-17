import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Image } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string, type?: 'text' | 'image' | 'file') => void;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
}

export const MessageInput = ({ 
  onSendMessage, 
  onTyping, 
  onStopTyping, 
  disabled 
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      handleStopTyping();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      onTyping();
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      onStopTyping();
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload the file to a server and get a URL
      const reader = new FileReader();
      reader.onload = () => {
        onSendMessage(reader.result as string, type);
      };
      if (type === 'image') {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  return (
    <div className="border-t bg-background p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex gap-1">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled}
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
        
        <Input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={handleInputChange}
          onBlur={handleStopTyping}
          disabled={disabled}
          className="flex-1"
        />
        
        <Button type="submit" disabled={!message.trim() || disabled}>
          <Send className="h-4 w-4" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={(e) => handleFileUpload(e, 'file')}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFileUpload(e, 'image')}
        />
      </form>
    </div>
  );
};