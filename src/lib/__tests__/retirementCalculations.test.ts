import { describe, it, expect } from 'vitest';
import { 
  getSickLeavePenalty, 
  getRealWageGrowthFactor, 
  getContributionRate,
  computeMonthlyPension,
  getAdjustedLifeExpectancy
} from '../retirementUtils';

describe('Retirement Calculations', () => {
  describe('getSickLeavePenalty', () => {
    it('should return realistic penalty for male with 45 years of work', () => {
      const penalty = getSickLeavePenalty('male', 45);
      // Dla mężczyzny: 11.28 dni/252 dni = 4.48% rocznie
      // 4.48% * 19.52% * 1.0 = 0.87% redukcji
      expect(penalty).toBeCloseTo(0.0087, 3);
    });

    it('should return realistic penalty for female with 45 years of work', () => {
      const penalty = getSickLeavePenalty('female', 45);
      // Dla kobiety: 12.33 dni/252 dni = 4.89% rocznie
      // 4.89% * 19.52% * 1.0 = 0.95% redukcji
      expect(penalty).toBeCloseTo(0.0095, 3);
    });

    it('should not exceed 5% penalty', () => {
      const penalty = getSickLeavePenalty('male', 100); // Ekstremalny przypadek
      expect(penalty).toBeLessThanOrEqual(0.05);
    });

    it('should return 0 for 0 years of work', () => {
      const penalty = getSickLeavePenalty('male', 0);
      expect(penalty).toBe(0);
    });
  });

  describe('computeMonthlyPension', () => {
    it('should calculate correct monthly pension', () => {
      const capital = 500000; // 500k PLN
      const lifeExpectancy = 20; // 20 lat
      const pension = computeMonthlyPension(capital, lifeExpectancy);
      // 500000 / (20 * 12) = 2083.33
      expect(pension).toBeCloseTo(2083.33, 2);
    });

    it('should return 0 for invalid life expectancy', () => {
      const pension = computeMonthlyPension(500000, 0);
      expect(pension).toBe(0);
    });
  });

  describe('getAdjustedLifeExpectancy', () => {
    it('should return correct life expectancy for male at 65', () => {
      const expectancy = getAdjustedLifeExpectancy('male', 65);
      expect(expectancy).toBe(17.5); // Bazowa długość życia dla mężczyzn
    });

    it('should adjust for early retirement', () => {
      const expectancy = getAdjustedLifeExpectancy('male', 60);
      // 17.5 - (60 - 65) * 0.3 = 17.5 + 5 * 0.3 = 17.5 + 1.5 = 19
      expect(expectancy).toBe(19);
    });

    it('should adjust for late retirement', () => {
      const expectancy = getAdjustedLifeExpectancy('male', 70);
      // 17.5 - (70 - 65) * 0.3 = 17.5 - 5 * 0.3 = 17.5 - 1.5 = 16
      expect(expectancy).toBe(16);
    });
  });

  describe('Realistic pension calculation example', () => {
    it('should calculate realistic pension for 35-year-old male', () => {
      // Dane wejściowe
      const age = 35;
      const gender = 'male' as const;
      const grossSalary = 8000; // 8k PLN brutto
      const workStartYear = 2010;
      const retirementYear = 2055;
      const zusBalance = 150000; // 150k PLN
      
      // Obliczenia
      const yearsOfWork = retirementYear - workStartYear; // 45 lat
      const sickLeavePenalty = getSickLeavePenalty(gender, yearsOfWork);
      
      // Szacunkowe składki (uproszczone)
      const annualSalary = grossSalary * 12;
      const contributionRate = 0.1952; // 19.52%
      const annualContributions = annualSalary * contributionRate;
      const totalContributions = annualContributions * yearsOfWork;
      
      // Kapitał z uwzględnieniem L4
      const totalCapital = zusBalance + totalContributions;
      const capitalWithSickLeave = totalCapital * (1 - sickLeavePenalty);
      
      // Emerytura
      const retirementAge = retirementYear - (2025 - age); // 65 lat
      const lifeExpectancy = getAdjustedLifeExpectancy(gender, retirementAge);
      const monthlyPension = computeMonthlyPension(capitalWithSickLeave, lifeExpectancy);
      
      // Sprawdź czy emerytura jest realistyczna
      expect(monthlyPension).toBeGreaterThan(2000); // Powyżej 2k PLN
      expect(monthlyPension).toBeLessThan(5000); // Poniżej 5k PLN
      
      // Sprawdź czy kara za L4 jest realistyczna
      expect(sickLeavePenalty).toBeGreaterThan(0.005); // Powyżej 0.5%
      expect(sickLeavePenalty).toBeLessThan(0.05); // Poniżej 5%
      
      console.log(`Test case: ${age}yo male, ${grossSalary}PLN salary, ${yearsOfWork} years work`);
      console.log(`Sick leave penalty: ${(sickLeavePenalty * 100).toFixed(1)}%`);
      console.log(`Monthly pension: ${monthlyPension.toFixed(0)} PLN`);
    });
  });
});
