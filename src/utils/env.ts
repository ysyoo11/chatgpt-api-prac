const envList = ['OPENAI_API_URL', 'OPENAI_API_KEY'] as const;

export const ENV = {
  OPENAI_API_URL: process.env.OPENAI_API_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
} as { [key in (typeof envList)[number]]: string };

export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';
