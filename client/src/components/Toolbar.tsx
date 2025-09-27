import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Copy, Download } from "lucide-react";

interface ToolbarProps {
  onRevealAll: () => void;
  onCopyJson: () => void;
  onDownloadJson: () => void;
  allRevealed: boolean;
}

export function Toolbar({ onRevealAll, onCopyJson, onDownloadJson, allRevealed }: ToolbarProps) {
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
      
      <Button
        variant="outline"
        size="sm"
        onClick={onCopyJson}
        data-testid="button-copy-json"
      >
        <Copy className="mr-2 h-4 w-4" />
        Copy JSON
      </Button>
      
      <Button
        size="sm"
        onClick={onDownloadJson}
        data-testid="button-download-json"
      >
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
    </div>
  );
}
