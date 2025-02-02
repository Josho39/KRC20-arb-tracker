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
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { type Token, type ArbOpportunity, type SortConfig } from '@/types/token'
import { calculateArbs, calculateCombinedMarketData, getAllMarkets } from '@/lib/arbcalc'
import _ from 'lodash'

const BATCH_SIZE = 100
const API_DELAY = 100
const REFRESH_THRESHOLD = 100

const ArbAnalyzer = () => {
    const [tokens, setTokens] = useState<Token[]>([])
    const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])
    const [filterTicker, setFilterTicker] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState({ current: 0, total: 0 })
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
    const [showAllMarkets, setShowAllMarkets] = useState(true)
    const [ignoreZeroVolume, setIgnoreZeroVolume] = useState(false)

    const handleSort = (key: SortConfig['key']) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
            }
            return { key, direction: 'desc' }
        })
    }

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

    const loadLocalTickers = async () => {
        try {
            setIsLoading(true)
            setError(null)
            setTokens([])

            const response = await fetch('/krc20_tickers.json')
            if (!response.ok) throw new Error('Failed to load tickers file')
            const data = await response.json()

            if (!Array.isArray(data.tickers)) {
                throw new Error('Invalid ticker file format')
            }

            const uniqueTickers = [...new Set(data.tickers)]
                .filter((t): t is string => Boolean(t && typeof t === 'string'))
                .map(t => t.trim())

            setProgress({ current: 0, total: uniqueTickers.length })

            const validTokens: Token[] = []
            const failedTokens: string[] = []
            let lastProcessedCount = 0

            for (let i = 0; i < uniqueTickers.length; i += BATCH_SIZE) {
                const batch = uniqueTickers.slice(i, i + BATCH_SIZE)
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
                    current: Math.min(i + BATCH_SIZE, uniqueTickers.length),
                    total: uniqueTickers.length
                })

                // Update tokens if we've processed REFRESH_THRESHOLD more or it's the last batch
                if (currentProcessedCount - lastProcessedCount >= REFRESH_THRESHOLD || 
                    i + BATCH_SIZE >= uniqueTickers.length) {
                    setTokens([...validTokens])
                    lastProcessedCount = currentProcessedCount
                }

                await new Promise(resolve => setTimeout(resolve, API_DELAY))
            }

            // Final update with all tokens
            setTokens([...validTokens])

            if (failedTokens.length > 0) {
                setError(`Loaded ${validTokens.length} tokens. Failed to load ${failedTokens.length} tokens.`)
            }

        } catch (error) {
            setError(`Failed to load tickers file: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsLoading(false)
            setProgress({ current: 0, total: 0 })
        }
    }

    const downloadAllTickers = async () => {
        try {
            setIsLoading(true)
            setError(null)

            let hasMore = true
            let nextParam: string | undefined
            const allTickers: string[] = []

            while (hasMore) {
                const response = await fetch(`https://api.kasplex.org/v1/krc20/tokenlist${nextParam ? `?next=${nextParam}` : ''}`)
                if (!response.ok) throw new Error('Failed to fetch tickers')
                const data = await response.json()

                if (data.result) {
                    const newTickers = data.result.map((token: { tick: string }) => token.tick)
                    allTickers.push(...newTickers)
                    setProgress({ current: allTickers.length, total: allTickers.length })
                }

                if (data.next && data.next !== nextParam) {
                    nextParam = data.next
                    await new Promise(resolve => setTimeout(resolve, 200))
                } else {
                    hasMore = false
                }
            }

            const blob = new Blob([JSON.stringify({ tickers: [...new Set(allTickers)] }, null, 2)],
                { type: 'application/json' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'krc20_tickers.json'
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

        } catch (error) {
            setError('Failed to download tickers')
        } finally {
            setIsLoading(false)
            setProgress({ current: 0, total: 0 })
        }
    }
    const allMarkets = useMemo(() =>
        getAllMarkets(tokens, ignoreZeroVolume),
        [tokens, ignoreZeroVolume]
    )

    const sortedArbs = useMemo(() =>
        calculateArbs(tokens, selectedMarkets, ignoreZeroVolume),
        [tokens, selectedMarkets, ignoreZeroVolume]
    )

    const combinedMarketData = useMemo(() => {
        const data = calculateCombinedMarketData(tokens, ignoreZeroVolume)
        return _.orderBy(data, ['maxSpread'], ['desc'])
    }, [tokens, ignoreZeroVolume])

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
        children: React.ReactNode
    }> = ({ column, children }) => (
        <TableHead
            className="cursor-pointer hover:bg-muted/50"
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
        loadLocalTickers()
    }, [])

    if (error) {
        return (
            <Card className="w-full max-w-6xl mx-auto">
                <CardContent className="p-6">
                    <div className="text-red-500">Error: {error}</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-6xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>KRC20 Arbitrage Analyzer</CardTitle>
                    <div className="flex gap-2 items-center">
                        <ThemeToggle />
                        {isLoading && (
                            <div className="text-sm text-muted-foreground">
                                {progress.current > 0
                                    ? `Processing: ${progress.current}/${progress.total}`
                                    : 'Loading...'}
                            </div>
                        )}
                        <Button
                            onClick={loadLocalTickers}
                            disabled={isLoading}
                            variant="outline"
                        >
                            Load Tickers
                        </Button>
                        <Button
                            onClick={downloadAllTickers}
                            disabled={isLoading}
                        >
                            Download New Tickers
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Input
                            type="text"
                            placeholder="Filter by ticker..."
                            value={filterTicker}
                            onChange={(e) => setFilterTicker(e.target.value)}
                            className="max-w-sm"
                        />
                        <div className="flex items-center space-x-2">
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
                        <div className="text-sm text-muted-foreground">
                            Total Tokens: {tokens.length}
                        </div>
                    </div>

                    {!showAllMarkets && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Select Markets to Compare:</h3>
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ticker</TableHead>
                                    <TableHead>Markets</TableHead>
                                    <TableHead>Lowest Price</TableHead>
                                    <TableHead>Highest Price</TableHead>
                                    <TableHead>Max Spread %</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {combinedMarketData
                                    .filter(data => data.ticker.toLowerCase().includes(filterTicker.toLowerCase()))
                                    .map((data, index) => {
                                        const sortedMarkets = [...data.markets].sort((a, b) => a.price - b.price)
                                        const lowestPrice = sortedMarkets[0].price
                                        const highestPrice = sortedMarkets[sortedMarkets.length - 1].price

                                        return (
                                            <TableRow key={`${data.ticker}-${index}`}>
                                                <TableCell className="font-medium">{data.ticker}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {sortedMarkets.map((m, i) => (
                                                            <div key={i} className={`text-sm ${m.price === lowestPrice ? 'text-green-600 dark:text-green-400 font-bold' : m.price === highestPrice ? 'text-red-600 dark:text-red-400 font-bold' : ''}`}>
                                                                {m.market}: ${m.price.toFixed(8)} (Vol: ${m.volume.toFixed(2)})
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-green-600 dark:text-green-400 font-bold">
                                                    ${data.minPrice.toFixed(8)}
                                                </TableCell>
                                                <TableCell className="text-red-600 dark:text-red-400 font-bold">
                                                    ${data.maxPrice.toFixed(8)}
                                                </TableCell>
                                                <TableCell className="font-semibold text-green-600 dark:text-green-400">
                                                    {data.maxSpread.toFixed(2)}%
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                            </TableBody>
                        </Table>
                    ) : (
                        selectedMarkets.length === 2 && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <SortableHeader column="ticker">Ticker</SortableHeader>
                                        <TableHead>Action</TableHead>
                                        <SortableHeader column="market1.price">{selectedMarkets[0]} Price</SortableHeader>
                                        <SortableHeader column="market1.volume">{selectedMarkets[0]} Volume</SortableHeader>
                                        <TableHead>Action</TableHead>
                                        <SortableHeader column="market2.price">{selectedMarkets[1]} Price</SortableHeader>
                                        <SortableHeader column="market2.volume">{selectedMarkets[1]} Volume</SortableHeader>
                                        <SortableHeader column="arbPercentage">Arb %</SortableHeader>
                                        <SortableHeader column="profitPerToken">Profit/Token</SortableHeader>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
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
                        )
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default ArbAnalyzer