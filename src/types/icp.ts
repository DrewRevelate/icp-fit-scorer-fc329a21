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

export interface ProspectScore {
  id: string;
  companyName: string;
  companyDescription: string;
  totalScore: number;
  scoreCategory: 'poor' | 'moderate' | 'strong';
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

export function getScoreCategory(score: number): 'poor' | 'moderate' | 'strong' {
  if (score <= 40) return 'poor';
  if (score <= 70) return 'moderate';
  return 'strong';
}

export function getScoreLabel(category: 'poor' | 'moderate' | 'strong'): string {
  switch (category) {
    case 'poor':
      return 'Poor Fit';
    case 'moderate':
      return 'Moderate Fit';
    case 'strong':
      return 'Strong Fit';
  }
}
