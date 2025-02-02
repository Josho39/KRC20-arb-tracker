/* eslint-disable @typescript-eslint/no-unused-vars */
import { Token, ArbOpportunity, CombinedMarketData, MarketPrice, SortConfig } from '@/types/token'
import _ from 'lodash'

export const calculateArbs = (
    tokenData: Token[], 
    markets: string[], 
    ignoreZeroVolume: boolean,
    minVolume: number = 0,
    sortConfig?: SortConfig | null
): ArbOpportunity[] => {
    if (markets.length !== 2) return []

    const arbs = tokenData.map<ArbOpportunity | null>(token => {
        const market1 = token.marketsData?.find(m => m.name === markets[0])
        const market2 = token.marketsData?.find(m => m.name === markets[1])

        if (!market1?.marketData?.priceInUsd || !market2?.marketData?.priceInUsd) return null
        
        const price1 = market1.marketData.priceInUsd
        const volume1 = market1.marketData.volumeInUsd
        const price2 = market2.marketData.priceInUsd
        const volume2 = market2.marketData.volumeInUsd

        if (ignoreZeroVolume && (volume1 === 0 || volume2 === 0)) return null
        if (minVolume > 0 && (volume1 < minVolume || volume2 < minVolume)) return null

        const priceDiff = Math.abs(price1 - price2)
        const avgPrice = (price1 + price2) / 2
        const arbPercentage = (priceDiff / avgPrice) * 100
        const profitPerToken = Math.abs(price1 - price2)

        const isBuyFromMarket1 = price1 < price2

        return {
            ticker: token.ticker,
            market1: {
                name: markets[0],
                price: price1,
                volume: volume1,
                action: isBuyFromMarket1 ? 'BUY' : 'SELL'
            },
            market2: {
                name: markets[1],
                price: price2,
                volume: volume2,
                action: isBuyFromMarket1 ? 'SELL' : 'BUY'
            },
            arbPercentage,
            profitPerToken
        }
    })

    const filteredArbs = arbs.filter((arb): arb is ArbOpportunity => arb !== null)
    return _.orderBy(filteredArbs, ['arbPercentage'], ['desc'])
}

export const calculateCombinedMarketData = (
    tokenData: Token[], 
    ignoreZeroVolume: boolean,
    minVolume: number = 0,
    sortConfig?: SortConfig | null
): CombinedMarketData[] => {
    return tokenData.map(token => {
        const markets: MarketPrice[] = token.marketsData
            ?.filter(m => {
                if (!m.marketData?.priceInUsd) return false
                if (ignoreZeroVolume && m.marketData.volumeInUsd === 0) return false
                if (minVolume > 0 && m.marketData.volumeInUsd < minVolume) return false
                return true
            })
            ?.map(m => ({
                market: m.name,
                price: m.marketData.priceInUsd,
                volume: m.marketData.volumeInUsd
            })) || []

        if (markets.length < 2) return null

        const prices = markets.map(m => m.price)
        const maxPrice = Math.max(...prices)
        const lowestPrice = Math.min(...prices)
        const maxSpread = ((maxPrice - lowestPrice) / lowestPrice) * 100

        return {
            ticker: token.ticker,
            markets,
            maxPrice,
            minPrice: lowestPrice,
            maxSpread
        }
    }).filter((data): data is CombinedMarketData => data !== null)
}

export const getAllMarkets = (
    tokens: Token[], 
    ignoreZeroVolume: boolean,
    minVolume: number = 0
): string[] => {
    return _.uniq(tokens.flatMap(token => 
        token.marketsData
            ?.filter(market => {
                if (ignoreZeroVolume && market.marketData?.volumeInUsd === 0) return false
                if (minVolume > 0 && market.marketData?.volumeInUsd < minVolume) return false
                return true
            })
            .map(market => market.name) || []
    ))
}