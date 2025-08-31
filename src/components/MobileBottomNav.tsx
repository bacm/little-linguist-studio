import { useNavigate, useLocation } from "react-router-dom";
import { 
  Lightbulb, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  Home
} from "lucide-react";

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { 
      id: 'home',
      icon: Home, 
      label: 'Home', 
      path: '/' 
    },
    { 
      id: 'suggestions',
      icon: Lightbulb, 
      label: 'Suggestions', 
      path: '/ai-suggestions' 
    },
    { 
      id: 'words',
      icon: Clock, 
      label: 'Words', 
      path: '/words' 
    },
    { 
      id: 'flashcards',
      icon: TrendingUp, 
      label: 'Flashcards', 
      path: '/flashcards' 
    },
    { 
      id: 'stats',
      icon: BarChart3, 
      label: 'Statistics', 
      path: '/statistics' 
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
      <div className="flex">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex-1 flex flex-col items-center py-3 px-2 transition-colors hover:bg-secondary"
            >
              <Icon 
                className={`w-6 h-6 mb-1 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`} 
              />
              <span 
                className={`text-xs ${
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};