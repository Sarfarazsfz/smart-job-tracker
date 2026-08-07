import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3001,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
  ai: {
    geminiKey: process.env.GEMINI_API_KEY,
    openAiKey: process.env.OPENAI_API_KEY,
  },
  jobs: {
    adzunaAppId: process.env.ADZUNA_APP_ID,
    adzunaAppKey: process.env.ADZUNA_APP_KEY,
    rapidApiKey: process.env.RAPIDAPI_KEY,
  }
};
