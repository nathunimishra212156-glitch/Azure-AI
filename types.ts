
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export type UserRole = 
  | 'Administration' 
  | 'Senior Data Manager' 
  | 'Junior Data Manager' 
  | 'Contributor' 
  | 'Master Guest' 
  | 'VIP Guest';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  image?: string;
  isStreaming?: boolean;
  groundingLinks?: Array<{ title: string; uri: string }>;
}

export interface Visitor {
  id: string;
  username: string;
  role: UserRole;
  entryTime: number;
}
