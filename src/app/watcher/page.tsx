/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import TransactionTimeline from './TransactionTimeline';
import WhaleWatcher from './WhaleWatcher';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Icon } from 'lucide-react';
import { whale } from '@lucide/lab';

export default function WatcherPage() {
  const [activeTab, setActiveTab] = useState('wallet');

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <Tabs defaultValue="wallet" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-center mb-6">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>Wallet Watcher</span>
            </TabsTrigger>
            <TabsTrigger value="whale" className="flex items-center gap-2">
              <Icon iconNode={whale} className="h-4 w-4" />
              <span>Whale Watcher</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="wallet" className="mt-0">
          <TransactionTimeline />
        </TabsContent>
        
        <TabsContent value="whale" className="mt-0">
          <WhaleWatcher />
        </TabsContent>
      </Tabs>
    </div>
  );
}