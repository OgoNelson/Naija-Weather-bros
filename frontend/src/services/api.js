import axios from 'axios';

const API_BASE_URL = 'http://localhost:4111';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const weatherApi = {
  async getWeatherResponse(message, conversationHistory = []) {
    try {
      const payload = {
        jsonrpc: "2.0",
        id: Date.now().toString(),
        method: "generate",
        params: {
          message: {
            role: "user",
            parts: [{
              kind: "text",
              text: message
            }],
            messageId: `msg-${Date.now()}`
          },
          taskId: `task-${Date.now()}`,
          contextId: `ctx-${Date.now()}`
        }
      };

      // If we have conversation history, include it
      if (conversationHistory.length > 0) {
        payload.params.messages = [
          ...conversationHistory,
          payload.params.message
        ];
        delete payload.params.message;
      }

      const response = await api.post('/a2a/agent/weatherAgent', payload);
      
      if (response.data.result) {
        return {
          success: true,
          message: response.data.result.status.message.parts[0].text,
          history: response.data.result.history || []
        };
      } else {
        throw new Error(response.data.error?.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Failed to get weather information'
      };
    }
  }
};

export default weatherApi;