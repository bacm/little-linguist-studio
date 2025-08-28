
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { cn } from "@/lib/utils";

interface WordCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const AddWordDialog = ({ onWordAdded }: { onWordAdded?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [dateLearned, setDateLearned] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [categories, setCategories] = useState<WordCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentChild } = useChild();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('word_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
      // Set default category
      if (data && data.length > 0) {
        setCategoryId(data[0].id);
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !currentChild) {
      toast({
        title: "Error",
        description: "Please ensure you're logged in and have selected a child.",
        variant: "destructive",
      });
      return;
    }

    if (!word.trim()) {
      toast({
        title: "Missing word",
        description: "Please enter a word.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('words')
        .insert({
          word: word.trim(),
          pronunciation: pronunciation.trim() || null,
          child_id: currentChild.id,
          user_id: user.id,
          category_id: categoryId || null,
          date_learned: format(dateLearned, 'yyyy-MM-dd'),
          notes: notes.trim() || null,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Word added!",
        description: `"${word}" has been added to ${currentChild.name}'s vocabulary.`,
      });

      // Reset form
      setWord("");
      setPronunciation("");
      setNotes("");
      setDateLearned(new Date());
      setOpen(false);
      
      // Callback to refresh data
      onWordAdded?.();
    } catch (error: any) {
      console.error('Error adding word:', error);
      toast({
        title: "Error adding word",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentChild) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Word</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="word">Word</Label>
            <Input
              id="word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Enter the word..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pronunciation">How {currentChild.name} says it (optional)</Label>
            <Input
              id="pronunciation"
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              placeholder="e.g., 'cac' for 'cat'"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date Learned</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateLearned && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateLearned ? format(dateLearned, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateLearned}
                  onSelect={(date) => date && setDateLearned(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this word..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Adding..." : "Add Word"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
