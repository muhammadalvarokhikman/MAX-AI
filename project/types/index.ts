// Theme types
export type ThemeType = 'theme-kid' | 'theme-teen' | 'theme-professional';

// Onboarding types
export interface OnboardingData {
  name: string;
  age: number;
  occupation: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

// Document types
export interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'website' | 'text';
  size?: number;
  uploadedAt: Date;
}