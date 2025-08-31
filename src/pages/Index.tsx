import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Lightbulb, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  Plus
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import babyAvatar from "@/assets/baby-avatar.png";

const weeklyData = [
  { day: 'S', activities: 0 },
  { day: 'M', activities: 0 },
  { day: 'T', activities: 0 },
  { day: 'W', activities: 0 },
  { day: 'T', activities: 0 },
  { day: 'F', activities: 2 },
  { day: 'S', activities: 4 },
];

const Index = () => {
  const { user } = useAuth();
  const { currentChild } = useChild();
  const [todaysActivities] = useState(4);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for demo
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-mint-light">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!currentChild) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-mint-light">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Child Profile</h2>
          <p className="text-muted-foreground mb-4">Please add a child profile to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mint-light pb-24">
      {/* Baby Profile Header */}
      <div className="flex flex-col items-center py-8 px-4">
        <div className="relative mb-4">
          <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
            <Avatar className="w-full h-full">
              <AvatarImage src={babyAvatar} alt="Jasper's profile" />
              <AvatarFallback className="bg-primary text-white text-2xl">
                J
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Jasper</h1>
        <p className="text-muted-foreground text-lg">2 yrs old</p>
      </div>

      {/* Today's Activities */}
      <div className="px-4 mb-8">
        <div className="text-center">
          <div className="text-6xl font-bold text-primary mb-2">{todaysActivities}</div>
          <h2 className="text-xl font-semibold text-foreground mb-6">Today's Activities</h2>
        </div>
        
        <Card className="p-6 mx-auto max-w-sm">
          <div className="text-center">
            <p className="text-lg font-medium text-foreground mb-2">No activity logged today</p>
            <p className="text-muted-foreground">Tap the + button to log the first activity</p>
          </div>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <div className="px-4 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 4]}
                  ticks={[0, 2, 4]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="activities" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="grid grid-cols-4 gap-1 p-4">
          <button className="flex flex-col items-center p-3 rounded-lg hover:bg-secondary transition-colors">
            <Lightbulb className="w-6 h-6 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Suggestions</span>
          </button>
          
          <button className="flex flex-col items-center p-3 rounded-lg hover:bg-secondary transition-colors">
            <Clock className="w-6 h-6 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Play History</span>
          </button>
          
          <button className="flex flex-col items-center p-3 rounded-lg hover:bg-secondary transition-colors">
            <TrendingUp className="w-6 h-6 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Progress</span>
          </button>
          
          <button className="flex flex-col items-center p-3 rounded-lg hover:bg-secondary transition-colors">
            <BarChart3 className="w-6 h-6 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Statistics</span>
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4">
        <button className="bg-primary hover:bg-primary-dark text-white rounded-full w-16 h-16 shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center">
          <Plus className="w-8 h-8" />
        </button>
        <p className="text-xs text-center text-muted-foreground mt-2 w-16">Tap to log activity</p>
      </div>
    </div>
  );
};

export default Index;