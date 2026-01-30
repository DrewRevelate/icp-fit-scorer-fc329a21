import { OutreachTone, TONE_DEFINITIONS } from '@/types/icp';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Smile, Briefcase, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToneSelectorProps {
  value: OutreachTone;
  onChange: (tone: OutreachTone) => void;
  disabled?: boolean;
}

const iconMap = {
  Smile: Smile,
  Briefcase: Briefcase,
  Zap: Zap,
};

export function ToneSelector({ value, onChange, disabled }: ToneSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">Outreach Tone</Label>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as OutreachTone)}
        disabled={disabled}
        className="grid grid-cols-3 gap-3"
      >
        {TONE_DEFINITIONS.map((tone) => {
          const Icon = iconMap[tone.icon as keyof typeof iconMap];
          const isSelected = value === tone.id;
          
          return (
            <Label
              key={tone.id}
              htmlFor={tone.id}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                isSelected 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <RadioGroupItem value={tone.id} id={tone.id} className="sr-only" />
              <Icon className={cn(
                "h-5 w-5",
                isSelected ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-sm font-medium",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {tone.name}
              </span>
              <span className="text-xs text-muted-foreground text-center leading-tight">
                {tone.description}
              </span>
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
