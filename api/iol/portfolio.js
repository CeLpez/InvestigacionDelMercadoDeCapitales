const IOL_BASE_URL = 'https://api.invertironline.com'

const getToken = async () => {
  const username = process.env.IOL_USERNAME
  const password = process.env.IOL_PASSWORD
  const refreshToken = process.env.IOL_REFRESH_TOKEN

  if (refreshToken) {
    const refreshResponse = await fetch(`${IOL_BASE_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ refresh_token: refreshToken, grant_type: 'refresh_token' })
    })
    if (refreshResponse.ok) return refreshResponse.json()
  }

  if (!username || !password) {
    throw new Error('Faltan IOL_USERNAME e IOL_PASSWORD en las variables privadas del servidor.')
  }

  const response = await fetch(`${IOL_BASE_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password, grant_type: 'password' })
  })
  if (!response.ok) throw new Error('InvertirOnline rechazó la autenticación.')
  return response.json()
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Método no permitido' })
    return
  }

  const account = process.env.IOL_ACCOUNT
  const country = process.env.IOL_COUNTRY || 'Argentina'
  if (!account) {
    response.status(503).json({ error: 'Falta configurar IOL_ACCOUNT en el servidor.' })
    return
  }

  try {
    const token = await getToken()
    const upstream = await fetch(
      `${IOL_BASE_URL}/api/v2/${encodeURIComponent(country)}/Portafolio/${encodeURIComponent(account)}`,
      { headers: { Authorization: `Bearer ${token.access_token}`, Accept: 'application/json' } }
    )
    const body = await upstream.text()
    response.setHeader('Cache-Control', 'private, no-store')
    response.setHeader('Content-Type', 'application/json')
    response.status(upstream.status).send(body)
  } catch (error) {
    response.status(502).json({ error: error.message || 'No se pudo consultar InvertirOnline.' })
  }
}
