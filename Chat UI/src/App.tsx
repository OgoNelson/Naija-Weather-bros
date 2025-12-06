import { ChatInterface } from "./components/ChatInterface";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";

export default function App() {
  return (
    <div className="h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1631728815316-323e4340748d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWF0aGVyJTIwc2t5JTIwY2xvdWRzfGVufDF8fHx8MTc2NDQ1MDAzOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Weather background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-blue-600/40"></div>
      </div>

      {/* Chat Interface */}
      <div className="relative h-full">
        <ChatInterface />
      </div>
    </div>
  );
}
