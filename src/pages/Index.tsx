import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BabyProfile } from "@/components/BabyProfile";
import { WordCard } from "@/components/WordCard"; 
import { CategoryChip } from "@/components/CategoryChip";
import { ActionButton } from "@/components/ActionButton";
import { VocabularyChart } from "@/components/VocabularyChart";
import { AddWordDialog } from "@/components/AddWordDialog";
import { VoiceRecognitionDialog } from "@/components/VoiceRecognitionDialog";
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
import { useChild } from "@/contexts/ChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInMonths } from "date-fns";

interface Word {
  id: string;
  word: string;
  category_id: string;
  date_learned: string;
  word_categories?: {
    name: string;
    icon: string;
    color: string;
  };
}

const Index = () => {
  const navigate = useNavigate();
  const { currentChild, loading: childLoading } = useChild();
  const { user } = useAuth();
  const [totalWords, setTotalWords] = useState(0);
  const [latestWord, setLatestWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [addWordOpen, setAddWordOpen] = useState(false);
  const [voiceWord, setVoiceWord] = useState("");
  
  const fetchWordsData = async () => {
    if (!user || !currentChild) {
      setLoading(false);
      return;
    }

    try {
      // Fetch total word count
      const { count } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('child_id', currentChild.id);

      setTotalWords(count || 0);

      // Fetch latest word
      const { data: latestWords } = await supabase
        .from('words')
        .select(`
          *,
          word_categories (
            name,
            icon,
            color
          )
        `)
        .eq('user_id', user.id)
        .eq('child_id', currentChild.id)
        .order('date_learned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1);

      if (latestWords && latestWords.length > 0) {
        setLatestWord(latestWords[0]);
      }
    } catch (error) {
      console.error('Error fetching words data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!childLoading) {
      fetchWordsData();
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

  const calculateAge = (birthdate: string) => {
    const months = differenceInMonths(new Date(), new Date(birthdate));
    return `${months} months`;
  };

  const handleVoiceWord = (word: string) => {
    setVoiceWord(word);
    setVoiceOpen(false);
    setAddWordOpen(true);
  };

  const getCategoryIcon = (word: Word) => {
    if (word.word_categories) {
      return <span className="text-lg">{word.word_categories.icon}</span>;
    }
    return <Package className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile App Container */}
      <div className="max-w-sm mx-auto bg-background min-h-screen">
        
        {/* Header with Baby Profile */}
        <div className="bg-primary-light/30 rounded-b-3xl relative">
          {/* Settings Button */}
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
            >
              <span className="text-lg">⚙️</span>
            </Button>
          </div>
          
          <BabyProfile 
            name={currentChild.name} 
            age={calculateAge(currentChild.birthdate)} 
            imageUrl={babyAvatar}
          />
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          
          {/* Total Words Card */}
          <WordCard variant="total" count={totalWords} word="" date="" icon={null} />

          {/* Latest Word */}
          {latestWord ? (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">Latest Word</h2>
              <WordCard 
                word={latestWord.word} 
                date={format(new Date(latestWord.date_learned), "d MMM yyyy")}
                icon={getCategoryIcon(latestWord)}
                wordId={latestWord.id}
              />
            </div>
          ) : totalWords === 0 ? (
            <div className="text-center py-8 px-4 bg-card rounded-lg border-2 border-dashed border-muted">
              <div className="mb-4">
                <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground font-medium">No words added yet!</p>
                <p className="text-sm text-muted-foreground mt-1">Tap the + button below to add your first word</p>
              </div>
            </div>
          ) : null}

          {/* Vocabulary Growth Chart */}
          <VocabularyChart />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <ActionButton
              icon={<Mic className="w-4 h-4" />}
              label="Voice Recognition"
              variant="mint"
              size="sm"
              onClick={() => setVoiceOpen(true)}
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
        <div className="fixed bottom-6 right-4 z-50">
          <div className="relative">
            <AddWordDialog
              onWordAdded={fetchWordsData}
              open={addWordOpen}
              setOpen={setAddWordOpen}
              initialWord={voiceWord}
            />
            {/* Debug helper - remove after testing */}
            {totalWords === 0 && (
              <div className="absolute -top-12 -left-12 bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap animate-bounce">
                👆 Tap to add word!
              </div>
            )}
          </div>
        </div>
        <VoiceRecognitionDialog
          open={voiceOpen}
          onOpenChange={setVoiceOpen}
          onWordDetected={handleVoiceWord}
        />
      </div>
    </div>
  );
};

export default Index;