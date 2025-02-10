/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useEffect, useRef } from 'react';
import { TelegramAuthData, handleTelegramAuth } from '@/utils/telegram-auth';

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramAuthData) => void;
  }
}

const TelegramLogin = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    window.onTelegramAuth = async (user: TelegramAuthData) => {
      try {
        console.log('Received auth data:', user);
        const authResult = await handleTelegramAuth(user);
        console.log('Auth result:', authResult);

        try {
          const saveResponse = await fetch('/api/users/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...authResult,
              telegramId: authResult.id
            }),
          });

          if (!saveResponse.ok) {
            console.error('Failed to save user data:', await saveResponse.text());
          }
        } catch (saveError) {
          console.error('Error saving user:', saveError);
        }

        localStorage.setItem('telegramUser', JSON.stringify(authResult));
        window.location.reload();
      } catch (error) {
        console.error('Authentication error:', error);
      }
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'logintestkastoolsbot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '20');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={containerRef} />;
};

export default TelegramLogin;