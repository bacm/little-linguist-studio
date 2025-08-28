import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useNavigate } from "react-router-dom";

const mockData = [
  { date: 'Jan', words: 5 },
  { date: 'Feb', words: 12 },
  { date: 'Mar', words: 18 },
  { date: 'Apr', words: 28 },
  { date: 'May', words: 35 },
  { date: 'Jun', words: 42 },
  { date: 'Jul', words: 56 },
];

export const VocabularyChart = () => {
  const navigate = useNavigate();

  return (
    <Card 
      className="p-4 bg-card border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate("/statistics")}
    >
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Vocabulary Growth</h3>
        <p className="text-muted-foreground text-sm">Words learned over time</p>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData}>
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
              stroke="hsl(var(--mint))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--mint))', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--mint-dark))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};