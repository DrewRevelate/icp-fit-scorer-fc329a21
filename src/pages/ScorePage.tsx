import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScoreGauge } from '@/components/ScoreGauge';
import { CriteriaCard } from '@/components/CriteriaCard';
import { OpeningLineCard } from '@/components/OpeningLineCard';
import { useICPStore } from '@/stores/icpStore';
import { ProspectScore, getScoreCategory, CriteriaScore } from '@/types/icp';
import { Target, Sparkles, Save, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIScoreResponse {
  companyName: string;
  totalScore: number;
  criteriaBreakdown: CriteriaScore[];
  openingLine: string;
}

export default function ScorePage() {
  const { criteria, addProspect } = useICPStore();
  const [companyInfo, setCompanyInfo] = useState('');
  const [isScoring, setIsScoring] = useState(false);
  const [result, setResult] = useState<ProspectScore | null>(null);

  const handleScore = async () => {
    if (!companyInfo.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter a company name or description.',
        variant: 'destructive',
      });
      return;
    }

    setIsScoring(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke<AIScoreResponse>('score-prospect', {
        body: { 
          companyInfo, 
          criteria: criteria.map(c => ({
            id: c.id,
            name: c.name,
            weight: c.weight,
            description: c.description,
          }))
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to score prospect');
      }

      if (!data) {
        throw new Error('No data returned from scoring');
      }

      const prospect: ProspectScore = {
        id: crypto.randomUUID(),
        companyName: data.companyName,
        companyDescription: companyInfo,
        totalScore: data.totalScore,
        scoreCategory: getScoreCategory(data.totalScore),
        criteriaBreakdown: data.criteriaBreakdown,
        openingLine: data.openingLine,
        createdAt: new Date().toISOString(),
      };

      setResult(prospect);
    } catch (err) {
      console.error('Scoring error:', err);
      toast({
        title: 'Scoring Failed',
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsScoring(false);
    }
  };

  const handleSave = () => {
    if (result) {
      addProspect(result);
      toast({
        title: 'Prospect Saved',
        description: `${result.companyName} has been added to your prospects.`,
      });
    }
  };

  const handleReset = () => {
    setCompanyInfo('');
    setResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 glow-effect">
            <Target className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold gradient-text">Score a Prospect</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Paste a company name, website, or description to instantly analyze 
          their fit against your ICP criteria using AI.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 space-y-4"
      >
        <Textarea
          placeholder="Enter company name, paste their website URL, or describe the company...

Example:
Acme Corp
B2B SaaS company with 150 employees
Series B, $25M ARR
Based in San Francisco
Tech stack: React, Node.js, AWS"
          value={companyInfo}
          onChange={(e) => setCompanyInfo(e.target.value)}
          className="min-h-[160px] bg-secondary/50 border-border resize-none"
          disabled={isScoring}
        />

        <div className="flex gap-3 justify-end">
          {result && (
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
            onClick={handleScore}
            disabled={isScoring || !companyInfo.trim()}
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
      </motion.div>

      <AnimatePresence mode="wait">
        {isScoring && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="relative">
              <div className="h-32 w-32 rounded-full border-4 border-primary/20 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            </div>
            <p className="mt-6 text-muted-foreground">AI is analyzing company fit...</p>
          </motion.div>
        )}

        {result && !isScoring && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Score Display */}
            <div className="flex flex-col items-center">
              <ScoreGauge score={result.totalScore} />
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-6"
              >
                <Button
                  onClick={handleSave}
                  size="lg"
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Save className="h-5 w-5" />
                  Save to Prospects
                </Button>
              </motion.div>
            </div>

            {/* Criteria Breakdown */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center">Criteria Breakdown</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.criteriaBreakdown.map((criteria, index) => (
                  <CriteriaCard key={criteria.criteriaId} criteria={criteria} index={index} />
                ))}
              </div>
            </div>

            {/* Opening Line */}
            <OpeningLineCard line={result.openingLine} companyName={result.companyName} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
