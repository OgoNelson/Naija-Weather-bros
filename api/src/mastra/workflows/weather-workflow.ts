import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { getWeather as fetchWeatherData } from "../tools/weather-tool";

const forecastSchema = z.object({
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
});

const fetchWeather = createStep({
  id: "fetch-weather",
  description: "Fetches weather forecast for a given Nigerian city",
  inputSchema: z.object({
    city: z.string().describe("The Nigerian city to get the weather for"),
    forecastType: z.enum(["current", "hourly", "daily"]).optional().describe("Type of forecast to get"),
  }),
  outputSchema: forecastSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    try {
      const weatherData = await fetchWeatherData(inputData.city, inputData.forecastType || "current");
      return weatherData;
    } catch (error) {
      console.error("Error in fetchWeather step:", error);
      throw new Error(`Failed to fetch weather for ${inputData.city}: ${error}`);
    }
  },
});

const planActivities = createStep({
  id: "plan-activities",
  description: "Suggests activities based on weather conditions in Naija style",
  inputSchema: forecastSchema,
  outputSchema: z.object({
    activities: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const forecast = inputData;

    if (!forecast) {
      throw new Error("Forecast data not found");
    }

    const agent = mastra?.getAgent("weatherAgent");
    if (!agent) {
      throw new Error("Weather agent not found");
    }

    const prompt = `You are Naija Weather Pal, a friendly Naija-style weather buddy. Based on the following weather forecast for ${forecast.location}, suggest appropriate activities in your unique Naija Pidgin style:

      Weather Data:
      ${JSON.stringify(forecast, null, 2)}

      Respond in a casual tone, blending English and Pidgin with practical street-smart advice. Include:
      - Current weather summary with Naija flavor
      - Activities that make sense for the weather
      - Practical tips for Nigerians
      - Some humor and local references

      Example style:
      "For ${forecast.location} today, na ${forecast.conditions} you go see ${forecast.temperature}°C. ${forecast.temperature > 30 ? "E go hot small oo, better carry water 💧" : "Weather dey cool, good for waka"}${forecast.precipitationProbability && forecast.precipitationProbability > 50 ? ". Rain fit fall later, no forget umbrella ☔" : "."}"

      Make it sound authentic Nigerian - use words like "na", "oo", "sha", "abeg", "waka", "small", "well well" etc.`;

    const response = await agent.stream([
      {
        role: "user",
        content: prompt,
      },
    ]);

    let activitiesText = "";

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      activitiesText += chunk;
    }

    return {
      activities: activitiesText,
    };
  },
});

const weatherWorkflow = createWorkflow({
  id: "weather-workflow",
  inputSchema: z.object({
    city: z.string().describe("The Nigerian city to get the weather for"),
    forecastType: z.enum(["current", "hourly", "daily"]).optional().describe("Type of forecast: current, hourly, or daily"),
  }),
  outputSchema: z.object({
    activities: z.string(),
  }),
})
  .then(fetchWeather)
  .then(planActivities);

// Test function
import { mastra } from "../index";
import { weatherTool, getWeather } from "../tools/weather-tool";

async function testWeather() {
  try {
    console.log("Testing weather tool with Lagos...");
    const weatherData = await getWeather("Lagos", "current");
    console.log("Weather data for Lagos:", weatherData);
    
    console.log("\nTesting workflow...");
    // For now, just test the weather tool directly
    // Workflow testing can be done separately
    console.log("Weather tool test completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Uncomment to test
// testWeather();

export { weatherWorkflow, testWeather };
