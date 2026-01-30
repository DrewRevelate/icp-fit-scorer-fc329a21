import { motion } from 'framer-motion';
import { EnrichedCompany } from '@/types/icp';
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Cpu, 
  Globe, 
  Link,
  Sparkles,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EnrichedDataCardProps {
  data: EnrichedCompany;
}

export function EnrichedDataCard({ data }: EnrichedDataCardProps) {
  const fields = [
    { icon: Building2, label: 'Industry', value: data.industry },
    { icon: Users, label: 'Company Size', value: data.companySize },
    { icon: DollarSign, label: 'Est. Revenue', value: data.estimatedRevenue },
    { icon: TrendingUp, label: 'Funding Stage', value: data.fundingStage },
    { icon: Globe, label: 'Region', value: data.region },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-success/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-success/20">
              <Check className="h-3.5 w-3.5 text-success" />
            </div>
            <span className="text-sm font-medium text-success">Auto-Enriched</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link className="h-3 w-3" />
            <a 
              href={data.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary truncate max-w-[200px]"
            >
              {data.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">
            {data.companyName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {data.description}
          </p>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {fields.map((field) => (
            <div 
              key={field.label}
              className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30"
            >
              <field.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p className="text-sm font-medium text-foreground truncate">
                  {field.value || 'Unknown'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        {data.techStack && data.techStack.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Tech Stack</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.techStack.slice(0, 8).map((tech) => (
                <Badge 
                  key={tech} 
                  variant="secondary"
                  className="text-xs bg-primary/10 text-primary border-primary/20"
                >
                  {tech}
                </Badge>
              ))}
              {data.techStack.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{data.techStack.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer with Data Sources */}
      <div className="px-4 py-2 border-t border-border/50 bg-secondary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>Waterfall enrichment</span>
          </div>
          {data.dataSources && data.dataSources.length > 0 && (
            <div className="flex items-center gap-1">
              {data.dataSources.map((source) => (
                <Badge 
                  key={source} 
                  variant="outline" 
                  className="text-[10px] px-1.5 py-0 h-5 bg-background"
                >
                  {source}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
