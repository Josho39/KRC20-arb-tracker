/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Icon, ChevronLeft, ChevronRight } from 'lucide-react';
import { whale } from '@lucide/lab';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Operation {
  p?: string;
  op?: string;
  tick?: string;
  amt?: string;
  from?: string;
  to?: string;
}

interface WhaleTransaction {
  _id: string;
  transaction_id?: string;
  tx_type?: string;
  sender?: string;
  receiver?: string;
  wallet?: string;
  amount?: string;
  operation?: Operation;
  message?: string;
  timestamp: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatKRC20Amount = (amount?: string, tick?: string): string => {
  if (!amount || !tick) return 'N/A';
  
  const numAmount = parseFloat(amount) / 100000000;
  return `${numAmount.toFixed(6)} ${tick}`;
};

const formatTxType = (txType?: string): string => {
  if (!txType) return 'unknown';
  
  return txType.replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const WhaleWatcher = () => {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/transactions/whales');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch whale transactions');
      }
      
      const data = await response.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch whale transactions');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [itemsPerPage]);

  const safeStringIncludes = (str?: string, searchStr?: string): boolean => {
    if (!str || !searchStr) return false;
    return str.toLowerCase().includes(searchStr.toLowerCase());
  };

  const filteredTransactions = transactions.filter(tx => {
    if (!filter) return true;
    
    const searchLower = filter.toLowerCase();
    return (
      safeStringIncludes(tx.transaction_id, searchLower) ||
      safeStringIncludes(tx.sender, searchLower) ||
      safeStringIncludes(tx.receiver, searchLower) ||
      safeStringIncludes(tx.wallet, searchLower) ||
      safeStringIncludes(tx.amount, searchLower) ||
      safeStringIncludes(tx.operation?.tick, searchLower) ||
      safeStringIncludes(tx.operation?.from, searchLower) ||
      safeStringIncludes(tx.operation?.to, searchLower)
    );
  });
  
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col space-y-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon iconNode={whale} className="h-5 w-5" />
            <CardTitle>Whale Transactions</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Filter transactions..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No whale transactions found
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>From/Sender</TableHead>
                    <TableHead>To/Receiver</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((tx) => (
                    <TableRow key={tx._id}>
                      <TableCell>
                        <Badge 
                          variant={
                            tx.tx_type === 'received' ? 'default' : 
                            tx.tx_type === 'krc20' ? 'outline' : 'secondary'
                          }
                        >
                          {tx.tx_type === 'krc20' ? 
                            `${tx.tx_type.toUpperCase()} (${tx.operation?.op || 'transfer'})` : 
                            formatTxType(tx.tx_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-[150px] truncate" title={tx.tx_type === 'krc20' ? tx.operation?.from : tx.sender}>
                        {tx.tx_type === 'krc20' ? (tx.operation?.from || 'N/A') : (tx.sender || 'N/A')}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate" title={tx.tx_type === 'krc20' ? tx.operation?.to : tx.receiver}>
                        {tx.tx_type === 'krc20' ? (tx.operation?.to || tx.wallet || 'N/A') : (tx.receiver || 'N/A')}
                      </TableCell>
                      <TableCell>
                        {tx.tx_type === 'krc20' ? 
                          formatKRC20Amount(tx.operation?.amt, tx.operation?.tick) : 
                          (tx.amount || 'N/A')}
                      </TableCell>
                      <TableCell>{formatDate(tx.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
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
                  disabled={currentPage === 0}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1 || totalPages === 0}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage === totalPages - 1 || totalPages === 0}
                >
                  Last
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WhaleWatcher;