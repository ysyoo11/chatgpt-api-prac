import { ArrowRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import debounce from 'lodash.debounce';
import { useCallback, useMemo, useState } from 'react';

import { fetcher } from '@/lib/fetcher';
import { validatePostGPTChatCompletionRequest } from '@/types/lib/api/gpt/chat';

export default function IndexPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const debouncedSetPrompt = useMemo(
    () => debounce((text: string) => setPrompt(text), 200),
    []
  );

  const generateResponse = useCallback(async () => {
    try {
      const validatedPrompt = await validatePostGPTChatCompletionRequest(
        prompt
      );
      setResult('');
      setLoading(true);
      const response = await fetcher.post('/api/gpt/chat', {
        body: JSON.stringify({ prompt: validatedPrompt }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = response.body as ReadableStream;
      const reader = data.getReader();
      const decoder = new TextDecoder();

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setResult((prev) => prev + chunkValue);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  return (
    <section className='mx-auto h-full min-h-screen w-full max-w-2xl flex-col justify-center py-12 px-4'>
      <div className='flex h-full w-full flex-col items-center justify-center'>
        <div className='w-full'>
          <h1 className='text-center text-6xl font-bold'>
            Yeonsuk&apos;s GPT App
          </h1>
          <p className='mt-6 text-center text-xl'>Ask whatever you want.</p>
          <div className='w-full space-y-1'>
            <textarea
              className='mt-6 w-full resize-none rounded-lg border-2 border-gray-300 p-3 focus:outline-black'
              placeholder='e.g., What is GPT?'
              rows={5}
              onChange={(e) => debouncedSetPrompt(e.target.value)}
            />
            <button
              disabled={loading || prompt.length === 0}
              className='group flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-900 py-2 px-4 text-lg font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-300'
              onClick={generateResponse}
            >
              <span>{loading ? '...' : 'Generate Response'}</span>
              {!loading && (
                <ArrowRightIcon className='h-4 w-4 stroke-2 transition-transform group-hover:translate-x-1' />
              )}
            </button>
          </div>
        </div>
        {result.length > 0 && (
          <div className='mt-8 min-h-[10rem] w-full rounded-lg border-2 border-black p-3'>
            {result}
            <span
              className={clsx(
                'ml-0.5 inline-block h-4 w-1.5 translate-y-[1px] bg-black',
                {
                  'animate-cursor-blink': !loading,
                  'opacity-60': loading,
                }
              )}
            />
          </div>
          // <textarea
          //   className='mt-8 max-h-full min-h-[10rem] w-full rounded-lg border-2 border-black p-3 outline-none'
          //   value={result ?? ''}
          // />
        )}
      </div>
    </section>
  );
}
