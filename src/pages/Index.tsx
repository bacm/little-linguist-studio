import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart,
  Calendar,
  FileText,
  Heart,
  Tag,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { supabase } from "@/integrations/supabase/client";
import { WordCard } from "@/components/WordCard";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentChild } = useChild();
  const [recentWords, setRecentWords] = useState<any[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user || !currentChild) {
      return;
    }

    const fetchRecentWords = async () => {
      const sevenDaysAgo = subDays(new Date(), 7);
      const { data, error } = await supabase
        .from('words')
        .select('*, word_categories(name, icon, color)')
        .eq('child_id', currentChild.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching recent words:", error);
        return;
      }

      setRecentWords(data);
    };

    const fetchTotalWords = async () => {
      const { count, error } = await supabase
        .from('words')
        .select('*', { count: 'exact' })
        .eq('child_id', currentChild.id);

      if (error) {
        console.error("Error fetching total words count:", error);
        return;
      }

      setTotalWords(count || 0);
    };

    const fetchStreak = async () => {
      // TODO: Implement streak calculation logic
      // This is a placeholder, replace with actual calculation
      setStreak(5);
    };

    fetchRecentWords();
    fetchTotalWords();
    fetchStreak();
  }, [user, currentChild]);

  if (!currentChild) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">No child selected</h1>
          <p className="text-muted-foreground">Please select a child to view their progress.</p>
          <Button onClick={() => navigate('/children')}>Go to Children</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile App Container */}
      <div className="max-w-sm mx-auto bg-background min-h-screen">
        
        {/* Header */}
        <div className="bg-primary-light/30 p-4">
          <h1 className="text-2xl font-bold text-foreground">
            {currentChild.name}'s Learning Journey
          </h1>
          <p className="text-muted-foreground">
            Track your baby's first words and milestones.
          </p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-card border-0 shadow-sm">
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BarChart className="w-4 h-4" />
                  <span>Total Words</span>
                </div>
                <div className="text-3xl font-bold text-foreground">{totalWords}</div>
              </div>
            </Card>
            
            <Card className="bg-card border-0 shadow-sm">
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  <span>Current Streak</span>
                </div>
                <div className="text-3xl font-bold text-foreground">{streak} days</div>
              </div>
            </Card>
          </div>

          {/* Recent Words */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Words</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/words')}
                className="text-primary hover:text-primary-dark"
              >
                View All
              </Button>
            </div>
            
            {recentWords.length > 0 ? (
              <div className="space-y-3">
                {recentWords.map((word) => (
                  <WordCard
                    key={word.id}
                    word={word.word}
                    pronunciation={word.pronunciation}
                    category={word.word_categories ? {
                      name: word.word_categories.name,
                      icon: word.word_categories.icon,
                      color: word.word_categories.color
                    } : undefined}
                    dateLearned={word.date_learned}
                    notes={word.notes}
                    onClick={() => navigate(`/word/${word.id}`)}
                  />
                ))}
              </div>
            ) : totalWords === 0 ? (
              <div className="text-center py-6">
                <h4 className="text-xl text-muted-foreground mb-2">No words added yet!</h4>
                <Button onClick={() => navigate('/words')}>Add First Word</Button>
              </div>
            ) : null}

          </div>

          {/* Milestones */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Developmental Milestones
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/milestones')}
                className="text-primary hover:text-primary-dark"
              >
                View All
              </Button>
            </div>
            
            <Card className="bg-card border-0 shadow-sm">
              <div className="p-3 space-y-2">
                <h4 className="text-lg font-semibold text-foreground">
                  First Steps
                </h4>
                <p className="text-muted-foreground">
                  Celebrate when your baby takes their first steps!
                </p>
                <Button className="w-full">
                  Track Milestone <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Bottom Spacing */}
          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
