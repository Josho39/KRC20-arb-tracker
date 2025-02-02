export type SortConfig = {
  key: keyof ArbOpportunity | 'market1.price' | 'market1.volume' | 'market2.price' | 'market2.volume'
  direction: 'asc' | 'desc'
}

export type MarketPrice = {
  market: string
  price: number
  volume: number
}

export type CombinedMarketData = {
  ticker: string
  markets: MarketPrice[]
  maxPrice: number
  minPrice: number
  maxSpread: number
}

export type MarketData = {
  name: string
  price: number
  volume: number
  action?: 'BUY' | 'SELL'
}

export type ArbOpportunity = {
  ticker: string
  market1: MarketData
  market2: MarketData
  arbPercentage: number
  profitPerToken: number
}

export type Token = {
  ticker: string
  marketsData?: {
      name: string
      marketData: {
          priceInUsd: number
          volumeInUsd: number
      }
  }[]
}