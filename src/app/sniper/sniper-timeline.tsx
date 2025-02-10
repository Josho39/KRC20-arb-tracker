'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, RefreshCw, Loader2, TrendingUp, TrendingDown, AlertCircle, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const LiveBadge = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(v => !v);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Badge variant="outline" className={cn(
      "ml-2 transition-opacity duration-500 bg-green-500/10",
      isVisible ? "opacity-100" : "opacity-30"
    )}>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Live
      </div>
    </Badge>
  );
};

interface SnipeData {
  _id: string;
  token_address: string;
  alert_message: string;
  change_percentage: number;
  direction: 'increase' | 'decrease';
  timestamp: string;
}

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

const SniperTimeline = () => {
  const [snipes, setSnipes] = useState<SnipeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationThreshold, setNotificationThreshold] = useState(5);
  const [minPercentageFilter, setMinPercentageFilter] = useState(0);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('telegramUser');
    if (storedUser) {
      setTelegramUser(JSON.parse(storedUser));
      fetchNotificationSettings();
    }
  }, []);

  const fetchNotificationSettings = async () => {
    if (!telegramUser?.id) return;
    
    try {
      const response = await fetch(`/api/notifications/settings?telegramId=${telegramUser.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      const data = await response.json();
      console.log('Fetched settings:', data);
      setNotificationsEnabled(data.enabled);
      setNotificationThreshold(data.threshold);
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
    }
  };

  const handleNotificationSettingChange = async (newEnabled: boolean) => {
    if (!telegramUser) {
      setError('Please log in with Telegram first');
      return;
    }

    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: telegramUser.id,
          enabled: newEnabled,
          threshold: notificationThreshold
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update notification settings');
      }

      const data = await response.json();
      if (data.success) {
        setNotificationsEnabled(newEnabled);
        setError(null);
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (err) {
      console.error('Handler error:', err);
      setError('Failed to update notification settings');
      setNotificationsEnabled(!newEnabled);
    }
  };

  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/snipes/stream');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnectionStatus('connected');
      setError(null);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    eventSource.onmessage = (event) => {
      const newSnipe = JSON.parse(event.data);
      setSnipes(currentSnipes => [newSnipe, ...currentSnipes].slice(0, 100));
    };

    eventSource.onerror = () => {
      setConnectionStatus('error');
      eventSource.close();
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = undefined;
          connectSSE();
        }, 5000);
      }
    };

    return eventSource;
  }, []);

  const fetchSnipes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/snipes');
      if (!response.ok) throw new Error('Failed to fetch snipes');
      const data = await response.json();
      setSnipes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load snipes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSnipes();
    const eventSource = connectSSE();

    return () => {
      eventSource.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectSSE]);

  const filteredSnipes = snipes.filter(snipe => {
    const matchesSearch = snipe.token_address.toLowerCase().includes(filter.toLowerCase());
    const meetsThreshold = Math.abs(snipe.change_percentage) >= minPercentageFilter;
    return matchesSearch && meetsThreshold;
  });

  return (
    <div className="container max-w-screen-2xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Button 
                onClick={fetchSnipes} 
                disabled={isLoading}
                className="flex items-center gap-2" 
                variant="outline"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="hidden sm:inline">Refresh Price Alerts</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
              <LiveBadge />
              {connectionStatus === 'error' && (
                <Badge >
              
              .
                </Badge>
              )}
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Alert Settings</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 py-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Telegram Notifications
                      </Label>
                      <Switch
                        id="notifications"
                        checked={notificationsEnabled}
                        onCheckedChange={(checked) => {
                          handleNotificationSettingChange(checked).catch(error => {
                            console.error('Switch error:', error);
                            setError('Failed to update notification settings');
                          });
                        }}
                      />
                    </div>
                    {notificationsEnabled && (
                      <div className="space-y-2">
                        <Label>Notification Threshold (%)</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[notificationThreshold]}
                            onValueChange={(values) => {
                              setNotificationThreshold(values[0]);
                              handleNotificationSettingChange(notificationsEnabled);
                            }}
                            min={0}
                            max={50}
                            step={0.5}
                            className="flex-1"
                          />
                          <span className="min-w-[3rem] text-sm">{notificationThreshold}%</span>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Filter Changes Above (%)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[minPercentageFilter]}
                          onValueChange={(values) => setMinPercentageFilter(values[0])}
                          min={0}
                          max={50}
                          step={0.5}
                          className="flex-1"
                        />
                        <span className="min-w-[3rem] text-sm">{minPercentageFilter}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
              <Input
                type="text"
                placeholder="Filter by token..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:max-w-sm"
              />
              <div className="text-sm text-muted-foreground w-full sm:w-auto">
                Total Alerts: {snipes.length}
              </div>
            </div>

            <div className="space-y-8">
              {error && (
                <div className="text-sm bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredSnipes.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No price alerts found
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border/50 to-transparent" />
                  
                  {filteredSnipes.map((snipe) => {
                    const date = new Date(snipe.timestamp);
                    const formattedTime = date.toLocaleTimeString();
                    const formattedDate = date.toLocaleDateString();
                    const isIncrease = snipe.direction === 'increase';
                    
                    return (
                      <div key={snipe._id} className="relative pl-8 pb-8 group">
                        <div className={`absolute left-0 w-3 h-3 rounded-full -translate-x-1/2 
                          ${isIncrease ? 'bg-green-500' : 'bg-red-500'}
                          shadow-lg shadow-${isIncrease ? 'green' : 'red'}-500/50
                          transition-all duration-4000 ease-in-out
                          animate-pulse`} 
                        />
                        
                        <div className={`bg-card rounded-lg border p-6 shadow-sm
                          transition-all duration-300
                          hover:shadow-xl hover:scale-[1.01]
                          ${isIncrease ? 'hover:border-green-500/50' : 'hover:border-red-500/50'}`}>
                          <div className="flex flex-col sm:flex-row justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-full
                                ${isIncrease ? 'bg-green-500/10' : 'bg-red-500/10'}
                                transition-colors duration-300`}>
                                {isIncrease ? (
                                  <TrendingUp className="h-5 w-5 text-green-500" />
                                ) : (
                                  <TrendingDown className="h-5 w-5 text-red-500" />
                                )}
                                <span className={`font-semibold text-base ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                                  {snipe.token_address}
                                </span>
                              </div>
                              <span className={`flex items-center gap-1 text-base font-medium
                                ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                                {isIncrease ? (
                                  <ArrowUp className="h-5 w-5" />
                                ) : (
                                  <ArrowDown className="h-5 w-5" />
                                )}
                                {Math.abs(snipe.change_percentage).toFixed(2)}%
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                              {formattedDate} {formattedTime}
                            </div>
                          </div>
                          
                          <p className="mt-3 text-sm text-muted-foreground">
                            {snipe.alert_message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SniperTimeline;