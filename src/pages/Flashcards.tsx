import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Mic, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryChip } from "@/components/CategoryChip";

// Mock flashcard data with cute illustrations
const flashcards = [
  {
    id: 1,
    word: "Apple",
    category: "Food",
    color: "peach" as const,
    illustration: "🍎"
  },
  {
    id: 2,
    word: "Cat",
    category: "Animals", 
    color: "mint" as const,
    illustration: "🐱"
  },
  {
    id: 3,
    word: "Ball",
    category: "Toys",
    color: "lavender" as const,
    illustration: "⚽"
  },
  {
    id: 4,
    word: "Milk",
    category: "Food",
    color: "peach" as const,
    illustration: "🥛"
  },
  {
    id: 5,
    word: "Dog",
    category: "Animals",
    color: "mint" as const,
    illustration: "🐕"
  }
];

const Flashcards = () => {
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [wordHidden, setWordHidden] = useState(false);
  const [cardsReviewedToday] = useState(12);
  const [totalReviewed] = useState(347);

  const currentCard = flashcards[currentCardIndex];

  const goToPrevious = () => {
    setCurrentCardIndex((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
    setWordHidden(false);
  };

  const goToNext = () => {
    setCurrentCardIndex((prev) => (prev === flashcards.length - 1 ? 0 : prev + 1));
    setWordHidden(false);
  };

  const handlePronunciation = () => {
    // Text-to-speech functionality would go here
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentCard.word);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile App Container */}
      <div className="max-w-sm mx-auto bg-background min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-accent"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-primary">Flashcards</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-6">
          {/* Category chip */}
          <div className="flex justify-center">
            <CategoryChip
              label={currentCard.category}
              icon={<span className="text-sm">📚</span>}
              color={currentCard.color}
            />
          </div>

          {/* Main flashcard */}
          <div className="flex items-center justify-center py-8">
            <div className="relative">
              {/* Navigation arrows */}
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-[-50px] top-1/2 transform -translate-y-1/2 hover:bg-accent rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              {/* Card */}
              <Card className="w-72 h-80 shadow-elegant border-0 bg-card">
              <CardContent className="h-full flex flex-col items-center justify-center p-6">
                {/* Illustration */}
                <div className="text-7xl mb-4 animate-scale-in">
                  {currentCard.illustration}
                </div>
                
                {/* Word */}
                <div className="text-center">
                  {!wordHidden ? (
                    <h2 className="text-2xl font-bold text-primary animate-fade-in">
                      {currentCard.word}
                    </h2>
                  ) : (
                    <div className="text-2xl font-bold text-muted-foreground">
                      ? ? ?
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 hover:bg-accent rounded-full"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {flashcards.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                    index === currentCardIndex ? 'bg-primary' : 'bg-primary/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom controls */}
          <div className="space-y-4">
            {/* Action buttons */}
            <div className="flex justify-center space-x-3">
              <Button
                onClick={handlePronunciation}
                className="bg-mint-light hover:bg-mint text-mint-foreground border-0 shadow-md"
                size="sm"
              >
                <Mic className="h-4 w-4 mr-2" />
                Pronounce
              </Button>
              
              <Button
                onClick={() => setWordHidden(!wordHidden)}
                variant="outline"
                className="shadow-md"
                size="sm"
              >
                {wordHidden ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                {wordHidden ? 'Show' : 'Hide'}
              </Button>
            </div>

            {/* Stats bar */}
            <Card className="bg-card border shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-primary">{cardsReviewedToday}</div>
                    <div className="text-muted-foreground">Today</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-primary">{currentCardIndex + 1}/{flashcards.length}</div>
                    <div className="text-muted-foreground">Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-primary">{totalReviewed}</div>
                    <div className="text-muted-foreground">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom spacing for mobile */}
            <div className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;