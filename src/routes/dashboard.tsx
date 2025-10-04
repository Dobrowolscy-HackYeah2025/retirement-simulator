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
  includeSickLeaveAtom
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
          color: zusColors.orange,
          width: 3,
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
          color: zusColors.orange,
          width: 3,
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
          text: 'Prognoza emerytury vs wiek przejścia',
          style: {
            color: zusColors.darkBlue,
            fontSize: '16px',
            fontWeight: 'bold'
          }
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
            name: 'Emerytura nominalna',
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
          text: 'Historia składek + kapitał początkowy',
          style: {
            color: zusColors.darkBlue,
            fontSize: '16px',
            fontWeight: 'bold'
          }
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
          text: 'Scenariusze "co-jeśli"',
          style: {
            color: zusColors.darkBlue,
            fontSize: '16px',
            fontWeight: 'bold'
          }
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
          text: 'Benchmark regionalny',
          style: {
            color: zusColors.darkBlue,
            fontSize: '16px',
            fontWeight: 'bold'
          }
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
              Prognoza emerytury nominalna
            </h3>
            <div className="text-3xl font-bold" style={{ color: zusColors.primary }}>
              {scenariosData.realistic.toLocaleString()} zł
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold mb-2" style={{ color: zusColors.darkBlue }}>
              Prognoza emerytury realna
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
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pension Forecast Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div ref={pensionForecastRef} style={{ height: '400px' }}></div>
            </div>

            {/* Scenarios Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div ref={scenariosRef} style={{ height: '400px' }}></div>
            </div>

            {/* Contribution History Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div ref={contributionHistoryRef} style={{ height: '400px' }}></div>
            </div>

            {/* Regional Benchmark Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
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

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sick-leave"
                    checked={includeSickLeave}
                    onChange={(e) => setIncludeSickLeave(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="sick-leave" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-[var(--zus-green)]" />
                    Uwzględnij absencję chorobową
                    <div className="group relative">
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

            {/* Real Pension Index */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4" style={{ color: zusColors.darkBlue }}>
                Indeks Realnej Emerytury (IRE)
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
                  <div className="text-sm text-gray-600">koszyków CPI miesięcznie</div>
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
