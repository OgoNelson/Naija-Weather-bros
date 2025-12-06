import { useState, useRef, useEffect } from "react";
import { Send, CloudRain, Loader2, Trash2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { chatAPI } from "../services/api";

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
  senderName: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hello! I'm your weather assistant. How can I help you today?",
    sender: "other",
    timestamp: new Date(Date.now() - 3600000),
    senderName: "Weather AI",
  },
  {
    id: "2",
    text: "What's the weather like today?",
    sender: "user",
    timestamp: new Date(Date.now() - 3540000),
    senderName: "You",
  },
  {
    id: "3",
    text: "Today we're expecting partly cloudy skies with a high of 72°F and a low of 58°F. There's a 20% chance of rain in the evening. Perfect weather for outdoor activities!",
    sender: "other",
    timestamp: new Date(Date.now() - 3480000),
    senderName: "Weather AI",
  },
  {
    id: "4",
    text: "Should I bring an umbrella?",
    sender: "user",
    timestamp: new Date(Date.now() - 3420000),
    senderName: "You",
  },
  {
    id: "5",
    text: "With only a 20% chance of rain, you should be fine without one. However, if you're planning to be out late in the evening, it wouldn't hurt to bring one just in case!",
    sender: "other",
    timestamp: new Date(Date.now() - 3360000),
    senderName: "Weather AI",
  },
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your weather assistant. I can help you with weather information, forecasts, and any weather-related questions. How can I help you today?",
      sender: "other",
      timestamp: new Date(),
      senderName: "Weather AI",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
      senderName: "You",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(userMessage.text);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        sender: "other",
        timestamp: new Date(),
        senderName: "Weather AI",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error in handleSend:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error while processing your message. Please try again later.",
        sender: "other",
        timestamp: new Date(),
        senderName: "Weather AI",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearMessages = () => {
    setMessages([
      {
        id: "1",
        text: "Hello! I'm your weather assistant. I can help you with weather information, forecasts, and any weather-related questions. How can I help you today?",
        sender: "other",
        timestamp: new Date(),
        senderName: "Weather AI",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl relative">
      {/* Clear Button - Top Right Corner */}
      <button
        onClick={handleClearMessages}
        className="absolute top-6 right-6 z-50 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition-colors flex items-center gap-2"
        title="Clear messages"
      >
        <Trash2 size={18} />
        <span className="hidden sm:inline text-sm">Clear</span>
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-sky-400 text-white px-6 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <CloudRain size={28} />
          <div>
            <h1 className="text-xl font-bold">Naija Weather bros</h1>
            <p className="text-sm opacity-90">I dey for you</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md">
              <div className="bg-gray-200 text-gray-900 rounded-lg px-4 py-2 flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white/80 backdrop-blur-sm">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the weather..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="bg-gradient-to-r from-blue-500 to-sky-400 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-sky-500 transition-all flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
