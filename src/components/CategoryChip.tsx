interface CategoryChipProps {
  label: string;
  icon: React.ReactNode;
  color: "mint" | "peach" | "lavender" | "primary";
  count?: number;
}

export const CategoryChip = ({ label, icon, color, count }: CategoryChipProps) => {
  const colorClasses = {
    mint: "bg-mint-light text-mint-foreground",
    peach: "bg-peach-light text-peach-foreground", 
    lavender: "bg-lavender-light text-lavender-foreground",
    primary: "bg-primary-light text-primary-foreground"
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${colorClasses[color]} font-medium text-sm shadow-sm transition-all duration-200 hover:scale-105`}>
      <div className="w-4 h-4">
        {icon}
      </div>
      <span>{label}</span>
      {count && (
        <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-semibold">
          {count}
        </span>
      )}
    </div>
  );
};