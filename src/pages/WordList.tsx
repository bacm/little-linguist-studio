import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChild } from "@/contexts/ChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Word {
  id: string;
  word: string;
  category_id: string;
  date_learned: string;
  word_categories?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const WordList = () => {
  const navigate = useNavigate();
  const { currentChild, loading: childLoading } = useChild();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user || !currentChild) {
      setLoading(false);
      return;
    }

    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('word_categories')
        .select('*')
        .order('name');

      setCategories(categoriesData || []);

      // Fetch words
      const { data: wordsData } = await supabase
        .from('words')
        .select(`
          *,
          word_categories (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('user_id', user.id)
        .eq('child_id', currentChild.id)
        .order('date_learned', { ascending: false })
        .order('created_at', { ascending: false });

      setWords(wordsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!childLoading) {
      fetchData();
    }
  }, [user, currentChild, childLoading]);

  const filteredWords = words.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || 
      (word.word_categories?.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (color: string) => {
    const colorMap = {
      mint: "bg-mint-light text-mint-foreground",
      peach: "bg-peach-light text-peach-foreground", 
      lavender: "bg-lavender-light text-lavender-foreground",
      primary: "bg-primary-light text-primary-foreground"
    };
    return colorMap[color as keyof typeof colorMap] || "bg-secondary text-secondary-foreground";
  };

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

  return (
    <div className="min-h-screen bg-mint-light pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">All Words</h1>
            <p className="text-sm text-muted-foreground">{currentChild.name}'s vocabulary - {filteredWords.length} words found</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-0 shadow-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              <Badge
                variant={selectedCategory === "All" ? "default" : "secondary"}
                className={`cursor-pointer whitespace-nowrap ${
                  selectedCategory === "All" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card text-foreground hover:bg-muted"
                }`}
                onClick={() => setSelectedCategory("All")}
              >
                All
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.name ? "default" : "secondary"}
                  className={`cursor-pointer whitespace-nowrap ${
                    selectedCategory === category.name 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-card text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Words List */}
      <div className="p-4">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-3">
            {filteredWords.map((wordItem) => (
              <Card 
                key={wordItem.id}
                className="p-4 bg-card border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/words/${wordItem.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    wordItem.word_categories ? 
                      getCategoryColor(wordItem.word_categories.color) : 
                      'bg-secondary text-secondary-foreground'
                  }`}>
                    <span className="text-lg">
                      {wordItem.word_categories?.icon || '📝'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground text-lg">{wordItem.word}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {wordItem.word_categories?.name || 'Uncategorized'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">
                        {format(new Date(wordItem.date_learned), "d MMM yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {filteredWords.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No words found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default WordList;