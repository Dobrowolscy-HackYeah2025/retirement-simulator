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
  expectedPension: number | null; // Oczekiwana emerytura użytkownika
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

// Średnia liczba dni absencji chorobowej na osobę (ZUS 2024/2025 - zaktualizowane dane).
const SICK_LEAVE_DAYS_BY_GENDER: Record<Gender, number> = {
  female: 24.2, // Kobiety: wzrost z 23.1 (2022) do 24.2 (2024/2025)
  male: 14.5,   // Mężczyźni: wzrost z 13.8 (2022) do 14.5 (2024/2025)
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

export const computeMonthlyPension = (
  capital: number,
  lifeExpectancyYears: number
) => {
  if (lifeExpectancyYears <= 0) {
    return 0;
  }
  return capital / (lifeExpectancyYears * 12);
};
