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

  if (str.toLowerCase() === 'true' || str.toLowerCase() === '1') {
    return true;
  }

  return false;
};

export const environment = {
  POSTHOG_KEY: requiredStr(import.meta.env.VITE_PUBLIC_POSTHOG_KEY),
  POSTHOG_HOST: requiredStr(import.meta.env.VITE_PUBLIC_POSTHOG_HOST),
  TEST_MULTI_LOADER: parseBool(import.meta.env.VITE_PUBLIC_TEST_MULTI_LOADER),
};
