import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  User, 
  Users, 
  Palette, 
  Globe, 
  Download, 
  Bell, 
  Info, 
  Plus,
  Settings as SettingsIcon,
  LogOut,
  Trash2,
  Moon,
  Sun,
  Sunrise,
  Volume2,
  VolumeX,
  FileText,
  FileImage,
  Mic,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AddChildDialog } from "@/components/AddChildDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { differenceInMonths, differenceInYears, format } from "date-fns";

interface Child {
  id: string;
  name: string;
  birthdate: string;
  avatar: string;
  created_at: string;
  updated_at: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "pastel" | "dark">("pastel");
  const [simplifiedPhonetics, setSimplifiedPhonetics] = useState(true);
  const [showIPA, setShowIPA] = useState(false);
  const [wordReminders, setWordReminders] = useState(true);
  const [milestoneAlerts, setMilestoneAlerts] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");

  // Fetch children and user data
  useEffect(() => {
    fetchChildren();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchChildren = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching children:', error);
        toast({
          title: "Error loading children",
          description: "Please try refreshing the page.",
          variant: "destructive",
        });
        return;
      }

      setChildren(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChildAge = (birthdate: string): string => {
    const birth = new Date(birthdate);
    const now = new Date();
    const years = differenceInYears(now, birth);
    const months = differenceInMonths(now, birth) % 12;

    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years}y ${months}m`;
    }
  };

  const handleChildAdded = () => {
    fetchChildren(); // Refresh the list when a new child is added
  };

  const themes = [
    { id: "light", name: "Light", icon: Sun, color: "bg-yellow-100" },
    { id: "pastel", name: "Pastel", icon: Sunrise, color: "bg-pink-100" },
    { id: "dark", name: "Dark", icon: Moon, color: "bg-slate-100" }
  ];

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
          <h1 className="text-xl font-bold text-primary">Settings</h1>
          <div className="w-10" />
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          
          {/* Parent Account */}
          <Card className="bg-gradient-to-br from-primary-light/20 to-primary-light/10 border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2 text-primary" />
                Parent Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                {userEmail || "Not logged in"}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
                <Button variant="destructive" size="sm" className="flex-1">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Children Management */}
          <Card className="bg-gradient-to-br from-mint-light/30 to-mint-light/10 border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 mr-2 text-mint" />
                Children
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading children...</div>
              ) : children.length > 0 ? (
                <>
                  {children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between p-2 rounded-lg bg-white/50">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{child.avatar}</div>
                        <div>
                          <div className="font-medium text-sm">{child.name}</div>
                          <div className="text-xs text-muted-foreground">{getChildAge(child.birthdate)}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <AddChildDialog onChildAdded={handleChildAdded} />
                </>
              ) : (
                <>
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No children added yet
                  </div>
                  <AddChildDialog onChildAdded={handleChildAdded} />
                </>
              )}
            </CardContent>
          </Card>

          {/* Personalization */}
          <Card className="bg-gradient-to-br from-peach-light/30 to-peach-light/10 border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Palette className="h-5 w-5 mr-2 text-peach" />
                Personalization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Theme</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {themes.map((themeOption) => (
                    <Button
                      key={themeOption.id}
                      variant={theme === themeOption.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme(themeOption.id as any)}
                      className="flex flex-col h-auto py-2"
                    >
                      <div className={`w-6 h-6 rounded-full ${themeOption.color} mb-1 flex items-center justify-center`}>
                        <themeOption.icon className="h-3 w-3" />
                      </div>
                      <span className="text-xs">{themeOption.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <SettingsIcon className="h-4 w-4 mr-1" />
                Custom Icons
              </Button>
            </CardContent>
          </Card>

          {/* Language & Phonetics */}
          <Card className="bg-gradient-to-br from-lavender-light/30 to-lavender-light/10 border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Globe className="h-5 w-5 mr-2 text-lavender" />
                Language & Phonetics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" size="sm" className="w-full justify-between">
                App Language
                <span className="text-muted-foreground">English</span>
              </Button>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Simplified Phonetics</Label>
                    <div className="text-xs text-muted-foreground">"cac" for "casque"</div>
                  </div>
                  <Switch 
                    checked={simplifiedPhonetics} 
                    onCheckedChange={setSimplifiedPhonetics}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Show IPA</Label>
                    <div className="text-xs text-muted-foreground">International Phonetic Alphabet</div>
                  </div>
                  <Switch 
                    checked={showIPA} 
                    onCheckedChange={setShowIPA}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup & Export */}
          <Card className="bg-gradient-to-br from-primary-light/20 to-primary-light/10 border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Download className="h-5 w-5 mr-2 text-primary" />
                Backup & Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Export Data (CSV)
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileImage className="h-4 w-4 mr-2" />
                Export Report (PDF)
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Mic className="h-4 w-4 mr-2" />
                Export Audio Recordings
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-gradient-to-br from-mint-light/30 to-mint-light/10 border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Bell className="h-5 w-5 mr-2 text-mint" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Word Reminders</Label>
                  <div className="text-xs text-muted-foreground">Daily prompts to add new words</div>
                </div>
                <Switch 
                  checked={wordReminders} 
                  onCheckedChange={setWordReminders}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Milestone Alerts</Label>
                  <div className="text-xs text-muted-foreground">Celebrate development milestones</div>
                </div>
                <Switch 
                  checked={milestoneAlerts} 
                  onCheckedChange={setMilestoneAlerts}
                />
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="bg-gradient-to-br from-peach-light/30 to-peach-light/10 border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Info className="h-5 w-5 mr-2 text-peach" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center py-1">
                <span className="text-sm">App Version</span>
                <span className="text-sm text-muted-foreground">1.2.3</span>
              </div>
              <Separator />
              <Button variant="ghost" size="sm" className="w-full justify-start p-1">
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start p-1">
                Terms of Service
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start p-1">
                Support & Feedback
              </Button>
            </CardContent>
          </Card>

          {/* Bottom spacing */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
};

export default Settings;