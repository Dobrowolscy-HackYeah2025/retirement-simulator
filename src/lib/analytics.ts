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

export type AnalyticsEventPayload = {
  age: number;
  gender: string;
  salaryBrutto: number;
  harPeriodsOfIllness: boolean;
  currentSavingsOnAccount: number;
  currentSavingsOnSubaccount: number;
  realRetirement: number;
  realRetirementRealized: number;
  retirementExpected: number;
  postalCode: string;
};

// you can easily change posthog to any other analytics tool
// such as mixpanel or custom backend
export const trackEvent = (event: string, payload: AnalyticsEventPayload) => {
  posthog.capture(event, payload);
};
