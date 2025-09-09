export interface GenerationParameters {
  Format?: string;
  Scale?: string;
  Length?: string;
  'Video Style'?: string;
  Background?: string;
}

export interface GenerationResult {
  type: 'image' | 'video';
  content: string;
  format: string;
  parameters: GenerationParameters;
  prompt: string;
  duration?: number;
  taskId?: string;
}