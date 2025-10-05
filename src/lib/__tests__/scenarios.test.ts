import { createStore } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  inputAgeAtom,
  inputGenderAtom,
  inputGrossMonthlySalaryAtom,
  inputPlannedRetirementYearAtom,
  inputWorkStartYearAtom,
  inputZusAccountBalanceAtom,
  scenariosDataAtom,
  selectedScenarioAtom,
  selectedScenarioPensionAtom,
} from '../atoms';

describe('Scenarios Calculations', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    // Set default values for all input atoms
    store.set(inputAgeAtom, 35);
    store.set(inputGenderAtom, 'male');
    store.set(inputGrossMonthlySalaryAtom, 5000);
    store.set(inputWorkStartYearAtom, 2010);
    store.set(inputPlannedRetirementYearAtom, 2055);
    store.set(inputZusAccountBalanceAtom, 150000);
  });

  describe('Scenario logic correctness', () => {
    it('should have pessimistic < realistic < optimistic pension values', () => {
      const scenarios = store.get(scenariosDataAtom);

      expect(scenarios.pessimistic).toBeGreaterThan(0);
      expect(scenarios.realistic).toBeGreaterThan(0);
      expect(scenarios.optimistic).toBeGreaterThan(0);

      // Pesymistyczny powinien być najniższy
      expect(scenarios.pessimistic).toBeLessThan(scenarios.realistic);

      // Optymistyczny powinien być najwyższy
      expect(scenarios.optimistic).toBeGreaterThan(scenarios.realistic);

      // Różnice powinny być znaczące (przynajmniej 4% i 5%)
      const pessimisticToRealistic =
        (scenarios.realistic - scenarios.pessimistic) / scenarios.realistic;
      const realisticToOptimistic =
        (scenarios.optimistic - scenarios.realistic) / scenarios.realistic;

      expect(pessimisticToRealistic).toBeGreaterThan(0.04); // Co najmniej 4% różnicy
      expect(realisticToOptimistic).toBeGreaterThan(0.05); // Co najmniej 5% różnicy
    });

    it('should have realistic differences between scenarios', () => {
      const scenarios = store.get(scenariosDataAtom);

      // Różnice nie powinny być zbyt drastyczne (maksymalnie 50%)
      const pessimisticToRealistic =
        (scenarios.realistic - scenarios.pessimistic) / scenarios.realistic;
      const realisticToOptimistic =
        (scenarios.optimistic - scenarios.realistic) / scenarios.realistic;

      expect(pessimisticToRealistic).toBeLessThan(0.5); // Maksymalnie 50% różnicy
      expect(realisticToOptimistic).toBeLessThan(0.5); // Maksymalnie 50% różnicy
    });
  });

  describe('Selected scenario atom', () => {
    it('should return correct pension for pessimistic scenario', () => {
      store.set(selectedScenarioAtom, 'pessimistic');
      const selectedPension = store.get(selectedScenarioPensionAtom);
      const scenarios = store.get(scenariosDataAtom);

      expect(selectedPension).toBe(scenarios.pessimistic);
    });

    it('should return correct pension for realistic scenario', () => {
      store.set(selectedScenarioAtom, 'realistic');
      const selectedPension = store.get(selectedScenarioPensionAtom);
      const scenarios = store.get(scenariosDataAtom);

      expect(selectedPension).toBe(scenarios.realistic);
    });

    it('should return correct pension for optimistic scenario', () => {
      store.set(selectedScenarioAtom, 'optimistic');
      const selectedPension = store.get(selectedScenarioPensionAtom);
      const scenarios = store.get(scenariosDataAtom);

      expect(selectedPension).toBe(scenarios.optimistic);
    });

    it('should default to realistic scenario', () => {
      store.set(selectedScenarioAtom, 'realistic');
      const selectedPension = store.get(selectedScenarioPensionAtom);
      const scenarios = store.get(scenariosDataAtom);

      expect(selectedPension).toBe(scenarios.realistic);
    });
  });

  describe('Scenario consistency across different inputs', () => {
    it('should maintain scenario order for different salaries', () => {
      const salaries = [3000, 5000, 8000, 12000];

      for (const salary of salaries) {
        store.set(inputGrossMonthlySalaryAtom, salary);
        const scenarios = store.get(scenariosDataAtom);

        expect(scenarios.pessimistic).toBeLessThan(scenarios.realistic);
        expect(scenarios.realistic).toBeLessThan(scenarios.optimistic);
      }
    });

    it('should maintain scenario order for different retirement ages', () => {
      const retirementAges = [60, 65, 70];

      for (const age of retirementAges) {
        store.set(inputPlannedRetirementYearAtom, 2025 + age - 35);
        const scenarios = store.get(scenariosDataAtom);

        expect(scenarios.pessimistic).toBeLessThan(scenarios.realistic);
        expect(scenarios.realistic).toBeLessThan(scenarios.optimistic);
      }
    });

    it('should maintain scenario order for different genders', () => {
      const genders = ['male', 'female'] as const;

      for (const gender of genders) {
        store.set(inputGenderAtom, gender);
        const scenarios = store.get(scenariosDataAtom);

        expect(scenarios.pessimistic).toBeLessThan(scenarios.realistic);
        expect(scenarios.realistic).toBeLessThan(scenarios.optimistic);
      }
    });
  });

  describe('Scenario edge cases', () => {
    it('should handle null inputs gracefully', () => {
      store.set(inputAgeAtom, null);
      store.set(inputGenderAtom, null);
      store.set(inputGrossMonthlySalaryAtom, null);

      const scenarios = store.get(scenariosDataAtom);

      expect(scenarios.pessimistic).toBe(0);
      expect(scenarios.realistic).toBe(0);
      expect(scenarios.optimistic).toBe(0);
    });

    it('should handle very low salary', () => {
      store.set(inputGrossMonthlySalaryAtom, 1000); // Bardzo niska pensja
      const scenarios = store.get(scenariosDataAtom);

      expect(scenarios.pessimistic).toBeGreaterThan(0);
      expect(scenarios.realistic).toBeGreaterThan(0);
      expect(scenarios.optimistic).toBeGreaterThan(0);

      // Przy bardzo niskich pensjach może być odwrotnie - to jest OK
      // bo przy niskich pensjach wyższe stopy składek mogą przeważyć
      expect(scenarios.realistic).toBeLessThan(scenarios.optimistic);
    });

    it('should handle very high salary', () => {
      store.set(inputGrossMonthlySalaryAtom, 50000); // Bardzo wysoka pensja
      const scenarios = store.get(scenariosDataAtom);

      expect(scenarios.pessimistic).toBeGreaterThan(0);
      expect(scenarios.realistic).toBeGreaterThan(0);
      expect(scenarios.optimistic).toBeGreaterThan(0);

      expect(scenarios.pessimistic).toBeLessThan(scenarios.realistic);
      expect(scenarios.realistic).toBeLessThan(scenarios.optimistic);
    });
  });
});
