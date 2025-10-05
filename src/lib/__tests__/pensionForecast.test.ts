import { createStore } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  inputAgeAtom,
  inputGenderAtom,
  inputGrossMonthlySalaryAtom,
  inputPlannedRetirementYearAtom,
  inputWorkStartYearAtom,
  inputZusAccountBalanceAtom,
  pensionForecastDataAtom,
} from '../atoms';

describe('Pension Forecast Calculations', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  describe('Realistic pension progression', () => {
    it('should show realistic pension progression for different retirement ages', () => {
      // Ustaw stałe wartości
      store.set(inputAgeAtom, 35);
      store.set(inputGenderAtom, 'male');
      store.set(inputGrossMonthlySalaryAtom, 5000);
      store.set(inputWorkStartYearAtom, 2010);
      store.set(inputPlannedRetirementYearAtom, 2055);
      store.set(inputZusAccountBalanceAtom, 150000);

      const forecastData = store.get(pensionForecastDataAtom);

      expect(forecastData).toHaveLength(6); // [60, 62, 64, 65, 67, 70]

      // Sprawdź czy emerytura rośnie z wiekiem (ale nie wykładniczo)
      const pensions = forecastData.map((d) => d.amount);

      // Emerytura powinna rosnąć z wiekiem
      for (let i = 1; i < pensions.length; i++) {
        expect(pensions[i]).toBeGreaterThan(pensions[i - 1]);
      }

      // Sprawdź czy wzrost jest realistyczny (nie więcej niż 80% między 60 a 70)
      const growth60to70 = (pensions[5] - pensions[0]) / pensions[0];
      expect(growth60to70).toBeLessThan(0.8); // Mniej niż 80% wzrostu

      // Sprawdź czy emerytura w wieku 60 nie jest absurdalnie niska
      expect(pensions[0]).toBeGreaterThan(1000); // Powyżej 1k PLN

      // Sprawdź czy emerytura w wieku 70 nie jest absurdalnie wysoka
      expect(pensions[5]).toBeLessThan(15000); // Poniżej 15k PLN

      console.log('Pension progression:');
      forecastData.forEach((data) => {
        console.log(
          `Age ${data.age}: ${data.amount} PLN (real: ${data.realAmount} PLN)`
        );
      });
    });

    it('should show realistic progression for female', () => {
      store.set(inputAgeAtom, 35);
      store.set(inputGenderAtom, 'female');
      store.set(inputGrossMonthlySalaryAtom, 5000);
      store.set(inputWorkStartYearAtom, 2010);
      store.set(inputPlannedRetirementYearAtom, 2055);
      store.set(inputZusAccountBalanceAtom, 150000);

      const forecastData = store.get(pensionForecastDataAtom);
      const pensions = forecastData.map((d) => d.amount);

      // Sprawdź czy wzrost jest realistyczny
      const growth60to70 = (pensions[5] - pensions[0]) / pensions[0];
      expect(growth60to70).toBeLessThan(0.8); // Mniej niż 80% wzrostu

      console.log('Female pension progression:');
      forecastData.forEach((data) => {
        console.log(
          `Age ${data.age}: ${data.amount} PLN (real: ${data.realAmount} PLN)`
        );
      });
    });

    it('should handle edge cases properly', () => {
      // Test z bardzo młodym pracownikiem
      store.set(inputAgeAtom, 25);
      store.set(inputGenderAtom, 'male');
      store.set(inputGrossMonthlySalaryAtom, 3000);
      store.set(inputWorkStartYearAtom, 2020);
      store.set(inputPlannedRetirementYearAtom, 2060);
      store.set(inputZusAccountBalanceAtom, 50000);

      const forecastData = store.get(pensionForecastDataAtom);
      expect(forecastData).toHaveLength(6);

      const pensions = forecastData.map((d) => d.amount);

      // Wszystkie emerytury powinny być dodatnie
      pensions.forEach((pension) => {
        expect(pension).toBeGreaterThan(0);
      });

      // Emerytura powinna rosnąć z wiekiem
      for (let i = 1; i < pensions.length; i++) {
        expect(pensions[i]).toBeGreaterThan(pensions[i - 1]);
      }

      console.log('Young worker pension progression:');
      forecastData.forEach((data) => {
        console.log(
          `Age ${data.age}: ${data.amount} PLN (real: ${data.realAmount} PLN)`
        );
      });
    });
  });
});
