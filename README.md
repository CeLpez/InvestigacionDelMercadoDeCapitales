# 📈 Dashboard Mercado de Capitales

Una plataforma completa para monitorear, analizar e invertir en el mercado de capitales con features educativas, comparativas y de gestión de portafolios.

## 🎯 Características Principales

- **📊 Dashboard en Tiempo Real**: Visualiza precios actuales, gráficos interactivos y tendencias del mercado
- **🔍 Búsqueda de Acciones**: Encuentra y analiza cualquier acción disponible
- **📚 Educación del Mercado**: Aprende conceptos fundamentales, estrategias e indicadores
- **⚖️ Comparador de Competidores**: Compara múltiples empresas con ventajas/desventajas
- **🏢 Análisis por Sectores**: Sectoriza el mercado y analiza tendencias por industria
- **💼 Gestor de Portafolios**: Crea, monitorea y optimiza tu portafolio de inversiones
- **💡 Recomendaciones**: Recibe sugerencias de inversión basadas en análisis técnico y fundamental

## 🚀 Tecnologías Utilizadas

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Gráficos**: Chart.js + react-chartjs-2
- **Estado**: Zustand
- **API de Datos**: Yahoo Finance (público, sin API key)
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

1. **Dashboard**: Resumen del mercado y precios principales
2. **Buscar**: Búsqueda y análisis de acciones individuales
3. **Educación**: Recursos educativos sobre inversiones
4. **Comparar**: Compara empresas competidoras
5. **Sectores**: Análisis y tendencias por sector
6. **Portafolio**: Gestión de tu cartera de inversiones
7. **Recomendaciones**: Sugerencias de inversión y estrategias

## 🔄 Fuentes de Datos

- **Yahoo Finance API**: Datos de precios, históricos y fundamentales
- **Mock Data**: Datos de demostración para desarrollo

## 💰 Cómo Usar el Portafolio

1. Ve a la sección "Portafolio"
2. Haz clic en "Agregar Acción"
3. Selecciona la empresa y cantidad
4. Monitora ganancias/pérdidas en tiempo real
5. Actualiza cantidades según sea necesario

## 🎓 Consejos de Inversión

- Comienza con pequeñas inversiones mientras aprendes
- Diversifica tu portafolio entre sectores
- No intentes "timing the market"
- Mantén una perspectiva a largo plazo
- Estudia las empresas antes de invertir

## ⚠️ Disclaimer

Esta aplicación es educativa y no constituye asesoramiento financiero. Consulta con un asesor financiero calificado antes de tomar decisiones de inversión. Los datos son de demostración y no representan precios reales actuales.

## 📝 Licencia

MIT