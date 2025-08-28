import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Droplets, 
  Utensils, 
  Dog, 
  Users, 
  Package,
  Heart,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data for words
const mockWords = [
  { id: 1, word: "mouillé", category: "Actions", date: "1 Aug 2025", icon: <Droplets className="w-4 h-4" />, color: "lavender" },
  { id: 2, word: "pomme", category: "Food", date: "30 Jul 2025", icon: <Utensils className="w-4 h-4" />, color: "mint" },
  { id: 3, word: "chien", category: "Animals", date: "28 Jul 2025", icon: <Dog className="w-4 h-4" />, color: "peach" },
  { id: 4, word: "maman", category: "Family", date: "25 Jul 2025", icon: <Users className="w-4 h-4" />, color: "primary" },
  { id: 5, word: "balle", category: "Objects", date: "22 Jul 2025", icon: <Package className="w-4 h-4" />, color: "mint" },
  { id: 6, word: "eau", category: "Food", date: "20 Jul 2025", icon: <Utensils className="w-4 h-4" />, color: "mint" },
  { id: 7, word: "chat", category: "Animals", date: "18 Jul 2025", icon: <Dog className="w-4 h-4" />, color: "peach" },
  { id: 8, word: "papa", category: "Family", date: "15 Jul 2025", icon: <Users className="w-4 h-4" />, color: "primary" },
  { id: 9, word: "courir", category: "Actions", date: "12 Jul 2025", icon: <Heart className="w-4 h-4" />, color: "lavender" },
  { id: 10, word: "livre", category: "Objects", date: "10 Jul 2025", icon: <Package className="w-4 h-4" />, color: "mint" },
];

const categories = ["All", "Food", "Animals", "Actions", "Family", "Objects"];

const WordList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredWords = mockWords.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || word.category === selectedCategory;
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

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile App Container */}
      <div className="max-w-sm mx-auto bg-background min-h-screen">
        
        {/* Header */}
        <div className="bg-primary-light/30 p-4">
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
              <p className="text-sm text-muted-foreground">{filteredWords.length} words found</p>
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
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "secondary"}
                    className={`cursor-pointer whitespace-nowrap ${
                      selectedCategory === category 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-card text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Words List */}
        <div className="p-4">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3">
              {filteredWords.map((wordItem) => (
                <Card 
                  key={wordItem.id}
                  className="p-4 bg-card border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    // TODO: Navigate to word detail page
                    console.log("Open word details for:", wordItem.word);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(wordItem.color)}`}>
                      {wordItem.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground text-lg">{wordItem.word}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {wordItem.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <p className="text-muted-foreground text-sm">{wordItem.date}</p>
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
      </div>
    </div>
  );
};

export default WordList;