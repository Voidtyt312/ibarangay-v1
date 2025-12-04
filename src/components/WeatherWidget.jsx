import { useEffect, useState } from 'react';

function WeatherWidget({ location = null }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        let latitude = 9.7612;   // Default: Dalaguete, Cebu
        let longitude = 123.5349;
        let locationName = 'Dalaguete, Cebu';

        // If location prop is provided, use geocoding to get coordinates
        if (location && location.municipality && location.province) {
          locationName = `${location.municipality}, ${location.province}`;
          try {
            const geoResponse = await fetch(
              `https://geocoding-api.open-meteo.com/v1/search?name=${location.municipality}&admin1=${location.province}&country=Philippines&language=en&limit=1`
            );
            const geoData = await geoResponse.json();
            if (geoData.results && geoData.results.length > 0) {
              latitude = geoData.results[0].latitude;
              longitude = geoData.results[0].longitude;
            }
          } catch (geoErr) {
            console.warn('Geocoding failed, using default coordinates:', geoErr);
          }
        }

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Manila`
        );

        if (!response.ok) throw new Error('Failed to fetch weather');

        const data = await response.json();
        const current = data.current;
        const daily = data.daily;

        setWeather({
          location: locationName,
          current: {
            temp: Math.round(current.temperature_2m),
            condition: getWeatherCondition(current.weather_code),
            humidity: current.relative_humidity_2m,
            windSpeed: Math.round(current.wind_speed_10m),
            icon: getWeatherIcon(current.weather_code),
          },
          forecast: [
            {
              day: 'Tomorrow',
              high: Math.round(daily.temperature_2m_max[1]),
              low: Math.round(daily.temperature_2m_min[1]),
              condition: getWeatherCondition(daily.weather_code[1]),
              precipitation: daily.precipitation_sum[1],
              icon: getWeatherIcon(daily.weather_code[1]),
            },
            {
              day: 'Day After',
              high: Math.round(daily.temperature_2m_max[2]),
              low: Math.round(daily.temperature_2m_min[2]),
              condition: getWeatherCondition(daily.weather_code[2]),
              precipitation: daily.precipitation_sum[2],
              icon: getWeatherIcon(daily.weather_code[2]),
            },
          ],
        });
        setError(null);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Unable to load weather data');
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location?.municipality, location?.province]);

  const getWeatherCondition = (code) => {
    // WMO Weather interpretation codes
    const conditions = {
      0: 'Clear',
      1: 'Mostly Clear',
      2: 'Partly Cloudy',
      3: 'Cloudy',
      45: 'Foggy',
      48: 'Foggy',
      51: 'Light Drizzle',
      53: 'Drizzle',
      55: 'Heavy Drizzle',
      61: 'Light Rain',
      63: 'Rain',
      65: 'Heavy Rain',
      71: 'Light Snow',
      73: 'Snow',
      75: 'Heavy Snow',
      77: 'Snow Grains',
      80: 'Light Showers',
      81: 'Showers',
      82: 'Heavy Showers',
      85: 'Light Snow Showers',
      86: 'Snow Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with Hail',
      99: 'Thunderstorm with Hail',
    };
    return conditions[code] || 'Unknown';
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️';
    if (code === 1 || code === 2) return '⛅';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 86) return '❄️';
    if (code >= 95) return '⛈️';
    return '🌤️';
  };

  if (loading) {
    return (
      <div className="weather-widget loading">
        <div className="spinner"></div>
        <p>Loading weather...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget error">
        <p>⚠️ {error}</p>
      </div>
    );
  }

  return (
    <div className="weather-widget">
      <div className="weather-current">
        <div className="weather-main">
          <div className="temp-display">
            <span className="icon">{weather.current.icon}</span>
            <span className="temperature">{weather.current.temp}°C</span>
          </div>
          <div className="weather-details">
            <p className="condition">{weather.current.condition}</p>
            <p className="meta">{weather.location}</p>
          </div>
        </div>
        <div className="stats">
          <span className="stat">
            <span className="stat-icon">💧</span>
            <span className="stat-label">Humidity: {weather.current.humidity}%</span>
          </span>
          <span className="stat">
            <span className="stat-icon">💨</span>
            <span className="stat-label">Wind: {weather.current.windSpeed} km/h</span>
          </span>
        </div>
      </div>

      <div className="weather-forecast">
        <h4>3-Day Forecast</h4>
        <div className="forecast-list">
          {weather.forecast.map((day, idx) => (
            <div key={idx} className="forecast-item">
              <p className="day">{day.day}</p>
              <span className="forecast-icon">{day.icon}</span>
              <p className="temps">
                <span className="high">{day.high}°</span>
                <span className="low">{day.low}°</span>
              </p>
              <p className="condition-small">{day.condition}</p>
              {day.precipitation > 0 && (
                <p className="precipitation">💧 {Math.round(day.precipitation)}mm</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="weather-advisory">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p>Check weather regularly, especially during typhoon season</p>
      </div>
    </div>
  );
}

export default WeatherWidget;
