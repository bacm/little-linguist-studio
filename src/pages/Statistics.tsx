import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MilestoneCard } from "@/components/MilestoneCard";
import { ArrowLeft, Trophy, MessageCircle, TrendingUp, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// Mock data for vocabulary growth over time
const vocabularyGrowthData = [
  { month: "Jan", words: 5 },
  { month: "Feb", words: 12 },
  { month: "Mar", words: 18 },
  { month: "Apr", words: 28 },
  { month: "May", words: 35 },
  { month: "Jun", words: 42 },
  { month: "Jul", words: 50 },
  { month: "Aug", words: 56 },
];

// Mock data for category distribution
const categoryData = [
  { category: "Food", count: 12, color: "#10b981" },
  { category: "Animals", count: 8, color: "#f97316" },
  { category: "Actions", count: 15, color: "#8b5cf6" },
  { category: "Family", count: 9, color: "#3b82f6" },
  { category: "Objects", count: 12, color: "#10b981" },
];

const Statistics = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile App Container */}
      <div className="max-w-sm mx-auto bg-background min-h-screen">
        
        {/* Header */}
        <div className="bg-primary-light/30 p-4">
          <div className="flex items-center gap-3 mb-4">
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
              <p className="text-sm text-muted-foreground">Ada's language progress</p>
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
                Total progress: <span className="font-semibold text-primary">56 words</span>
              </p>
            </div>
          </Card>

          {/* Category Distribution */}
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

          {/* Milestones & Badges */}
          <Card className="p-4 bg-card border-0 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Milestones & Badges</h2>
            </div>
            <div className="space-y-3">
              <MilestoneCard
                title="10 words"
                achieved={true}
                target={10}
                current={56}
                icon={<Trophy className="w-4 h-4" />}
              />
              <MilestoneCard
                title="50 words"
                achieved={true}
                target={50}
                current={56}
                icon={<Trophy className="w-4 h-4" />}
              />
              <MilestoneCard
                title="First phrase"
                achieved={false}
                target={1}
                current={0}
                icon={<MessageCircle className="w-4 h-4" />}
              />
              <MilestoneCard
                title="100 words"
                achieved={false}
                target={100}
                current={56}
                icon={<Trophy className="w-4 h-4" />}
              />
            </div>
          </Card>

          {/* Quick Stats Summary */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-mint-light border-0 shadow-md text-center">
              <div className="text-2xl font-bold text-mint-foreground">7.0</div>
              <p className="text-mint-foreground text-sm font-medium">Avg/Month</p>
            </Card>
            <Card className="p-4 bg-peach-light border-0 shadow-md text-center">
              <div className="text-2xl font-bold text-peach-foreground">5</div>
              <p className="text-peach-foreground text-sm font-medium">Categories</p>
            </Card>
          </div>

          {/* Bottom Spacing */}
          <div className="h-6" />
        </div>
      </div>
    </div>
  );
};

export default Statistics;