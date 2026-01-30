import { motion } from 'framer-motion';
import { CriteriaWeightSlider } from '@/components/CriteriaWeightSlider';
import { useICPStore } from '@/stores/icpStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, RotateCcw, CheckCircle, Zap, Scale, Calculator, Brain, Target, Activity, ShieldOff } from 'lucide-react';
import { DEFAULT_CRITERIA, ScoringMode } from '@/types/icp';
import { toast } from '@/hooks/use-toast';
import { RuleBasedSettings } from '@/components/scoring-rules';
import { PredictiveSettings } from '@/components/predictive-scoring';
import { IntentSettings } from '@/components/intent-scoring';
import { EngagementSettings } from '@/components/engagement-scoring';
import { NegativeSettings } from '@/components/negative-scoring';

export default function SetupPage() {
  const { criteria, updateCriteriaWeight, setCriteria, scoringMode, setScoringMode } = useICPStore();

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const isValidWeight = totalWeight === 100;

  const handleReset = () => {
    setCriteria(DEFAULT_CRITERIA);
    toast({
      title: 'Criteria Reset',
      description: 'All weights have been restored to defaults.',
    });
  };

  const handleSave = () => {
    if (!isValidWeight) {
      toast({
        title: 'Invalid Configuration',
        description: `Total weight must equal 100%. Current: ${totalWeight}%`,
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Configuration Saved',
      description: 'Your ICP criteria have been updated.',
    });
  };

  const handleModeChange = (mode: ScoringMode) => {
    setScoringMode(mode);
    toast({
      title: mode === 'advanced' ? 'Advanced Mode Enabled' : 'Standard Mode Enabled',
      description: mode === 'advanced' 
        ? 'Using GTM Partners -5 to +5 discrete scoring framework.' 
        : 'Using standard 0 to 100 weighted scoring.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero section - flowing design */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 pt-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 glow-effect">
            <Settings className="h-6 w-6 text-primary" />
          </div>
        </motion.div>
        <h1 className="text-5xl sm:text-6xl font-bold gradient-text leading-tight">
          Lead Scoring Configuration
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
          Configure AI-powered scoring criteria or set up rule-based lead qualification
        </p>
      </motion.div>

      <Tabs defaultValue="ai-scoring" className="w-full">
        <TabsList className="flex flex-wrap justify-center gap-1 mb-8 bg-transparent p-0">
          <TabsTrigger value="ai-scoring" className="gap-1.5 text-xs px-4 py-2 rounded-xl bg-secondary/30 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">AI</span>
          </TabsTrigger>
          <TabsTrigger value="rule-based" className="gap-1.5 text-xs px-4 py-2 rounded-xl bg-secondary/30 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Rules</span>
          </TabsTrigger>
          <TabsTrigger value="predictive" className="gap-1.5 text-xs px-4 py-2 rounded-xl bg-secondary/30 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Predictive</span>
          </TabsTrigger>
          <TabsTrigger value="intent" className="gap-1.5 text-xs px-4 py-2 rounded-xl bg-secondary/30 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Intent</span>
          </TabsTrigger>
          <TabsTrigger value="engagement" className="gap-1.5 text-xs px-4 py-2 rounded-xl bg-secondary/30 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Engage</span>
          </TabsTrigger>
          <TabsTrigger value="negative" className="gap-1.5 text-xs px-4 py-2 rounded-xl bg-secondary/30 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <ShieldOff className="h-4 w-4" />
            <span className="hidden sm:inline">Negative</span>
          </TabsTrigger>
        </TabsList>

        {/* AI Scoring Tab */}
        <TabsContent value="ai-scoring" className="space-y-6">
          {/* Scoring Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="fluid-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  Scoring Framework
                  {scoringMode === 'advanced' && (
                    <Badge className="bg-primary/20 text-primary border-primary/30">Pro</Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose how criteria are scored during analysis
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleModeChange('standard')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  scoringMode === 'standard'
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-secondary/30 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Scale className={`h-5 w-5 ${scoringMode === 'standard' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-semibold text-foreground">Standard</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  0 to 100 weighted scoring. Each criterion scored from 0 to its weight.
                </p>
              </button>
              
              <button
                onClick={() => handleModeChange('advanced')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  scoringMode === 'advanced'
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-secondary/30 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className={`h-5 w-5 ${scoringMode === 'advanced' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-semibold text-foreground">GTM Partners</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  -5 to +5 discrete scores only. Forces clear fit/no-fit decisions.
                </p>
                <div className="flex gap-1 mt-2">
                  {[-5, -3, -1, 1, 3, 5].map((score) => (
                    <span 
                      key={score}
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        score < 0 ? 'bg-destructive/20 text-destructive' : 'bg-success/20 text-success'
                      }`}
                    >
                      {score > 0 ? '+' : ''}{score}
                    </span>
                  ))}
                </div>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-center p-4 rounded-lg border ${
              isValidWeight 
                ? 'bg-success/10 border-success/30 text-success' 
                : 'bg-destructive/10 border-destructive/30 text-destructive'
            }`}
          >
            <span className="font-semibold">Total Weight: {totalWeight}%</span>
            {!isValidWeight && (
              <span className="ml-2 text-sm">
                ({totalWeight < 100 ? `${100 - totalWeight}% remaining` : `${totalWeight - 100}% over`})
              </span>
            )}
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2">
            {criteria.map((criterion, index) => (
              <CriteriaWeightSlider
                key={criterion.id}
                criteria={criterion}
                onWeightChange={(weight) => updateCriteriaWeight(criterion.id, weight)}
                index={index}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-4"
          >
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!isValidWeight}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <CheckCircle className="h-4 w-4" />
              Save Configuration
            </Button>
          </motion.div>
        </TabsContent>

        {/* Rule-Based Scoring Tab */}
        <TabsContent value="rule-based">
          <RuleBasedSettings />
        </TabsContent>

        {/* Predictive Scoring Tab */}
        <TabsContent value="predictive">
          <PredictiveSettings />
        </TabsContent>

        {/* Intent-Based Scoring Tab */}
        <TabsContent value="intent">
          <IntentSettings />
        </TabsContent>

        {/* Engagement-Based Scoring Tab */}
        <TabsContent value="engagement">
          <EngagementSettings />
        </TabsContent>

        {/* Negative Lead Scoring Tab */}
        <TabsContent value="negative">
          <NegativeSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
