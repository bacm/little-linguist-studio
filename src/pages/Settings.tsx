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
import { MobileBottomNav } from "@/components/MobileBottomNav";
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
    <div className="min-h-screen bg-mint-light pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-primary">Settings</h1>
        </div>
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
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => navigate('/auth')}
              >
                <LogOut className="h-4 w-4 mr-1" />
                {userEmail ? 'Switch Account' : 'Sign In'}
              </Button>
              {userEmail && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    // For now, just show a message - actual account deletion would need more confirmation
                    toast({
                      title: "Account deletion",
                      description: "Please contact support to delete your account.",
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ... keep existing content ... */}

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

        {/* ... keep remaining sections unchanged ... */}
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Settings;