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
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      
      window.onTelegramAuth = async (user) => {
        try {
          const authResult = await handleTelegramAuth(user);
          console.log('Authentication successful:', authResult);
          
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
            throw new Error('Failed to save user data');
          }

          const settingsResponse = await fetch('/api/notifications/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              telegramId: authResult.id,
              enabled: false,
              threshold: 5,
              settings: {
                token_alerts: true,
                price_changes: true,
                minimum_change_threshold: 5,
                preferred_exchanges: [],
                watched_tokens: []
              }
            }),
          });

          if (!settingsResponse.ok) {
            console.warn('Failed to initialize notification settings');
          }

          localStorage.setItem('telegramUser', JSON.stringify(authResult));
          window.location.reload();
        } catch (error) {
          console.error('Authentication failed:', error);
        }
      };
      
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.async = true;
      script.setAttribute('data-telegram-login', 'logintestkastoolsbot'); // Change to the bot we use for production
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '20');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.setAttribute('data-origin', origin);
      
      containerRef.current.appendChild(script);

      return () => {
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      };
    }
  }, [origin]);

  return <div ref={containerRef} />;
};

export default TelegramLogin;