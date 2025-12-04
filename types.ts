export interface DiagnosisItem {
  diagnosis: string;
  did: string;
  indicators_point: string[];
  indicators_count: number;
  probability: string;
}

export interface QuestionItem {
  role: string;
  content: string;
  qid: string;
  score: number;
  rank: number;
  status: 'deleted' | null | string;
}

export interface ChatMessage {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
}

export interface AudioMessage {
  type: 'audio';
  speaker: string;
  data: string; // Base64
}

export interface TranscriptMessage {
  type: 'transcript';
  speaker: string;
  text: string;
}

export interface DiagnosisMessage {
  type: 'diagnosis';
  data: DiagnosisItem[];
}

export interface QuestionsMessage {
  type: 'questions';
  data: QuestionItem[];
}

export interface SystemMessage {
  type: 'system';
  message: string;
}

export type WebSocketMessage = 
  | AudioMessage 
  | TranscriptMessage 
  | DiagnosisMessage 
  | QuestionsMessage 
  | SystemMessage;
