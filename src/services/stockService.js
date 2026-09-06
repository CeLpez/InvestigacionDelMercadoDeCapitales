import axios from 'axios'

// Yahoo Finance - usando fuentes públicas sin API key
const API_BASE = 'https://query1.finance.yahoo.com'

export const stockService = {
  async getStockData(symbol) {
    try {
      const response = await axios.get(`${API_BASE}/v8/finance/chart/${symbol}`, {
        params: { interval: '1d', range: '5d' }
      })
      const result = response.data.chart.result?.[0]
      if (!result?.meta) throw new Error(`No quote data for ${symbol}`)

      const meta = result.meta
      const price = meta.regularMarketPrice ?? meta.previousClose
      const previousClose = meta.previousClose ?? meta.chartPreviousClose ?? price
      const change = price - previousClose

      return {
        symbol,
        company: meta.longName || meta.shortName || symbol,
        price,
        change,
        changePercent: previousClose ? (change / previousClose) * 100 : 0,
        marketCap: 'N/D',
        pe: null,
        dividend: null,
        sector: 'N/D',
        currency: meta.currency || 'USD'
      }
    } catch (error) {
      console.error('Error fetching stock data:', error)
      throw error
    }
  },

  async getHistoricalData(symbol, interval = '1d', range = '1y') {
    try {
      const response = await axios.get(
        `${API_BASE}/v8/finance/chart/${symbol}`,
        {
          params: {
            interval,
            range
          }
        }
      )
      const result = response.data.chart.result?.[0]
      if (!result) throw new Error(`No historical data for ${symbol}`)
      return result
    } catch (error) {
      console.error('Error fetching historical data:', error)
      throw error
    }
  },

  async searchSymbol(query) {
    try {
      const response = await axios.get(`${API_BASE}/v1/finance/search`, {
        params: { q: query, lang: 'es', quotesCount: 10, newsCount: 0 }
      })
      return (response.data.quotes || [])
        .filter(quote => quote.quoteType === 'EQUITY')
        .map(quote => ({
          symbol: quote.symbol,
          company: quote.longname || quote.shortname || quote.symbol,
          exchange: quote.exchange,
          sector: 'N/D'
        }))
    } catch (error) {
      console.error('Error searching symbols:', error)
      throw error
    }
  },

  async getMultipleStocks(symbols) {
    try {
      const promises = symbols.map(sym => this.getStockData(sym))
      return await Promise.all(promises)
    } catch (error) {
      console.error('Error fetching multiple stocks:', error)
      throw error
    }
  }
}

// Mock data for development
export const mockStocks = {
  'AAPL': {
    symbol: 'AAPL',
    price: 189.95,
    change: 2.5,
    changePercent: 1.34,
    marketCap: '2.9T',
    pe: 28.5,
    dividend: 0.92,
    sector: 'Technology',
    company: 'Apple Inc.'
  },
  'MSFT': {
    symbol: 'MSFT',
    price: 378.91,
    change: 1.2,
    changePercent: 0.32,
    marketCap: '2.8T',
    pe: 35.2,
    dividend: 0.68,
    sector: 'Technology',
    company: 'Microsoft Corporation'
  },
  'GOOGL': {
    symbol: 'GOOGL',
    price: 138.89,
    change: -0.5,
    changePercent: -0.36,
    marketCap: '1.8T',
    pe: 24.3,
    dividend: 0,
    sector: 'Technology',
    company: 'Alphabet Inc.'
  },
  'AMZN': {
    symbol: 'AMZN',
    price: 171.41,
    change: 3.2,
    changePercent: 1.90,
    marketCap: '1.8T',
    pe: 52.1,
    dividend: 0,
    sector: 'Consumer Cyclical',
    company: 'Amazon.com Inc.'
  },
  'TSLA': {
    symbol: 'TSLA',
    price: 242.84,
    change: 5.6,
    changePercent: 2.36,
    marketCap: '770B',
    pe: 62.4,
    dividend: 0,
    sector: 'Automotive',
    company: 'Tesla Inc.'
  }
}
