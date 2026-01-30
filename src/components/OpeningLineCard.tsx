import { motion } from 'framer-motion';
import { MessageSquare, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface OpeningLineCardProps {
  line: string;
  companyName: string;
}

export function OpeningLineCard({ line, companyName }: OpeningLineCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(line);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <h3 className="font-semibold text-foreground">Personalized Opening Line</h3>
        </div>
      </div>
      
      <div className="p-5">
        <p className="text-foreground leading-relaxed italic">
          "{line}"
        </p>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Tailored for {companyName}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
