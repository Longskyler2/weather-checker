import { useState } from 'react'
import './App.css'

// WMO Weather Code → { label, emoji, bg }
const WMO_CODES = {
  0:  { label: 'Clear Sky',         emoji: '☀️',  bg: '#FFF9C4' },
  1:  { label: 'Mainly Clear',      emoji: '🌤️', bg: '#FFF9C4' },
  2:  { label: 'Partly Cloudy',     emoji: '⛅',  bg: '#E3F2FD' },
  3:  { label: 'Overcast',          emoji: '☁️',  bg: '#ECEFF1' },
  45: { label: 'Foggy',             emoji: '🌫️', bg: '#ECEFF1' },
  48: { label: 'Icy Fog',           emoji: '🌫️', bg: '#ECEFF1' },
  51: { label: 'Light Drizzle',     emoji: '🌦️', bg: '#E3F2FD' },
  53: { label: 'Drizzle',           emoji: '🌦️', bg: '#E3F2FD' },
  55: { label: 'Heavy Drizzle',     emoji: '🌧️', bg: '#BBDEFB' },
  61: { label: 'Light Rain',        emoji: '🌧️', bg: '#BBDEFB' },
  63: { label: 'Rain',              emoji: '🌧️', bg: '#BBDEFB' },
  65: { label: 'Heavy Rain',        emoji: '🌧️', bg: '#90CAF9' },
  71: { label: 'Light Snow',        emoji: '🌨️', bg: '#E8EAF6' },
  73: { label: 'Snow',              emoji: '❄️',  bg: '#E8EAF6' },
  75: { label: 'Heavy Snow',        emoji: '❄️',  bg: '#C5CAE9' },
  77: { label: 'Snow Grains',       emoji: '🌨️', bg: '#E8EAF6' },
  80: { label: 'Light Showers',     emoji: '🌦️', bg: '#E3F2FD' },
  81: { label: 'Rain Showers',      emoji: '🌧️', bg: '#BBDEFB' },
  82: { label: 'Heavy Showers',     emoji: '⛈️',  bg: '#90CAF9' },
  85: { label: 'Snow Showers',      emoji: '🌨️', bg: '#E8EAF6' },
  86: { label: 'Heavy Snow Showers',emoji: '❄️',  bg: '#C5CAE9' },
  95: { label: 'Thunderstorm',      emoji: '⛈️',  bg: '#B0BEC5' },
  96: { label: 'Thunderstorm',      emoji: '⛈️',  bg: '#B0BEC5' },
  99: { label: 'Severe Thunderstorm',emoji: '🌩️', bg: '#90A4AE' },
}

function getWeatherInfo(code) {
  return WMO_CODES[code] ?? { label: 'Unknown', emoji: '🌡️', bg: '#F5F5F5' }
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00') // avoid timezone edge case
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function ForecastCard({ day, index }) {
  const weather = getWeatherInfo(day.weathercode)
  const isToday = index === 0

  return (
    <div className={`forecast-card ${isToday ? 'forecast-card--today' : ''}`} style={{ '--card-bg': weather.bg }}>
      <div className="forecast-card__date">
        <span className="forecast-card__weekday">{formatDate(day.date)}</span>
      </div>
      <div className="forecast-card__icon">{weather.emoji}</div>
      <div className="forecast-card__label">{weather.label}</div>
      <div className="forecast-card__temps">
        <span className="forecast-card__high">{Math.round(day.temperature_2m_max)}°</span>
        <span className="forecast-card__separator">/</span>
        <span className="forecast-card__low">{Math.round(day.temperature_2m_min)}°</span>
      </div>
      {day.precipitation_sum > 0 && (
        <div className="forecast-card__precip">
          💧 {day.precipitation_sum.toFixed(1)} mm
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [forecast, setForecast] = useState(null)
  const [locationName, setLocationName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')
    setForecast(null)
    setLocationName('')

    try {
      // Step 1: Geocode the query (supports city names and many ZIP codes)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=1&language=en&format=json`
      )
      if (!geoRes.ok) throw new Error('Geocoding service unavailable. Please try again.')

      const geoData = await geoRes.json()
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`No location found for "${trimmed}". Try a city name (e.g. "New York") or a different ZIP code.`)
      }

      const { latitude, longitude, name, admin1, country } = geoData.results[0]
      const displayName = [name, admin1, country].filter(Boolean).join(', ')
      setLocationName(displayName)

      // Step 2: Fetch 10-day forecast from Open-Meteo
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum` +
        `&temperature_unit=fahrenheit&precipitation_unit=mm&timezone=auto&forecast_days=10`
      )
      if (!weatherRes.ok) throw new Error('Weather service unavailable. Please try again.')

      const weatherData = await weatherRes.json()
      const { time, weathercode, temperature_2m_max, temperature_2m_min, precipitation_sum } = weatherData.daily

      const days = time.map((date, i) => ({
        date,
        weathercode: weathercode[i],
        temperature_2m_max: temperature_2m_max[i],
        temperature_2m_min: temperature_2m_min[i],
        precipitation_sum: precipitation_sum[i] ?? 0,
      }))

      setForecast(days)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const todayWeather = forecast ? getWeatherInfo(forecast[0].weathercode) : null

  return (
    <div className="app">
      <div className="app__container">
        {/* Header */}
        <header className="header">
          <div className="header__icon">🌤️</div>
          <h1 className="header__title">10-Day Weather Forecast</h1>
          <p className="header__subtitle">Enter a city name or ZIP code to get started</p>
        </header>

        {/* Search */}
        <form className="search" onSubmit={handleSearch}>
          <div className="search__input-wrap">
            <span className="search__input-icon">📍</span>
            <input
              className="search__input"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. New York, London, 90210"
              aria-label="Location"
              disabled={loading}
            />
          </div>
          <button className="search__button" type="submit" disabled={loading || !query.trim()}>
            {loading ? <span className="spinner" /> : 'Get Forecast'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="error-banner" role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="skeleton-grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        )}

        {/* Results */}
        {forecast && !loading && (
          <section className="results">
            <div className="results__header">
              <h2 className="results__location">
                📍 {locationName}
              </h2>
              <p className="results__today-summary">
                {todayWeather.emoji} Today: {todayWeather.label} · {Math.round(forecast[0].temperature_2m_max)}°F high
              </p>
            </div>

            <div className="forecast-grid">
              {forecast.map((day, i) => (
                <ForecastCard key={day.date} day={day} index={i} />
              ))}
            </div>

            <p className="results__attribution">
              Powered by <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">Open-Meteo</a> · Free & open-source weather API
            </p>
          </section>
        )}

        {/* Empty state */}
        {!forecast && !loading && !error && (
          <div className="empty-state">
            <div className="empty-state__illustration">🌍</div>
            <p>Search for any city or ZIP code to see a 10-day forecast</p>
          </div>
        )}
      </div>
    </div>
  )
}
