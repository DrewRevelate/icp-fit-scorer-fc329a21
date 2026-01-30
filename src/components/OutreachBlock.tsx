import { motion } from 'framer-motion';
import { Mail, MessageSquare, Sparkles, MousePointer, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { OutreachBlock as OutreachBlockType } from '@/types/icp';

interface OutreachBlockProps {
  outreach: OutreachBlockType;
  companyName: string;
  // Legacy fallback
  legacyOpeningLine?: string;
}

export function OutreachBlock({ outreach, companyName, legacyOpeningLine }: OutreachBlockProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAll = async () => {
    const fullEmail = `Subject: ${outreach.subjectLine}

${outreach.openingLine}

${outreach.valueHook}

${outreach.cta}`;
    await navigator.clipboard.writeText(fullEmail);
    setCopiedField('all');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // If no outreach block, fall back to legacy opening line
  if (!outreach && legacyOpeningLine) {
    return (
      <motion.div
        className="glass-card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <div className="border-b border-border/50 bg-primary/5 px-5 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Opening Line</h3>
          </div>
        </div>
        <div className="p-5">
          <p className="text-foreground leading-relaxed italic">"{legacyOpeningLine}"</p>
        </div>
      </motion.div>
    );
  }

  const sections = [
    { 
      id: 'subject', 
      icon: Mail, 
      label: 'Subject Line', 
      content: outreach.subjectLine,
      color: 'text-primary'
    },
    { 
      id: 'opening', 
      icon: MessageSquare, 
      label: 'Opening Hook', 
      content: outreach.openingLine,
      color: 'text-success'
    },
    { 
      id: 'value', 
      icon: Sparkles, 
      label: 'Value Hook', 
      content: outreach.valueHook,
      color: 'text-warning'
    },
    { 
      id: 'cta', 
      icon: MousePointer, 
      label: 'Call to Action', 
      content: outreach.cta,
      color: 'text-primary'
    },
  ];

  return (
    <motion.div
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
    >
      <div className="border-b border-border/50 bg-primary/5 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Outreach Block</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            className="gap-2"
          >
            {copiedField === 'all' ? (
              <>
                <Check className="h-3 w-3" />
                Copied All
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy All
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="divide-y divide-border/30">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="p-4 hover:bg-secondary/20 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`mt-0.5 ${section.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      {section.label}
                    </p>
                    <p className="text-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(section.content, section.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 shrink-0"
                >
                  {copiedField === section.id ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="px-5 py-3 bg-secondary/30 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Personalized for <span className="font-medium text-foreground">{companyName}</span>
        </p>
      </div>
    </motion.div>
  );
}
