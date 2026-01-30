import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, RotateCcw, Loader2, Link, Wand2 } from 'lucide-react';
import { EnrichedCompany } from '@/types/icp';
import { EnrichedDataCard } from './EnrichedDataCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SingleScoreInputProps {
  value: string;
  onChange: (value: string) => void;
  onScore: () => void;
  onReset: () => void;
  isScoring: boolean;
  hasResult: boolean;
  enrichedData: EnrichedCompany | null;
  onEnrichedData: (data: EnrichedCompany | null) => void;
}

// URL detection regex
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

function isValidUrl(text: string): boolean {
  const trimmed = text.trim();
  // Check if the input looks like a URL (domain-like pattern)
  if (URL_REGEX.test(trimmed)) return true;
  // Also check for common domain patterns without protocol
  if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,}$/i.test(trimmed)) return true;
  return false;
}

export function SingleScoreInput({
  value,
  onChange,
  onScore,
  onReset,
  isScoring,
  hasResult,
  enrichedData,
  onEnrichedData,
}: SingleScoreInputProps) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);

  // Detect URL in input
  useEffect(() => {
    const trimmed = value.trim();
    if (isValidUrl(trimmed) && !enrichedData) {
      setDetectedUrl(trimmed);
    } else {
      setDetectedUrl(null);
    }
  }, [value, enrichedData]);

  const handleEnrich = async () => {
    if (!detectedUrl) return;

    setIsEnriching(true);
    try {
      const { data, error } = await supabase.functions.invoke('enrich-company', {
        body: { url: detectedUrl },
      });

      if (error) {
        console.error('Enrichment error:', error);
        toast.error('Failed to enrich company data. Try entering details manually.');
        return;
      }

      if (data?.error) {
        console.error('Enrichment API error:', data.error);
        toast.error(data.error);
        return;
      }

      if (data?.success && data?.data) {
        const enriched = data.data as EnrichedCompany;
        onEnrichedData(enriched);
        
        // Build a rich description for scoring
        const description = [
          enriched.companyName,
          enriched.description,
          `Industry: ${enriched.industry}`,
          `Size: ${enriched.companySize}`,
          `Revenue: ${enriched.estimatedRevenue}`,
          `Funding: ${enriched.fundingStage}`,
          `Region: ${enriched.region}`,
          enriched.techStack.length > 0 ? `Tech Stack: ${enriched.techStack.join(', ')}` : '',
        ].filter(Boolean).join('\n');
        
        onChange(description);
        toast.success(`Enriched data for ${enriched.companyName}`);
      }
    } catch (err) {
      console.error('Enrichment exception:', err);
      toast.error('Failed to connect to enrichment service');
    } finally {
      setIsEnriching(false);
    }
  };

  const handleReset = () => {
    onEnrichedData(null);
    onReset();
  };

  return (
    <div className="space-y-4">
      {/* Enriched Data Display */}
      {enrichedData && (
        <EnrichedDataCard data={enrichedData} />
      )}

      {/* Input Area */}
      <div className="relative">
        <Textarea
          placeholder={enrichedData 
            ? "Enriched data loaded. Click 'Score Prospect' to analyze."
            : `Paste a company URL to auto-enrich, or describe manually...

Examples:
• stripe.com
• https://hubspot.com
• Acme Corp - B2B SaaS, 150 employees, Series B`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[120px] bg-secondary/50 border-border resize-none pr-4"
          disabled={isScoring || isEnriching}
        />

        {/* URL Detection Indicator */}
        {detectedUrl && !isEnriching && !enrichedData && (
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              onClick={handleEnrich}
              className="gap-1.5 bg-primary/90 hover:bg-primary text-xs h-7"
            >
              <Wand2 className="h-3 w-3" />
              Auto-Enrich
            </Button>
          </div>
        )}
      </div>

      {/* Enrichment Loading State */}
      {isEnriching && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Enriching company data...</p>
            <p className="text-xs text-muted-foreground">Scraping website and extracting company signals</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        {(hasResult || enrichedData) && (
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            New Analysis
          </Button>
        )}
        
        <Button
          onClick={onScore}
          disabled={isScoring || isEnriching || !value.trim()}
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
