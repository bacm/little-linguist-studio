import { BabyProfile } from "@/components/BabyProfile";
import { WordCard } from "@/components/WordCard"; 
import { CategoryChip } from "@/components/CategoryChip";
import { ActionButton } from "@/components/ActionButton";
import { VocabularyChart } from "@/components/VocabularyChart";
import { Button } from "@/components/ui/button";
import { 
  Droplets, 
  Utensils, 
  Dog, 
  Users, 
  Package,
  Mic,
  Bot,
  CreditCard,
  BarChart3,
  Share,
  Plus,
  Heart
} from "lucide-react";
import babyAvatar from "@/assets/baby-avatar.png";

const Index = () => {
  // Force rebuild to clear cached MilestoneCard references
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile App Container */}
      <div className="max-w-sm mx-auto bg-background min-h-screen">
        
        {/* Header with Baby Profile */}
        <div className="bg-primary-light/30 rounded-b-3xl">
          <BabyProfile 
            name="Ada" 
            age="18 months" 
            imageUrl={babyAvatar}
          />
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          
          {/* Total Words Card */}
          <WordCard variant="total" count={56} word="" date="" icon={null} />

          {/* Latest Word */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">Latest Word</h2>
            <WordCard 
              word="mouillé" 
              date="1 Aug 2025"
              icon={<Droplets className="w-5 h-5 text-primary" />}
            />
          </div>

          {/* Vocabulary Growth Chart */}
          <VocabularyChart />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <ActionButton
              icon={<Mic className="w-4 h-4" />}
              label="Voice Recognition"
              variant="mint"
              size="sm"
            />
            <ActionButton
              icon={<Bot className="w-4 h-4" />}
              label="AI Suggestions"
              variant="lavender"
              size="sm"
              navigateTo="/ai-suggestions"
            />
            <ActionButton
              icon={<CreditCard className="w-4 h-4" />}
              label="Flashcards"
              variant="peach"
              size="sm"
              navigateTo="/flashcards"
            />
            <ActionButton
              icon={<BarChart3 className="w-4 h-4" />}
              label="Statistics"
              variant="default"
              size="sm"
              navigateTo="/statistics"
            />
          </div>

          {/* Export/Share */}
          <div className="pt-2">
            <ActionButton
              icon={<Share className="w-4 h-4" />}
              label="Export Progress (CSV/PDF)"
              variant="default"
              size="sm"
            />
          </div>

          {/* Bottom Spacing */}
          <div className="h-20" />
        </div>

        {/* Floating Add Button */}
        <div className="fixed bottom-6 right-4 z-10">
          <Button
            size="lg"
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;