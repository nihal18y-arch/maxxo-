
export enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  base64?: string;
  name: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  thinking?: string;
  sources?: GroundingSource[];
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export type ModelType = 'gemini-3-flash-preview' | 'gemini-3-pro-preview';
