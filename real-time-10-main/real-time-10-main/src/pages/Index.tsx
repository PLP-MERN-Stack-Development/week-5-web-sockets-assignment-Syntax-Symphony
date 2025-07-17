import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/chat/LoginForm';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { useSocket } from '@/hooks/useSocket';

const Index = () => {
  const [username, setUsername] = useState<string | null>(null);
  const { connect, disconnect } = useSocket();

  useEffect(() => {
    // Check if user was previously logged in
    const savedUsername = localStorage.getItem('chatUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      connect(savedUsername);
    }
  }, [connect]);

  const handleLogin = (newUsername: string) => {
    setUsername(newUsername);
    localStorage.setItem('chatUsername', newUsername);
    connect(newUsername);
  };

  const handleLogout = () => {
    disconnect();
    setUsername(null);
    localStorage.removeItem('chatUsername');
  };

  if (!username) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <ChatLayout username={username} onLogout={handleLogout} />;
};

export default Index;
