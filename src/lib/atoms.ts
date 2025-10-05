import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

// Import danych z plików JSON
import absencjaChorobowaData from './data/absencja_chorobowa_all_sheets.json';
import opoznienieData from './data/opoznienie_przejscia_all_sheets.json';
import parametryData from './data/parametry_III_2025_all_sheets.json';
import { environment } from './environment';
import type { Gender, RetirementInputsState } from './retirementUtils';
import {
  computeMonthlyPension,
  getAdjustedLifeExpectancy,
  getContributionRate,
  getRealWageGrowthFactor,
  getSickLeavePenalty,
  roundCurrency,
  roundRatio,
} from './retirementUtils';

export const showReportGeneratorAtom = atom<boolean>(false);

// Wejścia użytkownika jako osobne atomy
export const inputAgeAtom = atom<number | null>(
  environment.DEV_MODE ? 31 : null
);
export const inputGenderAtom = atom<Gender | null>(
  environment.DEV_MODE ? 'male' : null
);
export const inputCityAtom = atom<string | null>(
  environment.DEV_MODE ? 'Warszawa' : null
);
export const inputPostalCodeAtom = atom<string | null>(
  environment.DEV_MODE ? '00-000' : null
);
export const inputGrossMonthlySalaryAtom = atom<number | null>(
  environment.DEV_MODE ? 5000 : null
);
export const inputWorkStartYearAtom = atom<number | null>(
  environment.DEV_MODE ? 1990 : null
);
export const inputPlannedRetirementYearAtom = atom<number | null>(
  environment.DEV_MODE ? 2050 : null
);
export const inputZusAccountBalanceAtom = atom<number | null>(
  environment.DEV_MODE ? 100000 : null
);
export const onboardingCompletedAtom = atom<boolean>(
  environment.DEV_MODE ? true : false
);

// retirementAgeAtom - wiek przejścia na emeryturę
export const retirementAgeAtom = atom(
  (get) => {
    const plannedRetirementYear = get(inputPlannedRetirementYearAtom);
    const age = get(inputAgeAtom);

    if (plannedRetirementYear != null && age != null) {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - age;
      const derivedAge = plannedRetirementYear - birthYear;

      if (Number.isFinite(derivedAge) && derivedAge > 0) {
        const clampedAge = Math.min(Math.max(derivedAge, 60), 70);
        return clampedAge;
      }
    }

    return 60;
  },
  (get, set, nextRetirementAge: number) => {
    if (!Number.isFinite(nextRetirementAge) || nextRetirementAge <= 0) {
      return;
    }

    const age = get(inputAgeAtom);
    if (age == null) {
      return;
    }

    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    const sanitizedAge = Math.min(Math.max(nextRetirementAge, 60), 70);
    const nextPlannedYear = birthYear + Math.round(sanitizedAge);

    set(inputPlannedRetirementYearAtom, nextPlannedYear);
  }
);

// (Legacy) Zbiorczy widok wejść, do zgodności w miejscach gdzie potrzebny obiekt
export const retirementInputsAtom = atom<RetirementInputsState>((get) => ({
  age: get(inputAgeAtom),
  gender: get(inputGenderAtom),
  city: get(inputCityAtom),
  grossMonthlySalary: get(inputGrossMonthlySalaryAtom),
  workStartYear: get(inputWorkStartYearAtom),
  plannedRetirementYear: get(inputPlannedRetirementYearAtom),
  zusAccountBalance: get(inputZusAccountBalanceAtom),
  expectedPension: null, // Oczekiwana emerytura użytkownika
}));

export type RetirementProjection = {
  capital: number;
  capitalWithSickLeave: number;
  finalMonthlySalary: number;
  lifeExpectancyYears: number;
};

// Dashboard settings atoms
export const includeSickLeaveAtom = atom<boolean>(true);
export const selectedScenarioAtom = atom<
  'pessimistic' | 'realistic' | 'optimistic'
>('realistic');

// Wewnętrzna projekcja gromadząca kapitał i parametry potrzebne do dalszych obliczeń.
export const retirementComputationAtom = atom<RetirementProjection | null>(
  (get) => {
    const age = get(inputAgeAtom);
    const gender = get(inputGenderAtom);
    const grossMonthlySalary = get(inputGrossMonthlySalaryAtom);
    const workStartYear = get(inputWorkStartYearAtom);
    const plannedRetirementYear = get(inputPlannedRetirementYearAtom);
    const zusAccountBalance = get(inputZusAccountBalanceAtom) ?? 0;
    // Wymagane: age, gender, grossMonthlySalary, workStartYear, plannedRetirementYear
    if (
      age == null ||
      gender == null ||
      grossMonthlySalary == null ||
      workStartYear == null ||
      plannedRetirementYear == null
    ) {
      return null;
    }

    const contributionProjection = get(contributionProjectionAtom);
    if (!contributionProjection) {
      return null;
    }
    const { contributionsSum, monthlySalaryInFinalYear } =
      contributionProjection;

    if (!Number.isFinite(contributionsSum)) {
      return null;
    }

    const capital = zusAccountBalance + contributionsSum;
    const yearsOfWork = plannedRetirementYear - workStartYear;
    const sickLeavePenalty = getSickLeavePenalty(gender, yearsOfWork);
    // Oblicz wiek emerytalny na podstawie wieku i planowanego roku przejścia
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    const retirementAge = plannedRetirementYear - birthYear;
    const capitalWithSickLeave =
      (zusAccountBalance + contributionsSum) * (1 - sickLeavePenalty);
    const lifeExpectancyYears = getAdjustedLifeExpectancy(
      gender,
      retirementAge
    );

    if (!Number.isFinite(lifeExpectancyYears) || lifeExpectancyYears <= 0) {
      console.log(
        'retirementComputationAtom: invalid lifeExpectancyYears',
        lifeExpectancyYears
      );
      return null;
    }

    return {
      capital,
      capitalWithSickLeave,
      finalMonthlySalary: monthlySalaryInFinalYear,
      lifeExpectancyYears,
    };
  }
);

export type ContributionProjection = {
  contributionsSum: number;
  monthlySalaryInFinalYear: number;
};

// Projekcja składek i ostatniego wynagrodzenia brutto (derived atom)
export const contributionProjectionAtom = atom<ContributionProjection | null>(
  (get) => {
    const grossMonthlySalary = get(inputGrossMonthlySalaryAtom);
    const workStartYear = get(inputWorkStartYearAtom);
    const plannedRetirementYear = get(inputPlannedRetirementYearAtom);
    // Wymagane do projekcji składek
    if (
      grossMonthlySalary == null ||
      workStartYear == null ||
      plannedRetirementYear == null
    ) {
      return null;
    }

    const calendarYear = new Date().getFullYear();
    const projectionStartYear = workStartYear;
    const projectionEndYear = plannedRetirementYear;

    let monthlySalary = grossMonthlySalary;

    if (projectionStartYear < calendarYear) {
      for (
        let year = calendarYear - 1;
        year >= projectionStartYear;
        year -= 1
      ) {
        const growthFactor = getRealWageGrowthFactor(year + 1);
        if (growthFactor > 0) {
          monthlySalary /= growthFactor;
        }
      }
    } else if (projectionStartYear > calendarYear) {
      for (
        let year = calendarYear + 1;
        year <= projectionStartYear;
        year += 1
      ) {
        const growthFactor = getRealWageGrowthFactor(year);
        if (growthFactor > 0) {
          monthlySalary *= growthFactor;
        }
      }
    }

    let contributionsSum = 0;
    let monthlySalaryInFinalYear = monthlySalary;

    if (projectionEndYear > projectionStartYear) {
      for (
        let year = projectionStartYear;
        year < projectionEndYear;
        year += 1
      ) {
        if (year > projectionStartYear) {
          monthlySalary *= getRealWageGrowthFactor(year);
        }
        if (year === projectionEndYear - 1) {
          monthlySalaryInFinalYear = monthlySalary;
        }
        const annualSalary = monthlySalary * 12;
        const contributionRate = getContributionRate(year);
        contributionsSum += annualSalary * contributionRate;
      }
    }

    return {
      contributionsSum,
      monthlySalaryInFinalYear,
    } satisfies ContributionProjection;
  }
);

// Parametryzowany derived atom do projekcji składek dla zadanych inputs
export const contributionProjectionForInputsFamily = atomFamily(
  (inputs: RetirementInputsState) =>
    atom<ContributionProjection | null>((get) => {
      // zaznacz użycie parametru, aby uniknąć TS6133
      void get;
      if (
        inputs.grossMonthlySalary == null ||
        inputs.workStartYear == null ||
        inputs.plannedRetirementYear == null
      ) {
        return null;
      }

      const calendarYear = new Date().getFullYear();
      const projectionStartYear = inputs.workStartYear;
      const projectionEndYear = inputs.plannedRetirementYear;

      let monthlySalary = inputs.grossMonthlySalary;

      if (projectionStartYear < calendarYear) {
        for (
          let year = calendarYear - 1;
          year >= projectionStartYear;
          year -= 1
        ) {
          const growthFactor = getRealWageGrowthFactor(year + 1);
          if (growthFactor > 0) {
            monthlySalary /= growthFactor;
          }
        }
      } else if (projectionStartYear > calendarYear) {
        for (
          let year = calendarYear + 1;
          year <= projectionStartYear;
          year += 1
        ) {
          const growthFactor = getRealWageGrowthFactor(year);
          if (growthFactor > 0) {
            monthlySalary *= growthFactor;
          }
        }
      }

      let contributionsSum = 0;
      let monthlySalaryInFinalYear = monthlySalary;

      if (projectionEndYear > projectionStartYear) {
        for (
          let year = projectionStartYear;
          year < projectionEndYear;
          year += 1
        ) {
          if (year > projectionStartYear) {
            monthlySalary *= getRealWageGrowthFactor(year);
          }
          if (year === projectionEndYear - 1) {
            monthlySalaryInFinalYear = monthlySalary;
          }
          const annualSalary = monthlySalary * 12;
          const contributionRate = getContributionRate(year);
          contributionsSum += annualSalary * contributionRate;
        }
      }

      return {
        contributionsSum,
        monthlySalaryInFinalYear,
      } satisfies ContributionProjection;
    }),
  (a, b) =>
    a.age === b.age &&
    a.gender === b.gender &&
    a.city === b.city &&
    a.grossMonthlySalary === b.grossMonthlySalary &&
    a.workStartYear === b.workStartYear &&
    a.plannedRetirementYear === b.plannedRetirementYear &&
    a.zusAccountBalance === b.zusAccountBalance
);

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
  isSelected?: boolean;
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
  const age = get(inputAgeAtom);
  const gender = get(inputGenderAtom);
  const city = get(inputCityAtom);
  const grossMonthlySalary = get(inputGrossMonthlySalaryAtom);
  const workStartYear = get(inputWorkStartYearAtom);
  const plannedRetirementYear = get(inputPlannedRetirementYearAtom);
  const zusAccountBalance = get(inputZusAccountBalanceAtom);
  const includeSickLeave = get(includeSickLeaveAtom);

  // Early return if essential data is missing to avoid expensive calculations
  if (
    !age ||
    !gender ||
    !grossMonthlySalary ||
    !workStartYear ||
    !plannedRetirementYear
  ) {
    return [];
  }

  const ages = [60, 62, 64, 65, 67, 70];
  const currentAge = age!;
  const currentYear = new Date().getFullYear();

  // Oblicz bazowy kapitał na podstawie aktualnych danych (bez uwzględniania plannedRetirementYear)
  const baseRetirementYear = currentYear + (65 - currentAge); // Użyj 65 jako bazowy wiek

  // Stwórz tymczasowe inputs dla obliczenia bazowego kapitału
  const baseInputs = {
    age,
    gender,
    city,
    grossMonthlySalary,
    workStartYear,
    plannedRetirementYear: baseRetirementYear,
    zusAccountBalance,
    expectedPension: null,
  };

  const baseProjection = get(contributionProjectionForInputsFamily(baseInputs));
  if (!baseProjection) {
    return [];
  }
  const baseCapital =
    (baseInputs.zusAccountBalance || 0) + baseProjection.contributionsSum;

  const genderNN = gender!;

  // Uwzględnij L4 jeśli checkbox jest zaznaczony
  // Usunięto nieużywane obliczenia bazowego kapitału

  return ages.map((age) => {
    const yearsToRetirement = age - currentAge;
    const targetRetirementYear = currentYear + yearsToRetirement;

    // Oblicz kapitał dla konkretnego wieku przejścia na emeryturę
    const targetInputs = {
      age: currentAge,
      gender,
      city,
      grossMonthlySalary,
      workStartYear,
      plannedRetirementYear: targetRetirementYear,
      zusAccountBalance,
      expectedPension: null,
    };

    const targetProjection = get(
      contributionProjectionForInputsFamily(targetInputs)
    );
    if (!targetProjection) {
      return { age, amount: 0, realAmount: 0 };
    }

    const targetCapital =
      (zusAccountBalance || 0) + targetProjection.contributionsSum;
    const targetCapitalWithSickLeave = includeSickLeave
      ? targetCapital * (1 - getSickLeavePenalty(gender, yearsToRetirement))
      : targetCapital;

    const adjustedLifeExpectancy = getAdjustedLifeExpectancy(genderNN, age);
    const nominalPension = computeMonthlyPension(
      targetCapitalWithSickLeave,
      adjustedLifeExpectancy
    );

    // Emerytura realna - użyj rzeczywistych danych inflacji ZUS
    let inflationFactor = 1.0;
    const baseYear = currentYear;
    const targetYear = currentYear + yearsToRetirement;

    for (let year = baseYear; year < targetYear; year++) {
      const yearIndex = year - 2014;
      if (
        yearIndex >= 0 &&
        yearIndex < parametryData['parametry roczne'].rows.length
      ) {
        const parametry = parametryData['parametry roczne'].rows[yearIndex];
        const inflationIndex =
          parametry?.[
            'średnioroczny wskaźnik cen towarów i usług konsumpcyjnych ogółem*)'
          ] || 1.0;
        inflationFactor *= inflationIndex;
      } else {
        // Dla lat poza danymi, użyj średniej inflacji z prognozy ZUS (2.5%)
        inflationFactor *= 1.025;
      }
    }

    // Urealniona emerytura = nominalna / wskaźnik inflacji
    const realPension = nominalPension / inflationFactor;

    return {
      age,
      amount: roundCurrency(nominalPension),
      realAmount: roundCurrency(realPension),
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
    withoutSickLeave: roundCurrency(withoutSickLeave),
  };
});

// 4. Historia składek + kapitał narastający
export const contributionHistoryAtom = atom<ContributionHistoryData[]>(
  (get) => {
    const age = get(inputAgeAtom);
    const gender = get(inputGenderAtom);
    const grossMonthlySalary = get(inputGrossMonthlySalaryAtom);
    const workStartYear = get(inputWorkStartYearAtom);
    const plannedRetirementYear = get(inputPlannedRetirementYearAtom);

    // Early return to avoid expensive computation
    if (
      !age ||
      !gender ||
      !grossMonthlySalary ||
      !workStartYear ||
      !plannedRetirementYear
    ) {
      return [];
    }

    const projection = get(retirementComputationAtom);

    if (!projection) {
      return [];
    }

    const years: ContributionHistoryData[] = [];
    const currentYear = new Date().getFullYear();

    // Generuj dane dla ostatnich 5 lat
    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i;
      const yearIndex = year - 2014; // Indeks w danych parametrów

      if (
        yearIndex >= 0 &&
        yearIndex < parametryData['parametry roczne'].rows.length
      ) {
        const parametry = parametryData['parametry roczne'].rows[yearIndex];
        const monthlySalary =
          parametry?.[
            'przeciętne miesięczne wynagrodzenie w gospodarce narodowej**)'
          ];
        const contributionRate =
          (parametry?.[
            'stopa składki na ubezpieczenie emerytalne finansowanej przez pracownika'
          ] || 0) +
          (parametry?.[
            'stopa składki na ubezpieczenie emerytalne finansowanej przez pracodawcę'
          ] || 0);

        if (monthlySalary && contributionRate) {
          const annualContributions = monthlySalary * 12 * contributionRate;
          const accumulatedCapital =
            (projection.capital * (year - (workStartYear || 2014))) /
            ((plannedRetirementYear || 65) - (workStartYear || 2014));

          years.push({
            year,
            contributions: roundCurrency(annualContributions),
            capital: roundCurrency(accumulatedCapital),
          });
        }
      }
    }

    return years;
  }
);

// 5. Scenariusze "co-jeśli" - zgodnie z danymi ZUS
// UWAGA: Scenariusze wpływają na projekcję składek, nie na finalną emeryturę!
export const scenariosDataAtom = atom<ScenariosData>((get) => {
  const inputs = get(retirementInputsAtom);
  const includeSickLeave = get(includeSickLeaveAtom);

  if (
    !inputs.age ||
    !inputs.gender ||
    !inputs.grossMonthlySalary ||
    !inputs.workStartYear ||
    !inputs.plannedRetirementYear
  ) {
    return { pessimistic: 0, realistic: 0, optimistic: 0 };
  }

  // Oblicz emerytury dla każdego scenariusza osobno
  // Każdy scenariusz ma inne parametry ekonomiczne wpływające na projekcję składek

  // Scenariusz realistyczny (bazowy) - używa standardowych danych ZUS
  const realisticProjection = get(retirementComputationAtom);
  const realisticPension = realisticProjection
    ? computeMonthlyPension(
        includeSickLeave
          ? realisticProjection.capitalWithSickLeave
          : realisticProjection.capital,
        realisticProjection.lifeExpectancyYears
      )
    : 0;

  // Scenariusz pesymistyczny - gorsze warunki ekonomiczne
  // Wpływa na: niższy wzrost płac, wyższe stopy składek, krótsza długość życia
  const pessimisticProjection = computeScenarioProjection(
    inputs,
    'pessimistic'
  );
  const pessimisticPension = pessimisticProjection
    ? computeMonthlyPension(
        includeSickLeave
          ? pessimisticProjection.capitalWithSickLeave
          : pessimisticProjection.capital,
        pessimisticProjection.lifeExpectancyYears
      )
    : 0;

  // Scenariusz optymistyczny - lepsze warunki ekonomiczne
  // Wpływa na: wyższy wzrost płac, niższe stopy składek, dłuższa długość życia
  const optimisticProjection = computeScenarioProjection(inputs, 'optimistic');
  const optimisticPension = optimisticProjection
    ? computeMonthlyPension(
        includeSickLeave
          ? optimisticProjection.capitalWithSickLeave
          : optimisticProjection.capital,
        optimisticProjection.lifeExpectancyYears
      )
    : 0;

  return {
    pessimistic: roundCurrency(pessimisticPension),
    realistic: roundCurrency(realisticPension),
    optimistic: roundCurrency(optimisticPension),
  };
});

// Funkcja obliczająca projekcję dla konkretnego scenariusza
// Scenariusze wpływają na parametry ekonomiczne w projekcji składek
function computeScenarioProjection(
  inputs: RetirementInputsState,
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
      wageGrowthMultiplier = 0.5; // 50% normalnego wzrostu płac (wolniejszy wzrost)
      contributionRateMultiplier = 0.9; // 10% niższe stopy składek (mniej składek)
      lifeExpectancyAdjustment = -2.0; // 2 lata krótsza długość życia
      break;

    case 'optimistic':
      // Scenariusz optymistyczny: lepsze warunki ekonomiczne
      wageGrowthMultiplier = 1.5; // 150% normalnego wzrostu płac (szybszy wzrost)
      contributionRateMultiplier = 1.1; // 10% wyższe stopy składek (więcej składek)
      lifeExpectancyAdjustment = +2.0; // 2 lata dłuższa długość życia
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
  const { contributionsSum, monthlySalaryInFinalYear } =
    projectContributionsWithScenario(
      inputs,
      wageGrowthMultiplier,
      contributionRateMultiplier
    );

  if (
    !Number.isFinite(contributionsSum) ||
    !inputs.gender ||
    !inputs.plannedRetirementYear ||
    !inputs.age
  ) {
    return null;
  }

  const calendarYear = new Date().getFullYear();
  const birthYear = calendarYear - inputs.age!;
  const retirementAge = inputs.plannedRetirementYear! - birthYear;

  const capital = (inputs.zusAccountBalance ?? 0) + contributionsSum;
  const yearsOfWork = inputs.plannedRetirementYear! - inputs.workStartYear!;
  const sickLeavePenalty = getSickLeavePenalty(inputs.gender!, yearsOfWork);
  const capitalWithSickLeave =
    ((inputs.zusAccountBalance ?? 0) + contributionsSum) *
    (1 - sickLeavePenalty);

  // Długość życia z korektą scenariusza
  const baseLifeExpectancy = getAdjustedLifeExpectancy(
    inputs.gender,
    retirementAge
  );
  const lifeExpectancyYears = Math.max(
    1,
    baseLifeExpectancy + lifeExpectancyAdjustment
  );

  if (!Number.isFinite(lifeExpectancyYears) || lifeExpectancyYears <= 0) {
    return null;
  }

  return {
    capital,
    capitalWithSickLeave,
    finalMonthlySalary: monthlySalaryInFinalYear!,
    lifeExpectancyYears,
  };
}

// Funkcja projekcji składek z modyfikowanymi parametrami scenariusza
function projectContributionsWithScenario(
  inputs: RetirementInputsState,
  wageGrowthMultiplier: number,
  contributionRateMultiplier: number,
  calendarYear = new Date().getFullYear()
) {
  const projectionStartYear = inputs.workStartYear;
  const projectionEndYear = inputs.plannedRetirementYear;

  if (
    !projectionStartYear ||
    !projectionEndYear ||
    !inputs.grossMonthlySalary
  ) {
    return { contributionsSum: 0, monthlySalaryInFinalYear: 0 };
  }

  let monthlySalary = inputs.grossMonthlySalary;

  // Skoryguj wynagrodzenie do roku rozpoczęcia pracy (z modyfikacją scenariusza)
  if (projectionStartYear < calendarYear) {
    // Osoba już pracuje - skoryguj wynagrodzenie wstecz
    for (let year = calendarYear - 1; year >= projectionStartYear; year -= 1) {
      const baseGrowthFactor = getRealWageGrowthFactor(year + 1);
      const adjustedGrowthFactor =
        1 + (baseGrowthFactor - 1) * wageGrowthMultiplier;
      if (adjustedGrowthFactor > 0) {
        monthlySalary /= adjustedGrowthFactor;
      }
    }
  } else if (projectionStartYear > calendarYear) {
    // Osoba zacznie pracować w przyszłości - skoryguj wynagrodzenie do przodu
    for (let year = calendarYear + 1; year <= projectionStartYear; year += 1) {
      const baseGrowthFactor = getRealWageGrowthFactor(year);
      const adjustedGrowthFactor =
        1 + (baseGrowthFactor - 1) * wageGrowthMultiplier;
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
        const adjustedGrowthFactor =
          1 + (baseGrowthFactor - 1) * wageGrowthMultiplier;
        monthlySalary *= adjustedGrowthFactor;
      }

      if (year === projectionEndYear - 1) {
        monthlySalaryInFinalYear = monthlySalary;
      }

      const annualSalary = monthlySalary * 12;
      const baseContributionRate = getContributionRate(year);
      const adjustedContributionRate =
        baseContributionRate * contributionRateMultiplier;
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

  if (!inputs.plannedRetirementYear) {
    return Math.round(selectedPension * 0.7);
  }

  // Oblicz urealnioną emeryturę na podstawie rzeczywistych danych inflacji ZUS
  const currentYear = new Date().getFullYear();

  // Użyj rzeczywistych danych inflacji z ZUS zamiast hardcoded wartości
  let totalInflationFactor = 1.0;

  for (let year = currentYear; year < inputs.plannedRetirementYear; year++) {
    const yearIndex = year - 2014;
    if (
      yearIndex >= 0 &&
      yearIndex < parametryData['parametry roczne'].rows.length
    ) {
      const parametry = parametryData['parametry roczne'].rows[yearIndex];
      const inflationIndex =
        parametry?.[
          'średnioroczny wskaźnik cen towarów i usług konsumpcyjnych ogółem*)'
        ] || 1.0;
      totalInflationFactor *= inflationIndex;
    } else {
      // Dla lat poza danymi, użyj średniej inflacji z ostatnich lat (2.5% zgodnie z prognozą ZUS)
      totalInflationFactor *= 1.025; // 2.5% rocznie (średnia z prognozy ZUS 2026-2080)
    }
  }

  // Urealniona emerytura = nominalna emerytura / łączny wskaźnik inflacji
  // To daje emeryturę w wartościach z roku bieżącego (2025)
  const realPension = selectedPension / totalInflationFactor;

  return Math.round(realPension);
});

// Atom zwracający procent siły nabywczej (realna/nominalna * 100)
export const purchasingPowerPercentageAtom = atom((get) => {
  const selectedPension = get(selectedScenarioPensionAtom);
  const selectedRealPension = get(selectedScenarioRealPensionAtom);

  if (selectedPension === 0) {
    return 0;
  }
  return Math.round((selectedRealPension / selectedPension) * 100);
});

// Atom zwracający wzrost emerytury przy opóźnieniu o 2 lata
// Obliczany na podstawie rzeczywistych danych ZUS
export const retirementDelayBenefitAtom = atom((get) => {
  const inputs = get(retirementInputsAtom);
  const selectedPension = get(selectedScenarioPensionAtom);

  if (!inputs.plannedRetirementYear) {
    return 18;
  } // fallback

  // Oblicz emeryturę przy opóźnieniu o 2 lata używając rzeczywistych danych ZUS

  // Wzrost płac w dodatkowych 2 latach (używając danych ZUS)
  let additionalGrowth = 1.0;
  for (
    let year = inputs.plannedRetirementYear;
    year < inputs.plannedRetirementYear + 2;
    year++
  ) {
    const yearIndex = year - 2014;
    if (
      yearIndex >= 0 &&
      yearIndex < parametryData['parametry roczne'].rows.length
    ) {
      const parametry = parametryData['parametry roczne'].rows[yearIndex];
      const realGrowth =
        parametry?.['wskaźnik realnego wzrostu przeciętnego wynagrodzenia*)'] ||
        1.0;
      const inflation =
        parametry?.[
          'średnioroczny wskaźnik cen towarów i usług konsumpcyjnych ogółem*)'
        ] || 1.0;
      additionalGrowth *= realGrowth * inflation; // nominalny wzrost
    } else {
      // Dla lat poza danymi, użyj średniej z ostatnich lat
      additionalGrowth *= 1.06; // 6% rocznie (średnia z 2024-2025)
    }
  }

  // Dodatkowe składki z 2 lat pracy (szacunkowo 10% emerytury)
  const additionalContributions = selectedPension * 0.1;

  const delayedPension =
    selectedPension * additionalGrowth + additionalContributions;
  const percentageIncrease = Math.round(
    ((delayedPension - selectedPension) / selectedPension) * 100
  );

  return Math.max(5, Math.min(25, percentageIncrease)); // ograniczenie 5-25%
});

// 6. Benchmark regionalny
export const regionalBenchmarkAtom = atom<RegionalBenchmarkData[]>((get) => {
  const includeSickLeave = get(includeSickLeaveAtom);
  const userPension = includeSickLeave
    ? get(retirementMonthlyPensionWithSickLeaveAtom) || 0
    : get(retirementMonthlyPensionAtom) || 0;
  const selectedCity = get(inputCityAtom);

  // Wybierz 5 największych regionów (na podstawie danych)
  const topRegions = [
    { name: 'Mazowieckie', avgPension: 3500 },
    { name: 'Śląskie', avgPension: 3200 },
    { name: 'Wielkopolskie', avgPension: 3000 },
    { name: 'Małopolskie', avgPension: 3100 },
    { name: 'Dolnośląskie', avgPension: 2900 },
  ];

  // Mapuj miasta na regiony
  const cityToRegion: Record<string, string> = {
    Warszawa: 'Mazowieckie',
    Kraków: 'Małopolskie',
    Wrocław: 'Dolnośląskie',
    Poznań: 'Wielkopolskie',
    Katowice: 'Śląskie',
    Gdańsk: 'Pomorskie',
    Szczecin: 'Zachodniopomorskie',
    Białystok: 'Podlaskie',
    Lublin: 'Lubelskie',
    Rzeszów: 'Podkarpackie',
  };

  const userRegion = selectedCity
    ? cityToRegion[selectedCity] || 'Mazowieckie'
    : 'Mazowieckie';

  return topRegions.map((region) => ({
    region: region.name,
    average: region.avgPension,
    user: roundCurrency(userPension),
    isSelected: region.name === userRegion,
  }));
});

// 7. Indeks Realnej Emerytury (uproszczona implementacja)
export const realPensionIndexAtom = atom((get) => {
  const projection = get(retirementComputationAtom);

  if (!projection) {
    return { breadLoaves: 0, cpiBasket: 0 };
  }

  const includeSickLeave = get(includeSickLeaveAtom);

  if (!projection) {
    return { breadLoaves: 0, cpiBasket: 0 };
  }

  const baseCapital = includeSickLeave
    ? projection.capitalWithSickLeave
    : projection.capital;
  const monthlyPension = computeMonthlyPension(
    baseCapital,
    projection.lifeExpectancyYears
  );

  // Uproszczone obliczenia na podstawie dostępnych danych
  // Cena chleba: ~3.50 zł (przybliżona cena w 2024)
  // Koszyk CPI: ~2000 zł (przybliżona wartość w 2024)

  const breadPrice = 3.5; // zł za bochenek
  const cpiBasketValue = 2000; // zł

  const breadLoaves = Math.round(monthlyPension / breadPrice);
  const cpiBaskets = monthlyPension / cpiBasketValue;

  return {
    breadLoaves: breadLoaves,
    cpiBasket: Math.round(cpiBaskets * 100) / 100, // Zaokrąglij do 2 miejsc po przecinku
  };
});

// 8. Średnia emerytura w Polsce (dla porównania)
export const averagePensionAtom = atom((get) => {
  const inputs = get(retirementInputsAtom);
  if (!inputs.gender) {
    return 0;
  }

  // Średnia emerytura w Polsce w 2024/2025 (dane GUS/ZUS)
  const baseAverage = 2800; // Średnia emerytura w Polsce

  // Dostosowanie do płci (kobiety mają średnio niższe emerytury)
  const genderMultiplier = inputs.gender === 'female' ? 0.85 : 1.0;

  return Math.round(baseAverage * genderMultiplier);
});

// 9. Średnia długość życia (dla tooltipu IRE)
export const lifeExpectancyInfoAtom = atom((get) => {
  const projection = get(retirementComputationAtom);
  if (!projection) {
    return { years: 0, months: 0 };
  }

  const years = Math.floor(projection.lifeExpectancyYears);
  const months = Math.round((projection.lifeExpectancyYears - years) * 12);

  return { years, months };
});

// 11. Porównanie z oczekiwaną emeryturą
export const expectedPensionComparisonAtom = atom((get) => {
  const inputs = get(retirementInputsAtom);
  const projection = get(retirementComputationAtom);
  const includeSickLeave = get(includeSickLeaveAtom);

  if (!projection || !inputs.expectedPension) {
    return null;
  }

  const currentPension = includeSickLeave
    ? get(retirementMonthlyPensionWithSickLeaveAtom) || 0
    : get(retirementMonthlyPensionAtom) || 0;

  const difference = currentPension - inputs.expectedPension;
  const yearsToWork =
    difference < 0
      ? Math.ceil(Math.abs(difference) / (currentPension * 0.05))
      : 0; // Zakładamy 5% wzrost rocznie

  return {
    expected: inputs.expectedPension,
    current: currentPension,
    difference: roundCurrency(difference),
    yearsToWork: yearsToWork,
  };
});

// 10. Dane o opóźnieniach przejścia na emeryturę
export const retirementDelayDataAtom = atom((get) => {
  const gender = get(inputGenderAtom);

  // Pobierz dane z opoznienie_przejscia_all_sheets.json
  const delayData = opoznienieData.Dane.rows;

  // Zwróć dane dla odpowiedniej płci (przykładowe mapowanie)
  const genderKey = gender === 'female' ? '77.7' : '64.5';

  return {
    exactAge: delayData[0][genderKey] || 77.7,
    delay1to11Months: delayData[1][genderKey] || 15.6,
    delay12to23Months: delayData[2][genderKey] || 3.0,
    delay2YearsPlus: delayData[3][genderKey] || 3.6,
  };
});

// 9. Dane o absencji chorobowej według regionów
export const sickLeaveRegionalDataAtom = atom((get) => {
  const gender = get(inputGenderAtom);

  // Pobierz dane z absencja_chorobowa_all_sheets.json
  const absencjaRows =
    absencjaChorobowaData['Zwolnienia_Lekarskie_Polska'].rows;

  // Zwróć średnie dane dla Polski
  const avgSickLeave = gender === 'female' ? 38.12 : 32.81;

  return {
    averageDays: avgSickLeave,
    regionalData: absencjaRows.slice(0, 10).map((row: any) => ({
      region: row['powiat aleksandrowski'],
      days: gender === 'female' ? row['38.12'] : row['32.81'],
    })),
  };
});

export interface ReportEventPayload {
  expectedPension: number | null;
  age: number | null;
  gender: string | null;
  salary: number | null;
  includesSicknessPeriods: boolean;
  zusBalance: number | null;
  actualPension: number | null;
  adjustedPension: number | null;
  postalCode: string | null;
}

// Atom danych raportowania zainteresowania (payload zdarzenia)
export const reportEventPayloadAtom = atom<ReportEventPayload>((get) => {
  const inputs = get(retirementInputsAtom);
  const includesSicknessPeriods = Boolean(get(includeSickLeaveAtom));
  const actualPension = get(selectedScenarioPensionAtom);
  const adjustedPension = get(selectedScenarioRealPensionAtom);
  const postalCode = get(inputPostalCodeAtom);

  const sanitizeNumber = (value: number | null | undefined): number | null =>
    typeof value === 'number' && Number.isFinite(value) ? value : null;

  const sanitizeString = (value: string | null | undefined): string | null => {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed.toUpperCase() : null;
  };

  const mapGenderToLabel = (gender: Gender | null): string | null => {
    if (gender === 'female') {
      return 'kobieta';
    }
    if (gender === 'male') {
      return 'mężczyzna';
    }
    return null;
  };

  return {
    age: sanitizeNumber(inputs.age),
    gender: mapGenderToLabel(inputs.gender),
    salary: sanitizeNumber(inputs.grossMonthlySalary),
    includesSicknessPeriods,
    zusBalance: sanitizeNumber(inputs.zusAccountBalance),
    actualPension: sanitizeNumber(actualPension),
    expectedPension: sanitizeNumber(actualPension),
    adjustedPension: sanitizeNumber(adjustedPension),
    postalCode: sanitizeString(postalCode),
  };
});
