import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MilestoneCard } from "@/components/MilestoneCard";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ArrowLeft, Trophy, MessageCircle, TrendingUp, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useChild } from "@/contexts/ChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

interface ChartData {
  month: string;
  words: number;
}

interface CategoryData {
  category: string;
  count: number;
  color: string;
}

interface Milestone {
  id: string;
  title: string;
  description?: string;
  milestone_type: string;
  target_value: number;
  current_value: number;
  achieved: boolean;
  achieved_date?: string;
  icon: string;
}

const Statistics = () => {
  const navigate = useNavigate();
  const { currentChild, loading: childLoading } = useChild();
  const { user } = useAuth();
  const [vocabularyGrowthData, setVocabularyGrowthData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [monthlyAverage, setMonthlyAverage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    if (!user || !currentChild) {
      setLoading(false);
      return;
    }

    try {
      // Fetch total words
      const { count } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('child_id', currentChild.id);

      setTotalWords(count || 0);

      // Fetch words for growth chart (last 12 months)
      const startDate = subMonths(new Date(), 11);
      const { data: wordsData } = await supabase
        .from('words')
        .select('date_learned')
        .eq('user_id', user.id)
        .eq('child_id', currentChild.id)
        .gte('date_learned', format(startDate, 'yyyy-MM-dd'))
        .order('date_learned');

      // Process data for growth chart
      const monthsInterval = eachMonthOfInterval({
        start: startDate,
        end: new Date()
      });

      const growthData: ChartData[] = monthsInterval.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const wordsInMonth = wordsData?.filter(word => {
          const wordDate = new Date(word.date_learned);
          return wordDate >= monthStart && wordDate <= monthEnd;
        }).length || 0;

        return {
          month: format(month, 'MMM'),
          words: wordsInMonth
        };
      });

      // Calculate cumulative growth
      let cumulativeWords = 0;
      const cumulativeGrowthData = growthData.map(item => {
        cumulativeWords += item.words;
        return {
          ...item,
          words: cumulativeWords
        };
      });

      setVocabularyGrowthData(cumulativeGrowthData);
      
      // Calculate monthly average
      const totalNewWords = growthData.reduce((sum, item) => sum + item.words, 0);
      setMonthlyAverage(Math.round(totalNewWords / growthData.length * 10) / 10);

      // Fetch category statistics
      const { data: categoryStats } = await supabase
        .from('words')
        .select(`
          word_categories (
            name,
            color
          )
        `)
        .eq('user_id', user.id)
        .eq('child_id', currentChild.id);

      // Process category data
      const categoryMap = new Map<string, { count: number; color: string }>();
      
      categoryStats?.forEach(word => {
        if (word.word_categories) {
          const categoryName = word.word_categories.name;
          const existingData = categoryMap.get(categoryName);
          categoryMap.set(categoryName, {
            count: (existingData?.count || 0) + 1,
            color: word.word_categories.color
          });
        }
      });

      const categoryArray: CategoryData[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        count: data.count,
        color: data.color === 'primary' ? '#3b82f6' : 
               data.color === 'mint' ? '#10b981' :
               data.color === 'peach' ? '#f97316' :
               data.color === 'lavender' ? '#8b5cf6' : '#6b7280'
      }));

      setCategoryData(categoryArray);

      // Fetch milestones
      const { data: milestonesData } = await supabase
        .from('milestones')
        .select('*')
        .eq('user_id', user.id)
        .eq('child_id', currentChild.id)
        .order('target_value');

      if (milestonesData) {
        // Update milestone progress based on current word count
        const updatedMilestones = milestonesData.map(milestone => ({
          ...milestone,
          current_value: milestone.milestone_type === 'vocabulary' ? (count || 0) : milestone.current_value,
          achieved: milestone.milestone_type === 'vocabulary' ? 
            (count || 0) >= milestone.target_value : milestone.achieved
        }));

        // Update milestones in database if needed
        for (const milestone of updatedMilestones) {
          if (milestone.milestone_type === 'vocabulary' && 
              milestone.current_value !== milestonesData.find(m => m.id === milestone.id)?.current_value) {
            await supabase
              .from('milestones')
              .update({
                current_value: milestone.current_value,
                achieved: milestone.achieved,
                achieved_date: milestone.achieved && !milestone.achieved_date ? 
                  format(new Date(), 'yyyy-MM-dd') : milestone.achieved_date
              })
              .eq('id', milestone.id);
          }
        }

        setMilestones(updatedMilestones);
      }

    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!childLoading) {
      fetchStatistics();
    }
  }, [user, currentChild, childLoading]);

  if (childLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-sm mx-auto text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentChild) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-sm mx-auto text-center space-y-4">
          <p className="text-muted-foreground">No child profiles found.</p>
          <Button onClick={() => navigate('/settings')}>
            Add Your First Child
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mint-light pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Statistics</h1>
            <p className="text-sm text-muted-foreground">{currentChild.name}'s language progress</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        
        {/* Vocabulary Growth Chart */}
        <Card className="p-4 bg-card border-0 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Vocabulary Growth</h2>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vocabularyGrowthData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="words" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <p className="text-sm text-muted-foreground">
              Total progress: <span className="font-semibold text-primary">{totalWords} words</span>
            </p>
          </div>
        </Card>

        {/* Category Distribution */}
        {categoryData.length > 0 && (
          <Card className="p-4 bg-card border-0 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Word Categories</h2>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="category" 
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Milestones & Badges */}
        <Card className="p-4 bg-card border-0 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Milestones & Badges</h2>
          </div>
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                title={milestone.title}
                achieved={milestone.achieved}
                target={milestone.target_value}
                current={milestone.current_value}
                icon={<span className="text-sm">{milestone.icon}</span>}
              />
            ))}
            {milestones.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No milestones found. They will be created automatically when you add a child.
              </p>
            )}
          </div>
        </Card>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-mint-light border-0 shadow-md text-center">
            <div className="text-2xl font-bold text-mint-foreground">{monthlyAverage}</div>
            <p className="text-mint-foreground text-sm font-medium">Avg/Month</p>
          </Card>
          <Card className="p-4 bg-peach-light border-0 shadow-md text-center">
            <div className="text-2xl font-bold text-peach-foreground">{categoryData.length}</div>
            <p className="text-peach-foreground text-sm font-medium">Categories</p>
          </Card>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Statistics;