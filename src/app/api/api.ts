/* eslint-disable @typescript-eslint/no-unused-vars */
import { Token } from '@/types/token'
import { API_ENDPOINTS } from '@/constants'

export const fetchTokenData = async (ticker: string): Promise<Token | null> => {
    try {
        const cleanedTicker = ticker.replace(/['"]/g, '').trim()
        if (!cleanedTicker) return null

        const response = await fetch(`${API_ENDPOINTS.TOKEN_INFO}/${encodeURIComponent(cleanedTicker)}/info`)
        if (!response.ok) return null
        const data = await response.json()
        return data
    } catch (error) {
        return null
    }
}

export const downloadTickers = async (
    onProgress: (current: number, total: number) => void
): Promise<string[]> => {
    let hasMore = true
    let nextParam: string | undefined
    const allTickers: string[] = []

    while (hasMore) {
        const response = await fetch(`${API_ENDPOINTS.TOKEN_LIST}${nextParam ? `?next=${nextParam}` : ''}`)
        if (!response.ok) throw new Error('Failed to fetch tickers')
        const data = await response.json()

        if (data.result) {
            const newTickers = data.result.map((token: { tick: string }) => token.tick)
            allTickers.push(...newTickers)
            onProgress(allTickers.length, allTickers.length)
        }

        if (data.next && data.next !== nextParam) {
            nextParam = data.next
            await new Promise(resolve => setTimeout(resolve, 200))
        } else {
            hasMore = false
        }
    }

    return [...new Set(allTickers)]
}

export const downloadTickersFile = (tickers: string[]) => {
    const blob = new Blob([JSON.stringify({ tickers }, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'krc20_tickers.json'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
}