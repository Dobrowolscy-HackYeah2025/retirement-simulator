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
    // Ale realny wzrost już uwzględnia inflację, więc używamy go bezpośrednio
    return realGrowth;
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

// Średnia liczba dni absencji chorobowej na osobę rocznie (dane ZUS 2024/2025)
const SICK_LEAVE_DAYS_BY_GENDER: Record<Gender, number> = {
  female: 12.33, // Kobiety: średnia z danych ZUS dla Polski
  male: 11.28, // Mężczyźni: średnia z danych ZUS dla Polski
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

export const getSickLeavePenalty = (gender: Gender, yearsOfWork: number) => {
  const days = SICK_LEAVE_DAYS_BY_GENDER[gender] ?? 0;
  const shareOfYear = Math.min(Math.max(days / WORKING_DAYS_PER_YEAR, 0), 1);

  // ZUS nie odprowadza składek emerytalnych podczas L4
  // Wpływ na emeryturę = brak składek przez czas absencji
  // Wzór: udział_absencji_w_roku * współczynnik_składek * współczynnik_czasu
  const contributionRate = 0.1952; // 19.52% składki emerytalne
  const timeFactor = Math.min(yearsOfWork / 45, 1); // Maksymalnie 45 lat
  const penalty = shareOfYear * contributionRate * timeFactor;

  // Ograniczenie do realistycznego poziomu (maksymalnie 5% redukcji)
  return Math.min(penalty, 0.05);
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

  // Długość życia maleje wolniej z wiekiem przejścia na emeryturę
  // Wzór: baseExpectancy - (ageDelta * 0.3)
  // To daje bardziej realistyczne wartości
  const ageDelta = retirementAge - statutoryAge;
  const adjusted = baseExpectancy - ageDelta * 0.3;

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
