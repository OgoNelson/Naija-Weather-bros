import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getWeather } from './weather-tool';

export const travelWeatherTool = createTool({
  id: 'get-travel-weather',
  description: 'Get weather advisory for travel between two Nigerian cities',
  inputSchema: z.object({
    from: z.string().describe('Starting city in Nigeria'),
    to: z.string().describe('Destination city in Nigeria'),
    departureTime: z.string().optional().describe('Departure time (e.g., "6PM", "morning", "afternoon")'),
  }),
  outputSchema: z.object({
    from: z.object({
      city: z.string(),
      temperature: z.number(),
      conditions: z.string(),
      precipitationProbability: z.number().optional(),
    }),
    to: z.object({
      city: z.string(),
      temperature: z.number(),
      conditions: z.string(),
      precipitationProbability: z.number().optional(),
    }),
    travelAdvice: z.string(),
    recommendations: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    try {
      // Get weather for both cities
      const [fromWeather, toWeather] = await Promise.all([
        getWeather(context.from, 'current'),
        getWeather(context.to, 'current'),
      ]);

      // Get hourly forecasts for travel timing
      const [fromHourly, toHourly] = await Promise.all([
        getWeather(context.from, 'hourly'),
        getWeather(context.to, 'hourly'),
      ]);

      // Generate travel advice based on weather conditions
      const travelAdvice = generateTravelAdvice(
        context.from,
        context.to,
        fromWeather,
        toWeather,
        fromHourly.forecast || [],
        toHourly.forecast || [],
        context.departureTime
      );

      const recommendations = generateRecommendations(
        fromWeather,
        toWeather,
        context.departureTime
      );

      return {
        from: {
          city: fromWeather.location,
          temperature: fromWeather.temperature,
          conditions: fromWeather.conditions,
          precipitationProbability: fromHourly.forecast?.[0]?.precipitationProbability,
        },
        to: {
          city: toWeather.location,
          temperature: toWeather.temperature,
          conditions: toWeather.conditions,
          precipitationProbability: toHourly.forecast?.[0]?.precipitationProbability,
        },
        travelAdvice,
        recommendations,
      };
    } catch (error) {
      console.error('Error fetching travel weather:', error);
      throw new Error(`Failed to get travel weather: ${error}`);
    }
  },
});

function generateTravelAdvice(
  fromCity: string,
  toCity: string,
  fromWeather: any,
  toWeather: any,
  fromHourly: any[],
  toHourly: any[],
  departureTime?: string
): string {
  let advice = `If you dey go from ${fromCity} to ${toCity}`;
  
  // Add departure time context if provided
  if (departureTime) {
    advice += ` around ${departureTime}`;
  }
  
  // Check for precipitation
  const fromPrecip = fromHourly[0]?.precipitationProbability || 0;
  const toPrecip = toHourly[0]?.precipitationProbability || 0;
  
  if (fromPrecip > 50 || toPrecip > 50) {
    if (fromPrecip > 50 && toPrecip > 50) {
      advice += `, rain go show face for both cities ☔. Better carry umbrella and drive carefully oo!`;
    } else if (fromPrecip > 50) {
      advice += `, rain go start for ${fromCity} before you reach ${toCity} 🌧️. Check your wipers before you comot!`;
    } else {
      advice += `, weather dey okay for ${fromCity} but rain go welcome you for ${toCity} ☔. Prepare for wet road!`;
    }
  } else {
    advice += `, the weather dey cooperate well well 🌤️. Good journey ahead!`;
  }
  
  // Add temperature advice
  const avgTemp = (fromWeather.temperature + toWeather.temperature) / 2;
  if (avgTemp > 32) {
    advice += ` E go hot small - better carry water for the road 💧.`;
  } else if (avgTemp < 24) {
    advice += ` Weather dey cool - you go enjoy the journey 🌬️.`;
  }
  
  return advice;
}

function generateRecommendations(
  fromWeather: any,
  toWeather: any,
  departureTime?: string
): string[] {
  const recommendations: string[] = [];
  
  // General recommendations
  recommendations.push("Check your fuel level before you comot");
  recommendations.push("Make sure your phone battery full for navigation");
  
  // Weather-specific recommendations
  const maxPrecip = Math.max(
    fromWeather.precipitationProbability || 0,
    toWeather.precipitationProbability || 0
  );
  
  if (maxPrecip > 60) {
    recommendations.push("Drive slower than usual - road go slippery");
    recommendations.push("Make sure your wipers dey work well");
    recommendations.push("Check your tires - rain no be friend to bald tires");
  }
  
  if (fromWeather.temperature > 30 || toWeather.temperature > 30) {
    recommendations.push("Carry extra water to avoid dehydration");
    recommendations.push("If you get AC, better use am for this heat");
  }
  
  // Time-specific recommendations
  if (departureTime?.toLowerCase().includes('night') || 
      departureTime?.toLowerCase().includes('evening')) {
    recommendations.push("Make sure your headlights dey work properly");
    recommendations.push("Watch out for bad roads - e hard to see for night");
  }
  
  // Add some Naija flavor
  recommendations.push("No forget your driver license and papers - police dey wait 😂");
  recommendations.push("If traffic hold you, patient na virtue 🙏");
  
  return recommendations;
}