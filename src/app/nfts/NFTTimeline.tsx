/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Loader2, TrendingUp, TrendingDown, AlertCircle, Bell, Maximize2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

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

interface NFTData {
  _id: string;
  type: 'floor_price_change' | 'new_mint';
  name: string;
  old_floor_price?: number;
  new_floor_price?: number;
  floor_price?: number;
  total_volume?: number;
  volume_24h?: number;
  change_24h?: number;
  message: string;
  timestamp: string;
}

const NFTTimeline = () => {
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchNFTs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/nfts');
      if (!response.ok) throw new Error('Failed to fetch NFTs');
      const data = await response.json();
      setNfts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load NFTs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  const filteredNFTs = nfts.filter(nft =>
    nft.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container max-w-screen-2xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                onClick={fetchNFTs}
                disabled={isLoading}
                className="flex items-center gap-2"
                variant="outline"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="hidden sm:inline">Refresh NFT Alerts</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
              <LiveBadge />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
              <Input
                type="text"
                placeholder="Filter by name..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:max-w-sm"
              />
              <div className="text-sm text-muted-foreground w-full sm:w-auto">
                Total Alerts: {nfts.length}
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
              ) : filteredNFTs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No NFT alerts found
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border/50 to-transparent" />

                  {filteredNFTs.map((nft) => {
                    const date = new Date(nft.timestamp);
                    const formattedTime = date.toLocaleTimeString();
                    const formattedDate = date.toLocaleDateString();
                    const isFloorChange = nft.type === 'floor_price_change';
                    const priceIncrease = isFloorChange && nft.new_floor_price! > nft.old_floor_price!;
                    const imageUrl = `https://cache.krc721.stream/krc721/mainnet/thumbnail/${nft.name}/1`;

                    return (
                      <div key={nft._id} className="relative pl-8 pb-8 group">
                        <div className={`absolute left-0 w-3 h-3 rounded-full -translate-x-1/2 
                          ${isFloorChange ? (priceIncrease ? 'bg-green-500' : 'bg-red-500') : 'bg-blue-500'}
                          shadow-lg shadow-${isFloorChange ? (priceIncrease ? 'green' : 'red') : 'blue'}-500/50
                          transition-all duration-4000 ease-in-out
                          animate-pulse`}
                        />

                        <div className={`bg-card rounded-lg border p-6 shadow-sm
                          transition-all duration-300
                          hover:shadow-xl hover:scale-[1.01]
                          ${isFloorChange ? (priceIncrease ? 'hover:border-green-500/50' : 'hover:border-red-500/50') : 'hover:border-blue-500/50'}`}>
                          <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="relative group">
                                {!isFloorChange && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute -top-2 -right-2 bg-background h-6 w-6 rounded-full"
                                    onClick={() => setSelectedImage(imageUrl)}
                                  >
                                    <Maximize2 className="h-4 w-4" />
                                  </Button>
                                )}
                                <img
                                  src={imageUrl}
                                  alt={nft.name}
                                  className={cn(
                                    "w-12 h-12 rounded-full object-cover",
                                    !isFloorChange && "cursor-pointer"
                                  )}
                                  onClick={() => !isFloorChange && setSelectedImage(imageUrl)}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full
                                  ${isFloorChange ? (priceIncrease ? 'bg-green-500/10' : 'bg-red-500/10') : 'bg-blue-500/10'}
                                  transition-colors duration-300`}>
                                  {isFloorChange ? (
                                    priceIncrease ? (
                                      <TrendingUp className="h-5 w-5 text-green-500" />
                                    ) : (
                                      <TrendingDown className="h-5 w-5 text-red-500" />
                                    )
                                  ) : (
                                    <Bell className="h-5 w-5 text-blue-500" />
                                  )}
                                  <span className={`font-semibold text-base ${
                                    isFloorChange ? (priceIncrease ? 'text-green-500' : 'text-red-500') : 'text-blue-500'
                                  }`}>
                                    {nft.name}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  {!isFloorChange && (
                                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                                      New Mint
                                    </Badge>
                                  )}
                                  {isFloorChange && (
                                    <Badge 
                                      variant="secondary" 
                                      className={cn(
                                        priceIncrease ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                      )}
                                    >
                                      Floor Change
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                              {formattedDate} {formattedTime}
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {isFloorChange ? (
                              <>
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground">Old Floor Price</span>
                                  <span className="font-medium">{nft.old_floor_price}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground">New Floor Price</span>
                                  <span className="font-medium">{nft.new_floor_price}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground">Change</span>
                                  <span className={`font-medium ${priceIncrease ? 'text-green-500' : 'text-red-500'}`}>
                                    {priceIncrease ? '+' : '-'}
                                    {Math.abs(((nft.new_floor_price! - nft.old_floor_price!) / nft.old_floor_price!) * 100).toFixed(2)}%
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground">Floor Price</span>
                                  <span className="font-medium">{nft.floor_price}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground">24h Volume</span>
                                  <span className="font-medium">{nft.volume_24h}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground">Total Volume</span>
                                  <span className="font-medium">{nft.total_volume}</span>
                                </div>
                              </>
                            )}
                          </div>
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

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-2xl">
          <div className="sr-only">
            <DialogTitle>NFT Image Preview</DialogTitle>
          </div>
          <div className="relative aspect-square w-full">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="NFT"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NFTTimeline;