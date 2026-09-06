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
        currency: meta.currency || 'USD',
        exchange: meta.exchangeName || meta.exchange || 'N/D',
        volume: meta.regularMarketVolume ?? null,
        marketState: meta.marketState || 'N/D',
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null
      }
    } catch (error) {
      console.error('Error fetching stock data:', error)
      throw error
    }
  },

  async getCompanyProfile(symbol) {
    try {
      const response = await axios.get(`${API_BASE}/v10/finance/quoteSummary/${symbol}`, {
        params: {
          modules: 'price,summaryDetail,defaultKeyStatistics,assetProfile'
        }
      })
      const result = response.data.quoteSummary.result?.[0]
      if (!result) throw new Error(`No profile data for ${symbol}`)

      const price = result.price || {}
      const detail = result.summaryDetail || {}
      const statistics = result.defaultKeyStatistics || {}
      const profile = result.assetProfile || {}

      return {
        symbol,
        company: price.longName?.raw || price.shortName?.raw || symbol,
        price: price.regularMarketPrice?.raw ?? null,
        marketCap: detail.marketCap?.raw ?? null,
        pe: detail.trailingPE?.raw ?? null,
        forwardPe: statistics.forwardPE?.raw ?? null,
        dividend: detail.dividendRate?.raw ?? null,
        dividendYield: detail.dividendYield?.raw ?? null,
        beta: statistics.beta?.raw ?? null,
        eps: statistics.trailingEps?.raw ?? null,
        sector: profile.sector || 'N/D',
        industry: profile.industry || 'N/D',
        employees: profile.fullTimeEmployees || null,
        website: profile.website || '',
        summary: profile.longBusinessSummary || ''
      }
    } catch (error) {
      console.warn(`No se pudo cargar el perfil de ${symbol}:`, error.message)
      return null
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
    const results = []
    const concurrency = 6

    for (let index = 0; index < symbols.length; index += concurrency) {
      const batch = symbols.slice(index, index + concurrency)
      const batchResults = await Promise.all(batch.map(async symbol => {
        try {
          return await this.getStockData(symbol)
        } catch (error) {
          console.warn(`No se pudo actualizar ${symbol}:`, error.message)
          return null
        }
      }))
      results.push(...batchResults.filter(Boolean))
    }

    return results
  }
}

export const marketUniverse = {
  argentina: {
    index: [{ symbol: '^MERV', name: 'MERVAL', type: 'Índice' }],
    localStocks: [
      { symbol: 'GGAL.BA', name: 'Grupo Financiero Galicia', type: 'Acción local' },
      { symbol: 'YPFD.BA', name: 'YPF', type: 'Acción local' },
      { symbol: 'PAMP.BA', name: 'Pampa Energía', type: 'Acción local' },
      { symbol: 'TXAR.BA', name: 'Ternium Argentina', type: 'Acción local' },
      { symbol: 'ALUA.BA', name: 'Aluar', type: 'Acción local' },
      { symbol: 'COME.BA', name: 'Sociedad Comercial del Plata', type: 'Acción local' },
      { symbol: 'MIRG.BA', name: 'Mirgor', type: 'Acción local' },
      { symbol: 'BYMA.BA', name: 'BYMA', type: 'Acción local' },
      { symbol: 'CEPU.BA', name: 'Central Puerto', type: 'Acción local' },
      { symbol: 'TGSU2.BA', name: 'Transportadora de Gas del Sur', type: 'Acción local' }
    ],
    adrs: [
      { symbol: 'GGAL', name: 'Grupo Financiero Galicia', type: 'ADR' },
      { symbol: 'YPF', name: 'YPF', type: 'ADR' },
      { symbol: 'PAM', name: 'Pampa Energía', type: 'ADR' },
      { symbol: 'TGS', name: 'Transportadora de Gas del Sur', type: 'ADR' },
      { symbol: 'BMA', name: 'Banco Macro', type: 'ADR' },
      { symbol: 'BBAR', name: 'BBVA Argentina', type: 'ADR' },
      { symbol: 'CEPU', name: 'Central Puerto', type: 'ADR' },
      { symbol: 'CRESY', name: 'Cresud', type: 'ADR' },
      { symbol: 'LOMA', name: 'Loma Negra', type: 'ADR' },
      { symbol: 'SUPV', name: 'Grupo Supervielle', type: 'ADR' }
    ],
    bonds: [
      { symbol: 'AL30.BA', name: 'Bonar 2030', type: 'Bono' },
      { symbol: 'GD30.BA', name: 'Global 2030', type: 'Bono' },
      { symbol: 'AL35.BA', name: 'Bonar 2035', type: 'Bono' },
      { symbol: 'GD35.BA', name: 'Global 2035', type: 'Bono' },
      { symbol: 'AE38.BA', name: 'Global 2038', type: 'Bono' },
      { symbol: 'AL41.BA', name: 'Bonar 2041', type: 'Bono' },
      { symbol: 'TZX26.BA', name: 'Boncer 2026', type: 'Bono CER' }
    ],
    macro: [
      { symbol: 'ARS=X', name: 'Peso argentino / dólar', type: 'Tipo de cambio' },
      { symbol: 'BTC-USD', name: 'Bitcoin / dólar', type: 'Referencia' }
    ]
  },
  global: [
    { symbol: '^BVSP', name: 'Brasil - Bovespa', type: 'Índice' },
    { symbol: '^N225', name: 'Japón - Nikkei 225', type: 'Índice' },
    { symbol: '^KS11', name: 'Corea - KOSPI', type: 'Índice' },
    { symbol: '^GSPC', name: 'Estados Unidos - S&P 500', type: 'Índice' },
    { symbol: '^DJI', name: 'Estados Unidos - Dow Jones', type: 'Índice' },
    { symbol: '^IXIC', name: 'Estados Unidos - Nasdaq', type: 'Índice' }
  ],
  sp500: [
    ['MSFT', 'Microsoft'], ['AAPL', 'Apple'], ['NVDA', 'NVIDIA'], ['AMZN', 'Amazon'],
    ['META', 'Meta Platforms'], ['GOOGL', 'Alphabet'], ['AVGO', 'Broadcom'], ['BRK-B', 'Berkshire Hathaway'],
    ['GOOG', 'Alphabet C'], ['TSLA', 'Tesla'], ['LLY', 'Eli Lilly'], ['WMT', 'Walmart'],
    ['JPM', 'JPMorgan Chase'], ['V', 'Visa'], ['ORCL', 'Oracle'], ['XOM', 'Exxon Mobil'],
    ['MA', 'Mastercard'], ['JNJ', 'Johnson & Johnson'], ['COST', 'Costco'], ['HD', 'Home Depot']
  ].map(([symbol, name]) => ({ symbol, name, type: 'Acción S&P 500' }))
}

export const getMarketUniverse = () => [
  ...marketUniverse.argentina.index,
  ...marketUniverse.argentina.localStocks,
  ...marketUniverse.argentina.adrs,
  ...marketUniverse.argentina.bonds,
  ...marketUniverse.argentina.macro,
  ...marketUniverse.global,
  ...marketUniverse.sp500
]

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
