/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RefreshCw, AlertCircle, Zap, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface VelocityAlert {
  _id: string;
  ticker: string;
  category: string;
  set: string;
  threshold: number;
  elapsed: number;
  message_text: string;
  timestamp: number;
  telegram_message_id: number;
  action: string;
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const VelocityPage = () => {
  const [velocityAlerts, setVelocityAlerts] = useState<VelocityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const fetchVelocityData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/velocity');
      
      if (!response.ok) {
        throw new Error('Failed to fetch velocity data');
      }
      
      const data = await response.json();
      setVelocityAlerts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch velocity data');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVelocityData();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [categoryFilter, itemsPerPage]);

  const getCategories = () => {
    const categories = new Set(velocityAlerts.map(alert => alert.category));
    return Array.from(categories);
  };

  const filteredAlerts = velocityAlerts.filter(alert => {
    const matchesText = alert.ticker.toLowerCase().includes(filter.toLowerCase()) ||
                       alert.message_text.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || alert.category === categoryFilter;
    
    return matchesText && matchesCategory;
  });
  
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const paginatedAlerts = filteredAlerts.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mint':
        return 'bg-green-500/10 text-green-500 font-medium';
      case 'normal':
        return 'bg-blue-500/10 text-blue-500 font-medium';
      case 'volume':
        return 'bg-purple-500/10 text-purple-500 font-medium';
      case 'price':
        return 'bg-amber-500/10 text-amber-500 font-medium';
      default:
        return 'bg-gray-500/10 text-gray-500 font-medium';
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Zap className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <CardTitle>Velocity</CardTitle>
                <CardDescription>
                  High-speed trading and market analysis alerts
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={fetchVelocityData}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Filter by ticker or message..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Alert Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alert Types</SelectItem>
                {getCategories().map(category => (
                  <SelectItem key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)} Alerts</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Zap className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No velocity alerts found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or refreshing the data</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticker</TableHead>
                      <TableHead>Alert Type</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Elapsed Time</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAlerts.map((alert) => (
                      <TableRow key={alert._id}>
                        <TableCell className="font-medium">{alert.ticker}</TableCell>
                        <TableCell>
                          <Badge className={getCategoryBadgeColor(alert.category)}>
                            {alert.category.toUpperCase()} ALERT
                          </Badge>
                        </TableCell>
                        <TableCell>{alert.threshold}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{alert.elapsed.toFixed(2)} sec</span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{formatDate(alert.timestamp)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredAlerts.length > 0 ? currentPage * itemsPerPage + 1 : 0} to {Math.min((currentPage + 1) * itemsPerPage, filteredAlerts.length)} of {filteredAlerts.length} alerts
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="25" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">per page</span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage === 0 || filteredAlerts.length === 0}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0 || filteredAlerts.length === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1 || filteredAlerts.length === 0}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1 || filteredAlerts.length === 0}
                  >
                    Last
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VelocityPage;