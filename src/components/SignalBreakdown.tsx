import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  DollarSign, 
  Cpu, 
  TrendingUp, 
  Globe,
  LucideIcon,
  Plus,
  Minus
} from 'lucide-react';
import { CriteriaScore } from '@/types/icp';

const iconMap: Record<string, LucideIcon> = {
  Users,
  Building2,
  DollarSign,
  Cpu,
  TrendingUp,
  Globe,
};

interface SignalBreakdownProps {
  breakdown: CriteriaScore[];
  totalScore: number;
}

interface SignalRowProps {
  criteria: CriteriaScore;
  index: number;
}

function SignalRow({ criteria, index }: SignalRowProps) {
  const Icon = iconMap[criteria.icon] || Building2;
  const percentage = Math.round((criteria.score / criteria.maxScore) * 100);
  
  // Calculate contribution relative to weight
  // If score equals maxScore, full contribution
  // Below 50% of max is considered negative/poor
  const isStrong = percentage >= 70;
  const isModerate = percentage >= 40 && percentage < 70;
  const isPoor = percentage < 40;
  
  // Show as positive contribution (actual score)
  const contributionValue = criteria.score;
  
  const getContributionColor = () => {
    if (isPoor) return 'text-destructive';
    if (isModerate) return 'text-warning';
    return 'text-success';
  };

  const getContributionBg = () => {
    if (isPoor) return 'bg-destructive/10';
    if (isModerate) return 'bg-warning/10';
    return 'bg-success/10';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
      className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${getContributionBg()}`}>
          <Icon className={`h-4 w-4 ${getContributionColor()}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {criteria.criteriaName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {criteria.reasoning}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {/* Score indicator */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md font-mono text-sm font-semibold ${getContributionBg()} ${getContributionColor()}`}>
          {isPoor ? (
            <Minus className="h-3 w-3" />
          ) : (
            <Plus className="h-3 w-3" />
          )}
          {contributionValue}
        </div>
        
        {/* Max indicator */}
        <span className="text-xs text-muted-foreground">
          / {criteria.maxScore}
        </span>
      </div>
    </motion.div>
  );
}

export function SignalBreakdown({ breakdown, totalScore }: SignalBreakdownProps) {
  // Sort by score percentage (best matches first)
  const sortedBreakdown = [...breakdown].sort((a, b) => {
    const aPercent = a.score / a.maxScore;
    const bPercent = b.score / b.maxScore;
    return bPercent - aPercent;
  });

  const maxPossible = breakdown.reduce((sum, c) => sum + c.maxScore, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Signal Breakdown
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            SCORING RECEIPT
          </span>
        </div>
      </div>
      
      {/* Signals */}
      <div className="px-4 py-2">
        {sortedBreakdown.map((criteria, index) => (
          <SignalRow key={criteria.criteriaId} criteria={criteria} index={index} />
        ))}
      </div>
      
      {/* Total */}
      <div className="px-4 py-3 border-t border-border bg-secondary/50">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-semibold text-foreground">
            Total Score
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold text-primary">
              {totalScore}
            </span>
            <span className="text-sm text-muted-foreground">
              / {maxPossible}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
