import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePortfolioStore = create(persist((set, get) => ({
  portfolio: [],
  watchlist: [],

  addStock: (stock, quantity = 1, purchasePrice = stock.price) => set(state => ({
    portfolio: [...state.portfolio, {
      ...stock,
      quantity: Number(quantity),
      purchasePrice: Number(purchasePrice),
      id: `${stock.symbol}-${Date.now()}`
    }]
  })),

  removeStock: (id) => set(state => ({
    portfolio: state.portfolio.filter(s => s.id !== id)
  })),

  updateStock: (id, updates) => set(state => ({
    portfolio: state.portfolio.map(s => s.id === id ? { ...s, ...updates } : s)
  })),

  addToWatchlist: (stock) => set(state => ({
    watchlist: [...state.watchlist, { ...stock, id: Date.now() }]
  })),

  removeFromWatchlist: (id) => set(state => ({
    watchlist: state.watchlist.filter(s => s.id !== id)
  })),

  getPortfolioValue: () => {
    const { portfolio } = get()
    return portfolio.reduce((total, stock) => total + (stock.price * stock.quantity), 0)
  },

  getPortfolioReturn: () => {
    const { portfolio } = get()
    const currentValue = get().getPortfolioValue()
    const initialValue = portfolio.reduce((total, stock) => total + (stock.purchasePrice * stock.quantity), 0)
    return currentValue - initialValue
  }
}), {
  name: 'capital-markets-portfolio'
}))

export const useMarketStore = create(persist((set) => ({
  selectedStocks: [],
  marketTrends: {},
  
  setSelectedStocks: (stocks) => set({ selectedStocks: stocks }),
  setMarketTrends: (trends) => set({ marketTrends: trends })
}), {
  name: 'capital-markets-market'
}))
