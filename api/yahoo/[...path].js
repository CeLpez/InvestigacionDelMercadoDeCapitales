const YAHOO_HOSTS = [
  'https://query1.finance.yahoo.com',
  'https://query2.finance.yahoo.com'
]

const allowedPrefixes = new Set([
  'v1/finance/search',
  'v8/finance/chart',
  'v10/finance/quoteSummary'
])

const getPath = request => {
  const path = request.query?.path
  return Array.isArray(path) ? path.join('/') : path || ''
}

const isAllowedPath = path => {
  for (const prefix of allowedPrefixes) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return true
  }
  return false
}

export default async function handler(request, response) {
  const path = getPath(request)

  if (request.method !== 'GET' || !isAllowedPath(path)) {
    response.status(404).json({ error: 'Ruta de mercado no disponible' })
    return
  }

  const query = new URLSearchParams(request.query)
  query.delete('path')
  const suffix = query.toString() ? `?${query.toString()}` : ''
  let lastStatus = 502

  for (const host of YAHOO_HOSTS) {
    try {
      const upstream = await fetch(`${host}/${path}${suffix}`, {
        headers: { Accept: 'application/json' }
      })
      lastStatus = upstream.status
      if (!upstream.ok) continue

      const body = await upstream.text()
      response.setHeader('Content-Type', 'application/json')
      response.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
      response.status(200).send(body)
      return
    } catch {
      // Se prueba el segundo host antes de informar un error al cliente.
    }
  }

  response.status(lastStatus).json({ error: 'No se pudo consultar el mercado' })
}
