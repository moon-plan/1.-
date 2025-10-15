
export enum AppState {
  INITIAL = 'INITIAL',
  CHATTING = 'CHATTING',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  ERROR = 'ERROR',
}

export interface Message {
  role: 'model' | 'user';
  text: string;
}

export interface Answer {
  question: string;
  answer: string;
}
