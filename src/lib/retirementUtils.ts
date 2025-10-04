// Import danych z parametry_III_2025_all_sheets.json
import parametryData from './data/parametry_III_2025_all_sheets.json';

// Narzędzia do obliczeń emerytalnych oparte na danych FUS (llm/data.pdf) i GUS.

export type Gender = 'female' | 'male';

export type RetirementInputsState = {
  age: number | null;
  gender: Gender | null;
  city: string | null;
  grossMonthlySalary: number | null;
  workStartYear: number | null;
  plannedRetirementYear: number | null;
  zusAccountBalance: number | null;
};

// Funkcja do pobierania wskaźnika nominalnego wzrostu płac z danych
const getRealWageGrowthFromData = (year: number): number => {
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
    // Nominalny wzrost = realny wzrost * inflacja
    return realGrowth * inflation;
  }
  return 1.0; // Domyślnie brak wzrostu
};

// Funkcja do pobierania stopy składki z danych
const getContributionRateFromData = (year: number): number => {
  const yearIndex = year - 2014;
  if (
    yearIndex >= 0 &&
    yearIndex < parametryData['parametry roczne'].rows.length
  ) {
    const parametry = parametryData['parametry roczne'].rows[yearIndex];
    const employeeRate =
      parametry?.[
        'stopa składki na ubezpieczenie emerytalne finansowanej przez pracownika'
      ] || 0;
    const employerRate =
      parametry?.[
        'stopa składki na ubezpieczenie emerytalne finansowanej przez pracodawcę'
      ] || 0;
    return employeeRate + employerRate;
  }
  return 0.1952; // Domyślnie 19.52% (9.76% + 9.76%)
};

// Średnia liczba dni absencji chorobowej na osobę (ZUS „Absencja chorobowa w 2022 r.”).
const SICK_LEAVE_DAYS_BY_GENDER: Record<Gender, number> = {
  female: 23.1,
  male: 13.8,
};

const WORKING_DAYS_PER_YEAR = 252;
const SICK_LEAVE_REPLACEMENT_RATE = 0.8; // Standardowy poziom zasiłku chorobowego.

// Oczekiwana długość trwania życia w ustawowym wieku emerytalnym (GUS, 2022).
const LIFE_EXPECTANCY_AT_RETIREMENT: Record<Gender, number> = {
  female: 23.5,
  male: 17.5,
};

const STATUTORY_RETIREMENT_AGE: Record<Gender, number> = {
  female: 60,
  male: 65,
};

export const getRealWageGrowthFactor = getRealWageGrowthFromData;
export const getContributionRate = getContributionRateFromData;

export const getSickLeavePenalty = (gender: Gender) => {
  const days = SICK_LEAVE_DAYS_BY_GENDER[gender] ?? 0;
  const shareOfYear = Math.min(Math.max(days / WORKING_DAYS_PER_YEAR, 0), 1);
  return shareOfYear * (1 - SICK_LEAVE_REPLACEMENT_RATE);
};

export const getAdjustedLifeExpectancy = (
  gender: Gender,
  retirementAge: number
) => {
  const baseExpectancy = LIFE_EXPECTANCY_AT_RETIREMENT[gender];
  const statutoryAge = STATUTORY_RETIREMENT_AGE[gender];

  if (!Number.isFinite(baseExpectancy) || !Number.isFinite(statutoryAge)) {
    return baseExpectancy;
  }

  const ageDelta = retirementAge - statutoryAge;
  const adjusted = baseExpectancy - ageDelta;

  return Math.max(1, adjusted);
};

export const roundCurrency = (value: number) => Math.round(value);

export const roundRatio = (value: number) => Number(value.toFixed(3));

export const normalizeInputs = (
  inputs: RetirementInputsState,
  calendarYear = new Date().getFullYear()
) => {
  if (
    inputs.grossMonthlySalary == null ||
    inputs.workStartYear == null ||
    inputs.plannedRetirementYear == null ||
    inputs.age == null ||
    inputs.gender == null
  ) {
    return null;
  }

  if (
    !Number.isFinite(inputs.grossMonthlySalary) ||
    inputs.grossMonthlySalary <= 0 ||
    !Number.isFinite(inputs.workStartYear) ||
    !Number.isFinite(inputs.plannedRetirementYear)
  ) {
    return null;
  }

  const birthYear = calendarYear - inputs.age;
  const retirementAge = inputs.plannedRetirementYear - birthYear;

  if (!Number.isFinite(retirementAge) || retirementAge <= 0) {
    return null;
  }

  return {
    grossMonthlySalary: inputs.grossMonthlySalary,
    workStartYear: Math.trunc(inputs.workStartYear),
    plannedRetirementYear: Math.trunc(inputs.plannedRetirementYear),
    zusAccountBalance: Math.max(0, inputs.zusAccountBalance ?? 0),
    gender: inputs.gender,
    retirementAge,
  } satisfies NormalizedInputs;
};

export type NormalizedInputs = {
  grossMonthlySalary: number;
  workStartYear: number;
  plannedRetirementYear: number;
  zusAccountBalance: number;
  gender: Gender;
  retirementAge: number;
};

export const projectContributions = (
  inputs: NormalizedInputs,
  calendarYear = new Date().getFullYear()
) => {
  const projectionStartYear = inputs.workStartYear;
  const projectionEndYear = inputs.plannedRetirementYear;

  let monthlySalary = inputs.grossMonthlySalary;

  // Skoryguj wynagrodzenie do roku rozpoczęcia pracy
  if (projectionStartYear < calendarYear) {
    // Osoba już pracuje - skoryguj wynagrodzenie wstecz
    for (let year = calendarYear - 1; year >= projectionStartYear; year -= 1) {
      const growthFactor = getRealWageGrowthFactor(year + 1);
      if (growthFactor > 0) {
        monthlySalary /= growthFactor;
      }
    }
  } else if (projectionStartYear > calendarYear) {
    // Osoba zacznie pracować w przyszłości - skoryguj wynagrodzenie do przodu
    for (let year = calendarYear + 1; year <= projectionStartYear; year += 1) {
      const growthFactor = getRealWageGrowthFactor(year);
      if (growthFactor > 0) {
        monthlySalary *= growthFactor;
      }
    }
  }

  let contributionsSum = 0;
  let monthlySalaryInFinalYear = monthlySalary;

  if (projectionEndYear > projectionStartYear) {
    for (let year = projectionStartYear; year < projectionEndYear; year += 1) {
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
};

export type ContributionProjection = {
  contributionsSum: number;
  monthlySalaryInFinalYear: number;
};

export type RetirementProjection = {
  capital: number;
  capitalWithSickLeave: number;
  finalMonthlySalary: number;
  lifeExpectancyYears: number;
};

export const computeMonthlyPension = (
  capital: number,
  lifeExpectancyYears: number
) => {
  if (lifeExpectancyYears <= 0) {
    return 0;
  }
  return capital / (lifeExpectancyYears * 12);
};
