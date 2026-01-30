import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScoreGauge } from '@/components/ScoreGauge';
import { CriteriaCard } from '@/components/CriteriaCard';
import { OpeningLineCard } from '@/components/OpeningLineCard';
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
  );
}
