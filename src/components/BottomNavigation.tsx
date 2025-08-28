import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavButton {
  id: string;
  label: string;
  emoji: string;
  action?: () => void;
  navigateTo?: string;
  color: string;
  glowColor: string;
}

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const buttons: NavButton[] = [
    {
      id: "voice",
      label: "Voice",
      emoji: "🎙️",
      color: "bg-primary-light hover:bg-primary",
      glowColor: "shadow-primary/30 ring-primary/40",
      action: () => {
        // Voice recognition functionality
        console.log("Voice recognition clicked");
      }
    },
    {
      id: "ai",
      label: "AI Tips",
      emoji: "🤖",
      color: "bg-mint-light hover:bg-mint",
      glowColor: "shadow-mint/30 ring-mint/40",
      navigateTo: "/ai-suggestions"
    },
    {
      id: "flashcards",
      label: "Cards",
      emoji: "🎴",
      color: "bg-peach-light hover:bg-peach",
      glowColor: "shadow-peach/30 ring-peach/40",
      navigateTo: "/flashcards"
    },
    {
      id: "stats",
      label: "Stats",
      emoji: "📊",
      color: "bg-lavender-light hover:bg-lavender",
      glowColor: "shadow-lavender/30 ring-lavender/40",
      navigateTo: "/statistics"
    },
    {
      id: "export",
      label: "Export",
      emoji: "📤",
      color: "bg-accent hover:bg-accent/80",
      glowColor: "shadow-accent/30 ring-accent/40",
      action: () => {
        // Export functionality
        console.log("Export clicked");
      }
    }
  ];

  const handleButtonClick = (button: NavButton) => {
    if (button.navigateTo) {
      navigate(button.navigateTo);
    } else if (button.action) {
      button.action();
    }
  };

  const isActive = (button: NavButton) => {
    if (button.navigateTo) {
      return location.pathname === button.navigateTo;
    }
    return false;
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-white/80 backdrop-blur-lg rounded-full px-4 py-3 shadow-xl border border-white/20">
        <div className="flex items-center justify-center gap-2">
          {buttons.map((button) => {
            const active = isActive(button);
            return (
              <button
                key={button.id}
                onClick={() => handleButtonClick(button)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-full transition-all duration-300 group relative",
                  button.color,
                  active && "ring-2 ring-offset-1",
                  active && button.glowColor,
                  active && "shadow-lg scale-105"
                )}
              >
                <div className="text-xl mb-1 transform transition-transform duration-200 group-hover:scale-110">
                  {button.emoji}
                </div>
                <span className={cn(
                  "text-[10px] font-medium text-gray-700 transition-colors duration-200",
                  active && "text-gray-900 font-semibold"
                )}>
                  {button.label}
                </span>
                
                {/* Glow effect for active state */}
                {active && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};