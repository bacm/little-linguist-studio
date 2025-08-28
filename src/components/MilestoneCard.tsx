import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MilestoneProps {
  title: string;
  achieved: boolean;
  target: number;
  current: number;
  icon: React.ReactNode;
}

export const MilestoneCard = ({ title, achieved, target, current, icon }: MilestoneProps) => {
  const progress = Math.min((current / target) * 100, 100);
  
  return (
    <Card className="p-4 bg-card border-0 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${achieved ? 'bg-mint text-mint-foreground' : 'bg-muted text-muted-foreground'}`}>
            {icon}
          </div>
          <span className="font-medium text-sm">{title}</span>
        </div>
        {achieved && (
          <Badge variant="secondary" className="bg-mint-light text-mint-foreground">
            ✓
          </Badge>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{current}</span>
          <span>{target}</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${achieved ? 'bg-mint' : 'bg-primary'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Card>
  );
};