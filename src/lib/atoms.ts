import { atom } from 'jotai';

import type {
  RetirementInputsState,
  RetirementProjection,
} from './retirementUtils';
import {
  computeMonthlyPension,
  getAdjustedLifeExpectancy,
  getSickLeavePenalty,
  normalizeInputs,
  projectContributions,
  roundCurrency,
  roundRatio,
} from './retirementUtils';

export type { Gender, RetirementInputsState } from './retirementUtils';

// Stan wejściowy: dane osobiste i finansowe wymagane przez symulator.
export const retirementInputsAtom = atom<RetirementInputsState>({
  age: 31, // Dla dema: osoba w wieku 31 lat zaczynająca karierę w 2014 r.
  gender: 'female', // Płeć wykorzystywana w tablicach trwania życia i statystykach ZUS.
  grossMonthlySalary: 7200, // Aktualne miesięczne wynagrodzenie brutto (PLN).
  workStartYear: 2014, // Rok rozpoczęcia pracy zawodowej (przyjmujemy styczeń jako miesiąc startowy).
  plannedRetirementYear: 2056, // Rok planowanego zakończenia pracy (domyślne: ustawowy wiek emerytalny).
  zusAccountBalance: 42000, // Aktualny stan środków na koncie i subkoncie w ZUS (wartość fakultatywna).
});

// User gender atom for onboarding
export const userGenderAtom = atom<'man' | 'woman' | null>(null);

// User age atom for onboarding
export const userAgeAtom = atom<number>(30);

// User city atom for onboarding
export const userCityAtom = atom<string>('');

// Salary and work-related atoms for onboarding stage 2
export const currentSalaryGrossAtom = atom<number>(0);
export const workStartYearAtom = atom<number>(2020);
export const retirementYearAtom = atom<number>(2065);

// Example: Jotai + TanStack Query integration
// This creates an atom that automatically manages query state
export const retirementDataAtom = atomWithQuery(() => ({
  queryKey: ['retirement-data'],
  queryFn: async () => {
    // Simulate API call for retirement data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      currentSavings: 50000,
      monthlyContribution: 1000,
      expectedReturn: 0.07,
      projectedValue: 1200000,
    };
  },
}));
// Wewnętrzna projekcja gromadząca kapitał i parametry potrzebne do dalszych obliczeń.
const retirementComputationAtom = atom<RetirementProjection | null>((get) => {
  const inputs = get(retirementInputsAtom);
  const normalized = normalizeInputs(inputs);

  if (!normalized) {
    return null;
  }

  const { contributionsSum, monthlySalaryInFinalYear } =
    projectContributions(normalized);
  const capital = normalized.zusAccountBalance + contributionsSum;
  const sickLeavePenalty = getSickLeavePenalty(normalized.gender);
  const capitalWithSickLeave =
    normalized.zusAccountBalance + contributionsSum * (1 - sickLeavePenalty);
  const lifeExpectancyYears = getAdjustedLifeExpectancy(
    normalized.gender,
    normalized.retirementAge
  );

  if (!Number.isFinite(lifeExpectancyYears) || lifeExpectancyYears <= 0) {
    return null;
  }

  return {
    capital,
    capitalWithSickLeave,
    finalMonthlySalary: monthlySalaryInFinalYear,
    lifeExpectancyYears,
  };
});

// Zgromadzony kapitał emerytalny bez efektu absencji chorobowej (PLN).
export const retirementAccumulatedCapitalAtom = atom((get) => {
  const projection = get(retirementComputationAtom);
  if (!projection) {
    return null;
  }
  return roundCurrency(projection.capital);
});

// Miesięczna emerytura brutto wynikająca z zgromadzonego kapitału.
export const retirementMonthlyPensionAtom = atom((get) => {
  const projection = get(retirementComputationAtom);
  if (!projection) {
    return null;
  }
  const monthlyPension = computeMonthlyPension(
    projection.capital,
    projection.lifeExpectancyYears
  );
  return roundCurrency(monthlyPension);
});

// Relacja emerytury brutto do ostatniego wynagrodzenia brutto w momencie przejścia.
export const retirementPensionReplacementRatioAtom = atom((get) => {
  const projection = get(retirementComputationAtom);
  if (!projection || projection.finalMonthlySalary <= 0) {
    return null;
  }

  const monthlyPension = computeMonthlyPension(
    projection.capital,
    projection.lifeExpectancyYears
  );
  return roundRatio(monthlyPension / projection.finalMonthlySalary);
});

// Miesięczna emerytura z uwzględnieniem obniżki kapitału o statystyczne L4.
export const retirementMonthlyPensionWithSickLeaveAtom = atom((get) => {
  const projection = get(retirementComputationAtom);
  if (!projection) {
    return null;
  }
  const monthlyPension = computeMonthlyPension(
    projection.capitalWithSickLeave,
    projection.lifeExpectancyYears
  );
  return roundCurrency(monthlyPension);
});

// Relacja emerytury (po uwzględnieniu L4) do ostatniej pensji brutto.
export const retirementPensionReplacementRatioWithSickLeaveAtom = atom(
  (get) => {
    const projection = get(retirementComputationAtom);
    if (!projection || projection.finalMonthlySalary <= 0) {
      return null;
    }

    const monthlyPension = computeMonthlyPension(
      projection.capitalWithSickLeave,
      projection.lifeExpectancyYears
    );
    return roundRatio(monthlyPension / projection.finalMonthlySalary);
  }
);
