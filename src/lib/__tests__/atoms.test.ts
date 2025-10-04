import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'jotai';
import { 
  inputAgeAtom,
  inputGenderAtom,
  inputGrossMonthlySalaryAtom,
  inputWorkStartYearAtom,
  inputPlannedRetirementYearAtom,
  inputZusAccountBalanceAtom,
  retirementComputationAtom,
  retirementMonthlyPensionAtom,
  retirementMonthlyPensionWithSickLeaveAtom,
  selectedScenarioPensionAtom,
  selectedScenarioRealPensionAtom
} from '../atoms';

describe('Retirement Atoms', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  describe('Basic pension calculation', () => {
    it('should calculate consistent pension values', () => {
      // Ustaw stałe wartości
      store.set(inputAgeAtom, 35);
      store.set(inputGenderAtom, 'male');
      store.set(inputGrossMonthlySalaryAtom, 8000);
      store.set(inputWorkStartYearAtom, 2010);
      store.set(inputPlannedRetirementYearAtom, 2055);
      store.set(inputZusAccountBalanceAtom, 150000);

      const computation = store.get(retirementComputationAtom);
      const pensionWithoutSickLeave = store.get(retirementMonthlyPensionAtom);
      const pensionWithSickLeave = store.get(retirementMonthlyPensionWithSickLeaveAtom);

      // Sprawdź czy obliczenia są spójne
      expect(computation).not.toBeNull();
      expect(pensionWithoutSickLeave).not.toBeNull();
      expect(pensionWithSickLeave).not.toBeNull();

      // Sprawdź czy emerytura z L4 jest niższa niż bez L4
      expect(pensionWithSickLeave).toBeLessThan(pensionWithoutSickLeave!);

      // Sprawdź czy różnica jest realistyczna (0.5-5%)
      const difference = pensionWithoutSickLeave! - pensionWithSickLeave!;
      const percentageDifference = (difference / pensionWithoutSickLeave!) * 100;
      
      expect(percentageDifference).toBeGreaterThan(0.5); // Powyżej 0.5%
      expect(percentageDifference).toBeLessThan(5); // Poniżej 5%

      console.log(`Pension without sick leave: ${pensionWithoutSickLeave} PLN`);
      console.log(`Pension with sick leave: ${pensionWithSickLeave} PLN`);
      console.log(`Difference: ${difference.toFixed(0)} PLN (${percentageDifference.toFixed(1)}%)`);
    });

    it('should calculate realistic pension for different scenarios', () => {
      // Scenariusz 1: Młody pracownik
      store.set(inputAgeAtom, 25);
      store.set(inputGenderAtom, 'female');
      store.set(inputGrossMonthlySalaryAtom, 5000);
      store.set(inputWorkStartYearAtom, 2020);
      store.set(inputPlannedRetirementYearAtom, 2060);
      store.set(inputZusAccountBalanceAtom, 50000);

      const youngComputation = store.get(retirementComputationAtom);
      const youngPension = store.get(retirementMonthlyPensionAtom);

      expect(youngComputation).not.toBeNull();
      expect(youngPension).toBeGreaterThan(1000); // Powyżej 1k PLN
      expect(youngPension).toBeLessThan(5000); // Poniżej 5k PLN

      // Scenariusz 2: Starszy pracownik
      store.set(inputAgeAtom, 55);
      store.set(inputGenderAtom, 'male');
      store.set(inputGrossMonthlySalaryAtom, 12000);
      store.set(inputWorkStartYearAtom, 1990);
      store.set(inputPlannedRetirementYearAtom, 2030);
      store.set(inputZusAccountBalanceAtom, 300000);

      const oldComputation = store.get(retirementComputationAtom);
      const oldPension = store.get(retirementMonthlyPensionAtom);

      expect(oldComputation).not.toBeNull();
      expect(oldPension).toBeGreaterThan(3000); // Powyżej 3k PLN
      expect(oldPension).toBeLessThan(8000); // Poniżej 8k PLN

      console.log(`Young worker (25yo): ${youngPension} PLN`);
      console.log(`Old worker (55yo): ${oldPension} PLN`);
    });
  });

  describe('Scenario calculations', () => {
    it('should calculate different scenarios consistently', () => {
      // Ustaw bazowe wartości
      store.set(inputAgeAtom, 35);
      store.set(inputGenderAtom, 'male');
      store.set(inputGrossMonthlySalaryAtom, 8000);
      store.set(inputWorkStartYearAtom, 2010);
      store.set(inputPlannedRetirementYearAtom, 2055);
      store.set(inputZusAccountBalanceAtom, 150000);

      const realisticPension = store.get(selectedScenarioPensionAtom);
      const realPension = store.get(selectedScenarioRealPensionAtom);

      expect(realisticPension).toBeGreaterThan(0);
      expect(realPension).toBeGreaterThan(0);

      // Emerytura realna powinna być niższa niż nominalna
      expect(realPension).toBeLessThan(realisticPension);

      // Różnica powinna być realistyczna (20-50% z powodu inflacji)
      const inflationImpact = ((realisticPension - realPension) / realisticPension) * 100;
      expect(inflationImpact).toBeGreaterThan(10); // Powyżej 10%
      expect(inflationImpact).toBeLessThan(70); // Poniżej 70%

      console.log(`Nominal pension: ${realisticPension} PLN`);
      console.log(`Real pension: ${realPension} PLN`);
      console.log(`Inflation impact: ${inflationImpact.toFixed(1)}%`);
    });
  });

  describe('Edge cases', () => {
    it('should handle missing data gracefully', () => {
      store.set(inputAgeAtom, null);
      store.set(inputGenderAtom, null);
      store.set(inputGrossMonthlySalaryAtom, null);

      const computation = store.get(retirementComputationAtom);
      const pension = store.get(retirementMonthlyPensionAtom);

      expect(computation).toBeNull();
      expect(pension).toBeNull();
    });

    it('should handle extreme values', () => {
      store.set(inputAgeAtom, 18);
      store.set(inputGenderAtom, 'male');
      store.set(inputGrossMonthlySalaryAtom, 100000); // Bardzo wysoka pensja
      store.set(inputWorkStartYearAtom, 2025);
      store.set(inputPlannedRetirementYearAtom, 2070);
      store.set(inputZusAccountBalanceAtom, 0);

      const computation = store.get(retirementComputationAtom);
      const pension = store.get(retirementMonthlyPensionAtom);

      expect(computation).not.toBeNull();
      expect(pension).toBeGreaterThan(0);
      expect(pension).toBeLessThan(200000); // Rozsądny limit
    });
  });
});
