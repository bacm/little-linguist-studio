import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddWordDialog } from "@/components/AddWordDialog";
import { 
  Lightbulb, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  Plus
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { differenceInMonths, format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, subDays } from 'date-fns';
import babyAvatar from "@/assets/baby-avatar.png";

interface WeeklyData {
  day: string;
  activities: number;
}

const Index = () => {
  const { user } = useAuth();
  const { currentChild } = useChild();
  const navigate = useNavigate();
  const [todaysActivities, setTodaysActivities] = useState(0);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user || !currentChild) {
      setLoading(false);
      return;
    }

    try {
      // Fetch today's activities (words learned today)
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('child_id', currentChild.id)
        .eq('date_learned', today);

      setTodaysActivities(todayCount || 0);

      // Fetch weekly data for the chart
      const weekStart = startOfWeek(new Date());
      const weekDays = eachDayOfInterval({
        start: weekStart,
        end: endOfWeek(new Date())
      });

      const weeklyPromises = weekDays.map(async (day) => {
        const dayStr = day.toISOString().split('T')[0];
        const { count } = await supabase
          .from('words')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('child_id', currentChild.id)
          .eq('date_learned', dayStr);

        return {
          day: format(day, 'EEEEE'), // Single letter day
          activities: count || 0
        };
      });

      const weeklyResults = await Promise.all(weeklyPromises);
      setWeeklyData(weeklyResults);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, currentChild]);

  const calculateAge = (birthdate: string): string => {
    const months = differenceInMonths(new Date(), new Date(birthdate));
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''} old`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''} old`;
      }
      return `${years}y ${remainingMonths}m old`;
    }
  };

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
              <AvatarImage src={currentChild.avatar || babyAvatar} alt={`${currentChild.name}'s profile`} />
              <AvatarFallback className="bg-primary text-white text-2xl">
                {currentChild.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-1">{currentChild.name}</h1>
        <p className="text-muted-foreground text-lg">{calculateAge(currentChild.birthdate)}</p>
      </div>

      {/* Today's Activities */}
      <div className="px-4 mb-8">
        <div className="text-center">
          <div className="text-6xl font-bold text-primary mb-2">{todaysActivities}</div>
          <h2 className="text-xl font-semibold text-foreground mb-6">Today's Activities</h2>
        </div>
        
        <Card className="p-6 mx-auto max-w-sm">
          <div className="text-center">
            {todaysActivities > 0 ? (
              <>
                <p className="text-lg font-medium text-foreground mb-2">Great progress today!</p>
                <p className="text-muted-foreground">
                  {todaysActivities} word{todaysActivities !== 1 ? 's' : ''} learned
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-foreground mb-2">No activity logged today</p>
                <p className="text-muted-foreground">Tap the + button to log the first activity</p>
              </>
            )}
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
                  domain={[0, Math.max(...weeklyData.map(d => d.activities), 4)]}
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
          <button 
            onClick={() => navigate('/ai-suggestions')}
            className="flex flex-col items-center p-3 rounded-lg hover:bg-secondary transition-colors"
          >
            <Lightbulb className="w-6 h-6 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Suggestions</span>
          </button>
          
          <button 
            onClick={() => navigate('/words')}
            className="flex flex-col items-center p-3 rounded-lg hover:bg-secondary transition-colors"
          >
            <Clock className="w-6 h-6 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Word List</span>
          </button>
          
          <button 
            onClick={() => navigate('/flashcards')}
            className="flex flex-col items-center p-3 rounded-lg hover:bg-secondary transition-colors"
          >
            <TrendingUp className="w-6 h-6 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Flashcards</span>
          </button>
          
          <button 
            onClick={() => navigate('/statistics')}
            className="flex flex-col items-center p-3 rounded-lg hover:bg-secondary transition-colors"
          >
            <BarChart3 className="w-6 h-6 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Statistics</span>
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4">
        <AddWordDialog onWordAdded={fetchDashboardData} />
        <p className="text-xs text-center text-muted-foreground mt-2 w-16">Tap to log activity</p>
      </div>
    </div>
  );
};

export default Index;