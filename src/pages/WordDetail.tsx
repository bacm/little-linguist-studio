import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Mic, 
  Edit, 
  Trash2,
  Calendar,
  Tag,
  FileText,
  Play,
  Square,
  Droplets, 
  Utensils, 
  Dog, 
  Users, 
  Package,
  Heart
} from "lucide-react";

// Mock data - in real app this would come from Supabase
const mockWordData: Record<string, any> = {
  "1": { 
    id: 1, 
    word: "mouillé", 
    category: "Actions", 
    date: "1 Aug 2025", 
    icon: <Droplets className="w-5 h-5" />, 
    color: "lavender",
    notes: "Ada said this when she spilled water on her shirt. She was so proud to use the right word!",
    audioRecording: null
  },
  "2": { 
    id: 2, 
    word: "pomme", 
    category: "Food", 
    date: "30 Jul 2025", 
    icon: <Utensils className="w-5 h-5" />, 
    color: "mint",
    notes: "First word she said clearly while eating an apple at lunch.",
    audioRecording: null
  },
  "3": { 
    id: 3, 
    word: "chien", 
    category: "Animals", 
    date: "28 Jul 2025", 
    icon: <Dog className="w-5 h-5" />, 
    color: "peach",
    notes: "She saw a golden retriever at the park and immediately said 'chien'!",
    audioRecording: null
  }
};

const WordDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [notes, setNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  // Get word data - in real app this would be fetched from Supabase
  const wordData = mockWordData[id || "1"];

  if (!wordData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Word not found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Initialize notes with existing data
  useEffect(() => {
    setNotes(wordData.notes || "");
  }, [wordData.notes]);

  const getCategoryColor = (color: string) => {
    const colorMap = {
      mint: "bg-mint-light text-mint-foreground border-mint",
      peach: "bg-peach-light text-peach-foreground border-peach", 
      lavender: "bg-lavender-light text-lavender-foreground border-lavender",
      primary: "bg-primary-light text-primary-foreground border-primary"
    };
    return colorMap[color as keyof typeof colorMap] || "bg-secondary text-secondary-foreground border-secondary";
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // TODO: Implement actual recording functionality
    console.log("Starting audio recording...");
    
    // Simulate recording for demo
    setTimeout(() => {
      setIsRecording(false);
      setHasRecording(true);
    }, 3000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecording(true);
    // TODO: Implement stop recording
    console.log("Stopping audio recording...");
  };

  const handlePlayRecording = () => {
    // TODO: Implement play recording
    console.log("Playing audio recording...");
  };

  const handleEdit = () => {
    // TODO: Navigate to edit screen
    console.log("Edit word:", wordData.word);
  };

  const handleDelete = () => {
    // TODO: Show confirmation dialog and delete
    console.log("Delete word:", wordData.word);
  };

  const handleSaveNotes = () => {
    // TODO: Save to Supabase
    console.log("Saving notes:", notes);
  };

  return (
    <div className="min-h-screen bg-mint-light pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">Word Details</h2>
            <p className="text-sm text-muted-foreground">Manage word information</p>
          </div>
        </div>
      </div>

      {/* Word Display */}
      <div className="p-4">
        <Card className="p-6 bg-card border-0 shadow-lg mb-6">
          <div className="text-center space-y-4">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${getCategoryColor(wordData.color)}`}>
              {wordData.icon}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">{wordData.word}</h2>
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">First said on {wordData.date}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Content */}
        <div className="space-y-4">
          
          {/* Category */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">Category</h3>
            </div>
            <Badge className={`${getCategoryColor(wordData.color)} border-2`}>
              {wordData.category}
            </Badge>
          </div>

          {/* Audio Recording */}
          <Card className="p-4 bg-card border-0 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Mic className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">Audio Recording</h3>
            </div>
            
            <div className="flex items-center gap-3">
              {!isRecording && !hasRecording && (
                <Button
                  onClick={handleStartRecording}
                  className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Record Pronunciation
                </Button>
              )}
              
              {isRecording && (
                <Button
                  onClick={handleStopRecording}
                  variant="destructive"
                  className="flex-1"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
              )}
              
              {hasRecording && !isRecording && (
                <>
                  <Button
                    onClick={handlePlayRecording}
                    variant="outline"
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play Recording
                  </Button>
                  <Button
                    onClick={handleStartRecording}
                    size="icon"
                    variant="ghost"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            
            {isRecording && (
              <div className="mt-3 flex items-center justify-center">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Recording...</span>
                </div>
              </div>
            )}
          </Card>

          {/* Notes */}
          <Card className="p-4 bg-card border-0 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">Notes & Anecdotes</h3>
            </div>
            
            <Textarea
              placeholder="Add notes about when and how your baby said this word..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24 resize-none bg-background border-input"
            />
            
            {notes !== wordData.notes && (
              <Button 
                onClick={handleSaveNotes}
                size="sm" 
                className="mt-2 bg-primary hover:bg-primary-dark"
              >
                Save Notes
              </Button>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={handleEdit}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Word
            </Button>
            
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default WordDetail;