import { z } from 'zod';

export async function validatePostGPTChatCompletionRequest(params: string) {
  return await z.string().min(1).parseAsync(params);
}

export type PostGPTChatCompletionResponse = {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: [
    {
      message: {
        role: string;
        content: string;
      };
      finish_reason: string;
      index: number;
    }
  ];
};
