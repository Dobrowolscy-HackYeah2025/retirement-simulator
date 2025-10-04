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

// Import danych z plików JSON
import parametryData from './data/parametry_III_2025_all_sheets.json';
import absencjaChorobowaData from './data/absencja_chorobowa_all_sheets.json';
import opoznienieData from './data/opoznienie_przejscia_all_sheets.json';

export type { RetirementInputsState, Gender } from './retirementUtils';

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

// Wewnętrzna projekcja gromadząca kapitał i parametry potrzebne do dalszych obliczeń.
const retirementComputationAtom = atom<RetirementProjection | null>((get) => {
  const inputs = get(retirementInputsAtom);
  const normalized = normalizeInputs(inputs);

  if (!normalized) {
    return null;
  }

  const { contributionsSum, monthlySalaryInFinalYear } =
    projectContributions(normalized);
  
  if (!Number.isFinite(contributionsSum)) {
    return null;
  }
  
  const capital = normalized.zusAccountBalance + contributionsSum;
  const sickLeavePenalty = getSickLeavePenalty(normalized.gender);
  const capitalWithSickLeave =
    normalized.zusAccountBalance + contributionsSum * (1 - sickLeavePenalty);
  const lifeExpectancyYears = getAdjustedLifeExpectancy(
    normalized.gender,
    normalized.retirementAge
  );

  if (!Number.isFinite(lifeExpectancyYears) || lifeExpectancyYears <= 0) {
    console.log('retirementComputationAtom: invalid lifeExpectancyYears', lifeExpectancyYears);
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

// ===== DERIVED ATOMY DLA WYKRESÓW =====

// Typy dla danych wykresów
export interface PensionForecastData {
  age: number;
  amount: number; // emerytura nominalna
  realAmount: number; // emerytura realna (z uwzględnieniem inflacji)
}

export interface RegionalBenchmarkData {
  region: string;
  average: number;
  user: number;
}

export interface ContributionHistoryData {
  year: number;
  contributions: number;
  capital: number;
}

export interface SickLeaveImpactData {
  withSickLeave: number;
  withoutSickLeave: number;
}

export interface ScenariosData {
  pessimistic: number;
  realistic: number;
  optimistic: number;
}

// 1. Prognoza emerytury vs wiek przejścia - NIEZALEŻNA od slidera retirementAge
export const pensionForecastDataAtom = atom<PensionForecastData[]>((get) => {
  const inputs = get(retirementInputsAtom);
  
  if (!inputs.age || !inputs.gender || !inputs.grossMonthlySalary) return [];

  const ages = [60, 62, 64, 65, 67, 70];
  const currentAge = inputs.age;
  const currentYear = new Date().getFullYear();
  
  // Oblicz bazowy kapitał na podstawie aktualnych danych (bez uwzględniania plannedRetirementYear)
  const baseRetirementYear = currentYear + (65 - currentAge); // Użyj 65 jako bazowy wiek
  
  // Stwórz tymczasowe inputs dla obliczenia bazowego kapitału
  const baseInputs = {
    ...inputs,
    plannedRetirementYear: baseRetirementYear
  };
  
  const normalized = normalizeInputs(baseInputs);
  if (!normalized) return [];
  
  const { contributionsSum } = projectContributions(normalized);
  const baseCapital = normalized.zusAccountBalance + contributionsSum;
  
  return ages.map(age => {
    const yearsToRetirement = age - currentAge;
    
    // Użyj danych z parametry_III_2025_all_sheets.json dla inflacji
    const yearIndex = currentYear - 2014;
    const parametry = parametryData['parametry roczne'].rows[yearIndex];
    const inflationIndex = parametry?.['średnioroczny wskaźnik cen towarów i usług konsumpcyjnych ogółem*)'] || 1.025;
    const inflationRate = inflationIndex - 1;
    
    // Skorygowany kapitał - dla wcześniejszego przejścia mniejszy, dla późniejszego większy
    const wageGrowthRate = 0.035; // 3.5% roczny wzrost płac
    const adjustedCapital = baseCapital * Math.pow(1 + wageGrowthRate, yearsToRetirement);
    
    const adjustedLifeExpectancy = getAdjustedLifeExpectancy(inputs.gender, age);
    const nominalPension = computeMonthlyPension(adjustedCapital, adjustedLifeExpectancy);
    
    // Emerytura realna (z uwzględnieniem inflacji)
    const realPension = nominalPension * Math.pow(1 - inflationRate, Math.abs(yearsToRetirement));
    
    return {
      age,
      amount: roundCurrency(nominalPension),
      realAmount: roundCurrency(realPension)
    };
  });
});

// 2. Stopa zastąpienia (już istnieje jako retirementPensionReplacementRatioAtom)
export const replacementRateAtom = atom((get) => {
  const ratio = get(retirementPensionReplacementRatioAtom);
  return ratio ? Math.round(ratio * 100) : 0;
});

// 3. Wpływ absencji chorobowych
export const sickLeaveImpactAtom = atom<SickLeaveImpactData>((get) => {
  const withSickLeave = get(retirementMonthlyPensionWithSickLeaveAtom) || 0;
  const withoutSickLeave = get(retirementMonthlyPensionAtom) || 0;
  
  return {
    withSickLeave: roundCurrency(withSickLeave),
    withoutSickLeave: roundCurrency(withoutSickLeave)
  };
});

// 4. Historia składek + kapitał narastający
export const contributionHistoryAtom = atom<ContributionHistoryData[]>((get) => {
  const inputs = get(retirementInputsAtom);
  const projection = get(retirementComputationAtom);
  
  if (!projection || !inputs.workStartYear || !inputs.plannedRetirementYear) return [];

  const years: ContributionHistoryData[] = [];
  const currentYear = new Date().getFullYear();
  
  // Generuj dane dla ostatnich 5 lat
  for (let i = 4; i >= 0; i--) {
    const year = currentYear - i;
    const yearIndex = year - 2014; // Indeks w danych parametrów
    
    if (yearIndex >= 0 && yearIndex < parametryData['parametry roczne'].rows.length) {
      const parametry = parametryData['parametry roczne'].rows[yearIndex];
      const monthlySalary = parametry?.['przeciętne miesięczne wynagrodzenie w gospodarce narodowej**)'];
      const contributionRate = (parametry?.['stopa składki na ubezpieczenie emerytalne finansowanej przez pracownika'] || 0) + 
                              (parametry?.['stopa składki na ubezpieczenie emerytalne finansowanej przez pracodawcę'] || 0);
      
      if (monthlySalary && contributionRate) {
        const annualContributions = monthlySalary * 12 * contributionRate;
        const accumulatedCapital = projection.capital * (year - (inputs.workStartYear || 2014)) / ((inputs.plannedRetirementYear || 65) - (inputs.workStartYear || 2014));
        
        years.push({
          year,
          contributions: roundCurrency(annualContributions),
          capital: roundCurrency(accumulatedCapital)
        });
      }
    }
  }
  
  return years;
});

// 5. Scenariusze "co-jeśli"
export const scenariosDataAtom = atom<ScenariosData>((get) => {
  const inputs = get(retirementInputsAtom);
  const projection = get(retirementComputationAtom);
  
  if (!projection) return { pessimistic: 0, realistic: 0, optimistic: 0 };

  const basePension = computeMonthlyPension(projection.capital, projection.lifeExpectancyYears);
  
  // Użyj danych z parametry_III_2025_all_sheets.json dla różnych wariantów
  
  // Wariant 1 (realistyczny): inflacja 2.5%, wzrost płac 3.5%
  // Wariant 2 (pesymistyczny): inflacja 3.5%, wzrost płac 4.5%
  // Wariant 3 (optymistyczny): inflacja 4.5%, wzrost płac 5.5%
  
  const inflationRate1 = 0.025; // Wariant 1
  const inflationRate2 = 0.035; // Wariant 2
  const inflationRate3 = 0.045; // Wariant 3
  
  const wageGrowthRate1 = 0.035; // Wariant 1
  const wageGrowthRate2 = 0.045; // Wariant 2
  const wageGrowthRate3 = 0.055; // Wariant 3
  
  // Oblicz emerytury dla różnych wariantów
  const currentYear = new Date().getFullYear();
  const yearsToRetirement = (inputs.plannedRetirementYear || currentYear + 34) - currentYear;
  
  const pessimisticPension = basePension * Math.pow(1 + wageGrowthRate2, yearsToRetirement) * Math.pow(1 - inflationRate2, yearsToRetirement);
  const realisticPension = basePension * Math.pow(1 + wageGrowthRate1, yearsToRetirement) * Math.pow(1 - inflationRate1, yearsToRetirement);
  const optimisticPension = basePension * Math.pow(1 + wageGrowthRate3, yearsToRetirement) * Math.pow(1 - inflationRate3, yearsToRetirement);
  
  return {
    pessimistic: roundCurrency(pessimisticPension),
    realistic: roundCurrency(realisticPension),
    optimistic: roundCurrency(optimisticPension)
  };
});

// 6. Benchmark regionalny
export const regionalBenchmarkAtom = atom<RegionalBenchmarkData[]>((get) => {
  const userPension = get(retirementMonthlyPensionAtom) || 0;
  
  // Wybierz 5 największych regionów (na podstawie danych)
  const topRegions = [
    { name: 'Mazowieckie', avgPension: 3500 },
    { name: 'Śląskie', avgPension: 3200 },
    { name: 'Wielkopolskie', avgPension: 3000 },
    { name: 'Małopolskie', avgPension: 3100 },
    { name: 'Dolnośląskie', avgPension: 2900 }
  ];
  
  return topRegions.map(region => ({
    region: region.name,
    average: region.avgPension,
    user: roundCurrency(userPension)
  }));
});

// 7. Indeks Realnej Emerytury (uproszczona implementacja)
export const realPensionIndexAtom = atom((get) => {
  const projection = get(retirementComputationAtom);
  
  if (!projection) return { breadLoaves: 0, cpiBasket: 0 };

  const monthlyPension = computeMonthlyPension(projection.capital, projection.lifeExpectancyYears);
  
  // Uproszczone obliczenia na podstawie dostępnych danych
  // Cena chleba: ~3.50 zł (przybliżona cena w 2024)
  // Koszyk CPI: ~2000 zł (przybliżona wartość w 2024)
  
  const breadPrice = 3.50; // zł za bochenek
  const cpiBasketValue = 2000; // zł
  
  const breadLoaves = Math.round(monthlyPension / breadPrice);
  const cpiBaskets = monthlyPension / cpiBasketValue;
  
  return {
    breadLoaves: breadLoaves,
    cpiBasket: Math.round(cpiBaskets * 100) / 100 // Zaokrąglij do 2 miejsc po przecinku
  };
});

// 8. Dane o opóźnieniach przejścia na emeryturę
export const retirementDelayDataAtom = atom((get) => {
  const inputs = get(retirementInputsAtom);
  const gender = inputs.gender;
  
  // Pobierz dane z opoznienie_przejscia_all_sheets.json
  const delayData = opoznienieData.Dane.rows;
  
  // Zwróć dane dla odpowiedniej płci (przykładowe mapowanie)
  const genderKey = gender === 'female' ? '77.7' : '64.5';
  
  return {
    exactAge: delayData[0][genderKey] || 77.7,
    delay1to11Months: delayData[1][genderKey] || 15.6,
    delay12to23Months: delayData[2][genderKey] || 3.0,
    delay2YearsPlus: delayData[3][genderKey] || 3.6
  };
});

// 9. Dane o absencji chorobowej według regionów
export const sickLeaveRegionalDataAtom = atom((get) => {
  const inputs = get(retirementInputsAtom);
  const gender = inputs.gender;
  
  // Pobierz dane z absencja_chorobowa_all_sheets.json
  const absencjaRows = absencjaChorobowaData['Zwolnienia_Lekarskie_Polska'].rows;
  
  // Zwróć średnie dane dla Polski
  const avgSickLeave = gender === 'female' ? 38.12 : 32.81;
  
  return {
    averageDays: avgSickLeave,
    regionalData: absencjaRows.slice(0, 10).map((row: any) => ({
      region: row['powiat aleksandrowski'],
      days: gender === 'female' ? row['38.12'] : row['32.81']
    }))
  };
})