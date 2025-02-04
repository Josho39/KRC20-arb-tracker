/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { type Token, type ArbOpportunity, type SortConfig } from '@/types/token'
import { calculateArbs, calculateCombinedMarketData, getAllMarkets } from '@/lib/arbcalc'
import _ from 'lodash'

const BATCH_SIZE = 100
const API_DELAY = 100
const REFRESH_THRESHOLD = 100
const STORAGE_KEY = 'kasplex_tickers'

interface SelectedMarket {
    ticker: string
    market: string
    price: number
}

const ArbAnalyzer = () => {
    const [tokens, setTokens] = useState<Token[]>([])
    const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])
    const [filterTicker, setFilterTicker] = useState('')
    const [minVolume, setMinVolume] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState({ current: 0, total: 0 })
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
    const [showAllMarkets, setShowAllMarkets] = useState(true)
    const [ignoreZeroVolume, setIgnoreZeroVolume] = useState(false)
    const [selectedTickerMarkets, setSelectedTickerMarkets] = useState<SelectedMarket[]>([])
    const [hideXT, setHideXT] = useState(false)
    const [hideKSPRBot, setHideKSPRBot] = useState(false)

    const fetchTokenData = async (ticker: string): Promise<Token | null> => {
        try {
            const cleanedTicker = ticker.replace(/['"]/g, '').trim()
            if (!cleanedTicker) return null
            const response = await fetch(`https://api-v2-do.kas.fyi/token/krc20/${encodeURIComponent(cleanedTicker)}/info`)
            if (!response.ok) return null
            const data = await response.json()
            return data
        } catch (error) {
            return null
        }
    }

    const fetchAndUpdateTickers = async () => {
        try {
            setIsLoading(true)
            setError(null)
            setTokens([])
            let cachedTickers: string[] = []
            const cached = localStorage.getItem(STORAGE_KEY)
            if (cached) {
                try {
                    const parsed = JSON.parse(cached)
                    if (Array.isArray(parsed)) {
                        cachedTickers = parsed
                    }
                } catch (e) {
                    console.warn('Failed to parse cached tickers')
                }
            }
            let hasMore = true
            let nextParam: string | undefined
            const currentTickers: string[] = []
            while (hasMore) {
                const response = await fetch(`https://api.kasplex.org/v1/krc20/tokenlist${nextParam ? `?next=${nextParam}` : ''}`)
                if (!response.ok) throw new Error('Failed to fetch tickers')
                const data = await response.json()
                if (data.result) {
                    const newTickers = data.result.map((token: { tick: string }) => token.tick)
                    currentTickers.push(...newTickers)
                    setProgress({ current: currentTickers.length, total: currentTickers.length })
                }
                if (data.next && data.next !== nextParam) {
                    nextParam = data.next
                    await new Promise(resolve => setTimeout(resolve, 200))
                } else {
                    hasMore = false
                }
            }
            const uniqueCurrentTickers = [...new Set(currentTickers)]
            const newTickers = uniqueCurrentTickers.filter(ticker => !cachedTickers.includes(ticker))
            const allTickers = [...new Set([...cachedTickers, ...uniqueCurrentTickers])]
                .filter((t): t is string => Boolean(t && typeof t === 'string'))
                .map(t => t.trim())
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allTickers))
            setProgress({ current: 0, total: allTickers.length })
            const validTokens: Token[] = []
            const failedTokens: string[] = []
            let lastProcessedCount = 0
            for (let i = 0; i < allTickers.length; i += BATCH_SIZE) {
                const batch = allTickers.slice(i, i + BATCH_SIZE)
                const promises = batch.map(ticker =>
                    fetchTokenData(ticker)
                        .then(result => {
                            if (!result) failedTokens.push(ticker)
                            return result
                        })
                        .catch(() => {
                            failedTokens.push(ticker)
                            return null
                        })
                )
                const batchResults = await Promise.all(promises)
                const validBatchTokens = batchResults.filter((t): t is Token => t !== null)
                validTokens.push(...validBatchTokens)
                const currentProcessedCount = validTokens.length
                setProgress({
                    current: Math.min(i + BATCH_SIZE, allTickers.length),
                    total: allTickers.length
                })
                if (currentProcessedCount - lastProcessedCount >= REFRESH_THRESHOLD || 
                    i + BATCH_SIZE >= allTickers.length) {
                    setTokens([...validTokens])
                    lastProcessedCount = currentProcessedCount
                }
                await new Promise(resolve => setTimeout(resolve, API_DELAY))
            }
            setTokens([...validTokens])
            if (failedTokens.length > 0) {
                setError(`Loaded ${validTokens.length} tokens. Failed to load ${failedTokens.length} tokens. Found ${newTickers.length} new tickers.`)
            } else if (newTickers.length > 0) {
                setError(`Loaded ${validTokens.length} tokens successfully. Found ${newTickers.length} new tickers.`)
            }
        } catch (error) {
            setError(`Failed to load tickers: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsLoading(false)
            setProgress({ current: 0, total: 0 })
        }
    }

    const handleMarketRowClick = (ticker: string, market: string, price: number) => {
        setSelectedTickerMarkets(prev => {
            const currentSelected = prev.filter(m => m.ticker === ticker)
            const otherTickers = prev.filter(m => m.ticker !== ticker)
            if (currentSelected.find(m => m.market === market)) {
                return [...otherTickers, ...currentSelected.filter(m => m.market !== market)]
            }
            if (currentSelected.length >= 2) {
                return [...otherTickers, currentSelected[1], { ticker, market, price }]
            }
            return [...otherTickers, ...currentSelected, { ticker, market, price }]
        })
    }

    const getSpreadPercentage = (ticker: string) => {
        const markets = selectedTickerMarkets.filter(m => m.ticker === ticker)
        if (markets.length !== 2) return null
        const [market1, market2] = markets
        const avgPrice = (market1.price + market2.price) / 2
        const spread = Math.abs(market1.price - market2.price)
        return (spread / avgPrice) * 100
    }

    const isMarketSelected = (ticker: string, market: string) => {
        return selectedTickerMarkets.some(m => m.ticker === ticker && m.market === market)
    }

    const handleSort = (key: SortConfig['key']) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
            }
            return { key, direction: 'desc' }
        })
    }

    const filteredTokens = useMemo(() => {
        if (!hideXT && !hideKSPRBot) return tokens
        return tokens.map(token => ({
            ...token,
            marketsData: token.marketsData?.filter(market => {
                if (hideXT && market.name === 'XT') return false
                if (hideKSPRBot && market.name === 'KSPR Bot') return false
                return true
            })
        })).filter(token => token.marketsData && token.marketsData.length > 0)
    }, [tokens, hideXT, hideKSPRBot])

    const allMarkets = useMemo(() =>
        getAllMarkets(filteredTokens, ignoreZeroVolume, minVolume),
        [filteredTokens, ignoreZeroVolume, minVolume]
    )

    const sortedArbs = useMemo(() =>
        calculateArbs(filteredTokens, selectedMarkets, ignoreZeroVolume, minVolume),
        [filteredTokens, selectedMarkets, ignoreZeroVolume, minVolume]
    )

    const combinedMarketData = useMemo(() => {
        const data = calculateCombinedMarketData(filteredTokens, ignoreZeroVolume, minVolume)
        return _.orderBy(data, ['maxSpread'], ['desc'])
    }, [filteredTokens, ignoreZeroVolume, minVolume])

    const getSortedArbs = (arbs: ArbOpportunity[]) => {
        if (!sortConfig) return arbs
        return _.orderBy(
            arbs,
            [arb => {
                if (sortConfig.key.includes('.')) {
                    const [parent, child] = sortConfig.key.split('.')
                    return _.get(arb, `${parent}.${child}`)
                }
                return _.get(arb, sortConfig.key)
            }],
            [sortConfig.direction]
        )
    }

    const SortableHeader: React.FC<{
        column: SortConfig['key']
        children: React.ReactNode,
        className?: string
    }> = ({ column, children, className }) => (
        <TableHead
            className={`cursor-pointer hover:bg-muted/50 ${className}`}
            onClick={() => handleSort(column)}
        >
            <div className="flex items-center gap-1">
                {children}
                {sortConfig?.key === column ? (
                    sortConfig?.direction === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                    ) : (
                        <ArrowDown className="h-4 w-4" />
                    )
                ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                )}
            </div>
        </TableHead>
    )

    useEffect(() => {
        fetchAndUpdateTickers()
    }, [])

    if (error) {
        return (
            <Card className="w-[100vw] sm:w-full sm:max-w-7xl mx-auto">
                <CardContent className="p-6">
                    <div className="text-red-500">Error: {error}</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-[100vw] sm:w-full sm:max-w-7xl mx-auto">
            <CardHeader>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <CardTitle>KRC20 Arbitrage Analyzer</CardTitle>
                    <div className="flex flex-wrap gap-2 items-center">
                        <ThemeToggle />
                        <Button
                            onClick={() => fetchAndUpdateTickers()}
                            disabled={isLoading}
                            className="flex items-center gap-2"
                            variant="outline"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh Market Data</span>
                            <span className="sm:hidden">Refresh</span>
                        </Button>
                        {isLoading && (
                            <div className="text-sm text-muted-foreground">
                                {progress.current > 0
                                    ? `Processing: ${progress.current}/${progress.total}`
                                    : 'Loading...'}
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
                        <Input
                            type="text"
                            placeholder="Filter by ticker..."
                            value={filterTicker}
                            onChange={(e) => setFilterTicker(e.target.value)}
                            className="w-full sm:max-w-sm"
                        />
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="min-volume">Min Volume ($):</Label>
                            <Input
                                id="min-volume"
                                type="number"
                                placeholder="Min volume"
                                value={minVolume}
                                onChange={(e) => setMinVolume(Number(e.target.value))}
                                className="max-w-24"
                            />
                        </div>
                        <Button
                            variant={hideXT ? "default" : "outline"}
                            onClick={() => setHideXT(!hideXT)}
                            className="flex items-center gap-2"
                        >
                            {hideXT ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {hideXT ? "Show XT" : "Hide XT"}
                        </Button>
                        <Button
                            variant={hideKSPRBot ? "default" : "outline"}
                            onClick={() => setHideKSPRBot(!hideKSPRBot)}
                            className="flex items-center gap-2"
                        >
                            {hideKSPRBot ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {hideKSPRBot ? "Show KSPR Bot" : "Hide KSPR Bot"}
                        </Button>
                        <div className="flex items-centerspace-x-2">
                            <Switch
                                id="ignore-zero-volume"
                                checked={ignoreZeroVolume}
                                onCheckedChange={setIgnoreZeroVolume}
                            />
                            <Label htmlFor="ignore-zero-volume">Ignore Zero Volume</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="show-all-markets"
                                checked={showAllMarkets}
                                onCheckedChange={setShowAllMarkets}
                            />
                            <Label htmlFor="show-all-markets">Show All Markets</Label>
                        </div>
                        <div className="text-sm text-muted-foreground w-full sm:w-auto">
                            Total Tokens: {tokens.length}
                        </div>
                    </div>

                    {!showAllMarkets && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Select Markets:</h3>
                            <div className="flex flex-wrap gap-2">
                                {allMarkets.map(market => (
                                    <Button
                                        key={market}
                                        variant={selectedMarkets.includes(market) ? "default" : "outline"}
                                        onClick={() => {
                                            if (selectedMarkets.includes(market)) {
                                                setSelectedMarkets(prev => prev.filter(m => m !== market))
                                            } else if (selectedMarkets.length < 2) {
                                                setSelectedMarkets(prev => [...prev, market])
                                            }
                                        }}
                                    >
                                        {market}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {showAllMarkets ? (
                        <div className="relative h-[calc(100vh-300px)] overflow-x-auto overflow-y-auto border rounded-md min-w-full">
                            <Table className="min-w-[800px]">
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        <TableHead className="w-24">Ticker</TableHead>
                                        <TableHead>Market</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Volume</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Spread %</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="overflow-auto">
                                    {combinedMarketData
                                        .filter(data => data.ticker.toLowerCase().includes(filterTicker.toLowerCase()))
                                        .map((data, index) => {
                                            const sortedMarkets = [...data.markets].sort((a, b) => a.price - b.price)
                                            const lowestPrice = sortedMarkets[0].price
                                            const highestPrice = sortedMarkets[sortedMarkets.length - 1].price
                                            const spread = getSpreadPercentage(data.ticker)

                                            return sortedMarkets.map((market, marketIndex) => {
                                                const isSelected = isMarketSelected(data.ticker, market.market)
                                                return (
                                                    <TableRow 
                                                        key={`${data.ticker}-${index}-${marketIndex}`} 
                                                        className={`${marketIndex > 0 ? 'border-t-0' : ''} ${isSelected ? 'bg-muted/50' : ''} cursor-pointer hover:bg-muted/30`}
                                                        onClick={() => handleMarketRowClick(data.ticker, market.market, market.price)}
                                                    >
                                                        {marketIndex === 0 && (
                                                            <TableCell className="font-medium" rowSpan={sortedMarkets.length}>
                                                                {data.ticker}
                                                            </TableCell>
                                                        )}
                                                        <TableCell>{market.market}</TableCell>
                                                        <TableCell className={
                                                            market.price === lowestPrice 
                                                                ? 'text-green-600 dark:text-green-400 font-bold' 
                                                                : market.price === highestPrice 
                                                                    ? 'text-red-600 dark:text-red-400 font-bold' 
                                                                    : ''
                                                        }>
                                                            ${market.price.toFixed(8)}
                                                        </TableCell>
                                                        <TableCell>
                                                            ${market.volume.toFixed(2)}
                                                        </TableCell>
                                                        <TableCell className={
                                                            market.price === lowestPrice 
                                                                ? 'text-green-600 dark:text-green-400 font-bold' 
                                                                : market.price === highestPrice 
                                                                    ? 'text-red-600 dark:text-red-400 font-bold' 
                                                                    : ''
                                                        }>
                                                            {market.price === lowestPrice ? '[BUY]' : market.price === highestPrice ? '[SELL]' : '-'}
                                                        </TableCell>
                                                        {marketIndex === 0 && (
                                                            <TableCell 
                                                                className="font-semibold text-green-600 dark:text-green-400" 
                                                                rowSpan={sortedMarkets.length}
                                                            >
                                                                {spread !== null ? `${spread.toFixed(2)}%` : data.maxSpread.toFixed(2) + '%'}
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                )
                                            })
                                        })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (selectedMarkets.length === 2 && (
                        <div className="relative h-[calc(100vh-300px)] overflow-x-auto overflow-y-auto border rounded-md min-w-full">
                            <Table className="min-w-[800px]">
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        <SortableHeader column="ticker">Ticker</SortableHeader>
                                        <TableHead>Action</TableHead>
                                        <SortableHeader column="market1.price">
                                            {selectedMarkets[0]} Price
                                        </SortableHeader>
                                        <SortableHeader column="market1.volume">
                                            {selectedMarkets[0]} Volume
                                        </SortableHeader>
                                        <TableHead>Action</TableHead>
                                        <SortableHeader column="market2.price">
                                            {selectedMarkets[1]} Price
                                        </SortableHeader>
                                        <SortableHeader column="market2.volume">
                                            {selectedMarkets[1]} Volume
                                        </SortableHeader>
                                        <SortableHeader column="arbPercentage">Arb %</SortableHeader>
                                        <SortableHeader column="profitPerToken">Profit/Token</SortableHeader>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="overflow-auto">
                                    {getSortedArbs(sortedArbs)
                                        .filter(arb => arb.ticker.toLowerCase().includes(filterTicker.toLowerCase()))
                                        .map((arb, index) => (
                                            <TableRow key={`${arb.ticker}-${index}`}>
                                                <TableCell className="font-medium">{arb.ticker}</TableCell>
                                                <TableCell className={arb.market1.action === 'BUY' ? 'text-green-600 dark:text-green-400 font-bold' : 'text-red-600 dark:text-red-400 font-bold'}>
                                                    {arb.market1.action}
                                                </TableCell>
                                                <TableCell>${arb.market1.price.toFixed(8)}</TableCell>
                                                <TableCell>${arb.market1.volume.toFixed(2)}</TableCell>
                                                <TableCell className={arb.market2.action === 'BUY' ? 'text-green-600 dark:text-green-400 font-bold' : 'text-red-600 dark:text-red-400 font-bold'}>
                                                    {arb.market2.action}
                                                </TableCell>
                                                <TableCell>${arb.market2.price.toFixed(8)}</TableCell>
                                                <TableCell>${arb.market2.volume.toFixed(2)}</TableCell>
                                                <TableCell className="font-semibold">
                                                    {arb.arbPercentage.toFixed(2)}%
                                                </TableCell>
                                                <TableCell className="font-semibold text-green-600 dark:text-green-400">
                                                    ${arb.profitPerToken.toFixed(8)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default ArbAnalyzer