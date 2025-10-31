import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const categories = [
  { id: "all", label: "All Sports" },
  { id: "nba", label: "NBA" },
  { id: "fifa", label: "FIFA" },
  { id: "nfl", label: "NFL" },
  { id: "esports", label: "E-Sports" },
  { id: "boxing", label: "Boxing" },
];

interface CategoryFilterProps {
  onCategoryChange?: (category: string) => void;
}

export function CategoryFilter({ onCategoryChange }: CategoryFilterProps) {
  const [selected, setSelected] = useState("all");

  const handleSelect = (id: string) => {
    setSelected(id);
    onCategoryChange?.(id);
  };

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <Badge
          key={category.id}
          variant={selected === category.id ? "default" : "outline"}
          className={`cursor-pointer whitespace-nowrap px-4 py-2 text-sm transition-all ${
            selected === category.id ? "toggle-elevate toggle-elevated" : ""
          }`}
          onClick={() => handleSelect(category.id)}
          data-testid={`filter-${category.id}`}
        >
          {category.label}
        </Badge>
      ))}
    </div>
  );
}
