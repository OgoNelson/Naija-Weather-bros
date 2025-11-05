import express from 'express';
import { mastra } from './mastra/index';
import { getWeather } from './mastra/tools/weather-tool';
import { z } from 'zod';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

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
    if (!validForecastTypes.includes(forecastType as string)) {
      return res.status(400).json({
        error: 'Invalid forecastType. Must be one of: current, hourly, daily',
      });
    }

    const weatherData = await getWeather(city, forecastType as 'current' | 'hourly' | 'daily');
    
    res.status(200).json({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({
      error: 'Failed to fetch weather data',
      message: error instanceof Error ? error.message : 'Unknown error',
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

    // Get the weather workflow
    // Manually execute the workflow steps
    try {
      // Step 1: Fetch weather data
      const weatherData = await getWeather(city, forecastType);
      
      // Step 2: Get activity suggestions from the agent
      const agent = mastra.getAgent('weatherAgent');
      if (!agent) {
        return res.status(500).json({
          error: 'Weather agent not found',
        });
      }

      const prompt = `You are Naija Weather Pal, a friendly Naija-style weather buddy. Based on the following weather forecast for ${weatherData.location}, suggest appropriate activities in your unique Naija Pidgin style:

        Weather Data:
        ${JSON.stringify(weatherData, null, 2)}

        Respond in a casual tone, blending English and Pidgin with practical street-smart advice. Include:
        - Current weather summary with Naija flavor
        - Activities that make sense for the weather
        - Practical tips for Nigerians
        - Some humor and local references

        Example style:
        "For ${weatherData.location} today, na ${weatherData.conditions} you go see ${weatherData.temperature}°C. ${weatherData.temperature > 30 ? "E go hot small oo, better carry water 💧" : "Weather dey cool, good for waka"}${weatherData.precipitationProbability && weatherData.precipitationProbability > 50 ? ". Rain fit fall later, no forget umbrella ☔" : "."}"

        Make it sound authentic Nigerian - use words like "na", "oo", "sha", "abeg", "waka", "small", "well well" etc.`;

      const response = await agent.stream([
        {
          role: 'user',
          content: prompt,
        },
      ]);

      let activitiesText = '';
      for await (const chunk of response.textStream) {
        activitiesText += chunk;
      }

      const result = {
        activities: activitiesText,
      };

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (workflowError) {
      console.error('Workflow execution error:', workflowError);
      res.status(500).json({
        error: 'Failed to execute weather workflow',
        message: workflowError instanceof Error ? workflowError.message : 'Unknown error',
      });
    }
  } catch (error) {
    console.error('Weather workflow API error:', error);
    res.status(500).json({
      error: 'Failed to execute weather workflow',
      message: error instanceof Error ? error.message : 'Unknown error',
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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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