import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { regionalBenchmarkAtom } from '@/lib/atoms';

import { useEffect, useRef, useState } from 'react';

import Highcharts from 'highcharts';
import { Info } from 'lucide-react';
import { useAtomValue } from 'jotai';

// Import and initialize Highcharts Maps module
import('highcharts/modules/map').then((mapModule) => {
  mapModule.default(Highcharts);
});

const CHART_COLORS = {
  primary: 'var(--zus-green)', // #00993f
  greenLight: 'var(--secondary)', // #bad4c4
  greenDark: 'var(--secondary-foreground)', // #084f25
  gray: 'var(--gray-blue)', // #bec3ce
} as const;

function RegionalBenchmarkChart() {
  const regionalBenchmark = useAtomValue(regionalBenchmarkAtom);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<Highcharts.Chart | null>(null);

  // Mapowanie województw na kody hc-key dla mapy Polski
  const regionToHcKey: Record<string, string> = {
    'Dolnośląskie': 'pl-ds',
    'Kujawsko-Pomorskie': 'pl-kp', 
    'Lubelskie': 'pl-lu',
    'Lubuskie': 'pl-lb',
    'Łódzkie': 'pl-ld',
    'Małopolskie': 'pl-ma',
    'Mazowieckie': 'pl-mz',
    'Opolskie': 'pl-op',
    'Podkarpackie': 'pl-pk',
    'Podlaskie': 'pl-pd',
    'Pomorskie': 'pl-pm',
    'Śląskie': 'pl-sl',
    'Świętokrzyskie': 'pl-sk',
    'Warmińsko-Mazurskie': 'pl-wn',
    'Wielkopolskie': 'pl-wp',
    'Zachodniopomorskie': 'pl-zp',
  };

  // Słownik mapujący angielskie nazwy województw z topologii na polskie
  const englishToPolishNames: Record<string, string> = {
    'Greater Poland': 'Wielkopolskie',
    'Kuyavian-Pomeranian': 'Kujawsko-Pomorskie',
    'Lesser Poland': 'Małopolskie',
    'Łódź': 'Łódzkie',
    'Lower Silesian': 'Dolnośląskie',
    'Lublin': 'Lubelskie',
    'Lubusz': 'Lubuskie',
    'Masovian': 'Mazowieckie',
    'Opole': 'Opolskie',
    'Podlaskie': 'Podlaskie',
    'Pomeranian': 'Pomorskie',
    'Silesian': 'Śląskie',
    'Subcarpathian': 'Podkarpackie',
    'Świętokrzyskie': 'Świętokrzyskie',
    'Warmian-Masurian': 'Warmińsko-Mazurskie',
    'West Pomeranian': 'Zachodniopomorskie'
  };

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current || chart) {
      return;
    }

    const initializeMap = async () => {
      try {
        // Ładuj topologię asynchronicznie jak w oficjalnym demo
        const topology = await fetch(
          'https://code.highcharts.com/mapdata/countries/pl/pl-all.topo.json'
        ).then(response => response.json());

        // Przygotuj dane dla mapy
        const mapData = regionalBenchmark.map((item) => [
          regionToHcKey[item.region],
          item.average,
          item.isSelected
        ]);

        const newChart = Highcharts.mapChart(chartRef.current, {
          chart: {
            map: topology,
            backgroundColor: 'transparent',
            panning: false, // Wyłącza panowanie
          },
          title: {
            text: '',
          },
          mapNavigation: {
            enabled: false, // Wyłącza nawigację mapy
            enableMouseWheelZoom: false, // Wyłącza zoomowanie kółkiem myszy
          },
          colorAxis: {
            min: Math.min(...regionalBenchmark.map(item => item.average)),
            max: Math.max(...regionalBenchmark.map(item => item.average)),
            stops: [
              [0, CHART_COLORS.greenLight],
              [0.5, CHART_COLORS.primary],
              [1, CHART_COLORS.greenDark],
            ],
            labels: {
              style: {
                color: 'var(--foreground)',
              },
            },
          },
          series: [
            {
              data: mapData,
              name: 'Średnia emerytura',
              states: {
                hover: {
                  color: CHART_COLORS.gray,
                  brightness: 0.1,
                },
                select: {
                  color: CHART_COLORS.greenDark,
                },
              },
              dataLabels: {
                enabled: true,
                allowOverlap: true, // Zezwolenie na nakładanie się etykiet
                crop: false, // Wyłączenie przycinania etykiet
                overflow: 'allow', // Zezwolenie na wyświetlanie etykiet poza obszarem wykresu
                formatter: function() {
                  // Pobierz polską nazwę z słownika lub zwróć oryginalną nazwę
                  return englishToPolishNames[this.point.name] || this.point.name;
                },
                style: {
                  color: 'var(--foreground)',
                  fontSize: '11px',
                  fontWeight: '600',
                  textOutline: 'none',
                },
              },
              tooltip: {
                formatter: function() {
                  const polishName = englishToPolishNames[this.point.name] || this.point.name;
                  return `<b>${polishName}</b><br/>Średnia emerytura: <b>${this.point.value} zł</b>`;
                },
              },
            },
          ],
          legend: {
            enabled: true,
            itemStyle: { color: 'var(--foreground)' },
          },
          credits: {
            enabled: false,
          },
        });

        setChart(newChart);
      } catch (error) {
        console.error('Error loading map topology:', error);
      }
    };

    initializeMap();

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update chart data
  useEffect(() => {
    if (
      !chart ||
      !chart.series ||
      !chart.series[0] ||
      regionalBenchmark.length === 0
    ) {
      return;
    }

    // Przygotuj dane dla mapy
    const mapData = regionalBenchmark.map((item) => [
      regionToHcKey[item.region],
      item.average,
      item.isSelected
    ]);

    chart.series[0].setData(mapData, false);
    chart.redraw();
  }, [chart, regionalBenchmark]);

  return (
    <Card className="@container/card max-h-[500px]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle as="h2">Mapa emerytur w województwach</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info
                className="h-4 w-4 text-gray-600 hover:text-gray-800 transition-colors cursor-help"
                aria-label="Informacje o mapie emerytur regionalnych"
              />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-white text-gray-800 border border-gray-200 shadow-lg">
              <div className="text-sm">
                <div className="font-semibold mb-2">Mapa emerytur regionalnych</div>
                <div className="space-y-2">
                  <div>
                    <strong>Kolorowe województwa:</strong> Średnia emerytura w danym regionie
                  </div>
                  <div>
                    <strong>Skala kolorów:</strong> Od najniższych (jasny zielony) do najwyższych (ciemny zielony)
                  </div>
                  <div>
                    <strong>Interakcja:</strong> Najedź na województwo aby zobaczyć szczegóły
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="text-xs text-gray-500">
                      <strong>Źródło danych:</strong> ZUS - dane powiatowe zagregowane do poziomu wojewódzkiego (grudzień 2024)
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      * Wszystkie 16 województw Polski
                    </div>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <CardDescription>
          Średnie emerytury w poszczególnych województwach Polski
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full relative">
          <div ref={chartRef} className="absolute inset-0 h-full w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default RegionalBenchmarkChart;
