import { ENV } from '@/utils/env';
import { OpenAIStream, OpenAIStreamPayload } from '@/utils/openAIStream';

if (!ENV.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI api key env var');
}

const handler = async (req: Request) => {
  if (req.method === 'POST') {
    const { prompt } = (await req.json()) as { prompt?: string };
    if (!prompt) {
      return new Response('No prompt in the request', { status: 400 });
    }

    const payload: OpenAIStreamPayload = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Request: ${prompt}\nAnswer in the language of the request. Your response must not exceed 350 characters.`,
        },
      ],
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 1000,
      stream: true,
      n: 1,
    };

    const stream = await OpenAIStream(payload);

    return new Response(stream);
  }
};

export default handler;
