export interface ICPCriteria {
  id: string;
  name: string;
  weight: number;
  icon: string;
  description: string;
}

export interface CriteriaScore {
  criteriaId: string;
  criteriaName: string;
  score: number;
  maxScore: number;
  weight: number;
  reasoning: string;
  icon: string;
}

export type Tier = 'A' | 'B' | 'C' | 'D';

export interface TierDefinition {
  tier: Tier;
  label: string;
  action: string;
  description: string;
  minScore: number;
  maxScore: number;
}

export const TIER_DEFINITIONS: TierDefinition[] = [
  {
    tier: 'A',
    label: 'Tier A',
    action: 'Pursue Aggressively',
    description: 'Ideal customer profile match. Prioritize for immediate outreach with personalized approach.',
    minScore: 80,
    maxScore: 100,
  },
  {
    tier: 'B',
    label: 'Tier B',
    action: 'Nurture & Qualify',
    description: 'Strong potential fit. Engage with targeted content and qualify further before aggressive pursuit.',
    minScore: 60,
    maxScore: 79,
  },
  {
    tier: 'C',
    label: 'Tier C',
    action: 'Deprioritize',
    description: 'Partial fit with gaps. Add to nurture campaigns but focus resources on higher-tier prospects.',
    minScore: 40,
    maxScore: 59,
  },
  {
    tier: 'D',
    label: 'Tier D',
    action: 'Disqualify',
    description: 'Poor fit for current ICP. Do not pursue—archive or revisit if criteria change.',
    minScore: 0,
    maxScore: 39,
  },
];

export interface ProspectScore {
  id: string;
  companyName: string;
  companyDescription: string;
  totalScore: number;
  tier: Tier;
  tierDefinition: TierDefinition;
  criteriaBreakdown: CriteriaScore[];
  openingLine: string;
  createdAt: string;
}

export interface ICPConfig {
  criteria: ICPCriteria[];
}

export const DEFAULT_CRITERIA: ICPCriteria[] = [
  {
    id: 'company-size',
    name: 'Company Size',
    weight: 20,
    icon: 'Users',
    description: 'Number of employees (50-500 ideal)',
  },
  {
    id: 'industry',
    name: 'Industry',
    weight: 20,
    icon: 'Building2',
    description: 'SaaS, Tech, or B2B Services',
  },
  {
    id: 'revenue',
    name: 'Revenue',
    weight: 20,
    icon: 'DollarSign',
    description: 'Annual revenue $5M-$100M',
  },
  {
    id: 'tech-stack',
    name: 'Tech Stack',
    weight: 15,
    icon: 'Cpu',
    description: 'Modern tech stack alignment',
  },
  {
    id: 'funding-stage',
    name: 'Funding Stage',
    weight: 15,
    icon: 'TrendingUp',
    description: 'Series A to Series C',
  },
  {
    id: 'region',
    name: 'Region',
    weight: 10,
    icon: 'Globe',
    description: 'North America or Europe',
  },
];

export function getTierFromScore(score: number): TierDefinition {
  const tier = TIER_DEFINITIONS.find(
    (t) => score >= t.minScore && score <= t.maxScore
  );
  return tier || TIER_DEFINITIONS[TIER_DEFINITIONS.length - 1];
}

// Legacy compatibility
export type ScoreCategory = 'poor' | 'moderate' | 'strong';

export function getScoreCategory(score: number): ScoreCategory {
  if (score <= 40) return 'poor';
  if (score <= 70) return 'moderate';
  return 'strong';
}

export function getScoreLabel(category: ScoreCategory): string {
  switch (category) {
    case 'poor':
      return 'Poor Fit';
    case 'moderate':
      return 'Moderate Fit';
    case 'strong':
      return 'Strong Fit';
  }
}

// Enriched company data from URL scraping
export interface EnrichedCompany {
  companyName: string;
  description: string;
  industry: string;
  companySize: string;
  estimatedRevenue: string;
  fundingStage: string;
  techStack: string[];
  region: string;
  website: string;
  rawContent: string;
}
