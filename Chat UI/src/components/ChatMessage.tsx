import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
  senderName: string;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user";

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const components = {
    h1: ({ children }: any) => (
      <h1 className="text-lg font-bold text-gray-800 mb-2">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-base font-semibold text-gray-700 mb-2">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-sm font-medium text-gray-600 mb-1">{children}</h3>
    ),
    p: ({ children }: any) => (
      <p className="mb-2 text-gray-700 leading-relaxed">{children}</p>
    ),
    ul: ({ children }: any) => (
      <ul className="mb-2 ml-4 space-y-1">{children}</ul>
    ),
    li: ({ children }: any) => (
      <li className="text-gray-700 flex items-start gap-1">
        <span className="text-blue-500 mt-1">•</span>
        <span>{children}</span>
      </li>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-gray-800">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-gray-600">{children}</em>
    ),
    code: ({ inline, children }: any) =>
      inline ? (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-xs text-gray-700">
          {children}
        </code>
      ) : (
        <code className="block bg-gray-100 p-2 rounded text-xs text-gray-700 whitespace-pre-wrap">
          {children}
        </code>
      ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-200 pl-4 my-2 italic text-gray-600">
        {children}
      </blockquote>
    ),
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-sm sm:max-w-md lg:max-w-lg ${isUser ? "order-2" : "order-1"}`}
      >
        {!isUser && (
          <div className="text-xs font-medium text-gray-500 mb-1">
            {message.senderName}
          </div>
        )}

        <div
          className={`rounded-lg px-4 py-2 shadow-sm ${
            isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
          }`}
        >
          <ReactMarkdown components={components}>{message.text}</ReactMarkdown>
        </div>

        <p
          className={`text-xs text-gray-400 mt-1 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
