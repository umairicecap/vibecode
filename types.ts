
export interface UserProfile {
  jobStatus: string;
  familySize: string;
  incomeRange: string;
  currentSituation: string;
  futureGoals: string;
  limitations: string;
}

export interface PillarData {
  id: string;
  name: string;
  value: number; // 0 to 100
  color: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  type: 'improvement' | 'caution' | 'focus';
  timestamp: number;
}

export interface AppState {
  pillars: PillarData[];
  productivity: number;
  happinessScore: number;
  profile: UserProfile | null;
  messages: Message[];
  suggestions: Suggestion[];
}
