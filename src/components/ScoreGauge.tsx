import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getScoreCategory, getScoreLabel } from '@/types/icp';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  animate?: boolean;
}

export function ScoreGauge({ score, size = 280, animate = true }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const category = getScoreCategory(score);
  const label = getScoreLabel(category);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 100) * circumference;
  const offset = circumference - progress;

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }

    const duration = 1500;
    const startTime = Date.now();
    const startScore = 0;

    const animateScore = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startScore + (score - startScore) * eased);
      
      setDisplayScore(current);
      
      if (progress < 1) {
        requestAnimationFrame(animateScore);
      }
    };

    requestAnimationFrame(animateScore);
  }, [score, animate]);

  const getStrokeColor = () => {
    switch (category) {
      case 'poor':
        return 'hsl(var(--score-poor))';
      case 'moderate':
        return 'hsl(var(--score-moderate))';
      case 'strong':
        return 'hsl(var(--score-strong))';
    }
  };

  const getGlowColor = () => {
    switch (category) {
      case 'poor':
        return 'hsl(var(--score-poor) / 0.3)';
      case 'moderate':
        return 'hsl(var(--score-moderate) / 0.3)';
      case 'strong':
        return 'hsl(var(--score-strong) / 0.3)';
    }
  };

  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{
          filter: `drop-shadow(0 0 24px ${getGlowColor()})`,
        }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          className="opacity-50"
        />
        
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display text-6xl font-bold tabular-nums"
          style={{ color: getStrokeColor() }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {displayScore}
        </motion.span>
        <motion.span
          className="text-base font-medium text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {label}
        </motion.span>
      </div>
    </motion.div>
  );
}
