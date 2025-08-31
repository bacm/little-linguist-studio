import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ArrowLeft, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  Dog, 
  Cat, 
  Car, 
  Apple, 
  Heart, 
  Sun, 
  Circle, 
  Book, 
  Music, 
  Home,
  Baby,
  Smile,
  Hand,
  Eye,
  Ear
} from "lucide-react";

const AISuggestions = () => {
  const navigate = useNavigate();

  const suggestedWords = [
    { word: "dog", category: "Animals", icon: <Dog className="w-5 h-5" />, priority: "high" },
    { word: "cat", category: "Animals", icon: <Cat className="w-5 h-5" />, priority: "high" },
    { word: "car", category: "Objects", icon: <Car className="w-5 h-5" />, priority: "medium" },
    { word: "apple", category: "Food", icon: <Apple className="w-5 h-5" />, priority: "high" },
    { word: "love", category: "Emotions", icon: <Heart className="w-5 h-5" />, priority: "medium" },
    { word: "sun", category: "Nature", icon: <Sun className="w-5 h-5" />, priority: "low" },
    { word: "ball", category: "Toys", icon: <Circle className="w-5 h-5" />, priority: "high" },
    { word: "book", category: "Objects", icon: <Book className="w-5 h-5" />, priority: "medium" },
    { word: "music", category: "Sounds", icon: <Music className="w-5 h-5" />, priority: "low" },
    { word: "home", category: "Places", icon: <Home className="w-5 h-5" />, priority: "high" },
    { word: "baby", category: "People", icon: <Baby className="w-5 h-5" />, priority: "medium" },
    { word: "happy", category: "Emotions", icon: <Smile className="w-5 h-5" />, priority: "high" },
    { word: "clap", category: "Actions", icon: <Hand className="w-5 h-5" />, priority: "high" },
    { word: "look", category: "Actions", icon: <Eye className="w-5 h-5" />, priority: "medium" },
    { word: "listen", category: "Actions", icon: <Ear className="w-5 h-5" />, priority: "low" }
  ];

  const missingCategories = [
    { category: "Animals", current: 2, expected: 5, severity: "high" },
    { category: "Actions", current: 1, expected: 4, severity: "high" },
    { category: "Emotions", current: 0, expected: 3, severity: "medium" }
  ];

  const adviceBubbles = [
    {
      id: 1,
      text: "Try adding new action words this week! Actions help with communication.",
      type: "tip"
    },
    {
      id: 2,
      text: "Animal sounds are great for 18-month-olds. Try 'moo', 'woof', 'meow'!",
      type: "encouragement"
    },
    {
      id: 3,
      text: "Your baby is doing great! Keep practicing daily words together.",
      type: "praise"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-mint-light text-mint-foreground";
      case "medium":
        return "bg-peach-light text-peach-foreground";
      case "low":
        return "bg-lavender-light text-lavender-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-mint-light pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">AI Suggestions</h1>
            <p className="text-sm text-muted-foreground">Personalized word suggestions</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Advice Bubbles */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <span>Smart Tips</span>
          </h2>
          {adviceBubbles.map((advice) => (
            <Card key={advice.id} className="p-4 bg-primary-light/20 border-0">
              <p className="text-sm text-foreground">{advice.text}</p>
            </Card>
          ))}
        </div>

        {/* Missing Categories Alert */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>Focus Areas</span>
          </h2>
          {missingCategories.map((category) => (
            <Card key={category.category} className={`p-4 border ${getSeverityColor(category.severity)}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{category.category}</h3>
                  <p className="text-sm opacity-80">
                    {category.current} of {category.expected} expected words
                  </p>
                </div>
                <Badge variant="secondary" className="bg-white/50">
                  +{category.expected - category.current} needed
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Suggested Words */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Recommended Words</span>
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {suggestedWords.map((item, index) => (
              <Card key={index} className="p-3 border-0 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-light/30 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{item.word}</h3>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(item.priority)}>
                    {item.priority}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default AISuggestions;