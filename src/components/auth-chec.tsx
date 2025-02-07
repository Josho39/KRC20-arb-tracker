'use client';

import React, { useEffect, useState } from 'react';
import TelegramLogin from '@/components/telegram-login';

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck = ({ children }: AuthCheckProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const telegramUser = localStorage.getItem('telegramUser');
    setIsAuthenticated(!!telegramUser);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <h2 className="text-2xl font-semibold text-center">Please Sign In to Access Tools</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Sign in with Telegram to access all available tools and features.
        </p>
        <TelegramLogin />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthCheck;