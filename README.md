# 🌤️ 10-Day Weather Forecast Checker

A clean, modern React web app that shows a 10-day weather forecast for any city or ZIP code in the world.

## Features

- Search by city name (e.g. `New York`, `London`, `Tokyo`) or ZIP code (e.g. `90210`)
- 10-day forecast showing:
  - Date (with Today / Tomorrow labels)
  - High & low temperature (°F)
  - Weather condition with emoji icon
  - Precipitation in mm (when applicable)
- Shimmer skeleton loading animation
- Error handling for invalid locations or API failures
- Fully responsive layout (5-col → 2-col → 1-col grid)
- No API key required

## Tech Stack

| Tool | Purpose |
|------|---------|
| [React 18](https://react.dev) | UI framework |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Open-Meteo](https://open-meteo.com) | Free weather forecast API (no key needed) |
| [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) | City/ZIP → coordinates |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18 or higher
- npm (comes with Node.js)

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/WeatherCheckerAPI.git
cd WeatherCheckerAPI

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

## API Details

This app uses two free, no-key-required endpoints from [Open-Meteo](https://open-meteo.com):

1. **Geocoding** — converts a city name or ZIP code to coordinates
   `https://geocoding-api.open-meteo.com/v1/search?name=QUERY`

2. **Forecast** — returns 10 days of daily weather data
   `https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LON&daily=...&forecast_days=10`

Weather conditions are decoded from [WMO weather codes](https://open-meteo.com/en/docs#weathervariables).

## Project Structure

```
WeatherCheckerAPI/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx       # React entry point
    ├── App.jsx        # Main component (search, forecast logic, cards)
    ├── App.css        # Component styles
    └── index.css      # Global styles & body background
```

## License

MIT
