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

// you can easily change posthog to any other analytics tool
// such as mixpanel or custom backend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trackEvent = (event: string, payload: any) => {
  posthog.capture(event, payload);
};
