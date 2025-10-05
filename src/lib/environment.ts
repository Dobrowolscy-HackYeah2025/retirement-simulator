const requiredStr = (str: string) => {
  if (!str) {
    throw new Error('Environment variable is not set');
  }

  return str;
};

const parseBool = (str: string, required: boolean = false) => {
  if (required && !str) {
    throw new Error('Environment variable is not set');
  }

  if (!required && !str) {
    return false;
  }

  if (str.toLowerCase() === 'true' || str.toLowerCase() === '1') {
    return true;
  }

  return false;
};

export const environment = {
  POSTHOG_KEY: requiredStr(import.meta.env.VITE_PUBLIC_POSTHOG_KEY),
  POSTHOG_HOST: requiredStr(import.meta.env.VITE_PUBLIC_POSTHOG_HOST),
  TEST_MULTI_LOADER: parseBool(import.meta.env.VITE_PUBLIC_TEST_MULTI_LOADER),
  DEV_MODE: parseBool(import.meta.env.VITE_PUBLIC_DEV_MODE),
  METRICS_HOST: requiredStr(import.meta.env.VITE_PUBLIC_METRICS_HOST),
  VERCEL_BYPASS: requiredStr(import.meta.env.VITE_PUBLIC_VERCEL_BYPASS),
  SHOW_AI_SUMMARY: parseBool(import.meta.env.VITE_PUBLIC_SHOW_AI_SUMMARY),
};
