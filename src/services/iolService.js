import axios from 'axios'

export const iolService = {
  async getPortfolio() {
    const response = await axios.get('/api/iol/portfolio', { timeout: 20000 })
    return response.data
  }
}
