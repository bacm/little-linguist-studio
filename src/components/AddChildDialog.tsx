import { useState } from "react";
import { Calendar, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddChildDialogProps {
  onChildAdded?: () => void;
}

const avatarEmojis = ["👶", "🧒", "👦", "👧", "🧑", "👨", "👩"];

export const AddChildDialog = ({ onChildAdded }: AddChildDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState<Date | undefined>();
  const [selectedAvatar, setSelectedAvatar] = useState("👶");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !birthdate) {
      toast({
        title: "Please fill in all fields",
        description: "Name and birthdate are required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add a child profile.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('children')
        .insert({
          name: name.trim(),
          birthdate: format(birthdate, 'yyyy-MM-dd'),
          avatar: selectedAvatar,
          user_id: user.id
        });

      if (error) {
        console.error('Error adding child:', error);
        toast({
          title: "Error adding child",
          description: "Please try again later.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Child added successfully!",
        description: `${name} has been added to your family.`,
      });

      // Reset form
      setName("");
      setBirthdate(undefined);
      setSelectedAvatar("👶");
      setOpen(false);

      // Notify parent component
      onChildAdded?.();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Unexpected error",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <span className="text-lg mr-2">👶</span>
          Add Child
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Child</DialogTitle>
          <DialogDescription>
            Create a profile for your child to track their speech development.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter child's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Birthdate Field */}
          <div className="space-y-2">
            <Label>Birthdate</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !birthdate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthdate ? format(birthdate, "PPP") : "Select birthdate"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={birthdate}
                  onSelect={setBirthdate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Avatar Selection */}
          <div className="space-y-2">
            <Label>Avatar</Label>
            <div className="grid grid-cols-4 gap-2">
              {avatarEmojis.map((emoji) => (
                <Button
                  key={emoji}
                  type="button"
                  variant={selectedAvatar === emoji ? "default" : "outline"}
                  className="h-12 text-lg"
                  onClick={() => setSelectedAvatar(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Child"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};