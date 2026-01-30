import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProspectScore, getScoreLabel } from '@/types/icp';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CriteriaCard } from './CriteriaCard';

interface ProspectRowProps {
  prospect: ProspectScore;
  onDelete: (id: string) => void;
  isComparing?: boolean;
  onToggleCompare?: () => void;
}

export function ProspectRow({ 
  prospect, 
  onDelete, 
  isComparing,
  onToggleCompare 
}: ProspectRowProps) {
  const [expanded, setExpanded] = useState(false);

  const getBadgeVariant = () => {
    switch (prospect.scoreCategory) {
      case 'poor':
        return 'destructive';
      case 'moderate':
        return 'secondary';
      case 'strong':
        return 'default';
    }
  };

  const getBadgeClass = () => {
    switch (prospect.scoreCategory) {
      case 'poor':
        return 'bg-score-poor/20 text-score-poor border-score-poor/30';
      case 'moderate':
        return 'bg-score-moderate/20 text-score-moderate border-score-moderate/30';
      case 'strong':
        return 'bg-score-strong/20 text-score-strong border-score-strong/30';
    }
  };

  return (
    <motion.div
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div 
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {onToggleCompare && (
          <input
            type="checkbox"
            checked={isComparing}
            onChange={(e) => {
              e.stopPropagation();
              onToggleCompare();
            }}
            className="h-4 w-4 rounded border-border bg-secondary accent-primary"
          />
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {prospect.companyName}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {prospect.companyDescription.slice(0, 80)}...
          </p>
        </div>

        <Badge className={`${getBadgeClass()} border`}>
          {prospect.totalScore} - {getScoreLabel(prospect.scoreCategory)}
        </Badge>

        <span className="text-xs text-muted-foreground hidden sm:block">
          {new Date(prospect.createdAt).toLocaleDateString()}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(prospect.id);
          }}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-border/50 bg-secondary/20 p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {prospect.criteriaBreakdown.map((criteria, index) => (
              <CriteriaCard key={criteria.criteriaId} criteria={criteria} index={index} />
            ))}
          </div>
          
          <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Opening Line:</p>
            <p className="text-foreground italic">"{prospect.openingLine}"</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
