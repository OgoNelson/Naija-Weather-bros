import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Open-Meteo API interfaces
const getWeatherCondition = (code) => {
  const conditions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return conditions[code] || 'Unknown';
};

// Geocoding function to get coordinates for Nigerian cities
const geocodeLocation = async (location) => {
  try {
    // Use Open-Meteo geocoding API
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&country=NG`;
    const geocodingResponse = await axios.get(geocodingUrl);
    
    if (geocodingResponse.data.results?.[0]) {
      const { latitude, longitude, name } = geocodingResponse.data.results[0];
      return { lat: latitude, lon: longitude, name };
    }
    
    // If no Nigerian city found, try without country filter
    const fallbackUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
    const fallbackResponse = await axios.get(fallbackUrl);
    
    if (fallbackResponse.data.results?.[0]) {
      const { latitude, longitude, name } = fallbackResponse.data.results[0];
      return { lat: latitude, lon: longitude, name };
    }
    
    throw new Error(`Location '${location}' not found`);
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error(`Failed to find location: ${location}`);
  }
};

// Enhanced weather function with support for different forecast types
const getWeather = async (
  location,
  forecastType = 'current'
) => {
  try {
    // Get coordinates for the location
    const { lat, lon, name } = await geocodeLocation(location);
    
    // Build the API URL based on forecast type
    let weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=auto`;
    
    if (forecastType === 'current') {
      weatherUrl += '&current_weather=true&hourly=temperature_2m,apparent_temperature,relativehumidity_2m,windspeed_10m,windgusts_10m,weathercode,precipitation_probability,uv_index';
    } else if (forecastType === 'hourly') {
      weatherUrl += '&hourly=temperature_2m,apparent_temperature,relativehumidity_2m,windspeed_10m,windgusts_10m,weathercode,precipitation_probability,uv_index&forecast_hours=24';
    } else if (forecastType === 'daily') {
      weatherUrl += '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7';
    }
    
    const response = await axios.get(weatherUrl);
    
    if (forecastType === 'current') {
      if (!response.data.current_weather || !response.data.hourly) {
        throw new Error('No current weather data available');
      }
      
      const current = response.data.current_weather;
      const hourly = response.data.hourly;
      
      // Get the current hour index (first item should be current)
      const currentHourIndex = 0;
      
      return {
        location: name,
        temperature: Math.round(current.temperature),
        feelsLike: Math.round(hourly.apparent_temperature[currentHourIndex]),
        humidity: Math.round(hourly.relativehumidity_2m[currentHourIndex]),
        windSpeed: Math.round(current.windspeed),
        windGust: Math.round(hourly.windgusts_10m[currentHourIndex]),
        conditions: getWeatherCondition(current.weathercode),
        precipitationProbability: hourly.precipitation_probability[currentHourIndex],
        uvIndex: hourly.uv_index[currentHourIndex],
      };
    }
    
    if (forecastType === 'hourly') {
      if (!response.data.hourly) {
        throw new Error('No hourly forecast data available');
      }
      
      const hourly = response.data.hourly;
      const forecast = hourly.time.map((time, index) => ({
        time,
        temperature: Math.round(hourly.temperature_2m[index]),
        conditions: getWeatherCondition(hourly.weathercode[index]),
        precipitationProbability: hourly.precipitation_probability[index],
        uvIndex: hourly.uv_index[index],
      }));
      
      return {
        location: name,
        temperature: forecast[0].temperature,
        feelsLike: forecast[0].temperature,
        humidity: 0, // Not available in this format
        windSpeed: 0, // Not available in this format
        windGust: 0, // Not available in this format
        conditions: forecast[0].conditions,
        forecast,
      };
    }
    
    if (forecastType === 'daily') {
      if (!response.data.daily) {
        throw new Error('No daily forecast data available');
      }
      
      const daily = response.data.daily;
      const forecast = daily.time.map((time, index) => ({
        time,
        temperature: Math.round((daily.temperature_2m_max[index] + daily.temperature_2m_min[index]) / 2),
        conditions: getWeatherCondition(daily.weathercode[index]),
        precipitationProbability: daily.precipitation_probability_max[index],
      }));
      
      return {
        location: name,
        temperature: forecast[0].temperature,
        feelsLike: forecast[0].temperature,
        humidity: 0, // Not available in daily forecast
        windSpeed: 0, // Not available in daily forecast
        windGust: 0, // Not available in daily forecast
        conditions: forecast[0].conditions,
        forecast,
      };
    }
    
    throw new Error('Invalid forecast type');
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    throw new Error(`Failed to get weather for ${location}: ${error.message}`);
  }
};

// Generate Naija-style activity suggestions
const generateActivities = (weatherData) => {
  const { location, temperature, conditions, precipitationProbability } = weatherData;
  
  let activities = `For ${location} today, na ${conditions} you go see ${temperature}°C. `;
  
  if (temperature > 30) {
    activities += "E go hot small oo, better carry water 💧. ";
  } else if (temperature > 25) {
    activities += "Weather dey warm, good for outdoor activities. ";
  } else {
    activities += "Weather dey cool, good for waka. ";
  }
  
  if (precipitationProbability && precipitationProbability > 50) {
    activities += "Rain fit fall later, no forget umbrella ☔. ";
  }
  
  if (conditions.includes('rain') || conditions.includes('drizzle')) {
    activities += "Make you find indoor activities like cinema or shopping mall. ";
  } else if (conditions.includes('clear') || conditions.includes('sunny')) {
    activities += "Perfect day for beach or outdoor sports! ";
  } else if (conditions.includes('cloud')) {
    activities += "Good weather for sightseeing and photography. ";
  }
  
  activities += "Enjoy your day my Naija people! 🇳🇬";
  
  return activities;
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Naija Weather Bros API is running',
    timestamp: new Date().toISOString(),
  });
});

// Weather data endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const { city, forecastType = 'current' } = req.query;
    
    if (!city || typeof city !== 'string') {
      return res.status(400).json({
        error: 'City parameter is required',
        example: '/api/weather?city=Lagos&forecastType=current',
      });
    }

    const validForecastTypes = ['current', 'hourly', 'daily'];
    if (!validForecastTypes.includes(forecastType)) {
      return res.status(400).json({
        error: 'Invalid forecastType. Must be one of: current, hourly, daily',
      });
    }

    const weatherData = await getWeather(city, forecastType);
    
    res.status(200).json({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({
      error: 'Failed to fetch weather data',
      message: error.message,
    });
  }
});

// Weather workflow endpoint (includes activity suggestions)
app.post('/api/weather/workflow', async (req, res) => {
  try {
    const { city, forecastType = 'current' } = req.body;
    
    if (!city || typeof city !== 'string') {
      return res.status(400).json({
        error: 'City parameter is required in request body',
        example: { city: 'Lagos', forecastType: 'current' },
      });
    }

    const validForecastTypes = ['current', 'hourly', 'daily'];
    if (!validForecastTypes.includes(forecastType)) {
      return res.status(400).json({
        error: 'Invalid forecastType. Must be one of: current, hourly, daily',
      });
    }

    // Get weather data
    const weatherData = await getWeather(city, forecastType);
    
    // Generate activity suggestions
    const activities = generateActivities(weatherData);

    const result = {
      activities,
    };

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Weather workflow API error:', error);
    res.status(500).json({
      error: 'Failed to execute weather workflow',
      message: error.message,
    });
  }
});

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Naija Weather Bros API',
    version: '1.0.0',
    description: 'Weather API for Nigerian cities with activity suggestions',
    endpoints: {
      health: {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint',
      },
      weather: {
        method: 'GET',
        path: '/api/weather',
        description: 'Get weather data for a Nigerian city',
        parameters: {
          city: 'string (required) - Nigerian city name',
          forecastType: 'string (optional) - current, hourly, or daily (default: current)',
        },
        example: '/api/weather?city=Lagos&forecastType=current',
      },
      weatherWorkflow: {
        method: 'POST',
        path: '/api/weather/workflow',
        description: 'Get weather data with activity suggestions in Naija style',
        body: {
          city: 'string (required) - Nigerian city name',
          forecastType: 'string (optional) - current, hourly, or daily (default: current)',
        },
        example: { city: 'Lagos', forecastType: 'current' },
      },
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: ['/health', '/api/weather', '/api/weather/workflow', '/'],
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌤️  Naija Weather Bros API server running on port ${PORT}`);
  console.log(`📖 API documentation available at http://localhost:${PORT}/`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🌡️  Weather endpoint: http://localhost:${PORT}/api/weather?city=Lagos`);
  console.log(`🎯 Weather workflow: http://localhost:${PORT}/api/weather/workflow`);
});

export default app;