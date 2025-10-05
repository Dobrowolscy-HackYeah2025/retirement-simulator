// Taken from file requirements file
//  - Data użycia
// 	- Godzina użycia
// 	- Emerytura oczekiwana
// 	- Wiek
// 	- Płeć
// 	- Wysokość wynagrodzenia
// 	- Czy uwzględniał okresy choroby
// 	- Wysokość zgromadzonych środków na koncie i Subkoncie
// 	- Emerytura rzeczywista
// 	- Emerytura urealniona • Kod pocztowy
import { posthog } from 'posthog-js';

import { environment } from './environment';

// you can easily change posthog to any other analytics tool
// such as mixpanel or custom backend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trackEvent = (event: string, payload: any) => {
  fetch(`${environment.METRICS_HOST}/api/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Vercel-Protection-Bypass': environment.VERCEL_BYPASS,
    },
    body: JSON.stringify({
      ...payload,
    }),
  }).catch(() => {});

  posthog.capture(event, payload);
};
