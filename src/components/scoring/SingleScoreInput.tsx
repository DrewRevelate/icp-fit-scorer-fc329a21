import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, RotateCcw, Loader2 } from 'lucide-react';

interface SingleScoreInputProps {
  value: string;
  onChange: (value: string) => void;
  onScore: () => void;
  onReset: () => void;
  isScoring: boolean;
  hasResult: boolean;
}

export function SingleScoreInput({
  value,
  onChange,
  onScore,
  onReset,
  isScoring,
  hasResult,
}: SingleScoreInputProps) {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Enter company name, paste their website URL, or describe the company...

Example:
Acme Corp
B2B SaaS company with 150 employees
Series B, $25M ARR
Based in San Francisco
Tech stack: React, Node.js, AWS"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[160px] bg-secondary/50 border-border resize-none"
        disabled={isScoring}
      />

      <div className="flex gap-3 justify-end">
        {hasResult && (
          <Button
            variant="outline"
            onClick={onReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            New Analysis
          </Button>
        )}
        
        <Button
          onClick={onScore}
          disabled={isScoring || !value.trim()}
          className="gap-2 bg-primary hover:bg-primary/90 min-w-[140px]"
        >
          {isScoring ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Score Prospect
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
