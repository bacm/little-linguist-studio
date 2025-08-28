
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface WordCardProps {
  word: string;
  pronunciation?: string;
  category?: {
    name: string;
    icon: string;
    color: string;
  };
  dateLearned: string;
  notes?: string;
  onClick?: () => void;
}

export const WordCard = ({ 
  word, 
  pronunciation,
  category, 
  dateLearned, 
  notes,
  onClick 
}: WordCardProps) => {
  const getCategoryColor = (color?: string) => {
    const colorMap = {
      mint: "bg-mint-light text-mint-foreground border-mint",
      peach: "bg-peach-light text-peach-foreground border-peach", 
      lavender: "bg-lavender-light text-lavender-foreground border-lavender",
      primary: "bg-primary-light text-primary-foreground border-primary"
    };
    return colorMap[color as keyof typeof colorMap] || "bg-secondary text-secondary-foreground border-secondary";
  };

  return (
    <Card 
      className="p-4 bg-card hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm"
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header with category icon and word */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {category && (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(category.color)}`}>
                <span className="text-lg">{category.icon}</span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg text-foreground">{word}</h3>
              {pronunciation && (
                <p className="text-sm text-muted-foreground italic">
                  Says: "{pronunciation}"
                </p>
              )}
            </div>
          </div>
          {category && (
            <Badge className={`${getCategoryColor(category.color)} text-xs border-2`}>
              {category.name}
            </Badge>
          )}
        </div>

        {/* Date learned */}
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            Learned {format(new Date(dateLearned), 'MMM d, yyyy')}
          </span>
        </div>

        {/* Notes preview */}
        {notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notes}
          </p>
        )}
      </div>
    </Card>
  );
};
