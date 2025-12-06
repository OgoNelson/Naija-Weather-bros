import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Function to enhance weather responses with better formatting
function enhanceWeatherResponse(text: string): string {
  let enhancedText = text;

  // Add emojis for weather conditions
  enhancedText = enhancedText
    .replace(/partly cloudy/gi, "partly cloudy ☁️")
    .replace(/cloudy/gi, "cloudy ☁️")
    .replace(/sunny/gi, "sunny ☀️")
    .replace(/rain/gi, "rain 🌧️")
    .replace(/storm/gi, "storm ⛈️")
    .replace(/snow/gi, "snow ❄️")
    .replace(/windy/gi, "windy 💨")
    .replace(/clear/gi, "clear ☀️")
    .replace(/overcast/gi, "overcast ☁️");

  // Format temperature with appropriate emoji
  enhancedText = enhancedText.replace(/(\d+°C)/gi, "$1 🌡️");
  enhancedText = enhancedText.replace(/(\d+°F)/gi, "$1 🌡️");

  // Replace travel terms with emojis
  enhancedText = enhancedText
    .replace(/journey/gi, "journey 🚗️")
    .replace(/trip/gi, "trip 🛣️")
    .replace(/drive/gi, "drive 🚗️")
    .replace(/road/gi, "road 🛣️")
    .replace(/traffic/gi, "traffic 🚦")
    .replace(/fuel/gi, "fuel ⛽");

  // Replace safety advice with emojis
  enhancedText = enhancedText
    .replace(/phone/gi, "phone 📱")
    .replace(/papers/gi, "papers 📄")
    .replace(/license/gi, "license 🪪")
    .replace(/safe/gi, "safe ✅")
    .replace(/careful/gi, "careful 👀️");

  // Format lists with better markdown
  enhancedText = enhancedText
    .replace(/\*(.+?)/gi, "* $1")
    .replace(/\d+\.\s*(.+?)/gi, "$1")
    .replace(/:/g, ":");

  // Add headers for better structure
  if (enhancedText.includes("advice") || enhancedText.includes("recommend")) {
    enhancedText = enhancedText.replace(
      /(advice|recommend)/gi,
      "**Street-smart advice for your journey:**"
    );
  }

  return enhancedText;
}

export interface ChatResponse {
  reply: string;
  error?: string;
}

export interface A2ARequest {
  jsonrpc: "2.0";
  id: string;
  method: "generate";
  params: {
    message: {
      role: "user";
      parts: {
        kind: "text";
        text: string;
      }[];
    };
    taskId: string;
    contextId: string;
  };
}

export interface A2AResponse {
  jsonrpc: "2.0";
  id: string;
  result: {
    id: string;
    contextId: string;
    status: {
      state: "completed" | "failed";
      timestamp: string;
      message: {
        messageId: string;
        role: "agent";
        parts: {
          kind: "text";
          text: string;
        }[];
        kind: "message";
      };
    };
    artifacts: {
      artifactId: string;
      name: string;
      parts: {
        kind: "text";
        text: string;
      }[];
    }[];
    history: any[];
    kind: "task";
  };
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export const chatAPI = {
  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const request: A2ARequest = {
        jsonrpc: "2.0",
        id: Date.now().toString(),
        method: "generate",
        params: {
          message: {
            role: "user",
            parts: [
              {
                kind: "text",
                text: message,
              },
            ],
          },
          taskId: `task-${Date.now()}`,
          contextId: `ctx-${Date.now()}`,
        },
      };

      const response = await axios.post<A2AResponse>(
        `${API_URL}/a2a/agent/weatherAgent`,
        request,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      if (response.data.error) {
        throw new Error(`API Error: ${response.data.error.message}`);
      }

      // Extract the reply from the A2A response structure
      let reply =
        response.data.result?.status?.message?.parts?.[0]?.text ||
        response.data.result?.artifacts?.[0]?.parts?.[0]?.text ||
        "Sorry, I could not process your request.";

      // Enhance weather responses with better formatting and emojis
      reply = enhanceWeatherResponse(reply);

      return {
        reply: reply,
      };
    } catch (error) {
      console.error("Error sending message:", error);

      if (axios.isAxiosError(error)) {
        const axiosError = error;
        if (axiosError.response) {
          // Server responded with error status
          console.error(
            "Response error:",
            axiosError.response.status,
            axiosError.response.data
          );
          return {
            reply:
              "Server error occurred. Please make sure the backend is running on port 4111.",
            error: `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`,
          };
        } else if (axiosError.request) {
          // Network error
          console.error("Network error:", axiosError.message);
          return {
            reply:
              "Network error. Unable to connect to the weather service. Please check if the backend is running.",
            error: "Network connection failed",
          };
        }
      }

      return {
        reply:
          "Sorry, I encountered an error while processing your message. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
