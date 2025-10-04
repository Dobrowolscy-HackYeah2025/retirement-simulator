import { atom } from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';

// Example: Simple counter atom
export const counterAtom = atom(0);

// Example: User preferences atom
export const userPreferencesAtom = atom({
  theme: 'light' as 'light' | 'dark',
  currency: 'USD' as string,
  retirementAge: 65 as number,
});

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

// Example: Dynamic query atom that depends on other atoms
export const portfolioAtom = atomWithQuery((get) => {
  const preferences = get(userPreferencesAtom);

  return {
    queryKey: ['portfolio', preferences.currency],
    queryFn: async () => {
      // Simulate API call that depends on user preferences
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        currency: preferences.currency,
        totalValue: preferences.currency === 'USD' ? 75000 : 68000,
        assets: [
          { name: 'Stocks', value: 45000, percentage: 60 },
          { name: 'Bonds', value: 22500, percentage: 30 },
          { name: 'Cash', value: 7500, percentage: 10 },
        ],
      };
    },
  };
});

// Example: Derived atom for calculations
export const retirementProjectionAtom = atom((get) => {
  const data = get(retirementDataAtom);
  const preferences = get(userPreferencesAtom);

  if (data.isLoading || data.error) {
    return null;
  }

  const yearsToRetirement = preferences.retirementAge - 30; // Assuming current age 30
  const monthlyReturn = data.data!.expectedReturn / 12;
  const totalMonths = yearsToRetirement * 12;

  // Future value calculation
  const futureValue =
    data.data!.currentSavings * Math.pow(1 + monthlyReturn, totalMonths) +
    data.data!.monthlyContribution *
      ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);

  return {
    yearsToRetirement,
    projectedValue: Math.round(futureValue),
    monthlyIncome: Math.round((futureValue * 0.04) / 12), // 4% rule
  };
});
