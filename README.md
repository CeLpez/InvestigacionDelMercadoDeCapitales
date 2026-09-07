# 📈 Dashboard Mercado de Capitales

Una plataforma completa para monitorear, analizar e invertir en el mercado de capitales con features educativas, comparativas y de gestión de portafolios.

## 🎯 Características Principales

### Análisis y Monitoreo
- **📊 Dashboard en Tiempo Real**: Visualiza precios actuales, gráficos interactivos y tendencias del mercado
- **🌎 Mercados Globales**: MERVAL, ADRs y bonos argentinos, Brasil, Japón, Corea y principales índices de EE. UU.
- **🏛️ S&P 500**: Seguimiento de 20 empresas líderes del índice
- **🔍 Búsqueda de Acciones**: Encuentra y analiza cualquier acción disponible
- **🏢 Perfiles empresariales**: Consulta valoración, beta, EPS, dividendos, sector, industria y descripción
- **📰 Noticias Financieras**: Lee noticias del mercado filtradas por acción y categoría
- **🔔 Alertas de Precio**: Configura alertas cuando las acciones alcancen precios objetivo

### Educación e Información
- **📚 Educación del Mercado**: Aprende conceptos fundamentales, estrategias e indicadores
- **🇦🇷 Educación argentina**: Diferencias entre acciones locales, ADRs, bonos hard-dollar, CER y tipo de cambio
- **⚖️ Comparador de Competidores**: Compara múltiples empresas con ventajas/desventajas
- **🏢 Análisis por Sectores**: Sectoriza el mercado y analiza tendencias por industria
- **💡 Recomendaciones**: Recibe sugerencias de inversión basadas en análisis técnico y fundamental

### Gestión de Inversiones
- **💼 Gestor de Portafolios**: Crea, monitorea y optimiza tu portafolio de inversiones
- **📜 Historial de Transacciones**: Rastrea todas tus compras y ventas con timestamps
- **📥 Exportar a CSV**: Descarga datos del portafolio e historial para análisis externo
- **📈 Simulador de Rentabilidad**: Proyecta retornos futuros con parámetros ajustables

## 🚀 Tecnologías Utilizadas

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Gráficos**: Chart.js + react-chartjs-2
- **Estado**: Zustand
- **API de Datos**: Yahoo Finance (público, sin API key)
- **Usuarios y nube**: Supabase (opcional, con fallback local)
- **Utilidades**: Axios, date-fns

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables (Navbar, Charts, etc)
├── pages/            # Páginas principales (Dashboard, Portfolio, etc)
├── services/         # Servicios de API y datos
├── store/            # Estado global con Zustand
├── App.jsx          # Componente principal
└── index.css        # Estilos globales
```

## 📖 Páginas Disponibles

| Sección | Descripción |
|---------|------------|
| **Dashboard** | Resumen del mercado, precios y gráficos principales |
| **Buscar** | Búsqueda y análisis detallado de acciones individuales |
| **Educación** | Recursos sobre fundamentales, análisis, riesgo y glosario |
| **Comparar** | Compara empresas con análisis de ventajas/desventajas |
| **Sectores** | Análisis de mercado segmentado por industria |
| **Portafolio** | Gestor de inversiones con seguimiento de ganancias/pérdidas |
| **Historial** | Registro completo de transacciones (compras/ventas) |
| **Alertas** | Configurar alertas de precio para monitoreo automático |
| **Simulador** | Proyectar rentabilidad a futuro con múltiples escenarios |
| **Noticias** | Feed de noticias financieras con análisis de sentimiento |
| **Recomendaciones** | Sugerencias de inversión y estrategias de cartera |

## 🔄 Fuentes de Datos

- **Yahoo Finance API**: Datos de precios, históricos y fundamentales
- **Mock Data**: Datos de demostración para desarrollo

## 💰 Cómo Usar el Portafolio

1. Ve a la sección "Portafolio"
2. Haz clic en "Agregar Acción"
3. Selecciona la empresa y cantidad
4. Monitora ganancias/pérdidas en tiempo real
5. Actualiza cantidades según sea necesario
6. **Exporta a CSV** para análisis en Excel

## 🔔 Cómo Usar Alertas

1. Navega a **"Alertas"**
2. Haz clic en **"Nueva Alerta"**
3. Selecciona acción, tipo (arriba/abajo) y precio objetivo
4. Recibe notificaciones cuando se alcance el precio

## 📈 Cómo Usar el Simulador

1. Ve a **"Simulador"**
2. Ajusta:
   - Inversión inicial
   - Aporte mensual
   - Retorno anual esperado (5% conservador, 8% moderado, 12% agresivo)
   - Horizonte temporal (años)
3. Observa proyecciones en tiempo real
4. Compara escenarios (conservador, balanceado, agresivo)

## 🎓 Consejos de Inversión

- ✅ Comienza con pequeñas inversiones mientras aprendes
- ✅ Diversifica tu portafolio entre sectores
- ✅ No intentes "timing the market" - es impredecible
- ✅ Mantén una perspectiva a largo plazo (5+ años)
- ✅ Estudia las empresas antes de invertir
- ✅ Sigue noticias financieras y eventos económicos
- ✅ No inviertas dinero que necesites en corto plazo

## 📊 Características de Análisis

- **Gráficos interactivos** con Chart.js
- **Filtros dinámicos** en todas las tablas
- **Análisis comparativo** entre empresas
- **Sentimiento de noticias** (positivo/negativo)
- **Métricas financieras clave** (P/E, Dividend, ROE)
- **Seguimiento de rendimiento** en portafolio

## 📥 Exportación de Datos

El servicio de exportación CSV incluye:
- **Portfolio**: Símbolo, cantidad, precios, valores, ganancias
- **Transacciones**: Fecha, tipo, cantidad, precio, total
- **Resumen**: Totales y métricas agregadas

## ⚠️ Disclaimer

Esta aplicación es educativa y no constituye asesoramiento financiero. Consulta con un asesor financiero calificado antes de tomar decisiones de inversión. Los datos son de demostración y no representan precios reales actuales.

## ⚙️ Funcionalidad de Estado Global

Con Zustand puedes:
- Guardar portafolio persistentemente
- Mantener lista de seguimiento (watchlist)
- Sincronizar datos entre páginas

## 🔐 Configuración opcional de Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql` en el SQL Editor.
3. Copia `.env.example` a `.env.local`.
4. Completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

El cliente de Supabase queda disponible en `src/services/supabaseClient.js` y las operaciones de autenticación en `src/services/authService.js`. Si las variables están vacías, la aplicación continúa funcionando con persistencia local.

## 🌐 Publicar en Vercel

El proyecto incluye la función serverless `api/yahoo/[...path].js`, que consulta Yahoo Finance desde el servidor y evita problemas de CORS cuando la aplicación está publicada.

1. Sube el repositorio a GitHub.
2. Entra en [vercel.com](https://vercel.com), selecciona **Add New Project** e importa el repositorio.
3. Mantén `Framework Preset: Vite`, `Build Command: npm run build` y `Output Directory: dist`.
4. En **Settings → Environment Variables**, agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Pulsa **Deploy**.

Después del despliegue, comparte la URL pública de Vercel. Los usuarios podrán acceder desde cualquier red o celular. No publiques `.env.local` ni claves secretas; la clave `VITE_SUPABASE_ANON_KEY` está diseñada para usarse en el navegador, pero las políticas RLS de Supabase deben permanecer activas.

## 🚀 Próximas Características Potenciales

- Integración con APIs reales (Yahoo Finance, Polygon.io)
- Autenticación y sincronización en la nube
- Notificaciones push en tiempo real
- Análisis técnico avanzado (RSI, MACD, Bollinger Bands)
- Backtesting de estrategias
- Integración con corredoras de bolsa

## 📝 Licencia

MIT