import { useState } from 'react'
import './App.css'

// WMO Weather Code → { label, emoji, lightBg, darkBg }
const WMO_CODES = {
  0:  { label: 'Clear Sky',          emoji: '☀️',  lightBg: '#FFF9C4', darkBg: '#3a3510' },
  1:  { label: 'Mainly Clear',       emoji: '🌤️', lightBg: '#FFF9C4', darkBg: '#3a3510' },
  2:  { label: 'Partly Cloudy',      emoji: '⛅',  lightBg: '#E3F2FD', darkBg: '#1a2a3a' },
  3:  { label: 'Overcast',           emoji: '☁️',  lightBg: '#ECEFF1', darkBg: '#252830' },
  45: { label: 'Foggy',              emoji: '🌫️', lightBg: '#ECEFF1', darkBg: '#252830' },
  48: { label: 'Icy Fog',            emoji: '🌫️', lightBg: '#ECEFF1', darkBg: '#252830' },
  51: { label: 'Light Drizzle',      emoji: '🌦️', lightBg: '#E3F2FD', darkBg: '#1a2a3a' },
  53: { label: 'Drizzle',            emoji: '🌦️', lightBg: '#E3F2FD', darkBg: '#1a2a3a' },
  55: { label: 'Heavy Drizzle',      emoji: '🌧️', lightBg: '#BBDEFB', darkBg: '#152235' },
  61: { label: 'Light Rain',         emoji: '🌧️', lightBg: '#BBDEFB', darkBg: '#152235' },
  63: { label: 'Rain',               emoji: '🌧️', lightBg: '#BBDEFB', darkBg: '#152235' },
  65: { label: 'Heavy Rain',         emoji: '🌧️', lightBg: '#90CAF9', darkBg: '#0f1a28' },
  71: { label: 'Light Snow',         emoji: '🌨️', lightBg: '#E8EAF6', darkBg: '#1e2030' },
  73: { label: 'Snow',               emoji: '❄️',  lightBg: '#E8EAF6', darkBg: '#1e2030' },
  75: { label: 'Heavy Snow',         emoji: '❄️',  lightBg: '#C5CAE9', darkBg: '#181b2a' },
  77: { label: 'Snow Grains',        emoji: '🌨️', lightBg: '#E8EAF6', darkBg: '#1e2030' },
  80: { label: 'Light Showers',      emoji: '🌦️', lightBg: '#E3F2FD', darkBg: '#1a2a3a' },
  81: { label: 'Rain Showers',       emoji: '🌧️', lightBg: '#BBDEFB', darkBg: '#152235' },
  82: { label: 'Heavy Showers',      emoji: '⛈️',  lightBg: '#90CAF9', darkBg: '#0f1a28' },
  85: { label: 'Snow Showers',       emoji: '🌨️', lightBg: '#E8EAF6', darkBg: '#1e2030' },
  86: { label: 'Heavy Snow Showers', emoji: '❄️',  lightBg: '#C5CAE9', darkBg: '#181b2a' },
  95: { label: 'Thunderstorm',       emoji: '⛈️',  lightBg: '#B0BEC5', darkBg: '#1a1e22' },
  96: { label: 'Thunderstorm',       emoji: '⛈️',  lightBg: '#B0BEC5', darkBg: '#1a1e22' },
  99: { label: 'Severe Thunderstorm',emoji: '🌩️', lightBg: '#90A4AE', darkBg: '#141820' },
}

function getWeatherInfo(code) {
  return WMO_CODES[code] ?? { label: 'Unknown', emoji: '🌡️', lightBg: '#F5F5F5', darkBg: '#222' }
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function toC(f) { return (f - 32) * 5 / 9 }

function displayTemp(f, unit) {
  return unit === 'C' ? Math.round(toC(f)) : Math.round(f)
}

function displayWind(mph, unit) {
  return unit === 'C'
    ? `${Math.round(mph * 1.60934)} km/h`
    : `${Math.round(mph)} mph`
}

function degreesToCompass(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

function formatHour(isoString) {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
}

// ── Hourly Panel ──────────────────────────────────────────────
function HourlyPanel({ hours, date, unit, dark, onClose }) {
  // Show every 3 hours → 8 slots
  const slots = hours.filter((_, i) => i % 3 === 0)

  return (
    <div className={`hourly-panel ${dark ? 'hourly-panel--dark' : ''}`}>
      <div className="hourly-panel__header">
        <span className="hourly-panel__title">Hourly · {formatDate(date)}</span>
        <button className="hourly-panel__close" onClick={onClose} aria-label="Close hourly view">✕</button>
      </div>
      <div className="hourly-panel__scroll">
        {slots.map((h, i) => {
          const w = getWeatherInfo(h.weathercode)
          return (
            <div key={i} className="hour-slot">
              <span className="hour-slot__time">{formatHour(h.time)}</span>
              <span className="hour-slot__icon">{w.emoji}</span>
              <span className="hour-slot__temp">{displayTemp(h.temperature, unit)}°</span>
              <span className="hour-slot__stat">💨 {displayWind(h.windspeed, unit)}</span>
              <span className="hour-slot__stat">💧 {h.humidity}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Forecast Card ─────────────────────────────────────────────
function ForecastCard({ day, index, unit, dark, selected, onClick }) {
  const weather = getWeatherInfo(day.weathercode)
  const isToday = index === 0
  const cardBg = dark ? weather.darkBg : weather.lightBg

  return (
    <div
      className={`forecast-card ${isToday ? 'forecast-card--today' : ''} ${selected ? 'forecast-card--selected' : ''}`}
      style={{ '--card-bg': cardBg }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      aria-pressed={selected}
    >
      <div className="forecast-card__date">
        <span className="forecast-card__weekday">{formatDate(day.date)}</span>
      </div>
      <div className="forecast-card__icon">{weather.emoji}</div>
      <div className="forecast-card__label">{weather.label}</div>
      <div className="forecast-card__temps">
        <span className="forecast-card__high">{displayTemp(day.temperature_2m_max, unit)}°</span>
        <span className="forecast-card__separator">/</span>
        <span className="forecast-card__low">{displayTemp(day.temperature_2m_min, unit)}°</span>
      </div>

      <div className="forecast-card__divider" />

      <div className="forecast-card__stats">
        <span className="forecast-card__stat" title="Max wind speed">
          💨 {displayWind(day.windspeed_max, unit)}
        </span>
        <span className="forecast-card__stat" title="Avg humidity">
          💧 {day.humidity_avg}%
        </span>
      </div>

      {day.precip_probability > 0 && (
        <div className="forecast-card__precip">
          🌂 {day.precip_probability}% chance
        </div>
      )}

      <div className="forecast-card__expand-hint">
        {selected ? '▲ collapse' : '▼ hourly'}
      </div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const [query, setQuery] = useState('')
  const [forecast, setForecast] = useState(null)
  const [hourlyByDate, setHourlyByDate] = useState({})
  const [locationName, setLocationName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unit, setUnit] = useState('F')
  const [dark, setDark] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  async function handleSearch(e) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')
    setForecast(null)
    setHourlyByDate({})
    setLocationName('')
    setSelectedDate(null)

    try {
      // Step 1: Geocode
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=1&language=en&format=json`
      )
      if (!geoRes.ok) throw new Error('Geocoding service unavailable. Please try again.')

      const geoData = await geoRes.json()
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`No location found for "${trimmed}". Try a city name (e.g. "New York") or a different ZIP code.`)
      }

      const { latitude, longitude, name, admin1, country } = geoData.results[0]
      setLocationName([name, admin1, country].filter(Boolean).join(', '))

      // Step 2: Fetch daily + hourly in one request
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,winddirection_10m_dominant,precipitation_probability_max` +
        `&hourly=temperature_2m,weathercode,relativehumidity_2m,windspeed_10m` +
        `&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=mm&timezone=auto&forecast_days=10`
      )
      if (!weatherRes.ok) throw new Error('Weather service unavailable. Please try again.')

      const wd = await weatherRes.json()

      // Build hourly lookup: { 'YYYY-MM-DD': [...hours] }
      const hourly = {}
      wd.hourly.time.forEach((isoTime, i) => {
        const date = isoTime.slice(0, 10)
        if (!hourly[date]) hourly[date] = []
        hourly[date].push({
          time: isoTime,
          temperature: wd.hourly.temperature_2m[i],
          weathercode: wd.hourly.weathercode[i],
          humidity: wd.hourly.relativehumidity_2m[i],
          windspeed: wd.hourly.windspeed_10m[i],
        })
      })
      setHourlyByDate(hourly)

      // Build daily data with daily avg humidity from hourly
      const days = wd.daily.time.map((date, i) => {
        const hoursForDay = hourly[date] ?? []
        const avgHumidity = hoursForDay.length
          ? Math.round(hoursForDay.reduce((s, h) => s + h.humidity, 0) / hoursForDay.length)
          : null

        return {
          date,
          weathercode: wd.daily.weathercode[i],
          temperature_2m_max: wd.daily.temperature_2m_max[i],
          temperature_2m_min: wd.daily.temperature_2m_min[i],
          precipitation_sum: wd.daily.precipitation_sum[i] ?? 0,
          windspeed_max: wd.daily.windspeed_10m_max[i] ?? 0,
          winddirection: wd.daily.winddirection_10m_dominant[i] ?? 0,
          precip_probability: wd.daily.precipitation_probability_max[i] ?? 0,
          humidity_avg: avgHumidity ?? '--',
        }
      })

      setForecast(days)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleCardClick(date) {
    setSelectedDate(prev => prev === date ? null : date)
  }

  const todayWeather = forecast ? getWeatherInfo(forecast[0].weathercode) : null

  return (
    <div className={`app ${dark ? 'app--dark' : ''}`}>
      <div className="app__container">

        {/* Top controls */}
        <div className="controls">
          <button
            className="toggle-btn"
            onClick={() => setUnit(u => u === 'F' ? 'C' : 'F')}
            aria-label="Toggle temperature unit"
          >
            °{unit === 'F' ? 'F' : 'C'}
            <span className="toggle-btn__track">
              <span className={`toggle-btn__thumb ${unit === 'C' ? 'toggle-btn__thumb--right' : ''}`} />
            </span>
            °{unit === 'F' ? 'C' : 'F'}
          </button>

          <button
            className="toggle-btn"
            onClick={() => setDark(d => !d)}
            aria-label="Toggle dark mode"
          >
            {dark ? '☀️' : '🌙'}
            <span className="toggle-btn__track">
              <span className={`toggle-btn__thumb ${dark ? 'toggle-btn__thumb--right' : ''}`} />
            </span>
            {dark ? '🌙' : '☀️'}
          </button>
        </div>

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
              <h2 className="results__location">📍 {locationName}</h2>
              <p className="results__today-summary">
                {todayWeather.emoji} Today: {todayWeather.label} · {displayTemp(forecast[0].temperature_2m_max, unit)}°{unit} high
                {' · '}💨 {displayWind(forecast[0].windspeed_max, unit)}
                {' · '}💧 {forecast[0].humidity_avg}%
              </p>
              <p className="results__hint">Click any day for an hourly breakdown</p>
            </div>

            <div className="forecast-grid">
              {forecast.map((day, i) => (
                <ForecastCard
                  key={day.date}
                  day={day}
                  index={i}
                  unit={unit}
                  dark={dark}
                  selected={selectedDate === day.date}
                  onClick={() => handleCardClick(day.date)}
                />
              ))}
            </div>

            {/* Hourly panel */}
            {selectedDate && hourlyByDate[selectedDate] && (
              <HourlyPanel
                hours={hourlyByDate[selectedDate]}
                date={selectedDate}
                unit={unit}
                dark={dark}
                onClose={() => setSelectedDate(null)}
              />
            )}

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
