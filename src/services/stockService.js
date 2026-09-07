import axios from 'axios'

// Yahoo Finance - usando fuentes públicas sin API key
// La misma ruta funciona con el proxy de Vite en desarrollo y con la función
// serverless de Vercel en producción.
const API_BASE = '/api/yahoo'
const CACHE_PREFIX = 'capital-markets-cache:'
const memoryCache = new Map()
const CACHE_TTL = {
  quote: 2 * 60 * 1000,
  profile: 15 * 60 * 1000,
  historical: 10 * 60 * 1000,
  search: 15 * 60 * 1000
}

const getStorage = () => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

const readCache = (key, ttl) => {
  const now = Date.now()
  const inMemory = memoryCache.get(key)
  if (inMemory && now - inMemory.timestamp < ttl) return inMemory.value

  const storage = getStorage()
  if (!storage) return null

  try {
    const stored = JSON.parse(storage.getItem(`${CACHE_PREFIX}${key}`) || 'null')
    if (stored && now - stored.timestamp < ttl) {
      memoryCache.set(key, stored)
      return stored.value
    }
    storage.removeItem(`${CACHE_PREFIX}${key}`)
  } catch {
    // La caché es opcional: una entrada inválida no debe interrumpir una consulta.
  }
  return null
}

const writeCache = (key, value) => {
  const entry = { timestamp: Date.now(), value }
  memoryCache.set(key, entry)
  const storage = getStorage()
  if (storage) {
    try {
      storage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry))
    } catch {
      // El modo privado o el límite de almacenamiento no deben bloquear la app.
    }
  }
  return value
}

const requestJson = async (key, ttl, url, config) => {
  const cached = readCache(key, ttl)
  if (cached !== null) return cached
  const response = await axios.get(url, config)
  return writeCache(key, response.data)
}

export const clearMarketCache = () => {
  memoryCache.clear()
  const storage = getStorage()
  if (!storage) return
  try {
    Object.keys(storage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => storage.removeItem(key))
  } catch {
    // No-op: limpiar la caché no es crítico para el funcionamiento.
  }
}

export const stockService = {
  async getStockData(symbol) {
    try {
      const normalizedSymbol = symbol.trim().toUpperCase()
      const data = await requestJson(`quote:${normalizedSymbol}`, CACHE_TTL.quote, `${API_BASE}/v8/finance/chart/${encodeURIComponent(normalizedSymbol)}`, {
        params: { interval: '1d', range: '5d' }
      })
      const result = data.chart.result?.[0]
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
      const normalizedSymbol = symbol.trim().toUpperCase()
      const data = await requestJson(`profile:${normalizedSymbol}`, CACHE_TTL.profile, `${API_BASE}/v10/finance/quoteSummary/${encodeURIComponent(normalizedSymbol)}`, {
        params: {
          modules: 'price,summaryDetail,defaultKeyStatistics,assetProfile'
        }
      })
      const result = data.quoteSummary.result?.[0]
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
    const hosts = [API_BASE]
    let lastError

    for (const host of hosts) {
      try {
        const data = await requestJson(
          `historical:${symbol}:${interval}:${range}`,
          CACHE_TTL.historical,
          `${host}/v8/finance/chart/${encodeURIComponent(symbol)}`,
          {
            params: { interval, range },
            timeout: 15000,
            headers: { Accept: 'application/json' }
          }
        )
        const result = data.chart.result?.[0]
        if (!result) throw new Error(`No historical data for ${symbol}`)
        return result
      } catch (error) {
        lastError = error
      }
    }

    console.error('Error fetching historical data:', lastError)
    throw lastError
  },

  async searchSymbol(query) {
    try {
      const normalizedQuery = query.trim().toLowerCase()
      const data = await requestJson(`search:${normalizedQuery}`, CACHE_TTL.search, `${API_BASE}/v1/finance/search`, {
        params: { q: query, lang: 'es', quotesCount: 10, newsCount: 0 }
      })
      return (data.quotes || [])
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
    const uniqueSymbols = [...new Set(symbols)]

    for (let index = 0; index < uniqueSymbols.length; index += concurrency) {
      const batch = uniqueSymbols.slice(index, index + concurrency)
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
    // La moneda de cotización es una característica estructural del instrumento
    // (no una cotización en vivo): acciones locales cotizan en pesos en BYMA y
    // los ADR cotizan en dólares en bolsas de EE. UU.
    localStocks: [
      { symbol: 'GGAL.BA', name: 'Grupo Financiero Galicia', type: 'Acción local', currency: 'ARS' },
      { symbol: 'YPFD.BA', name: 'YPF', type: 'Acción local', currency: 'ARS' },
      { symbol: 'PAMP.BA', name: 'Pampa Energía', type: 'Acción local', currency: 'ARS' },
      { symbol: 'TXAR.BA', name: 'Ternium Argentina', type: 'Acción local', currency: 'ARS' },
      { symbol: 'ALUA.BA', name: 'Aluar', type: 'Acción local', currency: 'ARS' },
      { symbol: 'COME.BA', name: 'Sociedad Comercial del Plata', type: 'Acción local', currency: 'ARS' },
      { symbol: 'MIRG.BA', name: 'Mirgor', type: 'Acción local', currency: 'ARS' },
      { symbol: 'BYMA.BA', name: 'BYMA', type: 'Acción local', currency: 'ARS' },
      { symbol: 'CEPU.BA', name: 'Central Puerto', type: 'Acción local', currency: 'ARS' },
      { symbol: 'TGSU2.BA', name: 'Transportadora de Gas del Sur', type: 'Acción local', currency: 'ARS' },
      { symbol: 'BMA.BA', name: 'Banco Macro', type: 'Acción local', currency: 'ARS' },
      { symbol: 'SUPV.BA', name: 'Grupo Supervielle', type: 'Acción local', currency: 'ARS' },
      { symbol: 'CRES.BA', name: 'Cresud', type: 'Acción local', currency: 'ARS' },
      { symbol: 'LOMA.BA', name: 'Loma Negra', type: 'Acción local', currency: 'ARS' },
      { symbol: 'HARG.BA', name: 'H.Argentina', type: 'Acción local', currency: 'ARS' },
      { symbol: 'TECO2.BA', name: 'Telecom Argentina', type: 'Acción local', currency: 'ARS' }
    ],
    adrs: [
      { symbol: 'GGAL', name: 'Grupo Financiero Galicia', type: 'ADR', currency: 'USD' },
      { symbol: 'YPF', name: 'YPF', type: 'ADR', currency: 'USD' },
      { symbol: 'PAM', name: 'Pampa Energía', type: 'ADR', currency: 'USD' },
      { symbol: 'TGS', name: 'Transportadora de Gas del Sur', type: 'ADR', currency: 'USD' },
      { symbol: 'BMA', name: 'Banco Macro', type: 'ADR', currency: 'USD' },
      { symbol: 'BBAR', name: 'BBVA Argentina', type: 'ADR', currency: 'USD' },
      { symbol: 'CEPU', name: 'Central Puerto', type: 'ADR', currency: 'USD' },
      { symbol: 'CRESY', name: 'Cresud', type: 'ADR', currency: 'USD' },
      { symbol: 'LOMA', name: 'Loma Negra', type: 'ADR', currency: 'USD' },
      { symbol: 'SUPV', name: 'Grupo Supervielle', type: 'ADR', currency: 'USD' }
    ],
    // Metadatos estructurales de cada bono (moneda, legislación y vencimiento
    // aproximado según convención de mercado). El cupón, la TIR y la duration
    // dependen de cotizaciones de mercado en tiempo real que esta app no posee;
    // se muestran como 'N/D' en la interfaz en lugar de inventarse.
    bonds: [
      { symbol: 'AL30.BA', name: 'Bonar 2030', type: 'Bono', currency: 'USD', law: 'Legislación argentina', maturityYear: 2030, couponRate: null, tir: null, duration: null },
      { symbol: 'GD30.BA', name: 'Global 2030', type: 'Bono', currency: 'USD', law: 'Legislación extranjera', maturityYear: 2030, couponRate: null, tir: null, duration: null },
      { symbol: 'AL35.BA', name: 'Bonar 2035', type: 'Bono', currency: 'USD', law: 'Legislación argentina', maturityYear: 2035, couponRate: null, tir: null, duration: null },
      { symbol: 'GD35.BA', name: 'Global 2035', type: 'Bono', currency: 'USD', law: 'Legislación extranjera', maturityYear: 2035, couponRate: null, tir: null, duration: null },
      { symbol: 'AE38.BA', name: 'Global 2038', type: 'Bono', currency: 'USD', law: 'Legislación extranjera', maturityYear: 2038, couponRate: null, tir: null, duration: null },
      { symbol: 'AL41.BA', name: 'Bonar 2041', type: 'Bono', currency: 'USD', law: 'Legislación argentina', maturityYear: 2041, couponRate: null, tir: null, duration: null },
      { symbol: 'TZX26.BA', name: 'Boncer 2026', type: 'Bono CER', currency: 'ARS', law: 'Legislación argentina', maturityYear: 2026, couponRate: null, tir: null, duration: null },
      { symbol: 'AL29.BA', name: 'Bonar 2029', type: 'Bono', currency: 'USD', law: 'Legislación argentina', maturityYear: 2029, couponRate: null, tir: null, duration: null },
      { symbol: 'GD38.BA', name: 'Global 2038', type: 'Bono', currency: 'USD', law: 'Legislación extranjera', maturityYear: 2038, couponRate: null, tir: null, duration: null },
      { symbol: 'GD41.BA', name: 'Global 2041', type: 'Bono', currency: 'USD', law: 'Legislación extranjera', maturityYear: 2041, couponRate: null, tir: null, duration: null },
      { symbol: 'GD46.BA', name: 'Global 2046', type: 'Bono', currency: 'USD', law: 'Legislación extranjera', maturityYear: 2046, couponRate: null, tir: null, duration: null },
      { symbol: 'TZX27.BA', name: 'Boncer 2027', type: 'Bono CER', currency: 'ARS', law: 'Legislación argentina', maturityYear: 2027, couponRate: null, tir: null, duration: null },
      { symbol: 'TX28.BA', name: 'Boncer 2028', type: 'Bono CER', currency: 'ARS', law: 'Legislación argentina', maturityYear: 2028, couponRate: null, tir: null, duration: null },
      { symbol: 'S31O6.BA', name: 'Lecap octubre 2026', type: 'Bono tasa fija', currency: 'ARS', law: 'Legislación argentina', maturityYear: 2026, couponRate: null, tir: null, duration: null }
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
    ['MA', 'Mastercard'], ['JNJ', 'Johnson & Johnson'], ['COST', 'Costco'], ['HD', 'Home Depot'],
    ['META', 'Meta Platforms'], ['NFLX', 'Netflix'], ['CRM', 'Salesforce'], ['AMD', 'AMD'],
    ['ADBE', 'Adobe'], ['QCOM', 'Qualcomm'], ['INTC', 'Intel'], ['CSCO', 'Cisco'],
    ['UNH', 'UnitedHealth'], ['ABBV', 'AbbVie'], ['PFE', 'Pfizer'], ['MRK', 'Merck'],
    ['CVX', 'Chevron'], ['COP', 'ConocoPhillips'], ['CAT', 'Caterpillar'], ['GE', 'GE Aerospace'],
    ['MCD', "McDonald's"], ['NKE', 'Nike'], ['PG', 'Procter & Gamble'], ['KO', 'Coca-Cola'],
    ['PEP', 'PepsiCo'], ['DIS', 'Disney'], ['T', 'AT&T'], ['NEE', 'NextEra Energy']
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
