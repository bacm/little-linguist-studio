import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useNavigate } from "react-router-dom";
import { useChild } from "@/contexts/ChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

interface ChartData {
  date: string;
  words: number;
}

export const VocabularyChart = () => {
  const navigate = useNavigate();
  const { currentChild } = useChild();
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVocabularyData = async () => {
    if (!user || !currentChild) {
      setLoading(false);
      return;
    }

    try {
      // Fetch words for last 6 months for the chart preview
      const startDate = subMonths(new Date(), 5);
      const { data: wordsData } = await supabase
        .from('words')
        .select('date_learned')
        .eq('user_id', user.id)
        .eq('child_id', currentChild.id)
        .gte('date_learned', format(startDate, 'yyyy-MM-dd'))
        .order('date_learned');

      // Create monthly intervals
      const monthsInterval = eachMonthOfInterval({
        start: startDate,
        end: new Date()
      });

      // Process data for chart
      const growthData: ChartData[] = monthsInterval.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const wordsInMonth = wordsData?.filter(word => {
          const wordDate = new Date(word.date_learned);
          return wordDate >= monthStart && wordDate <= monthEnd;
        }).length || 0;

        return {
          date: format(month, 'MMM'),
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

      setChartData(cumulativeGrowthData);
    } catch (error) {
      console.error('Error fetching vocabulary data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabularyData();
  }, [user, currentChild]);

  if (loading) {
    return (
      <Card className="p-4 bg-card border-0 shadow-md">
        <div className="mb-4">
          <h3 className="font-semibold text-foreground">Vocabulary Growth</h3>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="animate-pulse bg-muted rounded w-full h-full"></div>
        </div>
      </Card>
    );
  }

  if (!currentChild) {
    return (
      <Card className="p-4 bg-card border-0 shadow-md opacity-50">
        <div className="mb-4">
          <h3 className="font-semibold text-foreground">Vocabulary Growth</h3>
          <p className="text-muted-foreground text-sm">Select a child to view progress</p>
        </div>
        <div className="h-32 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No data available</p>
        </div>
      </Card>
    );
  }

  const totalWords = chartData.length > 0 ? chartData[chartData.length - 1].words : 0;

  return (
    <Card 
      className="p-4 bg-card border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate("/statistics")}
    >
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Vocabulary Growth</h3>
        <p className="text-muted-foreground text-sm">
          {totalWords > 0 ? `${totalWords} words learned` : 'No words added yet'}
        </p>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis hide />
            <Line 
              type="monotone" 
              dataKey="words" 
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--primary-dark))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};