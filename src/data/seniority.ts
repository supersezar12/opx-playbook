import type { SeniorityLevel } from '../types';

export const SENIORITY_LEVELS: SeniorityLevel[] = [
  {
    id: 'entry',
    label: 'Entry-Level / Operator',
    tone: 'task adherence, procedure compliance, safety awareness',
  },
  {
    id: 'junior',
    label: 'Junior Management / Supervisor',
    tone: 'team coordination, KPI monitoring, operational problem-solving',
  },
  {
    id: 'senior',
    label: 'Senior Management / Executive',
    tone: 'P&L optimization, strategic risk, stakeholder governance',
  },
];
