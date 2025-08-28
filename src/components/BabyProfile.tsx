import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BabyProfileProps {
  name: string;
  age: string;
  imageUrl?: string;
}

export const BabyProfile = ({ name, age, imageUrl }: BabyProfileProps) => {
  return (
    <div className="flex flex-col items-center space-y-3 py-6">
      <Avatar className="w-20 h-20 border-4 border-primary-light shadow-lg">
        <AvatarImage src={imageUrl} alt={`${name}'s profile`} />
        <AvatarFallback className="bg-primary-light text-primary-foreground text-xl font-semibold">
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">{name}</h1>
        <p className="text-muted-foreground font-medium">{age}</p>
      </div>
    </div>
  );
};