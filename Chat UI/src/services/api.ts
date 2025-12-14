import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// ✅ Stable IDs (DO NOT recreate per request)
let contextId: string | null = null;
let taskId: string | null = null;

function getContextId(): string {
  if (!contextId) contextId = `ctx-${crypto.randomUUID()}`;
  return contextId;
}

function getTaskId(): string {
  if (!taskId) taskId = `task-${crypto.randomUUID()}`;
  return taskId;
}

export function resetContext(): void {
  contextId = null;
  taskId = null;
}

// 🔥 Weather response enhancement (unchanged)
function enhanceWeatherResponse(text: string): string {
  return text
    .replace(/partly cloudy/gi, "partly cloudy ☁️")
    .replace(/cloudy/gi, "cloudy ☁️")
    .replace(/sunny/gi, "sunny ☀️")
    .replace(/rain/gi, "rain 🌧️")
    .replace(/storm/gi, "storm ⛈️")
    .replace(/snow/gi, "snow ❄️")
    .replace(/windy/gi, "windy 💨")
    .replace(/clear/gi, "clear ☀️")
    .replace(/overcast/gi, "overcast ☁️")
    .replace(/(\d+°C|\d+°F)/gi, "$& 🌡️")
    .replace(/journey/gi, "journey 🚗️")
    .replace(/trip/gi, "trip 🛣️")
    .replace(/road/gi, "road 🛣️")
    .replace(/traffic/gi, "traffic 🚦")
    .replace(/fuel/gi, "fuel ⛽")
    .replace(/phone/gi, "phone 📱")
    .replace(/papers/gi, "papers 📄")
    .replace(/license/gi, "license 🪪")
    .replace(/safe/gi, "safe ✅")
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
    messages: {
      role: "user";
      parts: { kind: "text"; text: string }[];
    }[];
    taskId: string;
    contextId: string;
  };
}

export interface A2AResponse {
  jsonrpc: "2.0";
  id: string;
  result: any;
  error?: { code: number; message: string };
}

export const chatAPI = {
  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const request: A2ARequest = {
        jsonrpc: "2.0",
        id: crypto.randomUUID(),
        method: "generate",
        params: {
          contextId: getContextId(),
          taskId: getTaskId(),

          // ✅ ONLY SEND NEW USER MESSAGE
          messages: [
            {
              role: "user",
              parts: [{ kind: "text", text: message }],
            },
          ],
        },
      };

      const response = await axios.post<A2AResponse>(
        `${API_URL}/a2a/agent/weatherAgent`,
        request,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      let reply =
        response.data.result?.status?.message?.parts?.[0]?.text ||
        response.data.result?.artifacts?.[0]?.parts?.[0]?.text ||
        "Sorry, I couldn’t process that.";

      reply = enhanceWeatherResponse(reply);

      return { reply };
    } catch (error: any) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        return {
          reply: "Network or server error.",
          error: error.message,
        };
      }

      return {
        reply: "Unexpected error occurred.",
        error: error.message,
      };
    }
  },

  resetContext,
};
