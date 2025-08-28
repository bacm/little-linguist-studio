import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { WordCard } from "@/components/WordCard";
import { AddWordDialog } from "@/components/AddWordDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { Database } from "@/integrations/supabase/types";

type Word = Database['public']['Tables']['words']['Row'] & {
  word_categories: Database['public']['Tables']['word_categories']['Row'] | null;
  pronunciation?: string;
};

export default function WordList() {
  const [words, setWords] = useState<Word[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentChild } = useChild();

  useEffect(() => {
    if (!user || !currentChild) {
      return;
    }

    const fetchWords = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('words')
          .select(`
            *,
            word_categories (
              name,
              icon,
              color
            )
          `)
          .eq('child_id', currentChild.id)
          .order('created_at', { ascending: false });

        if (categoryFilter && categoryFilter !== "all") {
          query = query.eq('category_id', categoryFilter);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setWords(data as Word[]);
      } catch (error: any) {
        console.error("Error fetching words:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch words.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWords();
  }, [user, currentChild, categoryFilter, toast]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('word_categories')
          .select('id, name')
          .order('name');

        if (error) {
          throw error;
        }

        setCategories(data || []);
      } catch (error: any) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch categories.",
          variant: "destructive",
        });
      }
    };

    fetchCategories();
  }, [toast]);

  const handleWordAdded = () => {
    // Refresh words after a new word is added
    if (user && currentChild) {
      setIsLoading(true);
      supabase
        .from('words')
        .select(`
          *,
          word_categories (
            name,
            icon,
            color
          )
        `)
        .eq('child_id', currentChild.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          setIsLoading(false);
          if (error) {
            console.error("Error refetching words:", error);
            toast({
              title: "Error",
              description: error.message || "Failed to refresh words.",
              variant: "destructive",
            });
          } else {
            setWords(data as Word[]);
          }
        });
    }
  };

  const filteredWords = words.filter(word =>
    word.word.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile App Container */}
      <div className="max-w-sm mx-auto bg-background min-h-screen">
        
        {/* Header */}
        <div className="bg-primary-light/30 p-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Vocabulary</h1>
              <p className="text-muted-foreground">
                {words.length} words
                {currentChild ? ` in ${currentChild.name}'s vocabulary` : null}
              </p>
            </div>
            <AddWordDialog onWordAdded={handleWordAdded} />
          </div>

          {/* Search and Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search words..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          

          

          {/* Words List */}
          <div className="space-y-3">
            {filteredWords.map((word) => (
              <WordCard
                key={word.id}
                word={word.word}
                pronunciation={word.pronunciation}
                category={word.word_categories ? {
                  name: word.word_categories.name,
                  icon: word.word_categories.icon,
                  color: word.word_categories.color
                } : undefined}
                dateLearned={word.date_learned}
                notes={word.notes}
                onClick={() => navigate(`/word/${word.id}`)}
              />
            ))}
          </div>

          {filteredWords.length === 0 && (
            <div className="text-center py-6">
              <h2 className="text-xl font-semibold text-muted-foreground mb-2">No words found</h2>
              <p className="text-muted-foreground">Add some words to start building your child's vocabulary!</p>
            </div>
          )}

          
        </div>
      </div>
    </div>
  );
}
