import { useState, useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import { useAtom } from 'jotai';
import { Info, Stethoscope } from 'lucide-react';
import {
  pensionForecastDataAtom,
  replacementRateAtom,
  sickLeaveImpactAtom,
  contributionHistoryAtom,
  scenariosDataAtom,
  regionalBenchmarkAtom,
  realPensionIndexAtom,
  retirementInputsAtom,
  includeSickLeaveAtom,
  averagePensionAtom,
  lifeExpectancyInfoAtom,
  expectedPensionComparisonAtom
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
  black: 'rgb(0, 0, 0)'
};

// Usunięto sampleData - teraz używamy derived atomów

export default function Dashboard() {
  const [retirementAge, setRetirementAge] = useState(65);
  const [salary, setSalary] = useState(5000);
  const [includeSickLeave, setIncludeSickLeave] = useAtom(includeSickLeaveAtom);
  const [selectedRegion, setSelectedRegion] = useState('Mazowieckie');
  const [selectedScenario, setSelectedScenario] = useState('realistic');

  // Pobierz i zaktualizuj retirementInputsAtom na podstawie ustawień
  const [, setInputs] = useAtom(retirementInputsAtom);
  
  // Zaktualizuj inputs gdy zmieniają się ustawienia
  useEffect(() => {
    setInputs((prev: any) => ({
      ...prev,
      grossMonthlySalary: salary,
      plannedRetirementYear: new Date().getFullYear() + (retirementAge - prev.age!)
    }));
  }, [salary, retirementAge, setInputs]);


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

  // Chart refs
  const pensionForecastRef = useRef<HTMLDivElement>(null);
  const replacementRateRef = useRef<HTMLDivElement>(null);
  const sickLeaveRef = useRef<HTMLDivElement>(null);
  const contributionHistoryRef = useRef<HTMLDivElement>(null);
  const scenariosRef = useRef<HTMLDivElement>(null);
  const regionalBenchmarkRef = useRef<HTMLDivElement>(null);

  // Chart instances
  const [pensionForecastChart, setPensionForecastChart] = useState<Highcharts.Chart | null>(null);
  const [replacementRateChart, setReplacementRateChart] = useState<Highcharts.Chart | null>(null);
  const [sickLeaveChart, setSickLeaveChart] = useState<Highcharts.Chart | null>(null);
  const [contributionHistoryChart, setContributionHistoryChart] = useState<Highcharts.Chart | null>(null);
  const [scenariosChart, setScenariosChart] = useState<Highcharts.Chart | null>(null);
  const [regionalBenchmarkChart, setRegionalBenchmarkChart] = useState<Highcharts.Chart | null>(null);

  // Aktualizuj plotline na wykresie prognozy emerytury gdy zmienia się retirementAge
  useEffect(() => {
    if (pensionForecastChart) {
      const xAxis = pensionForecastChart.xAxis[0];
      const plotLine = (xAxis as any).plotLinesAndBands.find((pl: any) => pl.id === 'retirement-age-line');
      
      if (plotLine) {
        // Debug: sprawdź wartości
        console.log('Plotline debug:', {
          retirementAge,
          currentValue: plotLine.options.value,
          newX: xAxis.toPixels(retirementAge),
          currentX: xAxis.toPixels(plotLine.options.value)
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
            style: { color: zusColors.darkBlue, fontWeight: 'bold' }
          }
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
            style: { color: zusColors.darkBlue, fontWeight: 'bold' }
          }
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
            fontFamily: 'Arial, sans-serif'
          }
        },
        title: {
          text: ''
        },
        xAxis: {
          type: 'linear',
          title: {
            text: 'Wiek przejścia na emeryturę',
            style: { color: zusColors.darkBlue }
          },
          min: 60,
          max: 70
        },
        yAxis: {
          title: {
            text: 'Kwota emerytury (zł)',
            style: { color: zusColors.darkBlue }
          }
        },
        series: [
          {
            name: 'Kwota emerytury',
            type: 'line',
            data: pensionForecastData.map(item => [item.age, item.amount]),
            color: zusColors.primary,
            marker: {
              radius: 6,
              fillColor: zusColors.primary,
              lineColor: zusColors.primary
            },
            lineWidth: 3
          },
          {
            name: 'Emerytura realna',
            type: 'line',
            data: pensionForecastData.map(item => [item.age, item.realAmount]),
            color: zusColors.green,
            marker: {
              radius: 6,
              fillColor: zusColors.green,
              lineColor: zusColors.green
            },
            lineWidth: 3
          }
        ],
        legend: {
          enabled: true,
          itemStyle: { color: zusColors.darkBlue }
        },
        tooltip: {
          pointFormat: '<b>{series.name}</b>: {point.y} zł'
        }
      });
      setPensionForecastChart(chart);
    }

    if (replacementRateRef.current && !replacementRateChart) {
      const chart = Highcharts.chart(replacementRateRef.current!, {
        chart: {
          type: 'pie',
          backgroundColor: 'transparent'
        },
        title: {
          text: 'Stopa zastąpienia',
          style: {
            color: zusColors.darkBlue,
            fontSize: '16px',
            fontWeight: 'bold'
          }
        },
        series: [{
          name: 'Stopa zastąpienia',
          type: 'pie',
          data: [
            { name: 'Zastąpienie', y: replacementRate, color: zusColors.primary },
            { name: 'Pozostałe', y: 100 - replacementRate, color: zusColors.greenLight }
          ],
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.y}%',
            style: { color: zusColors.darkBlue, fontWeight: 'bold' }
          },
          borderWidth: 0
        }]
      });
      setReplacementRateChart(chart);
    }

    if (sickLeaveRef.current && !sickLeaveChart) {
      const chart = Highcharts.chart(sickLeaveRef.current!, {
        chart: {
          type: 'column',
          backgroundColor: 'transparent'
        },
        title: {
          text: 'Wpływ absencji chorobowych',
          style: {
            color: zusColors.darkBlue,
            fontSize: '16px',
            fontWeight: 'bold'
          }
        },
        xAxis: {
          categories: ['Z L4', 'Bez L4']
        },
        yAxis: {
          title: {
            text: 'Kwota emerytury (zł)',
            style: { color: zusColors.darkBlue }
          }
        },
        series: [{
          name: 'Wysokość emerytury',
          type: 'column',
          data: [
            { y: sickLeaveImpact.withSickLeave, color: zusColors.greenDark },
            { y: sickLeaveImpact.withoutSickLeave, color: zusColors.primary }
          ],
          dataLabels: {
            enabled: true,
            format: '{y} zł',
            style: { color: zusColors.darkBlue, fontWeight: 'bold' }
          },
          borderWidth: 0,
          borderRadius: 4
        }],
        legend: {
          enabled: false
        }
      });
      setSickLeaveChart(chart);
    }

    if (contributionHistoryRef.current && !contributionHistoryChart) {
      const chart = Highcharts.chart(contributionHistoryRef.current!, {
        chart: {
          type: 'column',
          backgroundColor: 'transparent'
        },
        title: {
          text: ''
        },
        xAxis: {
          categories: contributionHistory.map(item => item.year.toString())
        },
        yAxis: [{
          title: {
            text: 'Składki (zł)',
            style: { color: zusColors.darkBlue }
          }
        }, {
          title: {
            text: 'Kapitał (zł)',
            style: { color: zusColors.darkBlue }
          },
          opposite: true
        }],
        series: [
          {
            name: 'Składki roczne',
            type: 'column',
            data: contributionHistory.map(item => item.contributions),
            color: zusColors.greenLight,
            yAxis: 0,
            borderWidth: 0,
            borderRadius: 4
          },
          {
            name: 'Kapitał narastający',
            type: 'line',
            data: contributionHistory.map(item => item.capital),
            color: zusColors.primary,
            yAxis: 1,
            marker: {
              radius: 4,
              fillColor: zusColors.primary,
              lineColor: zusColors.primary
            },
            lineWidth: 3
          }
        ],
        legend: {
          enabled: true,
          itemStyle: { color: zusColors.darkBlue }
        }
      });
      setContributionHistoryChart(chart);
    }

    if (scenariosRef.current && !scenariosChart) {
      const chart = Highcharts.chart(scenariosRef.current!, {
        chart: {
          type: 'column',
          backgroundColor: 'transparent'
        },
        title: {
          text: ''
        },
        xAxis: {
          categories: ['Pesymistyczny', 'Realistyczny', 'Optymistyczny']
        },
        yAxis: {
          title: {
            text: 'Kwota emerytury (zł)',
            style: { color: zusColors.darkBlue }
          }
        },
        series: [{
          name: 'Prognozowana emerytura',
          type: 'column',
          data: [
            { y: scenariosData.pessimistic, color: zusColors.greenDark },
            { y: scenariosData.realistic, color: zusColors.primary },
            { y: scenariosData.optimistic, color: zusColors.green }
          ],
          dataLabels: {
            enabled: true,
            format: '{y} zł',
            style: { color: zusColors.darkBlue, fontWeight: 'bold' }
          },
          borderWidth: 0,
          borderRadius: 4
        }],
        legend: {
          enabled: false
        }
      });
      setScenariosChart(chart);
    }

    if (regionalBenchmarkRef.current && !regionalBenchmarkChart) {
      const chart = Highcharts.chart(regionalBenchmarkRef.current!, {
        chart: {
          type: 'column',
          backgroundColor: 'transparent'
        },
        title: {
          text: ''
        },
        xAxis: {
          categories: regionalBenchmark.map(item => item.region)
        },
        yAxis: {
          title: {
            text: 'Kwota emerytury (zł)',
            style: { color: zusColors.darkBlue }
          }
        },
        series: [
          {
            name: 'Średnia w regionie',
            type: 'column',
            data: regionalBenchmark.map(item => item.average),
            color: zusColors.greenLight,
            borderWidth: 0,
            borderRadius: 4
          },
          {
            name: 'Twoja prognoza',
            type: 'column',
            data: regionalBenchmark.map(item => item.user),
            color: zusColors.primary,
            borderWidth: 0,
            borderRadius: 4
          }
        ],
        legend: {
          enabled: true,
          itemStyle: { color: zusColors.darkBlue }
        }
      });
      setRegionalBenchmarkChart(chart);
    }
  }, []);

  // Update charts when data changes
  useEffect(() => {
    if (pensionForecastChart && pensionForecastData.length > 0) {
      pensionForecastChart.series[0].setData(pensionForecastData.map(item => item.amount));
      pensionForecastChart.series[1].setData(pensionForecastData.map(item => item.realAmount));
    }
  }, [pensionForecastData, pensionForecastChart]);

  useEffect(() => {
    if (sickLeaveChart && sickLeaveImpact) {
      const withSickLeave = includeSickLeave ? sickLeaveImpact.withSickLeave : sickLeaveImpact.withoutSickLeave;
      const withoutSickLeave = sickLeaveImpact.withoutSickLeave;
      
      sickLeaveChart.series[0].setData([
        { y: withSickLeave, color: zusColors.red },
        { y: withoutSickLeave, color: zusColors.green }
      ]);
    }
  }, [includeSickLeave, sickLeaveChart, sickLeaveImpact]);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      [pensionForecastChart, replacementRateChart, sickLeaveChart, contributionHistoryChart, scenariosChart, regionalBenchmarkChart].forEach(chart => {
        if (chart) {
          chart.destroy();
        }
      });
    };
  }, [pensionForecastChart, replacementRateChart, sickLeaveChart, contributionHistoryChart, scenariosChart, regionalBenchmarkChart]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: zusColors.darkBlue }}>
            ZUS Symulator Emerytalny
          </h1>
          <p className="text-gray-600">
            Narzędzie edukacyjne do prognozowania wysokości emerytury
          </p>
        </div>

        {/* Top KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold mb-2" style={{ color: zusColors.darkBlue }}>
              Prognozowana emerytura (kwota)
            </h3>
            <div className="text-3xl font-bold" style={{ color: zusColors.primary }}>
              {scenariosData.realistic.toLocaleString()} zł
            </div>
            <div className="mt-2 text-sm text-gray-600">
              vs średnia: {averagePension.toLocaleString()} zł
              <span className={`ml-2 font-semibold ${scenariosData.realistic > averagePension ? 'text-green-600' : 'text-red-600'}`}>
                ({scenariosData.realistic > averagePension ? '+' : ''}{Math.round(((scenariosData.realistic - averagePension) / averagePension) * 100)}%)
              </span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold mb-2" style={{ color: zusColors.darkBlue }}>
              Emerytura realna
            </h3>
            <div className="text-3xl font-bold" style={{ color: zusColors.green }}>
              {Math.round(scenariosData.realistic * 0.7).toLocaleString()} zł
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold mb-2" style={{ color: zusColors.darkBlue }}>
              Stopa zastąpienia
            </h3>
            <div className="text-3xl font-bold" style={{ color: zusColors.greenDark }}>
              {replacementRate}%
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Średni czas pobierania świadczenia: <span className="font-semibold text-[var(--zus-green)]">{lifeExpectancyInfo.years},{lifeExpectancyInfo.months} roku</span>
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
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold" style={{ color: zusColors.darkBlue }}>
                    Prognoza emerytury vs wiek przejścia
                  </h3>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 hover:text-[var(--zus-green)] cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-96">
                      <div className="text-left">
                        <div className="font-semibold mb-2">Emerytura nominalna vs realna</div>
                        <div className="space-y-1">
                          <div>
                            <div className="font-medium text-green-400">Nominalna:</div>
                            <div>Kwota w złotych na koncie</div>
                          </div>
                          <div>
                            <div className="font-medium text-blue-400">Realna:</div>
                            <div>Siła nabywcza po uwzględnieniu inflacji</div>
                          </div>
                          <div className="border-t border-gray-600 pt-2 mt-2">
                            <div className="text-gray-300 text-xs">
                              <div className="font-medium mb-1">Przykład:</div>
                              <div>5000 zł nominalnie = ~4200 zł realnie</div>
                              <div>Za 5 lat za te same pieniądze kupisz mniej</div>
                              <div className="mt-1 text-yellow-300">Średnia inflacja: 3.5% rocznie</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Wariant:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedScenario === 'pessimistic' ? 'bg-red-100 text-red-700' :
                    selectedScenario === 'realistic' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedScenario === 'pessimistic' ? 'Pesymistyczny' :
                     selectedScenario === 'realistic' ? 'Realistyczny' : 'Optymistyczny'}
                  </span>
                </div>
              </div>
              <div ref={pensionForecastRef} style={{ height: '400px' }}></div>
              
              {/* Analiza ekspercka */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-l-4 border-[var(--zus-green)]">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">Analiza Twojej sytuacji emerytalnej</div>
                    <div className="text-sm text-gray-700">
                      Przy obecnych założeniach Twoja emerytura realnie pozwoli utrzymać <span className="font-semibold text-[var(--zus-green)]">~{Math.round((scenariosData.realistic * 0.7 / scenariosData.realistic) * 100)}%</span> obecnej siły nabywczej. 
                      Największy wpływ na wysokość świadczenia ma wiek przejścia na emeryturę — przesunięcie decyzji o 2 lata zwiększa emeryturę o <span className="font-semibold text-[var(--zus-green)]">+18%</span>.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scenarios Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold" style={{ color: zusColors.darkBlue }}>
                  Scenariusze "co-jeśli"
                </h3>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 hover:text-[var(--zus-green)] cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-80">
                    <div className="text-left">
                      <div className="font-semibold mb-2">Scenariusze emerytalne</div>
                      <div className="space-y-1">
                        <div>
                          <div className="font-medium text-red-400">Pesymistyczny:</div>
                          <div>Niższe płace, wyższa inflacja</div>
                        </div>
                        <div>
                          <div className="font-medium text-green-400">Realistyczny:</div>
                          <div>Obecne trendy ekonomiczne</div>
                        </div>
                        <div>
                          <div className="font-medium text-blue-400">Optymistyczny:</div>
                          <div>Wzrost płac, niższa inflacja</div>
                        </div>
                        <div className="border-t border-gray-600 pt-2 mt-2">
                          <div className="text-gray-300 text-xs">
                            <div className="font-medium mb-1">Przykład różnic:</div>
                            <div>Realistyczny: 4000 zł</div>
                            <div>Pesymistyczny: 3200 zł (-20%)</div>
                            <div>Optymistyczny: 4800 zł (+20%)</div>
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
                <h3 className="text-lg font-semibold" style={{ color: zusColors.darkBlue }}>
                  Historia składek emerytalnych
                </h3>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 hover:text-[var(--zus-green)] cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-88">
                    <div className="text-left">
                      <div className="font-semibold mb-2">Historia składek emerytalnych</div>
                      <div className="space-y-1">
                        <div>
                          <div className="font-medium text-green-400">Składki roczne:</div>
                          <div>Ile wpłacasz do ZUS każdego roku</div>
                        </div>
                        <div>
                          <div className="font-medium text-blue-400">Kapitał skumulowany:</div>
                          <div>Łączna kwota na koncie emerytalnym</div>
                        </div>
                        <div className="border-t border-gray-600 pt-2 mt-2">
                          <div className="text-gray-300 text-xs">
                            <div className="font-medium mb-1">Przykład:</div>
                            <div>Rok 1: 5000 zł składki</div>
                            <div>Rok 5: 6000 zł składki (+20%)</div>
                            <div>Kapitał: 55,000 zł łącznie</div>
                            <div className="mt-1 text-yellow-300">Składki rosną z podwyżkami</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <div ref={contributionHistoryRef} style={{ height: '400px' }}></div>
            </div>

            {/* Regional Benchmark Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold" style={{ color: zusColors.darkBlue }}>
                  Porównanie z innymi regionami
                </h3>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 hover:text-[var(--zus-green)] cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-88">
                    <div className="text-left">
                      <div className="font-semibold mb-2">Benchmark regionalny</div>
                      <div className="space-y-1">
                        <div>
                          <div className="font-medium text-green-400">Twoja emerytura:</div>
                          <div>Na podstawie Twoich składek</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-400">Średnia regionalna:</div>
                          <div>Średnia emerytura w województwie</div>
                        </div>
                        <div className="border-t border-gray-600 pt-2 mt-2">
                          <div className="text-gray-300 text-xs">
                            <div className="font-medium mb-1">Przykład różnic:</div>
                            <div>Twoja: 4500 zł</div>
                            <div>Mazowieckie: 3500 zł</div>
                            <div>Podlaskie: 2800 zł</div>
                            <div className="mt-1 text-yellow-300">Większe miasta = wyższe płace</div>
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
              <h3 className="text-lg font-semibold mb-4" style={{ color: zusColors.darkBlue }}>
                Ustawienia symulacji
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="retirement-age" className="block text-sm font-medium text-gray-700">
                    Wiek przejścia na emeryturę: {retirementAge}
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
                  <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                    Wysokość wynagrodzenia brutto (zł)
                  </label>
                  <input
                    id="salary"
                    type="number"
                    value={salary}
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
                      <label htmlFor="sick-leave" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                        <Stethoscope className="w-4 h-4 text-[var(--zus-green)] flex-shrink-0" />
                        <span>Uwzględnij absencję chorobową</span>
                        <div className="group relative flex-shrink-0">
                          <Info className="w-4 h-4 text-gray-400 hover:text-[var(--zus-green)] cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-6 py-4 bg-[var(--background)] border-2 border-[var(--zus-green)] text-[var(--foreground)] text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-80 shadow-lg">
                            <div className="text-left">
                              <div className="font-bold mb-3 text-center text-[var(--zus-green)] text-base">Wpływ L4 na emeryturę</div>
                              <div className="space-y-2">
                                <div className="font-semibold text-[var(--foreground)]">Jak to działa:</div>
                                <div className="pl-2">• Podczas L4 dostajesz 80% wynagrodzenia</div>
                                <div className="pl-2">• Składki emerytalne naliczane są tylko od 80%</div>
                                <div className="pl-2">• To oznacza niższy kapitał emerytalny</div>
                                <div className="border-t border-[var(--border)] pt-3 mt-3">
                                  <div className="font-semibold text-[var(--foreground)]">Średnio w roku:</div>
                                  <div className="pl-2">• Kobiety: 24.2 dni L4</div>
                                  <div className="pl-2">• Mężczyźni: 14.5 dni L4</div>
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
                        Symulacja uwzględni średnią liczbę dni L4 w ciągu kariery zawodowej
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                    Region
                  </label>
                  <select
                    id="region"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
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

            {/* Preset Scenarios */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4" style={{ color: zusColors.darkBlue }}>
                Preset scenariuszy
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedScenario('pessimistic')}
                  className="w-full text-left px-4 py-2 rounded-md border transition-colors"
                  style={{ 
                    backgroundColor: selectedScenario === 'pessimistic' ? zusColors.greenDark : 'transparent',
                    color: selectedScenario === 'pessimistic' ? 'white' : zusColors.darkBlue,
                    borderColor: zusColors.greenDark
                  }}
                >
                  Pesymistyczny
                </button>
                <button
                  onClick={() => setSelectedScenario('realistic')}
                  className="w-full text-left px-4 py-2 rounded-md border transition-colors"
                  style={{ 
                    backgroundColor: selectedScenario === 'realistic' ? zusColors.primary : 'transparent',
                    color: selectedScenario === 'realistic' ? 'white' : zusColors.darkBlue,
                    borderColor: zusColors.primary
                  }}
                >
                  Realistyczny
                </button>
                <button
                  onClick={() => setSelectedScenario('optimistic')}
                  className="w-full text-left px-4 py-2 rounded-md border transition-colors"
                  style={{ 
                    backgroundColor: selectedScenario === 'optimistic' ? zusColors.green : 'transparent',
                    color: selectedScenario === 'optimistic' ? 'white' : zusColors.darkBlue,
                    borderColor: zusColors.green
                  }}
                >
                  Optymistyczny
                </button>
              </div>
            </div>

            {/* Replacement Rate Gauge */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div ref={replacementRateRef} style={{ height: '300px' }}></div>
            </div>

            {/* Sick Leave Impact */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div ref={sickLeaveRef} style={{ height: '300px' }}></div>
            </div>


            {/* Expected Pension Comparison */}
            {expectedComparison && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4" style={{ color: zusColors.darkBlue }}>
                  Porównanie z oczekiwaną emeryturą
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Oczekiwana:</span>
                    <span className="font-bold">{expectedComparison.expected.toLocaleString()} zł</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Prognozowana:</span>
                    <span className="font-bold">{expectedComparison.current.toLocaleString()} zł</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Różnica:</span>
                      <span className={`font-bold ${expectedComparison.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {expectedComparison.difference >= 0 ? '+' : ''}{expectedComparison.difference.toLocaleString()} zł
                      </span>
                    </div>
                    {expectedComparison.yearsToWork > 0 && (
                      <div className="text-xs text-red-600 mt-1">
                        Musisz pracować {expectedComparison.yearsToWork} lat dłużej
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Real Pension Index */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: zusColors.darkBlue }}>
                Siła nabywcza emerytury (IRE)
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 hover:text-[var(--zus-green)] cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-[var(--background)] border-2 border-[var(--zus-green)] text-[var(--foreground)] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64 shadow-lg">
                    <div className="text-center">
                      <div className="font-bold text-[var(--zus-green)] mb-1">Średnia długość życia</div>
                      <div className="text-sm">
                        Oczekiwane lata poboru emerytury:<br/>
                        <span className="font-semibold text-[var(--zus-green)]">
                          {lifeExpectancyInfo.years} lat {lifeExpectancyInfo.months} miesięcy
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[var(--zus-green)]"></div>
                  </div>
                </div>
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: zusColors.green }}>
                    {realPensionIndex.breadLoaves}
                  </div>
                  <div className="text-sm text-gray-600">bochenków chleba miesięcznie</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: zusColors.primary }}>
                    {realPensionIndex.cpiBasket}
                  </div>
                  <div className="text-sm text-gray-600">koszyków zakupów miesięcznie</div>
                </div>
              </div>
            </div>

            {/* Fun Facts */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4" style={{ color: zusColors.darkBlue }}>
                Ciekawostki
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Czy wiesz, że</strong> najwyższą emeryturę w Polsce otrzymuje mieszkaniec województwa śląskiego - 4,200 zł miesięcznie.
                </p>
                <p>
                  Średnia długość pracy w Polsce to 38 lat dla mężczyzn i 35 lat dla kobiet.
                </p>
                <p>
                  W 2024 roku średnia emerytura w Polsce wynosiła 2,800 zł brutto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
