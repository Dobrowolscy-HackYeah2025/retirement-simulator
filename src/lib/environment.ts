const requiredStr = (str: string) => {
  if (!str) {
    throw new Error('Environment variable is not set');
  }

  return str;
};

export const environment = {
  POSTHOG_KEY: requiredStr(import.meta.env.VITE_PUBLIC_POSTHOG_KEY),
  POSTHOG_HOST: requiredStr(import.meta.env.VITE_PUBLIC_POSTHOG_HOST),
};
