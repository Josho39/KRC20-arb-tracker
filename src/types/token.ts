export interface MarketData {
  name: string
  price: number
  volume: number
}

export interface Token {
  ticker: string
  marketsData?: MarketData[]
}

export interface SortConfig {
  key: 'ticker' | 'market1.price' | 'market1.volume' | 'market2.price' | 'market2.volume' | 'arbPercentage' | 'profitPerToken'
  direction: 'asc' | 'desc'
}

export interface ArbOpportunity {
  ticker: string
  market1: {
      market: string
      price: number
      volume: number
      action: 'BUY' | 'SELL'
  }
  market2: {
      market: string
      price: number
      volume: number
      action: 'BUY' | 'SELL'
  }
  arbPercentage: number
  profitPerToken: number
}