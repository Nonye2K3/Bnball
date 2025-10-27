import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const categories = [
  { id: "all", label: "All Sports", icon: "🏆" },
  { id: "nba", label: "NBA", icon: "🏀" },
  { id: "fifa", label: "FIFA", icon: "⚽" },
  { id: "nfl", label: "NFL", icon: "🏈" },
  { id: "esports", label: "E-Sports", icon: "🎮" },
  { id: "boxing", label: "Boxing", icon: "🥊" },
];

interface CategoryFilterProps {
  onCategoryChange?: (category: string) => void;
}

export function CategoryFilter({ onCategoryChange }: CategoryFilterProps) {
  const [selected, setSelected] = useState("all");

  const handleSelect = (id: string) => {
    setSelected(id);
    onCategoryChange?.(id);
    console.log('Category selected:', id);
  };

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <Badge
          key={category.id}
          variant={selected === category.id ? "default" : "outline"}
          className={`cursor-pointer whitespace-nowrap px-4 py-2 text-sm transition-all ${
            selected === category.id ? "toggle-elevate toggle-elevated" : "hover-elevate"
          }`}
          onClick={() => handleSelect(category.id)}
          data-testid={`filter-${category.id}`}
        >
          <span className="mr-2">{category.icon}</span>
          {category.label}
        </Badge>
      ))}
    </div>
  );
}
