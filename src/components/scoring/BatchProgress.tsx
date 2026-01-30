import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface BatchProgressProps {
  total: number;
  completed: number;
  failed: number;
  currentCompany: string;
}

export function BatchProgress({
  total,
  completed,
  failed,
  currentCompany,
}: BatchProgressProps) {
  const progress = Math.round(((completed + failed) / total) * 100);
  const successful = completed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Batch Progress</h3>
        <span className="text-sm text-muted-foreground">
          {completed + failed} / {total}
        </span>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-score-strong">
          <CheckCircle2 className="h-4 w-4" />
          <span>{successful} scored</span>
        </div>
        {failed > 0 && (
          <div className="flex items-center gap-2 text-score-poor">
            <XCircle className="h-4 w-4" />
            <span>{failed} failed</span>
          </div>
        )}
      </div>

      {currentCompany && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="truncate">Analyzing: {currentCompany}</span>
        </div>
      )}
    </motion.div>
  );
}
