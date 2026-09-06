export const exportPortfolioToCSV = (portfolio, filename = 'portafolio.csv') => {
  if (portfolio.length === 0) {
    alert('El portafolio está vacío')
    return
  }

  const headers = ['Símbolo', 'Empresa', 'Sector', 'Cantidad', 'Precio Actual', 'Precio Compra', 'Valor Total', 'Costo Total', 'Ganancia/Pérdida', 'Retorno %']

  const data = portfolio.map(stock => {
    const currentValue = stock.price * stock.quantity
    const costValue = stock.purchasePrice * stock.quantity
    const gain = currentValue - costValue
    const gainPercent = (gain / costValue) * 100

    return [
      stock.symbol,
      stock.company,
      stock.sector || 'N/A',
      stock.quantity,
      stock.price.toFixed(2),
      stock.purchasePrice.toFixed(2),
      currentValue.toFixed(2),
      costValue.toFixed(2),
      gain.toFixed(2),
      gainPercent.toFixed(2)
    ]
  })

  const totalValue = portfolio.reduce((sum, s) => sum + (s.price * s.quantity), 0)
  const totalCost = portfolio.reduce((sum, s) => sum + (s.purchasePrice * s.quantity), 0)
  const totalGain = totalValue - totalCost

  data.push(['', '', '', '', '', '', '', '', '', ''])
  data.push(['RESUMEN', '', '', '', '', '', '', '', '', ''])
  data.push(['Valor Total', '', '', '', '', '', totalValue.toFixed(2), '', '', ''])
  data.push(['Costo Total', '', '', '', '', '', totalCost.toFixed(2), '', '', ''])
  data.push(['Ganancia Total', '', '', '', '', '', totalGain.toFixed(2), '', '', ''])
  data.push(['Retorno Total %', '', '', '', '', '', '', '', '', ((totalGain / totalCost) * 100).toFixed(2)])

  let csvContent = 'data:text/csv;charset=utf-8,'
  csvContent += headers.join(',') + '\n'
  data.forEach(row => {
    csvContent += row.join(',') + '\n'
  })

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportTransactionsToCSV = (transactions, filename = 'transacciones.csv') => {
  if (transactions.length === 0) {
    alert('No hay transacciones para exportar')
    return
  }

  const headers = ['Fecha', 'Acción', 'Tipo', 'Cantidad', 'Precio', 'Total', 'Estado']

  const data = transactions.map(t => [
    t.date,
    t.symbol,
    t.type,
    t.shares,
    t.price.toFixed(2),
    t.total.toFixed(2),
    t.status
  ])

  let csvContent = 'data:text/csv;charset=utf-8,'
  csvContent += headers.join(',') + '\n'
  data.forEach(row => {
    csvContent += row.join(',') + '\n'
  })

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
