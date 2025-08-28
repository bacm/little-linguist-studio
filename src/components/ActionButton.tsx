import { Button } from "@/components/ui/button";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "mint" | "peach" | "lavender";
  size?: "sm" | "default" | "lg";
  onClick?: () => void;
}

export const ActionButton = ({ icon, label, variant = "default", size = "default", onClick }: ActionButtonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "mint":
        return "bg-mint-light hover:bg-mint text-mint-foreground border-0";
      case "peach":
        return "bg-peach-light hover:bg-peach text-peach-foreground border-0";
      case "lavender":
        return "bg-lavender-light hover:bg-lavender text-lavender-foreground border-0";
      default:
        return "bg-primary-light hover:bg-primary text-primary-foreground border-0";
    }
  };

  return (
    <Button
      onClick={onClick}
      className={`${getVariantClasses()} shadow-md hover:scale-105 transition-all duration-200 flex items-center space-x-2`}
      size={size}
    >
      <div className="w-4 h-4">
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </Button>
  );
};