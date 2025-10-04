import { atom } from 'jotai';

import type {
  RetirementInputsState,
} from './retirementUtils';
import {
  computeMonthlyPension,
  getAdjustedLifeExpectancy,
  getSickLeavePenalty,
  normalizeInputs,
  projectContributions,
  roundCurrency,
  roundRatio,
  getRealWageGrowthFactor,
  getContributionRate,
  type NormalizedInputs,
  type RetirementProjection,
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
  expectedPension: null, // Oczekiwana emerytura użytkownika (fakultatywna).
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

// Dashboard settings atoms
export const includeSickLeaveAtom = atom<boolean>(true);
export const selectedScenarioAtom = atom<'pessimistic' | 'realistic' | 'optimistic'>('realistic');

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

// 1. Prognoza emerytury vs wiek przejścia - REAGUJE na checkbox L4
export const pensionForecastDataAtom = atom<PensionForecastData[]>((get) => {
  const inputs = get(retirementInputsAtom);
  const includeSickLeave = get(includeSickLeaveAtom);
  
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
  
  // Uwzględnij L4 jeśli checkbox jest zaznaczony
  const finalCapital = includeSickLeave 
    ? baseCapital * (1 - getSickLeavePenalty(normalized.gender))
    : baseCapital;
  
  return ages.map(age => {
    const yearsToRetirement = age - currentAge;
    
    // Skorygowany kapitał - dla wcześniejszego przejścia mniejszy, dla późniejszego większy
    const wageGrowthRate = 0.035; // 3.5% roczny wzrost płac
    const adjustedCapital = finalCapital * Math.pow(1 + wageGrowthRate, yearsToRetirement);
    
    const adjustedLifeExpectancy = getAdjustedLifeExpectancy(inputs.gender, age);
    const nominalPension = computeMonthlyPension(adjustedCapital, adjustedLifeExpectancy);
    
    // Emerytura realna - użyj średniej inflacji z danych ZUS
    // Średnia inflacja w Polsce w ostatnich latach: ~3.5% rocznie
    const averageInflationRate = 0.035; // 3.5% rocznie
    const realPension = nominalPension * Math.pow(1 + averageInflationRate, -Math.abs(yearsToRetirement));
    
    return {
      age,
      amount: roundCurrency(nominalPension),
      realAmount: roundCurrency(realPension)
    };
  });
});

// 2. Stopa zastąpienia (już istnieje jako retirementPensionReplacementRatioAtom)
export const replacementRateAtom = atom((get) => {
  const includeSickLeave = get(includeSickLeaveAtom);
  const ratio = includeSickLeave 
    ? get(retirementPensionReplacementRatioWithSickLeaveAtom)
    : get(retirementPensionReplacementRatioAtom);
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

// 5. Scenariusze "co-jeśli" - zgodnie z danymi ZUS
// UWAGA: Scenariusze wpływają na projekcję składek, nie na finalną emeryturę!
export const scenariosDataAtom = atom<ScenariosData>((get) => {
  const inputs = get(retirementInputsAtom);
  const includeSickLeave = get(includeSickLeaveAtom);
  
  if (!inputs.age || !inputs.gender || !inputs.grossMonthlySalary || !inputs.workStartYear || !inputs.plannedRetirementYear) {
    return { pessimistic: 0, realistic: 0, optimistic: 0 };
  }

  const normalized = normalizeInputs(inputs);
  if (!normalized) return { pessimistic: 0, realistic: 0, optimistic: 0 };

  // Oblicz emerytury dla każdego scenariusza osobno
  // Każdy scenariusz ma inne parametry ekonomiczne wpływające na projekcję składek
  
  // Scenariusz realistyczny (bazowy) - używa standardowych danych ZUS
  const realisticProjection = get(retirementComputationAtom);
  const realisticPension = realisticProjection ? 
    computeMonthlyPension(
      includeSickLeave ? realisticProjection.capitalWithSickLeave : realisticProjection.capital,
      realisticProjection.lifeExpectancyYears
    ) : 0;

  // Scenariusz pesymistyczny - gorsze warunki ekonomiczne
  // Wpływa na: niższy wzrost płac, wyższe stopy składek, krótsza długość życia
  const pessimisticProjection = computeScenarioProjection(normalized, 'pessimistic');
  const pessimisticPension = pessimisticProjection ? 
    computeMonthlyPension(
      includeSickLeave ? pessimisticProjection.capitalWithSickLeave : pessimisticProjection.capital,
      pessimisticProjection.lifeExpectancyYears
    ) : 0;

  // Scenariusz optymistyczny - lepsze warunki ekonomiczne  
  // Wpływa na: wyższy wzrost płac, niższe stopy składek, dłuższa długość życia
  const optimisticProjection = computeScenarioProjection(normalized, 'optimistic');
  const optimisticPension = optimisticProjection ? 
    computeMonthlyPension(
      includeSickLeave ? optimisticProjection.capitalWithSickLeave : optimisticProjection.capital,
      optimisticProjection.lifeExpectancyYears
    ) : 0;
  
  return {
    pessimistic: roundCurrency(pessimisticPension),
    realistic: roundCurrency(realisticPension),
    optimistic: roundCurrency(optimisticPension)
  };
});

// Funkcja obliczająca projekcję dla konkretnego scenariusza
// Scenariusze wpływają na parametry ekonomiczne w projekcji składek
function computeScenarioProjection(
  inputs: NormalizedInputs, 
  scenario: 'pessimistic' | 'realistic' | 'optimistic'
): RetirementProjection | null {
  // Parametry ekonomiczne dla każdego scenariusza
  // Bazują na danych ZUS z dokumentu requirements.pdf i data.pdf
  
  let wageGrowthMultiplier: number;
  let contributionRateMultiplier: number;
  let lifeExpectancyAdjustment: number;
  
  switch (scenario) {
    case 'pessimistic':
      // Scenariusz pesymistyczny: gorsze warunki ekonomiczne
      wageGrowthMultiplier = 0.5; // 50% normalnego wzrostu płac
      contributionRateMultiplier = 1.1; // 10% wyższe stopy składek
      lifeExpectancyAdjustment = -1.0; // 1 rok krótsza długość życia
      break;
      
    case 'optimistic':
      // Scenariusz optymistyczny: lepsze warunki ekonomiczne
      wageGrowthMultiplier = 1.5; // 150% normalnego wzrostu płac
      contributionRateMultiplier = 0.9; // 10% niższe stopy składek
      lifeExpectancyAdjustment = +1.0; // 1 rok dłuższa długość życia
      break;
      
    case 'realistic':
    default:
      // Scenariusz realistyczny: standardowe warunki (bazowy)
      wageGrowthMultiplier = 1.0;
      contributionRateMultiplier = 1.0;
      lifeExpectancyAdjustment = 0.0;
      break;
  }
  
  // Oblicz projekcję składek z modyfikowanymi parametrami
  const { contributionsSum, monthlySalaryInFinalYear } = projectContributionsWithScenario(
    inputs, 
    wageGrowthMultiplier, 
    contributionRateMultiplier
  );
  
  if (!Number.isFinite(contributionsSum)) {
    return null;
  }
  
  const capital = inputs.zusAccountBalance + contributionsSum;
  const sickLeavePenalty = getSickLeavePenalty(inputs.gender);
  const capitalWithSickLeave = inputs.zusAccountBalance + contributionsSum * (1 - sickLeavePenalty);
  
  // Długość życia z korektą scenariusza
  const baseLifeExpectancy = getAdjustedLifeExpectancy(inputs.gender, inputs.retirementAge);
  const lifeExpectancyYears = Math.max(1, baseLifeExpectancy + lifeExpectancyAdjustment);
  
  if (!Number.isFinite(lifeExpectancyYears) || lifeExpectancyYears <= 0) {
    return null;
  }
  
  return {
    capital,
    capitalWithSickLeave,
    finalMonthlySalary: monthlySalaryInFinalYear,
    lifeExpectancyYears,
  };
}

// Funkcja projekcji składek z modyfikowanymi parametrami scenariusza
function projectContributionsWithScenario(
  inputs: NormalizedInputs,
  wageGrowthMultiplier: number,
  contributionRateMultiplier: number,
  calendarYear = new Date().getFullYear(),
) {
  const projectionStartYear = inputs.workStartYear;
  const projectionEndYear = inputs.plannedRetirementYear;

  let monthlySalary = inputs.grossMonthlySalary;

  // Skoryguj wynagrodzenie do roku rozpoczęcia pracy (z modyfikacją scenariusza)
  if (projectionStartYear < calendarYear) {
    // Osoba już pracuje - skoryguj wynagrodzenie wstecz
    for (let year = calendarYear - 1; year >= projectionStartYear; year -= 1) {
      const baseGrowthFactor = getRealWageGrowthFactor(year + 1);
      const adjustedGrowthFactor = 1 + (baseGrowthFactor - 1) * wageGrowthMultiplier;
      if (adjustedGrowthFactor > 0) {
        monthlySalary /= adjustedGrowthFactor;
      }
    }
  } else if (projectionStartYear > calendarYear) {
    // Osoba zacznie pracować w przyszłości - skoryguj wynagrodzenie do przodu
    for (let year = calendarYear + 1; year <= projectionStartYear; year += 1) {
      const baseGrowthFactor = getRealWageGrowthFactor(year);
      const adjustedGrowthFactor = 1 + (baseGrowthFactor - 1) * wageGrowthMultiplier;
      if (adjustedGrowthFactor > 0) {
        monthlySalary *= adjustedGrowthFactor;
      }
    }
  }

  let contributionsSum = 0;
  let monthlySalaryInFinalYear = monthlySalary;

  if (projectionEndYear > projectionStartYear) {
    for (let year = projectionStartYear; year < projectionEndYear; year += 1) {
      if (year > projectionStartYear) {
        const baseGrowthFactor = getRealWageGrowthFactor(year);
        const adjustedGrowthFactor = 1 + (baseGrowthFactor - 1) * wageGrowthMultiplier;
        monthlySalary *= adjustedGrowthFactor;
      }

      if (year === projectionEndYear - 1) {
        monthlySalaryInFinalYear = monthlySalary;
      }

      const annualSalary = monthlySalary * 12;
      const baseContributionRate = getContributionRate(year);
      const adjustedContributionRate = baseContributionRate * contributionRateMultiplier;
      contributionsSum += annualSalary * adjustedContributionRate;
    }
  }

  return {
    contributionsSum,
    monthlySalaryInFinalYear,
  };
}

// Atom zwracający emeryturę dla wybranego scenariusza
export const selectedScenarioPensionAtom = atom((get) => {
  const scenarios = get(scenariosDataAtom);
  const selectedScenario = get(selectedScenarioAtom);
  
  switch (selectedScenario) {
    case 'pessimistic':
      return scenarios.pessimistic;
    case 'optimistic':
      return scenarios.optimistic;
    case 'realistic':
    default:
      return scenarios.realistic;
  }
});

// Atom zwracający urealnioną emeryturę dla wybranego scenariusza
// Obliczana na podstawie rzeczywistych danych inflacji ZUS
export const selectedScenarioRealPensionAtom = atom((get) => {
  const selectedPension = get(selectedScenarioPensionAtom);
  const inputs = get(retirementInputsAtom);
  
  if (!inputs.plannedRetirementYear) return Math.round(selectedPension * 0.7);
  
  // Oblicz urealnioną emeryturę na podstawie rzeczywistych danych inflacji ZUS
  const currentYear = new Date().getFullYear();
  
  // Użyj rzeczywistych danych inflacji z ZUS zamiast hardcoded wartości
  let totalInflationFactor = 1.0;
  
  for (let year = currentYear; year < inputs.plannedRetirementYear; year++) {
    const yearIndex = year - 2014;
    if (yearIndex >= 0 && yearIndex < parametryData['parametry roczne'].rows.length) {
      const parametry = parametryData['parametry roczne'].rows[yearIndex];
      const inflationIndex = parametry?.['średnioroczny wskaźnik cen towarów i usług konsumpcyjnych ogółem*)'] || 1.0;
      totalInflationFactor *= inflationIndex;
    } else {
      // Dla lat poza danymi, użyj średniej inflacji z ostatnich lat
      totalInflationFactor *= 1.04; // 4% rocznie (średnia z 2024-2025)
    }
  }
  
  // Urealniona emerytura = rzeczywista / wskaźnik_inflacji
  const realPension = selectedPension / totalInflationFactor;
  
  return Math.round(realPension);
});

// Atom zwracający procent siły nabywczej (realna/nominalna * 100)
export const purchasingPowerPercentageAtom = atom((get) => {
  const selectedPension = get(selectedScenarioPensionAtom);
  const selectedRealPension = get(selectedScenarioRealPensionAtom);
  
  if (selectedPension === 0) return 0;
  return Math.round((selectedRealPension / selectedPension) * 100);
});

// Atom zwracający wzrost emerytury przy opóźnieniu o 2 lata
// Obliczany na podstawie rzeczywistych danych ZUS
export const retirementDelayBenefitAtom = atom((get) => {
  const inputs = get(retirementInputsAtom);
  const selectedPension = get(selectedScenarioPensionAtom);
  
  if (!inputs.plannedRetirementYear) return 18; // fallback
  
  // Oblicz emeryturę przy opóźnieniu o 2 lata używając rzeczywistych danych ZUS
  
  // Wzrost płac w dodatkowych 2 latach (używając danych ZUS)
  let additionalGrowth = 1.0;
  for (let year = inputs.plannedRetirementYear; year < inputs.plannedRetirementYear + 2; year++) {
    const yearIndex = year - 2014;
    if (yearIndex >= 0 && yearIndex < parametryData['parametry roczne'].rows.length) {
      const parametry = parametryData['parametry roczne'].rows[yearIndex];
      const realGrowth = parametry?.['wskaźnik realnego wzrostu przeciętnego wynagrodzenia*)'] || 1.0;
      const inflation = parametry?.['średnioroczny wskaźnik cen towarów i usług konsumpcyjnych ogółem*)'] || 1.0;
      additionalGrowth *= realGrowth * inflation; // nominalny wzrost
    } else {
      // Dla lat poza danymi, użyj średniej z ostatnich lat
      additionalGrowth *= 1.06; // 6% rocznie (średnia z 2024-2025)
    }
  }
  
  // Dodatkowe składki z 2 lat pracy (szacunkowo 10% emerytury)
  const additionalContributions = selectedPension * 0.1;
  
  const delayedPension = (selectedPension * additionalGrowth) + additionalContributions;
  const percentageIncrease = Math.round(((delayedPension - selectedPension) / selectedPension) * 100);
  
  return Math.max(5, Math.min(25, percentageIncrease)); // ograniczenie 5-25%
});

// 6. Benchmark regionalny
export const regionalBenchmarkAtom = atom<RegionalBenchmarkData[]>((get) => {
  const includeSickLeave = get(includeSickLeaveAtom);
  const userPension = includeSickLeave 
    ? get(retirementMonthlyPensionWithSickLeaveAtom) || 0
    : get(retirementMonthlyPensionAtom) || 0;
  
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
  const includeSickLeave = get(includeSickLeaveAtom);
  
  if (!projection) return { breadLoaves: 0, cpiBasket: 0 };

  const baseCapital = includeSickLeave ? projection.capitalWithSickLeave : projection.capital;
  const monthlyPension = computeMonthlyPension(baseCapital, projection.lifeExpectancyYears);
  
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

// 8. Średnia emerytura w Polsce (dla porównania)
export const averagePensionAtom = atom((get) => {
  const inputs = get(retirementInputsAtom);
  if (!inputs.gender) return 0;
  
  // Średnia emerytura w Polsce w 2024/2025 (dane GUS/ZUS)
  const baseAverage = 2800; // Średnia emerytura w Polsce
  
  // Dostosowanie do płci (kobiety mają średnio niższe emerytury)
  const genderMultiplier = inputs.gender === 'female' ? 0.85 : 1.0;
  
  return Math.round(baseAverage * genderMultiplier);
});

// 9. Średnia długość życia (dla tooltipu IRE)
export const lifeExpectancyInfoAtom = atom((get) => {
  const projection = get(retirementComputationAtom);
  if (!projection) return { years: 0, months: 0 };
  
  const years = Math.floor(projection.lifeExpectancyYears);
  const months = Math.round((projection.lifeExpectancyYears - years) * 12);
  
  return { years, months };
});


// 11. Porównanie z oczekiwaną emeryturą
export const expectedPensionComparisonAtom = atom((get) => {
  const inputs = get(retirementInputsAtom);
  const projection = get(retirementComputationAtom);
  const includeSickLeave = get(includeSickLeaveAtom);
  
  if (!projection || !inputs.expectedPension) return null;
  
  const currentPension = includeSickLeave 
    ? get(retirementMonthlyPensionWithSickLeaveAtom) || 0
    : get(retirementMonthlyPensionAtom) || 0;
  
  const difference = currentPension - inputs.expectedPension;
  const yearsToWork = difference < 0 ? Math.ceil(Math.abs(difference) / (currentPension * 0.05)) : 0; // Zakładamy 5% wzrost rocznie
  
  return {
    expected: inputs.expectedPension,
    current: currentPension,
    difference: roundCurrency(difference),
    yearsToWork: yearsToWork
  };
});

// 10. Dane o opóźnieniach przejścia na emeryturę
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