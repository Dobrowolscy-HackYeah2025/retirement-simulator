import { KpiRows } from '@/components/dashboard/KpiRows';

import { Suspense, useEffect, useRef, useState } from 'react';

import Highcharts from 'highcharts';
import { useAtom, useAtomValue } from 'jotai';
import { Info, Stethoscope } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../components/ui/tooltip';
import {
  averagePensionAtom,
  contributionHistoryAtom,
  dashboardSummaryAtom,
  expectedPensionComparisonAtom,
  includeSickLeaveAtom,
  inputCityAtom,
  inputGrossMonthlySalaryAtom,
  lifeExpectancyInfoAtom,
  pensionForecastDataAtom,
  purchasingPowerPercentageAtom,
  realPensionIndexAtom,
  regionalBenchmarkAtom,
  replacementRateAtom,
  retirementAgeAtom,
  retirementDelayBenefitAtom,
  retirementInputsAtom,
  scenariosDataAtom,
  selectedScenarioAtom,
  selectedScenarioPensionAtom,
  selectedScenarioRealPensionAtom,
  sickLeaveImpactAtom,
} from '../lib/atoms';

// ZUS Brand Colors - głównie zielone (rzeczywiste wartości dla Highcharts)
const zusColors = {
  primary: '#00993f', // główny zielony ZUS
  green: 'rgb(0, 153, 63)', // zielony ZUS
  greenLight: '#bad4c4', // jasny zielony
  greenDark: '#084f25', // ciemny zielony
  orange: 'rgb(255, 179, 79)',
  gray: 'rgb(190, 195, 206)',
  blue: 'rgb(63, 132, 210)',
  darkBlue: 'rgb(0, 65, 110)',
  red: 'rgb(240, 94, 94)',
  black: 'rgb(0, 0, 0)',
};

// Usunięto sampleData - teraz używamy derived atomów

function DashboardSummaryFallback() {
  return (
    <section className="mb-8 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-6 shadow-md">
      <h2 className="text-lg font-semibold text-[var(--color-primary)]">
        Podsumowanie w przygotowaniu
      </h2>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Ładujemy najważniejsze informacje o Twojej emeryturze.
      </p>
    </section>
  );
}

function DashboardSummarySection() {
  const summaryData = useAtomValue(dashboardSummaryAtom);
  const summaryText = summaryData.summary?.trim();
  const content =
    summaryText && summaryText.length > 0
      ? summaryText
      : 'Brak dostępnego podsumowania w tej chwili. Spróbuj ponownie później.';

  return (
    <section className="mb-8 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
          <Stethoscope className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">
            Podsumowanie agenta
          </h2>
          <p className="mt-2 text-base leading-relaxed text-[var(--foreground)]">
            {content}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const [retirementAge, setRetirementAge] = useAtom(retirementAgeAtom);
  const [salary, setSalary] = useAtom(inputGrossMonthlySalaryAtom);
  const [includeSickLeave, setIncludeSickLeave] = useAtom(includeSickLeaveAtom);
  const [selectedCity, setSelectedCity] = useAtom(inputCityAtom);
  const [selectedScenario, setSelectedScenario] = useAtom(selectedScenarioAtom);

  // Aktualizacja pojedynczych atomów wejściowych
  // Pobierz i zaktualizuj retirementInputsAtom na podstawie ustawień
  const inputs = useAtomValue(retirementInputsAtom);

  // Pobierz dane z derived atomów
  const [pensionForecastData] = useAtom(pensionForecastDataAtom);
  const [replacementRate] = useAtom(replacementRateAtom);
  const [sickLeaveImpact] = useAtom(sickLeaveImpactAtom);
  const [contributionHistory] = useAtom(contributionHistoryAtom);
  const [scenariosData] = useAtom(scenariosDataAtom);
  const [regionalBenchmark] = useAtom(regionalBenchmarkAtom);
  const [realPensionIndex] = useAtom(realPensionIndexAtom);
  const [averagePension] = useAtom(averagePensionAtom);
  const [lifeExpectancyInfo] = useAtom(lifeExpectancyInfoAtom);
  const [expectedComparison] = useAtom(expectedPensionComparisonAtom);
  const [selectedPension] = useAtom(selectedScenarioPensionAtom);
  const [selectedRealPension] = useAtom(selectedScenarioRealPensionAtom);
  const [purchasingPowerPercentage] = useAtom(purchasingPowerPercentageAtom);
  const [retirementDelayBenefit] = useAtom(retirementDelayBenefitAtom);

  // Chart refs
  const pensionForecastRef = useRef<HTMLDivElement>(null);
  const replacementRateRef = useRef<HTMLDivElement>(null);
  const sickLeaveRef = useRef<HTMLDivElement>(null);
  const contributionHistoryRef = useRef<HTMLDivElement>(null);
  const scenariosRef = useRef<HTMLDivElement>(null);
  const regionalBenchmarkRef = useRef<HTMLDivElement>(null);

  // Chart instances
  const [pensionForecastChart, setPensionForecastChart] =
    useState<Highcharts.Chart | null>(null);
  const [replacementRateChart, setReplacementRateChart] =
    useState<Highcharts.Chart | null>(null);
  const [sickLeaveChart, setSickLeaveChart] = useState<Highcharts.Chart | null>(
    null
  );
  const [contributionHistoryChart, setContributionHistoryChart] =
    useState<Highcharts.Chart | null>(null);
  const [scenariosChart, setScenariosChart] = useState<Highcharts.Chart | null>(
    null
  );
  const [regionalBenchmarkChart, setRegionalBenchmarkChart] =
    useState<Highcharts.Chart | null>(null);

  // Aktualizuj plotline na wykresie prognozy emerytury gdy zmienia się retirementAge
  useEffect(() => {
    if (pensionForecastChart) {
      const xAxis = pensionForecastChart.xAxis[0];
      const plotLine = (xAxis as any).plotLinesAndBands.find(
        (pl: any) => pl.id === 'retirement-age-line'
      );

      if (plotLine) {
        // Debug: sprawdź wartości
        console.log('Plotline debug:', {
          retirementAge,
          currentValue: plotLine.options.value,
          newX: xAxis.toPixels(retirementAge),
          currentX: xAxis.toPixels(plotLine.options.value),
        });

        // Zamiast animacji translateX, usuń i dodaj nowy plotline
        pensionForecastChart.xAxis[0].removePlotLine('retirement-age-line');
        pensionForecastChart.xAxis[0].addPlotLine({
          id: 'retirement-age-line',
          value: retirementAge,
          color: zusColors.darkBlue,
          width: 2,
          dashStyle: 'Solid',
          label: {
            text: `Wybrany wiek: ${retirementAge} lat`,
            style: { color: zusColors.darkBlue, fontWeight: 'bold' },
          },
        });
      } else {
        // Dodaj nowy plotline jeśli nie istnieje
        pensionForecastChart.xAxis[0].addPlotLine({
          id: 'retirement-age-line',
          value: retirementAge,
          color: zusColors.darkBlue,
          width: 2,
          dashStyle: 'Solid',
          label: {
            text: `Wybrany wiek: ${retirementAge} lat`,
            style: { color: zusColors.darkBlue, fontWeight: 'bold' },
          },
        });
      }
    }
  }, [retirementAge, pensionForecastChart]);

  // Initialize charts
  useEffect(() => {
    if (pensionForecastRef.current && !pensionForecastChart) {
      const chart = Highcharts.chart(pensionForecastRef.current!, {
        chart: {
          type: 'line',
          backgroundColor: 'transparent',
          style: {
            fontFamily: 'Arial, sans-serif',
          },
        },
        title: {
          text: '',
        },
        xAxis: {
          type: 'linear',
          title: {
            text: 'Wiek przejścia na emeryturę',
            style: { color: zusColors.darkBlue },
          },
          min: 60,
          max: 70,
        },
        yAxis: {
          title: {
            text: 'Kwota emerytury (zł)',
            style: { color: zusColors.darkBlue },
          },
        },
        series: [
          {
            name: 'Kwota emerytury',
            type: 'line',
            data: pensionForecastData.map((item) => [item.age, item.amount]),
            color: zusColors.primary,
            marker: {
              radius: 6,
              fillColor: zusColors.primary,
              lineColor: zusColors.primary,
            },
            lineWidth: 3,
          },
          {
            name: 'Emerytura realna',
            type: 'line',
            data: pensionForecastData.map((item) => [
              item.age,
              item.realAmount,
            ]),
            color: zusColors.green,
            marker: {
              radius: 6,
              fillColor: zusColors.green,
              lineColor: zusColors.green,
            },
            lineWidth: 3,
          },
        ],
        legend: {
          enabled: true,
          itemStyle: { color: zusColors.darkBlue },
        },
        tooltip: {
          pointFormat: '<b>{series.name}</b>: {point.y} zł',
        },
      });
      setPensionForecastChart(chart);
    }

    if (replacementRateRef.current && !replacementRateChart) {
      const chart = Highcharts.chart(replacementRateRef.current!, {
        chart: {
          type: 'pie',
          backgroundColor: 'transparent',
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
        },
        title: {
          text: '',
        },
        tooltip: {
          enabled: false, // Wyłączamy tooltips jak prosiłeś
        },
        plotOptions: {
          pie: {
            allowPointSelect: false,
            cursor: 'default',
            dataLabels: {
              enabled: true,
              format: '{point.name}<br/><b>{point.y}%</b>',
              style: {
                color: zusColors.darkBlue,
                fontWeight: 'bold',
                fontSize: '14px',
                textOutline: 'none',
              },
              distance: 20,
            },
            showInLegend: false,
            borderWidth: 0,
            innerSize: '40%',
            size: '80%',
          },
        },
        series: [
          {
            name: 'Stopa zastąpienia',
            type: 'pie',
            data: [
              {
                name: 'Emerytura',
                y: replacementRate,
                color: zusColors.primary,
              },
              {
                name: 'Różnica',
                y: 100 - replacementRate,
                color: zusColors.greenLight,
              },
            ],
          },
        ],
        credits: {
          enabled: false,
        },
      });
      setReplacementRateChart(chart);
    }

    if (sickLeaveRef.current && !sickLeaveChart) {
      const chart = Highcharts.chart(sickLeaveRef.current!, {
        chart: {
          type: 'column',
          backgroundColor: 'transparent',
        },
        title: {
          text: '',
        },
        xAxis: {
          categories: ['Z L4', 'Bez L4'],
        },
        yAxis: {
          title: {
            text: 'Kwota emerytury (zł)',
            style: { color: zusColors.darkBlue },
          },
        },
        series: [
          {
            name: 'Wysokość emerytury',
            type: 'column',
            data: [
              { y: sickLeaveImpact.withSickLeave, color: zusColors.greenDark },
              { y: sickLeaveImpact.withoutSickLeave, color: zusColors.primary },
            ],
            dataLabels: {
              enabled: true,
              format: '{y} zł',
              style: { color: zusColors.darkBlue, fontWeight: 'bold' },
            },
            borderWidth: 0,
            borderRadius: 4,
          },
        ],
        legend: {
          enabled: false,
        },
      });
      setSickLeaveChart(chart);
    }

    if (contributionHistoryRef.current && !contributionHistoryChart) {
      const chart = Highcharts.chart(contributionHistoryRef.current!, {
        chart: {
          type: 'column',
          backgroundColor: 'transparent',
        },
        title: {
          text: '',
        },
        xAxis: {
          categories: contributionHistory.map((item) => item.year.toString()),
        },
        yAxis: [
          {
            title: {
              text: 'Składki (zł)',
              style: { color: zusColors.darkBlue },
            },
          },
          {
            title: {
              text: 'Kapitał (zł)',
              style: { color: zusColors.darkBlue },
            },
            opposite: true,
          },
        ],
        series: [
          {
            name: 'Składki roczne',
            type: 'column',
            data: contributionHistory.map((item) => item.contributions),
            color: zusColors.greenLight,
            yAxis: 0,
            borderWidth: 0,
            borderRadius: 4,
          },
          {
            name: 'Kapitał narastający',
            type: 'line',
            data: contributionHistory.map((item) => item.capital),
            color: zusColors.primary,
            yAxis: 1,
            marker: {
              radius: 4,
              fillColor: zusColors.primary,
              lineColor: zusColors.primary,
            },
            lineWidth: 3,
          },
        ],
        legend: {
          enabled: true,
          itemStyle: { color: zusColors.darkBlue },
        },
      });
      setContributionHistoryChart(chart);
    }

    if (scenariosRef.current && !scenariosChart) {
      const chart = Highcharts.chart(scenariosRef.current!, {
        chart: {
          type: 'column',
          backgroundColor: 'transparent',
        },
        title: {
          text: '',
        },
        xAxis: {
          categories: ['Pesymistyczny', 'Realistyczny', 'Optymistyczny'],
        },
        yAxis: {
          title: {
            text: 'Kwota emerytury (zł)',
            style: { color: zusColors.darkBlue },
          },
        },
        series: [
          {
            name: 'Prognozowana emerytura',
            type: 'column',
            data: [
              { y: scenariosData.pessimistic, color: zusColors.greenDark },
              { y: scenariosData.realistic, color: zusColors.primary },
              { y: scenariosData.optimistic, color: zusColors.green },
            ],
            dataLabels: {
              enabled: true,
              format: '{y} zł',
              style: { color: zusColors.darkBlue, fontWeight: 'bold' },
            },
            borderWidth: 0,
            borderRadius: 4,
          },
        ],
        legend: {
          enabled: false,
        },
      });
      setScenariosChart(chart);
    }

    if (regionalBenchmarkRef.current && !regionalBenchmarkChart) {
      const chart = Highcharts.chart(regionalBenchmarkRef.current!, {
        chart: {
          type: 'column',
          backgroundColor: 'transparent',
        },
        title: {
          text: '',
        },
        xAxis: {
          categories: regionalBenchmark.map((item) => item.region),
        },
        yAxis: {
          title: {
            text: 'Kwota emerytury (zł)',
            style: { color: zusColors.darkBlue },
          },
        },
        series: [
          {
            name: 'Średnia w regionie',
            type: 'column',
            data: regionalBenchmark.map((item) => ({
              y: item.average,
              color: item.isSelected ? zusColors.primary : zusColors.greenLight,
            })),
            borderWidth: 0,
            borderRadius: 4,
          },
          {
            name: 'Twoja prognoza',
            type: 'column',
            data: regionalBenchmark.map((item) => ({
              y: item.user,
              color: item.isSelected ? zusColors.greenDark : zusColors.gray,
            })),
            color: zusColors.primary,
            borderWidth: 0,
            borderRadius: 4,
          },
        ],
        legend: {
          enabled: true,
          itemStyle: { color: zusColors.darkBlue },
        },
      });
      setRegionalBenchmarkChart(chart);
    }
  }, []);

  // Update charts when data changes
  useEffect(() => {
    if (pensionForecastChart && pensionForecastData.length > 0) {
      pensionForecastChart.series[0].setData(
        pensionForecastData.map((item) => item.amount)
      );
      pensionForecastChart.series[1].setData(
        pensionForecastData.map((item) => item.realAmount)
      );
    }
  }, [pensionForecastData, pensionForecastChart]);

  // Update replacement rate chart when data changes
  useEffect(() => {
    if (replacementRateChart) {
      replacementRateChart.series[0].setData([
        {
          name: 'Emerytura',
          y: replacementRate,
          color: zusColors.primary,
        },
        {
          name: 'Różnica',
          y: 100 - replacementRate,
          color: zusColors.greenLight,
        },
      ]);
    }
  }, [replacementRate, replacementRateChart]);

  useEffect(() => {
    if (sickLeaveChart && sickLeaveImpact) {
      const withSickLeave = includeSickLeave
        ? sickLeaveImpact.withSickLeave
        : sickLeaveImpact.withoutSickLeave;
      const withoutSickLeave = sickLeaveImpact.withoutSickLeave;

      sickLeaveChart.series[0].setData([
        { y: withSickLeave, color: zusColors.greenDark },
        { y: withoutSickLeave, color: zusColors.primary },
      ]);
    }
  }, [includeSickLeave, sickLeaveChart, sickLeaveImpact]);

  // Update contribution history chart when data changes
  useEffect(() => {
    if (contributionHistoryChart && contributionHistory.length > 0) {
      contributionHistoryChart.series[0].setData(
        contributionHistory.map((item) => item.contributions)
      );
      contributionHistoryChart.series[1].setData(
        contributionHistory.map((item) => item.cumulativeCapital)
      );
    }
  }, [contributionHistory, contributionHistoryChart]);

  // Update scenarios chart when data changes
  useEffect(() => {
    if (scenariosChart && scenariosData) {
      scenariosChart.series[0].setData([
        { y: scenariosData.pessimistic, color: zusColors.greenDark },
        { y: scenariosData.realistic, color: zusColors.primary },
        { y: scenariosData.optimistic, color: zusColors.green },
      ]);
    }
  }, [scenariosData, scenariosChart]);

  // Update regional benchmark chart when data changes
  useEffect(() => {
    if (regionalBenchmarkChart && regionalBenchmark.length > 0) {
      regionalBenchmarkChart.series[0].setData(
        regionalBenchmark.map((item) => ({
          y: item.average,
          color: item.isSelected ? zusColors.primary : zusColors.greenLight,
        }))
      );
      regionalBenchmarkChart.series[1].setData(
        regionalBenchmark.map((item) => ({
          y: item.user,
          color: item.isSelected ? zusColors.greenDark : zusColors.gray,
        }))
      );
    }
  }, [regionalBenchmark, regionalBenchmarkChart]);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      [
        pensionForecastChart,
        replacementRateChart,
        sickLeaveChart,
        contributionHistoryChart,
        scenariosChart,
        regionalBenchmarkChart,
      ].forEach((chart) => {
        if (chart) {
          chart.destroy();
        }
      });
    };
  }, [
    pensionForecastChart,
    replacementRateChart,
    sickLeaveChart,
    contributionHistoryChart,
    scenariosChart,
    regionalBenchmarkChart,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto px-8">
        {/* Top KPI Row */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Twoja prognoza emerytalna
          </h2>
        </div>

        <Suspense fallback={<DashboardSummaryFallback />}>
          <DashboardSummarySection />
        </Suspense>

        <KpiRows
          selectedPension={selectedPension}
          selectedRealPension={selectedRealPension}
          averagePension={averagePension}
          replacementRate={replacementRate}
          purchasingPowerPercentage={purchasingPowerPercentage}
        />

        {/* Old KPI Cards - to be removed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 hidden">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: zusColors.darkBlue }}
            >
              Emerytura rzeczywista
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="text-3xl font-bold cursor-help"
                  style={{ color: zusColors.primary }}
                >
                  {selectedPension.toLocaleString()} zł
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm bg-white text-gray-800 border border-gray-200 shadow-lg">
                <div className="text-sm">
                  <div className="font-semibold mb-2">Emerytura nominalna</div>
                  <div className="mb-2">
                    <strong>Wzór:</strong> Kapitał emerytalny ÷ (Długość życia ×
                    12)
                  </div>
                  <div className="mb-2">
                    <strong>Kapitał:</strong> Stan konta ZUS + Składki przez
                    całe życie
                  </div>
                  <div className="mb-2">
                    <strong>Długość życia:</strong> {lifeExpectancyInfo.years}{' '}
                    lat {lifeExpectancyInfo.months} miesięcy
                  </div>
                  <div className="text-xs text-gray-500">
                    * Wartość w cenach z roku przejścia na emeryturę
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
            <div className="mt-2 text-sm text-gray-600">
              vs średnia: {averagePension.toLocaleString()} zł
              <span
                className={`ml-2 font-semibold ${selectedPension > averagePension ? 'text-green-600' : 'text-red-600'}`}
              >
                ({selectedPension > averagePension ? '+' : ''}
                {Math.round(
                  ((selectedPension - averagePension) / averagePension) * 100
                )}
                %)
              </span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3
                className="text-lg font-semibold"
                style={{ color: zusColors.darkBlue }}
              >
                Emerytura urealniona
              </h3>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-600 hover:text-[var(--zus-green)] cursor-help transition-colors" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-white text-gray-800 border border-gray-200 shadow-lg text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-80">
                  <div className="text-left">
                    <div className="font-semibold mb-2">
                      Emerytura urealniona
                    </div>
                    <div className="text-xs space-y-2">
                      <div>• To co faktycznie możesz kupić za emeryturę</div>
                      <div>
                        • Uwzględnia inflację do momentu przejścia na emeryturę
                      </div>
                      <div>• Pokazuje realną siłę nabywczą</div>
                      <div className="border-t border-gray-600 pt-2 mt-2">
                        <div className="font-medium mb-1">Przykład:</div>
                        <div>
                          5000 zł nominalnie ={' '}
                          {selectedRealPension.toLocaleString()} zł realnie
                        </div>
                        <div>
                          Za{' '}
                          {new Date().getFullYear() +
                            (inputs?.plannedRetirementYear || 2065) -
                            new Date().getFullYear()}{' '}
                          lat za te same pieniądze kupisz mniej
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="text-3xl font-bold cursor-help"
                  style={{ color: zusColors.green }}
                >
                  {selectedRealPension.toLocaleString()} zł
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm bg-white text-gray-800 border border-gray-200 shadow-lg">
                <div className="text-sm">
                  <div className="font-semibold mb-2">Emerytura urealniona</div>
                  <div className="mb-2">
                    <strong>Wzór:</strong> Emerytura nominalna ÷ Wskaźnik
                    inflacji
                  </div>
                  <div className="mb-2">
                    <strong>Inflacja:</strong> Rzeczywiste dane ZUS 2025-
                    {inputs.plannedRetirementYear}
                  </div>
                  <div className="mb-2">
                    <strong>Średnia inflacja:</strong> ~2.5% rocznie (prognoza
                    ZUS)
                  </div>
                  <div className="text-xs text-gray-500">
                    * Wartość w cenach z 2025 roku (siła nabywcza)
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
            <div className="mt-2 text-sm text-gray-600">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    siła nabywcza po inflacji
                    <span className="ml-2 font-semibold text-[var(--zus-green)]">
                      ({purchasingPowerPercentage}% nominalnej)
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm bg-white text-gray-800 border border-gray-200 shadow-lg">
                  <div className="text-sm">
                    <div className="font-semibold mb-2">Siła nabywcza</div>
                    <div className="mb-2">
                      <strong>Wzór:</strong> (Emerytura realna ÷ Emerytura
                      nominalna) × 100%
                    </div>
                    <div className="mb-2">
                      <strong>Oznacza:</strong> Jaki procent siły nabywczej
                      zachowasz po inflacji
                    </div>
                    <div className="text-xs text-gray-500">
                      * Im wyższy %, tym lepiej dla Twojej emerytury
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: zusColors.darkBlue }}
            >
              Stopa zastąpienia
            </h3>
            <div
              className="text-3xl font-bold"
              style={{ color: zusColors.greenDark }}
            >
              {replacementRate}%
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Średni czas pobierania świadczenia:{' '}
              <span className="font-semibold text-[var(--zus-green)]">
                {lifeExpectancyInfo.years},{lifeExpectancyInfo.months} roku
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pension Forecast Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="mb-4">
                  <h3
                    className="text-lg font-semibold mb-1"
                    style={{ color: zusColors.darkBlue }}
                  >
                    Prognoza emerytury vs wiek przejścia
                  </h3>
                  <p className="text-sm text-gray-600">
                    Wpływ wieku przejścia na emeryturę na wysokość świadczenia
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-600 hover:text-[var(--zus-green)] cursor-help transition-colors" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white text-gray-800 border border-gray-200 shadow-lg text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-96">
                      <div className="text-left">
                        <div className="font-semibold mb-2">
                          Emerytura nominalna vs realna
                        </div>
                        <div className="space-y-1">
                          <div>
                            <div className="font-medium text-green-400">
                              Nominalna:
                            </div>
                            <div>Kwota w złotych na koncie</div>
                          </div>
                          <div>
                            <div className="font-medium text-blue-400">
                              Realna:
                            </div>
                            <div>Siła nabywcza po uwzględnieniu inflacji</div>
                          </div>
                          <div className="border-t border-gray-600 pt-2 mt-2">
                            <div className="text-gray-300 text-xs">
                              <div className="font-medium mb-1">Przykład:</div>
                              <div>5000 zł nominalnie = ~4200 zł realnie</div>
                              <div>
                                Za 5 lat za te same pieniądze kupisz mniej
                              </div>
                              <div className="mt-1 text-yellow-300">
                                Średnia inflacja: 3.5% rocznie
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div ref={pensionForecastRef} style={{ height: '400px' }}></div>

              {/* Analiza ekspercka */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-l-4 border-[var(--zus-green)]">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">
                      Analiza Twojej sytuacji emerytalnej
                    </div>
                    <div className="text-sm text-gray-700">
                      Przy obecnych założeniach Twoja emerytura realnie pozwoli
                      utrzymać{' '}
                      <span className="font-semibold text-[var(--zus-green)]">
                        {purchasingPowerPercentage}%
                      </span>{' '}
                      obecnej siły nabywczej. Największy wpływ na wysokość
                      świadczenia ma wiek przejścia na emeryturę — przesunięcie
                      decyzji o 2 lata zwiększa emeryturę o{' '}
                      <span className="font-semibold text-[var(--zus-green)]">
                        +{retirementDelayBenefit}%
                      </span>
                      .
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scenarios Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: zusColors.darkBlue }}
                >
                  Scenariusze "co-jeśli"
                </h3>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-600 hover:text-[var(--zus-green)] cursor-help transition-colors" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white text-gray-800 border border-gray-200 shadow-lg text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-80">
                    <div className="text-left">
                      <div className="font-semibold mb-2">
                        Scenariusze emerytalne
                      </div>
                      <div className="space-y-1">
                        <div>
                          <div className="font-medium text-red-400">
                            Pesymistyczny:
                          </div>
                          <div>Spadek płac -2.5%, więcej emerytów</div>
                        </div>
                        <div>
                          <div className="font-medium text-green-400">
                            Realistyczny:
                          </div>
                          <div>Wzrost płac +3.4%, stabilne warunki</div>
                        </div>
                        <div>
                          <div className="font-medium text-blue-400">
                            Optymistyczny:
                          </div>
                          <div>Wzrost płac +4.0%, mniej emerytów</div>
                        </div>
                        <div className="border-t border-gray-600 pt-2 mt-2">
                          <div className="text-gray-300 text-xs">
                            <div className="font-medium mb-1">
                              Przykład różnic:
                            </div>
                            <div>Realistyczny: 4000 zł (bazowa)</div>
                            <div>Pesymistyczny: 3400 zł (-15%)</div>
                            <div>Optymistyczny: 4400 zł (+10%)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <div ref={scenariosRef} style={{ height: '400px' }}></div>
            </div>

            {/* Contribution History Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: zusColors.darkBlue }}
                >
                  Historia składek emerytalnych
                </h3>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-600 hover:text-[var(--zus-green)] cursor-help transition-colors" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white text-gray-800 border border-gray-200 shadow-lg text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-88">
                    <div className="text-left">
                      <div className="font-semibold mb-2">
                        Historia składek emerytalnych
                      </div>
                      <div className="space-y-1">
                        <div>
                          <div className="font-medium text-green-400">
                            Składki roczne:
                          </div>
                          <div>Ile wpłacasz do ZUS każdego roku</div>
                        </div>
                        <div>
                          <div className="font-medium text-blue-400">
                            Kapitał skumulowany:
                          </div>
                          <div>Łączna kwota na koncie emerytalnym</div>
                        </div>
                        <div className="border-t border-gray-600 pt-2 mt-2">
                          <div className="text-gray-300 text-xs">
                            <div className="font-medium mb-1">Przykład:</div>
                            <div>Rok 1: 5000 zł składki</div>
                            <div>Rok 5: 6000 zł składki (+20%)</div>
                            <div>Kapitał: 55,000 zł łącznie</div>
                            <div className="mt-1 text-yellow-300">
                              Składki rosną z podwyżkami
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <div
                ref={contributionHistoryRef}
                style={{ height: '400px' }}
              ></div>
            </div>

            {/* Regional Benchmark Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: zusColors.darkBlue }}
                >
                  Porównanie z innymi regionami
                </h3>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-600 hover:text-[var(--zus-green)] cursor-help transition-colors" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white text-gray-800 border border-gray-200 shadow-lg text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-88">
                    <div className="text-left">
                      <div className="font-semibold mb-2">
                        Benchmark regionalny
                      </div>
                      <div className="space-y-1">
                        <div>
                          <div className="font-medium text-green-400">
                            Twoja emerytura:
                          </div>
                          <div>Na podstawie Twoich składek</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-600">
                            Średnia regionalna:
                          </div>
                          <div>Średnia emerytura w województwie</div>
                        </div>
                        <div className="border-t border-gray-600 pt-2 mt-2">
                          <div className="text-gray-300 text-xs">
                            <div className="font-medium mb-1">
                              Przykład różnic:
                            </div>
                            <div>Twoja: 4500 zł</div>
                            <div>Mazowieckie: 3500 zł</div>
                            <div>Podlaskie: 2800 zł</div>
                            <div className="mt-1 text-yellow-300">
                              Większe miasta = wyższe płace
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <div ref={regionalBenchmarkRef} style={{ height: '400px' }}></div>
            </div>
          </div>

          {/* Right Column - Controls and Additional Info */}
          <div className="space-y-6">
            {/* Interactive Controls */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: zusColors.darkBlue }}
              >
                Ustawienia symulacji
              </h3>

              {/* Scenario Selection */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Wybierz scenariusz ekonomiczny:
                  </label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-600 hover:text-[var(--zus-green)] cursor-help transition-colors" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-white text-gray-800 border border-gray-200 shadow-lg text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-96">
                      <div className="text-left">
                        <div className="font-semibold mb-3">
                          Scenariusze ekonomiczne ZUS
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="font-medium text-red-400 mb-1">
                              Pesymistyczny:
                            </div>
                            <div className="text-xs space-y-1">
                              <div>
                                • Wzrost płac: 50% normalnego (wolniejszy)
                              </div>
                              <div>• Stopy składek: +10% (wyższe)</div>
                              <div>• Długość życia: -1 rok (krótsza)</div>
                              <div>• Więcej emerytów w systemie</div>
                              <div className="text-red-300 font-medium">
                                → Niższa emerytura
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-green-400 mb-1">
                              Realistyczny:
                            </div>
                            <div className="text-xs space-y-1">
                              <div>• Wzrost płac: standardowy (dane ZUS)</div>
                              <div>• Stopy składek: normalne</div>
                              <div>• Długość życia: standardowa</div>
                              <div>• Stabilne warunki demograficzne</div>
                              <div className="text-green-300 font-medium">
                                → Bazowa emerytura
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-blue-400 mb-1">
                              Optymistyczny:
                            </div>
                            <div className="text-xs space-y-1">
                              <div>
                                • Wzrost płac: 150% normalnego (szybszy)
                              </div>
                              <div>• Stopy składek: -10% (niższe)</div>
                              <div>• Długość życia: +1 rok (dłuższa)</div>
                              <div>• Mniej emerytów w systemie</div>
                              <div className="text-blue-300 font-medium">
                                → Wyższa emerytura
                              </div>
                            </div>
                          </div>
                          <div className="border-t border-gray-600 pt-2 mt-2">
                            <div className="text-xs text-gray-300">
                              <div className="font-medium mb-1">
                                Dlaczego to ma znaczenie:
                              </div>
                              <div>
                                • Więcej emerytów = mniej składek w systemie
                              </div>
                              <div>
                                • Wolniejszy wzrost płac = niższe składki
                              </div>
                              <div>
                                • Dłuższe życie = emerytura wypłacana dłużej
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2">
                  <button
                    onClick={() => setSelectedScenario('pessimistic')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors border-2 ${
                      selectedScenario === 'pessimistic'
                        ? 'bg-red-100 text-red-700 border-red-300'
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Pesymistyczny
                  </button>
                  <button
                    onClick={() => setSelectedScenario('realistic')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors border-2 ${
                      selectedScenario === 'realistic'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Realistyczny
                  </button>
                  <button
                    onClick={() => setSelectedScenario('optimistic')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors border-2 ${
                      selectedScenario === 'optimistic'
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Optymistyczny
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Scenariusz wpływa na prognozy wzrostu płac i warunki systemowe
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="retirement-age"
                    className="block text-sm font-medium text-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <span>Wiek przejścia na emeryturę: {retirementAge}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info
                            className="h-4 w-4 text-gray-600 hover:text-gray-800 transition-colors cursor-help"
                            aria-label="Informacje o obliczeniach emerytury"
                          />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm bg-white text-gray-800 border border-gray-200 shadow-lg">
                          <div className="text-sm">
                            <div className="font-semibold mb-2">
                              Jak obliczana jest emerytura?
                            </div>
                            <div className="mb-2">
                              <strong>Wzór:</strong> Kapitał emerytalny ÷
                              (Długość życia × 12)
                            </div>
                            <div className="mb-2">
                              <strong>Kapitał:</strong> Stan konta ZUS + Składki
                              przez całe życie
                            </div>
                            <div className="mb-2">
                              <strong>Długość życia:</strong> Maleje z wiekiem
                              przejścia na emeryturę
                            </div>
                            <div className="mb-2">
                              <strong>Wpływ opóźnienia:</strong>
                            </div>
                            <ul className="text-xs ml-4 space-y-1">
                              <li>• Więcej składek = wyższy kapitał</li>
                              <li>
                                • Krótsza emerytura = wyższa miesięczna
                                emerytura
                              </li>
                              <li>• Razem: ~3-6% wzrostu rocznie</li>
                            </ul>
                            <div className="text-xs text-gray-500 mt-2">
                              * Wzrost jest realistyczny dzięki danym ZUS
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </label>
                  <input
                    type="range"
                    id="retirement-age"
                    min="60"
                    max="70"
                    step="1"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(Number(e.target.value))}
                    className="mt-2 w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="salary"
                    className="block text-sm font-medium text-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <span>Wysokość wynagrodzenia brutto (zł)</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info
                            className="h-4 w-4 text-gray-600 hover:text-gray-800 transition-colors cursor-help"
                            aria-label="Informacje o wpływie pensji na emeryturę"
                          />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm bg-white text-gray-800 border border-gray-200 shadow-lg">
                          <div className="text-sm">
                            <div className="font-semibold mb-2">
                              Wpływ pensji na emeryturę
                            </div>
                            <div className="mb-2">
                              <strong>Składki:</strong> 19.52% pensji brutto
                              rocznie
                            </div>
                            <div className="mb-2">
                              <strong>Wzrost płac:</strong> Rzeczywiste dane ZUS
                              (3-5% rocznie)
                            </div>
                            <div className="mb-2">
                              <strong>Kapitał:</strong> Składki × lata pracy +
                              stan konta ZUS
                            </div>
                            <div className="text-xs text-gray-500">
                              * Wyższa pensja = więcej składek = wyższa
                              emerytura
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </label>
                  <input
                    id="salary"
                    type="number"
                    value={salary ?? 0}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 pt-0.5">
                      <input
                        type="checkbox"
                        id="sick-leave"
                        checked={includeSickLeave}
                        onChange={(e) => setIncludeSickLeave(e.target.checked)}
                        className="rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor="sick-leave"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        <Stethoscope className="w-4 h-4 text-[var(--zus-green)] flex-shrink-0" />
                        <span>Uwzględnij absencję chorobową</span>
                        <div className="group relative flex-shrink-0">
                          <Info className="w-4 h-4 text-gray-600 hover:text-[var(--zus-green)] cursor-help transition-colors" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-6 py-4 bg-white border border-gray-200 text-gray-800 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-80 shadow-lg">
                            <div className="text-left">
                              <div className="font-bold mb-3 text-center text-gray-800 text-base">
                                Wpływ L4 na emeryturę
                              </div>
                              <div className="space-y-2">
                                <div className="font-semibold text-gray-800">
                                  Jak to działa:
                                </div>
                                <div className="pl-2">
                                  • Podczas L4 dostajesz 80% wynagrodzenia
                                </div>
                                <div className="pl-2">
                                  • Składki emerytalne naliczane są tylko od 80%
                                </div>
                                <div className="pl-2">
                                  • To oznacza niższy kapitał emerytalny
                                </div>
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                  <div className="font-semibold text-gray-800">
                                    Średnio w roku:
                                  </div>
                                  <div className="pl-2">
                                    • Kobiety: 24.2 dni L4
                                  </div>
                                  <div className="pl-2">
                                    • Mężczyźni: 14.5 dni L4
                                  </div>
                                </div>
                                <div className="bg-[var(--zus-green)] text-[var(--background)] font-bold p-2 rounded-lg mt-3 text-center">
                                  Rezultat: ~1-2% niższa emerytura
                                </div>
                              </div>
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-[var(--zus-green)]"></div>
                          </div>
                        </div>
                      </label>
                      <p className="mt-2 text-xs text-gray-500">
                        Symulacja uwzględni średnią liczbę dni L4 w ciągu
                        kariery zawodowej
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="region"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Region
                  </label>
                  <select
                    id="region"
                    value={selectedCity || 'Warszawa'}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {regionalBenchmark.map((region) => (
                      <option key={region.region} value={region.region}>
                        {region.region}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Replacement Rate Gauge */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <h3
                  className="text-lg font-semibold mb-1"
                  style={{ color: zusColors.darkBlue }}
                >
                  Stopa zastąpienia
                </h3>
                <p className="text-sm text-gray-600">
                  Stosunek emerytury do ostatniego wynagrodzenia
                </p>
              </div>
              <div ref={replacementRateRef} style={{ height: '300px' }}></div>
            </div>

            {/* Sick Leave Impact */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <h3
                  className="text-lg font-semibold mb-1"
                  style={{ color: zusColors.darkBlue }}
                >
                  Wpływ absencji chorobowych
                </h3>
                <p className="text-sm text-gray-600">
                  Porównanie emerytury z uwzględnieniem L4 i bez
                </p>
              </div>
              <div ref={sickLeaveRef} style={{ height: '300px' }}></div>
            </div>

            {/* Expected Pension Comparison */}
            {expectedComparison && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: zusColors.darkBlue }}
                >
                  Porównanie z oczekiwaną emeryturą
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Oczekiwana:</span>
                    <span className="font-bold">
                      {expectedComparison.expected.toLocaleString()} zł
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Prognozowana:</span>
                    <span className="font-bold">
                      {expectedComparison.current.toLocaleString()} zł
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Różnica:</span>
                      <span
                        className={`font-bold ${expectedComparison.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {expectedComparison.difference >= 0 ? '+' : ''}
                        {expectedComparison.difference.toLocaleString()} zł
                      </span>
                    </div>
                    {expectedComparison.yearsToWork > 0 && (
                      <div className="text-xs text-red-600 mt-1">
                        Musisz pracować {expectedComparison.yearsToWork} lat
                        dłużej
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Real Pension Index */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: zusColors.darkBlue }}
              >
                Siła nabywcza emerytury (IRE)
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-600 hover:text-[var(--zus-green)] cursor-help transition-colors" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-white border border-gray-200 text-gray-800 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64 shadow-lg">
                    <div className="text-center">
                      <div className="font-bold text-gray-800 mb-1">
                        Średnia długość życia
                      </div>
                      <div className="text-sm">
                        Oczekiwane lata poboru emerytury:
                        <br />
                        <span className="font-semibold text-[var(--zus-green)]">
                          {lifeExpectancyInfo.years} lat{' '}
                          {lifeExpectancyInfo.months} miesięcy
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[var(--zus-green)]"></div>
                  </div>
                </div>
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: zusColors.green }}
                  >
                    {realPensionIndex.breadLoaves}
                  </div>
                  <div className="text-sm text-gray-600">
                    bochenków chleba miesięcznie
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: zusColors.primary }}
                  >
                    {realPensionIndex.cpiBasket}
                  </div>
                  <div className="text-sm text-gray-600">
                    koszyków zakupów miesięcznie
                  </div>
                </div>
              </div>
            </div>

            {/* Fun Facts */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: zusColors.darkBlue }}
              >
                Ciekawostki
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Czy wiesz, że</strong> najwyższą emeryturę w Polsce
                  otrzymuje mieszkaniec województwa śląskiego - 4,200 zł
                  miesięcznie.
                </p>
                <p>
                  Średnia długość pracy w Polsce to 38 lat dla mężczyzn i 35 lat
                  dla kobiet.
                </p>
                <p>
                  W 2024 roku średnia emerytura w Polsce wynosiła 2,800 zł
                  brutto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
