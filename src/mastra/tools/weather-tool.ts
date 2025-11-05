import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Open-Meteo API interfaces
interface OpenMeteoGeocodingResponse {
  results: Array<{
    latitude: number;
    longitude: number;
    name: string;
    country: string;
    admin1?: string;
  }>;
}

interface OpenMeteoWeatherResponse {
  latitude: number;
  longitude: number;
  current_weather?: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    is_day: number;
    time: string;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    relativehumidity_2m: number[];
    windspeed_10m: number[];
    windgusts_10m: number[];
    weathercode: number[];
    precipitation_probability: number[];
    uv_index: number[];
  };
  daily?: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
}

// Weather condition mapping for Open-Meteo WMO codes
const getWeatherCondition = (code: number): string => {
  const conditions: Record<number, string> = {
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
const geocodeLocation = async (location: string): Promise<{ lat: number; lon: number; name: string }> => {
  try {
    // Use Open-Meteo geocoding API
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&country=NG`;
    const geocodingResponse = await axios.get<OpenMeteoGeocodingResponse>(geocodingUrl);
    
    if (geocodingResponse.data.results?.[0]) {
      const { latitude, longitude, name } = geocodingResponse.data.results[0];
      return { lat: latitude, lon: longitude, name };
    }
    
    // If no Nigerian city found, try without country filter
    const fallbackUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
    const fallbackResponse = await axios.get<OpenMeteoGeocodingResponse>(fallbackUrl);
    
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

// Main weather tool
export const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a Nigerian city',
  inputSchema: z.object({
    location: z.string().describe('Nigerian city name (e.g., Lagos, Abuja, Port Harcourt)'),
    forecastType: z.enum(['current', 'hourly', 'daily']).optional().describe('Type of forecast: current, hourly, or daily'),
  }),
  outputSchema: z.object({
    location: z.string(),
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windGust: z.number(),
    conditions: z.string(),
    precipitationProbability: z.number().optional(),
    uvIndex: z.number().optional(),
    forecast: z.array(z.object({
      time: z.string(),
      temperature: z.number(),
      conditions: z.string(),
      precipitationProbability: z.number().optional(),
    })).optional(),
  }),
  execute: async ({ context }) => {
    const weatherData = await getWeather(context.location, context.forecastType || 'current');
    console.log('Weather data for ' + context.location + ':', weatherData);
    return weatherData;
  },
});

// Enhanced weather function with support for different forecast types
export const getWeather = async (
  location: string,
  forecastType: 'current' | 'hourly' | 'daily' = 'current'
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
    
    const response = await axios.get<OpenMeteoWeatherResponse>(weatherUrl);
    
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
  } catch (error: any) {
    console.error('Error fetching weather data:', error.message);
    throw new Error(`Failed to get weather for ${location}: ${error.message}`);
  }
};
