# Naija Weather Bros 🌤️

Your friendly Nigerian weather AI agent that delivers weather updates in authentic Naija Pidgin with practical local advice.

## 🎭 About

Naija Weather Bros is an AI-powered weather assistant specifically designed for Nigerians. It blends English with light Pidgin, provides practical street-smart advice, and understands the local context of weather conditions in Nigeria.

## ✨ Features

### ☀️ Current Weather
Get real-time weather information for any city in Nigeria
- Temperature, humidity, wind conditions
- Weather conditions in simple terms
- Practical advice for the day

### 🌧️ Daily & Hourly Forecast
Plan your day with accurate weather predictions
- Today and tomorrow's forecast
- Hourly breakdown for the next 24 hours
- Rain probability and timing

### 🚗 Travel Advisory
Weather intelligence for your road trips
- Weather conditions between two cities
- Road safety recommendations
- Best travel times based on weather

### 💡 Local Tips
Nigerian-specific weather wisdom
- Power outage warnings for thunderstorms
- Network disruption alerts
- Traffic considerations for bad weather

## 🛠️ Tech Stack

- **Framework**: Mastra (AI Agent Framework)
- **Language**: TypeScript
- **Weather API**: Open-Meteo
- **AI Model**: Google Gemini 2.5 Pro
- **Storage**: LibSQL (with memory persistence)

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 20.9.0)
- npm or yarn
- Google Generative AI API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd naija-weather-bros
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
```

4. Run the development server
```bash
npm run dev
```

## 📝 Usage Examples

### Basic Weather Query
```
User: "Naija Weather Bros, how the weather for Lagos today?"
Agent: "For Lagos today, na light rain you go see later this afternoon 🌧️. Temperature dey around 29°C — e go humid small, abeg no forget your umbrella o!"
```

### Travel Advisory
```
User: "I wan travel from Abuja to Port Harcourt tomorrow morning"
Agent: "For your journey from Abuja to Port Harcourt tomorrow morning, the weather dey cooperate well well 🌤️. Abuja go be sunny around 26°C while Port Harcourt go be partly cloudy with 28°C. No serious rain expected, so you fit travel safely. Just make sure your AC dey work well for the heat!"
```

### Hourly Forecast
```
User: "Give me 6 hours forecast for Kano"
Agent: "For Kano next 6 hours: Morning go sunny well well ☀️ with temperature around 30°C. Afternoon go still hot but small clouds go show face. No rain expected, so good day for outdoor activities. Better carry water sha, e go hot!"
```

## 🏗️ Project Structure

```
src/mastra/
├── agents/
│   └── weather-agent.ts      # Main AI agent with Naija persona
├── tools/
│   ├── weather-tool.ts       # Weather data fetching from Open-Meteo
│   └── travel-weather-tool.ts # Travel advisory between cities
├── workflows/
│   └── weather-workflow.ts   # Weather processing workflow
├── scorers/
│   └── weather-scorer.ts     # Quality evaluation for responses
└── index.ts                  # Main Mastra configuration
```

## 🔧 Configuration

### Weather Tool
The weather tool uses Open-Meteo API with the following features:
- Geocoding for Nigerian cities
- Current, hourly, and daily forecasts
- Weather condition mapping
- Error handling for API failures

### Travel Tool
The travel weather tool provides:
- Weather comparison between cities
- Route-specific recommendations
- Travel timing advice
- Safety considerations

### Agent Configuration
The weather agent is configured with:
- Naija Pidgin persona
- Context-aware responses
- Local Nigerian references
- Practical advice generation

## 📊 API Integration

### Open-Meteo API
- Real-time weather data
- Hourly forecast resolution
- Weather condition codes (WMO)
- Precipitation probability
- UV index and visibility

### Google Gemini API
- Natural language processing
- Context understanding
- Pidgin language generation
- Local advice generation

## 🌍 Supported Cities

The agent supports weather information for all major Nigerian cities including:
- Lagos, Abuja, Port Harcourt
- Kano, Ibadan, Kaduna
- Benin City, Maiduguri, Zaria
- And many more Nigerian locations

## 🔮 Future Enhancements

- [ ] Air quality monitoring
- [ ] Agricultural weather advice
- [ ] Severe weather alerts
- [ ] Integration with local transport apps
- [ ] Voice interface support
- [ ] WhatsApp bot integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Open-Meteo for weather data API
- Google for Gemini AI model
- Mastra framework for agent infrastructure
- The Nigerian community for inspiration and feedback

---

**Made with ❤️ for Nigerians, by Nigerians**