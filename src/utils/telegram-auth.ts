import crypto from 'crypto';

export interface TelegramAuthData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export const verifyTelegramAuth = (authData: TelegramAuthData, botToken: string): boolean => {
  try {

    const { hash, ...data } = authData;
    const checkArr = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key as keyof typeof data]}`);
      
    const checkString = checkArr.join('\n');

    const secretKey = crypto
      .createHash('sha256')
      .update(botToken)
      .digest();

    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex');

    const isHashValid = hmac === hash;
    const isNotExpired = (Math.floor(Date.now() / 1000) - authData.auth_date) < 86400;

    return isHashValid && isNotExpired;
  } catch (error) {
    console.error('Telegram auth verification failed:', error);
    return false;
  }
}

export const handleTelegramAuth = async (authData: TelegramAuthData) => {
  const BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  
  if (!BOT_TOKEN) {
    throw new Error('Telegram bot token not configured');
  }

  if (verifyTelegramAuth(authData, BOT_TOKEN)) {
    // Auth is valid, you can now:
    // 1. Create a session
    // 2. Store user data
    // 3. Redirect user
    return authData;
  } else {
    throw new Error('Telegram authentication failed');
  }
}