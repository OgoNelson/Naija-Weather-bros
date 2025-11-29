# Naija Weather Bros Frontend

A modern React frontend for the Naija Weather Bros AI weather agent, built with Vite and styled with Tailwind CSS.

## Features

- 🌤️ Real-time weather information for Nigerian cities
- 💬 Conversational interface with the Naija Weather Bros AI
- 🚗 Travel advisory between Nigerian cities
- 📱 Fully responsive design for mobile and desktop
- ⚡ Fast and lightweight with Vite
- 🎨 Modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (>= 18.0.0)
- pnpm package manager
- Backend server running on port 4111

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
pnpm install
```

### Running the Development Server

1. Start the development server:
```bash
pnpm dev
```

2. Open your browser and navigate to:
```
http://localhost:5173
```

### Building for Production

1. Create a production build:
```bash
pnpm build
```

2. Preview the production build:
```bash
pnpm preview
```

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   └── WeatherChat.jsx      # Main chat interface component
│   ├── services/
│   │   └── api.js               # API service for backend communication
│   ├── App.jsx                  # Main App component
│   ├── App.css                  # App-specific styles
│   ├── index.css                # Global styles with Tailwind
│   └── main.jsx                 # React entry point
├── index.html
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
└── package.json
```

## Usage

### Basic Weather Queries

Ask about current weather conditions in any Nigerian city:
- "What's the weather like in Lagos today?"
- "How's the weather in Abuja right now?"

### Travel Advisory

Get weather information for travel between cities:
- "I want to travel from Abuja to Port Harcourt tomorrow"
- "What's the weather like for a trip from Lagos to Kano?"

### Forecasts

Request weather forecasts:
- "Give me 6 hours forecast for Kano"
- "Will it rain in Ibadan tomorrow?"

## Configuration

The frontend is configured to connect to the backend API at `http://localhost:4111`. To change this:

1. Open `src/services/api.js`
2. Update the `API_BASE_URL` constant to your backend URL

## Technologies Used

- **React 19** - UI framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests

## Development

### Adding New Features

1. Create new components in the `src/components/` directory
2. Add API functions to `src/services/api.js`
3. Update the main App component to include new features

### Styling

The project uses Tailwind CSS for styling. You can:
- Modify the Tailwind configuration in `tailwind.config.js`
- Add custom utility classes in `src/index.css`
- Use Tailwind's utility classes directly in your components

## Troubleshooting

### Common Issues

1. **API Connection Errors**: Ensure the backend server is running on port 4111
2. **Styling Issues**: Make sure Tailwind CSS is properly configured and imported
3. **Build Errors**: Check that all dependencies are installed correctly

### Getting Help

If you encounter any issues:
1. Check the browser console for error messages
2. Verify the backend server is running and accessible
3. Ensure all dependencies are properly installed

## License

This project is licensed under the ISC License.
