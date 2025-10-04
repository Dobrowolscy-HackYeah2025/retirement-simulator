// Narzędzia do obliczeń emerytalnych oparte na danych FUS (llm/data.pdf) i GUS.

export type Gender = 'female' | 'male';

export type RetirementInputsState = {
  age: number | null;
  gender: Gender;
  grossMonthlySalary: number | null;
  workStartYear: number | null;
  plannedRetirementYear: number | null;
  zusAccountBalance: number | null;
};

// Źródło: llm/data.pdf (Tabela 1.1, wariant nr 1) — wskaźniki realnego wzrostu płac.
const REAL_WAGE_GROWTH_VARIANT_1: Record<number, number> = {
  2022: 0.98,
  2023: 1.003,
  2024: 1.034,
  2025: 1.037,
  2026: 1.035,
  2027: 1.03,
  2028: 1.029,
  2029: 1.029,
  2030: 1.029,
  2031: 1.029,
  2032: 1.029,
  2035: 1.028,
  2040: 1.027,
  2045: 1.026,
  2050: 1.025,
  2055: 1.024,
  2060: 1.024,
  2065: 1.023,
  2070: 1.022,
  2075: 1.021,
  2080: 1.02,
};

// Źródło: llm/data.pdf (Tabela 8, wariant nr 1) — udział wpływów składkowych w podstawie.
const CONTRIBUTION_RATE_VARIANT_1: Record<number, number> = {
  2023: 0.1923,
  2024: 0.1924,
  2025: 0.1925,
  2026: 0.1929,
  2027: 0.1933,
  2028: 0.1938,
  2029: 0.1943,
  2030: 0.1948,
  2031: 0.1953,
  2032: 0.1957,
  2035: 0.1967,
  2040: 0.1964,
  2045: 0.194,
  2050: 0.1912,
  2055: 0.1899,
  2060: 0.1897,
  2065: 0.1897,
  2070: 0.1897,
  2075: 0.1897,
  2080: 0.1897,
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

const createYearLookup = (table: Record<number, number>) => {
  const sortedYears = Object.keys(table)
    .map(Number)
    .sort((a, b) => a - b);

  return (year: number) => {
    if (!Number.isFinite(year) || sortedYears.length === 0) {
      return 0;
    }

    let currentValue = table[sortedYears[0]];

    for (const y of sortedYears) {
      if (year < y) {
        return currentValue;
      }
      currentValue = table[y];
    }

    return currentValue;
  };
};

export const getRealWageGrowthFactor = createYearLookup(REAL_WAGE_GROWTH_VARIANT_1);
export const getContributionRate = createYearLookup(CONTRIBUTION_RATE_VARIANT_1);

export const getSickLeavePenalty = (gender: Gender) => {
  const days = SICK_LEAVE_DAYS_BY_GENDER[gender] ?? 0;
  const shareOfYear = Math.min(Math.max(days / WORKING_DAYS_PER_YEAR, 0), 1);
  return shareOfYear * (1 - SICK_LEAVE_REPLACEMENT_RATE);
};

export const getAdjustedLifeExpectancy = (gender: Gender, retirementAge: number) => {
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
  calendarYear = new Date().getFullYear(),
) => {
  if (
    inputs.grossMonthlySalary == null ||
    inputs.workStartYear == null ||
    inputs.plannedRetirementYear == null ||
    inputs.age == null
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
  calendarYear = new Date().getFullYear(),
) => {
  const projectionStartYear = Math.max(calendarYear, inputs.workStartYear);
  const projectionEndYear = inputs.plannedRetirementYear;

  let monthlySalary = inputs.grossMonthlySalary;

  if (projectionStartYear > calendarYear) {
    for (let year = calendarYear + 1; year <= projectionStartYear; year += 1) {
      monthlySalary *= getRealWageGrowthFactor(year);
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

export const computeMonthlyPension = (capital: number, lifeExpectancyYears: number) => {
  if (lifeExpectancyYears <= 0) {
    return 0;
  }
  return capital / (lifeExpectancyYears * 12);
};

