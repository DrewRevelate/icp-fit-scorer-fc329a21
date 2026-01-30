import { motion } from 'framer-motion';
import { CriteriaWeightSlider } from '@/components/CriteriaWeightSlider';
import { useICPStore } from '@/stores/icpStore';
import { Button } from '@/components/ui/button';
import { Settings, RotateCcw, CheckCircle } from 'lucide-react';
import { DEFAULT_CRITERIA } from '@/types/icp';
import { toast } from '@/hooks/use-toast';

export default function SetupPage() {
  const { criteria, updateCriteriaWeight, setCriteria } = useICPStore();

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const isValidWeight = totalWeight === 100;

  const handleReset = () => {
    setCriteria(DEFAULT_CRITERIA);
    toast({
      title: 'Criteria Reset',
      description: 'All weights have been restored to defaults.',
    });
  };

  const handleSave = () => {
    if (!isValidWeight) {
      toast({
        title: 'Invalid Configuration',
        description: `Total weight must equal 100%. Current: ${totalWeight}%`,
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Configuration Saved',
      description: 'Your ICP criteria have been updated.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 glow-effect">
            <Settings className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold gradient-text">Configure ICP Criteria</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Adjust the weight of each criterion to match your Ideal Customer Profile. 
          Total weights must equal 100%.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`text-center p-4 rounded-lg border ${
          isValidWeight 
            ? 'bg-success/10 border-success/30 text-success' 
            : 'bg-destructive/10 border-destructive/30 text-destructive'
        }`}
      >
        <span className="font-semibold">Total Weight: {totalWeight}%</span>
        {!isValidWeight && (
          <span className="ml-2 text-sm">
            ({totalWeight < 100 ? `${100 - totalWeight}% remaining` : `${totalWeight - 100}% over`})
          </span>
        )}
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {criteria.map((criterion, index) => (
          <CriteriaWeightSlider
            key={criterion.id}
            criteria={criterion}
            onWeightChange={(weight) => updateCriteriaWeight(criterion.id, weight)}
            index={index}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center gap-4"
      >
        <Button
          variant="outline"
          onClick={handleReset}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        
        <Button
          onClick={handleSave}
          disabled={!isValidWeight}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <CheckCircle className="h-4 w-4" />
          Save Configuration
        </Button>
      </motion.div>
    </div>
  );
}
