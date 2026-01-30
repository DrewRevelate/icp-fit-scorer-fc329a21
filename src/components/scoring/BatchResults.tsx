import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProspectScore, getScoreLabel } from '@/types/icp';
import { Save, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface BatchResultsProps {
  results: ProspectScore[];
  failedCompanies: string[];
  onSaveAll: () => void;
  onSaveOne: (prospect: ProspectScore) => void;
}

export function BatchResults({
  results,
  failedCompanies,
  onSaveAll,
  onSaveOne,
}: BatchResultsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getBadgeClass = (category: ProspectScore['scoreCategory']) => {
    switch (category) {
      case 'poor':
        return 'bg-score-poor/20 text-score-poor border-score-poor/30';
      case 'moderate':
        return 'bg-score-moderate/20 text-score-moderate border-score-moderate/30';
      case 'strong':
        return 'bg-score-strong/20 text-score-strong border-score-strong/30';
    }
  };

  const sortedResults = [...results].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Batch Results</h2>
          <p className="text-sm text-muted-foreground">
            {results.length} scored successfully
            {failedCompanies.length > 0 && `, ${failedCompanies.length} failed`}
          </p>
        </div>
        
        {results.length > 0 && (
          <Button
            onClick={onSaveAll}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            Save All ({results.length})
          </Button>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-2">
        {sortedResults.map((prospect, index) => (
          <motion.div
            key={prospect.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card overflow-hidden"
          >
            <div
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
              onClick={() => setExpandedId(expandedId === prospect.id ? null : prospect.id)}
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-score-strong/20 text-score-strong">
                <CheckCircle2 className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {prospect.companyName}
                </h3>
              </div>

              <Badge className={`${getBadgeClass(prospect.scoreCategory)} border`}>
                {prospect.totalScore} - {getScoreLabel(prospect.scoreCategory)}
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveOne(prospect);
                }}
                className="text-primary hover:text-primary/80"
              >
                <Save className="h-4 w-4" />
              </Button>

              <motion.div
                animate={{ rotate: expandedId === prospect.id ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            </div>

            {expandedId === prospect.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="border-t border-border/50 bg-secondary/20 p-4 space-y-3"
              >
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {prospect.criteriaBreakdown.map((criteria) => (
                    <div
                      key={criteria.criteriaId}
                      className="p-3 rounded-lg bg-secondary/50 border border-border/50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{criteria.criteriaName}</span>
                        <span className="text-sm text-primary">
                          {criteria.score}/{criteria.maxScore}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{criteria.reasoning}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Opening Line:</p>
                  <p className="text-sm italic">"{prospect.openingLine}"</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}

        {/* Failed Companies */}
        {failedCompanies.map((company, index) => (
          <motion.div
            key={`failed-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (results.length + index) * 0.05 }}
            className="flex items-center gap-4 p-4 glass-card opacity-60"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-score-poor/20 text-score-poor">
              <XCircle className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground truncate">{company}</p>
            </div>
            <Badge variant="outline" className="text-score-poor border-score-poor/30">
              Failed
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
