import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface WordCardProps {
  word: string;
  date: string;
  icon: React.ReactNode;
  variant?: "total" | "latest";
  count?: number;
}

export const WordCard = ({ word, date, icon, variant = "latest", count }: WordCardProps) => {
  const navigate = useNavigate();

  if (variant === "total") {
    return (
      <Card 
        className="p-6 bg-mint-light border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        onClick={() => navigate("/words")}
      >
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-mint-foreground">{count}</div>
          <p className="text-mint-foreground font-medium">Total Words</p>
          <div className="w-full h-2 bg-mint rounded-full mt-4">
            <div 
              className="h-full bg-mint-dark rounded-full transition-all duration-500"
              style={{ width: `${Math.min((count || 0) / 100 * 100, 100)}%` }}
            />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card border-0 shadow-md">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg">{word}</h3>
          <p className="text-muted-foreground text-sm">{date}</p>
        </div>
      </div>
    </Card>
  );
};