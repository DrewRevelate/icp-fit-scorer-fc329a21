import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScoreGauge } from '@/components/ScoreGauge';
import { SignalBreakdown } from '@/components/SignalBreakdown';
import { OutreachBlock } from '@/components/OutreachBlock';
import { ProspectScore } from '@/types/icp';
import { Save } from 'lucide-react';

interface ScoreResultProps {
  result: ProspectScore;
  onSave: () => void;
}

export function ScoreResult({ result, onSave }: ScoreResultProps) {
  return (
    <motion.div
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
            onClick={onSave}
            size="lg"
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Save className="h-5 w-5" />
            Save to Prospects
          </Button>
        </motion.div>
      </div>

      {/* Signal Breakdown - Receipt Style */}
      <SignalBreakdown 
        breakdown={result.criteriaBreakdown} 
        totalScore={result.totalScore}
        scoringMode={result.scoringMode}
      />

      {/* Full Outreach Block */}
      <OutreachBlock 
        outreach={result.outreach || {
          subjectLine: "Quick question",
          openingLine: result.openingLine,
          valueHook: "I believe there's an opportunity here.",
          cta: "Would a quick call work?"
        }} 
        companyName={result.companyName}
        legacyOpeningLine={result.openingLine}
      />
    </motion.div>
  );
}
