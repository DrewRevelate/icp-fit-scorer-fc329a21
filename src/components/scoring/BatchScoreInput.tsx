import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, RotateCcw, Loader2, ListChecks } from 'lucide-react';

interface BatchScoreInputProps {
  value: string;
  onChange: (value: string) => void;
  onScore: () => void;
  onReset: () => void;
  isScoring: boolean;
  hasResults: boolean;
  companyCount: number;
}

export function BatchScoreInput({
  value,
  onChange,
  onScore,
  onReset,
  isScoring,
  hasResults,
  companyCount,
}: BatchScoreInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Enter one company per line. Include any relevant details on the same line.
        </p>
        {companyCount > 0 && (
          <span className="text-sm font-medium text-primary flex items-center gap-1.5">
            <ListChecks className="h-4 w-4" />
            {companyCount} {companyCount === 1 ? 'company' : 'companies'}
          </span>
        )}
      </div>
      
      <Textarea
        placeholder="Paste multiple companies, one per line...

Example:
HubSpot - 7000 employees, Marketing SaaS, Series E
Stripe - 8000 employees, FinTech, $95B valuation
Notion - 400 employees, Productivity SaaS, Series C
Figma - 800 employees, Design tools, acquired by Adobe
Linear - 50 employees, Dev tools, Series B"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[200px] bg-secondary/50 border-border resize-none font-mono text-sm"
        disabled={isScoring}
      />

      <div className="flex gap-3 justify-end">
        {hasResults && (
          <Button
            variant="outline"
            onClick={onReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            New Batch
          </Button>
        )}
        
        <Button
          onClick={onScore}
          disabled={isScoring || companyCount === 0}
          className="gap-2 bg-primary hover:bg-primary/90 min-w-[160px]"
        >
          {isScoring ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Score All ({companyCount})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
