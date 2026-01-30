import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  RotateCcw, 
  Loader2, 
  ListChecks, 
  Link, 
  Zap,
  Check,
  X,
  Globe
} from 'lucide-react';
import { EnrichedCompany } from '@/types/icp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface BatchScoreInputProps {
  value: string;
  onChange: (value: string) => void;
  onScore: () => void;
  onReset: () => void;
  isScoring: boolean;
  hasResults: boolean;
  companyCount: number;
  enrichedCompanies: EnrichedCompany[];
  onEnrichedCompanies: (companies: EnrichedCompany[]) => void;
}

// URL detection regex
const URL_REGEX = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/\S*)?$/;

function isUrl(line: string): boolean {
  return URL_REGEX.test(line.trim());
}

interface EnrichmentProgress {
  total: number;
  completed: number;
  failed: number;
  current: string;
}

export function BatchScoreInput({
  value,
  onChange,
  onScore,
  onReset,
  isScoring,
  hasResults,
  companyCount,
  enrichedCompanies,
  onEnrichedCompanies,
}: BatchScoreInputProps) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState<EnrichmentProgress | null>(null);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);

  const lines = value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const urlLines = lines.filter(isUrl);
  const textLines = lines.filter(l => !isUrl(l));
  const hasUrls = urlLines.length > 0;
  const allAreUrls = urlLines.length === lines.length && lines.length > 0;

  const handleEnrichAll = async () => {
    if (urlLines.length === 0) return;

    setIsEnriching(true);
    setEnrichProgress({ total: urlLines.length, completed: 0, failed: 0, current: '' });
    setFailedUrls([]);
    onEnrichedCompanies([]);

    const enriched: EnrichedCompany[] = [];
    const failed: string[] = [];

    for (let i = 0; i < urlLines.length; i++) {
      const url = urlLines[i];
      setEnrichProgress(prev => prev ? { ...prev, current: url } : null);

      try {
        const { data, error } = await supabase.functions.invoke<{ success: boolean; data: EnrichedCompany; error?: string }>('enrich-company', {
          body: { url },
        });

        if (error || !data?.success) {
          throw new Error(error?.message || data?.error || 'Enrichment failed');
        }

        enriched.push(data.data);
        setEnrichProgress(prev => prev ? { ...prev, completed: prev.completed + 1 } : null);
      } catch (err) {
        console.error(`Failed to enrich ${url}:`, err);
        failed.push(url);
        setEnrichProgress(prev => prev ? { ...prev, failed: prev.failed + 1 } : null);
      }

      // Delay between requests
      if (i < urlLines.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    onEnrichedCompanies(enriched);
    setFailedUrls(failed);
    setIsEnriching(false);
    setEnrichProgress(null);

    if (enriched.length > 0) {
      toast({
        title: 'Enrichment Complete',
        description: `Enriched ${enriched.length} companies${failed.length > 0 ? `, ${failed.length} failed` : ''}.`,
      });
    } else {
      toast({
        title: 'Enrichment Failed',
        description: 'Could not enrich any URLs. Please check the URLs and try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClearEnriched = () => {
    onEnrichedCompanies([]);
    setFailedUrls([]);
  };

  const handleScoreEnriched = () => {
    // Convert enriched companies to text format for scoring
    const enrichedText = enrichedCompanies.map(c => 
      `${c.companyName} - ${c.companySize}, ${c.industry}, ${c.fundingStage}, ${c.estimatedRevenue}, Tech: ${c.techStack.slice(0, 5).join(', ')}`
    ).join('\n');
    
    onChange(enrichedText);
    onEnrichedCompanies([]);
    
    // Trigger score after state update
    setTimeout(() => onScore(), 100);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {hasUrls 
            ? 'Paste company URLs to auto-enrich, or enter company details directly.'
            : 'Enter one company per line. Include any relevant details on the same line.'}
        </p>
        {companyCount > 0 && (
          <div className="flex items-center gap-2">
            {hasUrls && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Link className="h-3 w-3" />
                {urlLines.length} URLs
              </Badge>
            )}
            <span className="text-sm font-medium text-primary flex items-center gap-1.5">
              <ListChecks className="h-4 w-4" />
              {companyCount} {companyCount === 1 ? 'company' : 'companies'}
            </span>
          </div>
        )}
      </div>
      
      {/* Input */}
      <Textarea
        placeholder="Paste multiple companies or URLs, one per line...

Examples:
hubspot.com
notion.so
linear.app

Or enter details directly:
HubSpot - 7000 employees, Marketing SaaS, Series E
Stripe - 8000 employees, FinTech, $95B valuation"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[200px] bg-secondary/50 border-border resize-none font-mono text-sm"
        disabled={isScoring || isEnriching || enrichedCompanies.length > 0}
      />

      {/* Enrichment Progress */}
      <AnimatePresence>
        {isEnriching && enrichProgress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">Enriching URLs...</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {enrichProgress.completed + enrichProgress.failed} / {enrichProgress.total}
              </span>
            </div>
            
            <div className="w-full bg-secondary rounded-full h-2">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${((enrichProgress.completed + enrichProgress.failed) / enrichProgress.total) * 100}%` 
                }}
              />
            </div>
            
            {enrichProgress.current && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Globe className="h-3 w-3" />
                {enrichProgress.current}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enriched Companies Preview */}
      <AnimatePresence>
        {enrichedCompanies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-success/30 bg-success/5 overflow-hidden"
          >
            <div className="px-4 py-2 border-b border-success/20 bg-success/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">
                  {enrichedCompanies.length} Companies Enriched
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearEnriched}
                className="h-7 text-xs"
              >
                Clear
              </Button>
            </div>
            
            <div className="divide-y divide-border/30 max-h-[300px] overflow-y-auto">
              {enrichedCompanies.map((company, index) => (
                <motion.div
                  key={company.website}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-4 py-3 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{company.companyName}</p>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                      <span>{company.industry}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span>{company.companySize}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span>{company.fundingStage}</span>
                    </p>
                  </div>
                  {company.dataSources && (
                    <div className="flex gap-1 shrink-0">
                      {company.dataSources.map(source => (
                        <Badge key={source} variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {failedUrls.length > 0 && (
              <div className="px-4 py-2 border-t border-destructive/20 bg-destructive/5">
                <p className="text-xs text-destructive flex items-center gap-1.5">
                  <X className="h-3 w-3" />
                  Failed: {failedUrls.join(', ')}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
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

        {/* Show Enrich button when URLs detected and not yet enriched */}
        {hasUrls && enrichedCompanies.length === 0 && !hasResults && (
          <Button
            variant="outline"
            onClick={handleEnrichAll}
            disabled={isEnriching || isScoring}
            className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
          >
            {isEnriching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enriching...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Auto-Enrich ({urlLines.length})
              </>
            )}
          </Button>
        )}
        
        {/* Score button - either score enriched or score raw */}
        <Button
          onClick={enrichedCompanies.length > 0 ? handleScoreEnriched : onScore}
          disabled={isScoring || isEnriching || (companyCount === 0 && enrichedCompanies.length === 0)}
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
              Score All ({enrichedCompanies.length > 0 ? enrichedCompanies.length : companyCount})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
