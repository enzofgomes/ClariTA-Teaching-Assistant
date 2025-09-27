import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface ToolbarProps {
  onRevealAll: () => void;
  allRevealed: boolean;
}

export function Toolbar({ onRevealAll, allRevealed }: ToolbarProps) {
  return (
    <div className="flex space-x-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={onRevealAll}
        data-testid="button-reveal-all"
      >
        {allRevealed ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
        {allRevealed ? "Hide All" : "Reveal All"}
      </Button>
    </div>
  );
}
