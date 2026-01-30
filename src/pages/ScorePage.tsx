import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SingleScoreInput } from '@/components/scoring/SingleScoreInput';
import { BatchScoreInput } from '@/components/scoring/BatchScoreInput';
import { BatchProgress } from '@/components/scoring/BatchProgress';
import { BatchResults } from '@/components/scoring/BatchResults';
import { ScoreResult } from '@/components/scoring/ScoreResult';
import { ScoringLoader } from '@/components/scoring/ScoringLoader';
import { useICPStore } from '@/stores/icpStore';
import { useScoringRules } from '@/hooks/useScoringRules';
import { evaluateLeadAgainstRules } from '@/lib/rule-scoring-engine';
import { ProspectScore, getTierFromScore, CriteriaScore, EnrichedCompany, ScoringMode, OutreachTone, OutreachBlock } from '@/types/icp';
import { RuleBasedScore } from '@/types/scoring-rules';
import { Target, User, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIScoreResponse {
  companyName: string;
  totalScore: number;
  criteriaBreakdown: CriteriaScore[];
  openingLine: string;
  outreach?: OutreachBlock;
  outreachTone?: OutreachTone;
}

export default function ScorePage() {
  const { criteria, addProspect, scoringMode } = useICPStore();
  const { rules, settings } = useScoringRules();
  
  // Single mode state
  const [companyInfo, setCompanyInfo] = useState('');
  const [isScoring, setIsScoring] = useState(false);
  const [result, setResult] = useState<ProspectScore | null>(null);
  const [ruleBasedScore, setRuleBasedScore] = useState<RuleBasedScore | null>(null);
  const [enrichedData, setEnrichedData] = useState<EnrichedCompany | null>(null);
  
  // Batch mode state
  const [batchInput, setBatchInput] = useState('');
  const [isBatchScoring, setIsBatchScoring] = useState(false);
  const [batchResults, setBatchResults] = useState<ProspectScore[]>([]);
  const [failedCompanies, setFailedCompanies] = useState<string[]>([]);
  const [batchProgress, setBatchProgress] = useState({ completed: 0, failed: 0, current: '' });
  const [showBatchResults, setShowBatchResults] = useState(false);
  const [batchEnrichedCompanies, setBatchEnrichedCompanies] = useState<EnrichedCompany[]>([]);

  const companies = useMemo(() => {
    return batchInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }, [batchInput]);

  const scoreCompany = async (companyInfo: string, tone: OutreachTone = 'casual'): Promise<ProspectScore | null> => {
    const { data, error } = await supabase.functions.invoke<AIScoreResponse>('score-prospect', {
      body: { 
        companyInfo, 
        criteria: criteria.map(c => ({
          id: c.id,
          name: c.name,
          weight: c.weight,
          description: c.description,
        })),
        scoringMode,
        outreachTone: tone,
      },
    });

    if (error || !data) {
      throw new Error(error?.message || 'Failed to score prospect');
    }

    const tierDef = getTierFromScore(data.totalScore);

    return {
      id: crypto.randomUUID(),
      companyName: data.companyName,
      companyDescription: companyInfo,
      totalScore: data.totalScore,
      tier: tierDef.tier,
      tierDefinition: tierDef,
      criteriaBreakdown: data.criteriaBreakdown,
      openingLine: data.openingLine,
      outreach: data.outreach,
      outreachTone: data.outreachTone,
      scoringMode: scoringMode, // Store the mode used
      createdAt: new Date().toISOString(),
    };
  };

  const handleSingleScore = async (tone: OutreachTone) => {
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
      const prospect = await scoreCompany(companyInfo, tone);
      setResult(prospect);
      
      // Calculate rule-based score if enabled and rules exist
      if (settings?.rule_based_enabled && rules.length > 0 && prospect) {
        const ruleScore = evaluateLeadAgainstRules(
          { enrichedData: enrichedData || undefined },
          rules,
          settings.qualification_threshold
        );
        setRuleBasedScore(ruleScore);
      } else {
        setRuleBasedScore(null);
      }
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

  const handleBatchScore = async () => {
    if (companies.length === 0) {
      toast({
        title: 'Input Required',
        description: 'Please enter at least one company.',
        variant: 'destructive',
      });
      return;
    }

    setIsBatchScoring(true);
    setBatchResults([]);
    setFailedCompanies([]);
    setBatchProgress({ completed: 0, failed: 0, current: '' });
    setShowBatchResults(false);

    const results: ProspectScore[] = [];
    const failed: string[] = [];

    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      setBatchProgress(prev => ({ ...prev, current: company }));

      try {
        const prospect = await scoreCompany(company);
        if (prospect) {
          results.push(prospect);
          setBatchProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
        }
      } catch (err) {
        console.error(`Failed to score ${company}:`, err);
        failed.push(company);
        setBatchProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
      }

      // Small delay between requests to avoid rate limiting
      if (i < companies.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setBatchResults(results);
    setFailedCompanies(failed);
    setIsBatchScoring(false);
    setBatchProgress(prev => ({ ...prev, current: '' }));
    setShowBatchResults(true);

    toast({
      title: 'Batch Scoring Complete',
      description: `Scored ${results.length} companies successfully${failed.length > 0 ? `, ${failed.length} failed` : ''}.`,
    });
  };

  const handleSaveSingle = () => {
    if (result) {
      addProspect(result);
      toast({
        title: 'Prospect Saved',
        description: `${result.companyName} has been added to your prospects.`,
      });
    }
  };

  const handleSaveOne = (prospect: ProspectScore) => {
    addProspect(prospect);
    toast({
      title: 'Prospect Saved',
      description: `${prospect.companyName} has been added to your prospects.`,
    });
  };

  const handleSaveAll = () => {
    batchResults.forEach(prospect => addProspect(prospect));
    toast({
      title: 'All Prospects Saved',
      description: `${batchResults.length} companies have been added to your prospects.`,
    });
  };

  const handleResetSingle = () => {
    setCompanyInfo('');
    setResult(null);
    setRuleBasedScore(null);
    setEnrichedData(null);
  };

  // Recalculate rule score when enriched data changes
  useEffect(() => {
    if (enrichedData && settings?.rule_based_enabled && rules.length > 0) {
      const ruleScore = evaluateLeadAgainstRules(
        { enrichedData },
        rules,
        settings.qualification_threshold
      );
      setRuleBasedScore(ruleScore);
    }
  }, [enrichedData, rules, settings]);

  const handleResetBatch = () => {
    setBatchInput('');
    setBatchResults([]);
    setFailedCompanies([]);
    setShowBatchResults(false);
    setBatchEnrichedCompanies([]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Hero section - flowing, no box */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 pt-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-block"
        >
          <span className="section-label">AI-Powered Analysis</span>
        </motion.div>
        <h1 className="text-5xl sm:text-6xl font-bold gradient-text leading-tight">
          Score Prospects
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
          Analyze companies and assign them to tiers based on your ICP criteria.
          Get clear action recommendations for each prospect.
        </p>
      </motion.div>

      {/* Main input card - fluid design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="fluid-card p-8"
      >
        <Tabs defaultValue="single" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto bg-secondary/30 p-1 rounded-xl">
            <TabsTrigger value="single" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <User className="h-4 w-4" />
              Single
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Users className="h-4 w-4" />
              Batch
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-0">
            <SingleScoreInput
              value={companyInfo}
              onChange={setCompanyInfo}
              onScore={handleSingleScore}
              onReset={handleResetSingle}
              isScoring={isScoring}
              hasResult={!!result}
              enrichedData={enrichedData}
              onEnrichedData={setEnrichedData}
            />
          </TabsContent>

          <TabsContent value="batch" className="space-y-0">
            <BatchScoreInput
              value={batchInput}
              onChange={setBatchInput}
              onScore={handleBatchScore}
              onReset={handleResetBatch}
              isScoring={isBatchScoring}
              hasResults={showBatchResults}
              companyCount={companies.length}
              enrichedCompanies={batchEnrichedCompanies}
              onEnrichedCompanies={setBatchEnrichedCompanies}
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Single Mode Results */}
      <AnimatePresence mode="wait">
        {isScoring && <ScoringLoader key="single-loading" />}
        {result && !isScoring && (
          <ScoreResult 
            key="single-result" 
            result={result} 
            ruleBasedScore={ruleBasedScore}
            onSave={handleSaveSingle} 
          />
        )}
      </AnimatePresence>

      {/* Batch Mode Progress & Results */}
      <AnimatePresence mode="wait">
        {isBatchScoring && (
          <BatchProgress
            key="batch-progress"
            total={companies.length}
            completed={batchProgress.completed}
            failed={batchProgress.failed}
            currentCompany={batchProgress.current}
          />
        )}
        
        {showBatchResults && !isBatchScoring && (
          <BatchResults
            key="batch-results"
            results={batchResults}
            failedCompanies={failedCompanies}
            onSaveAll={handleSaveAll}
            onSaveOne={handleSaveOne}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
