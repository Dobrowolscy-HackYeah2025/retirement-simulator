import ZusSansBold from '@/lib/report/fonts/DejaVuSans-Bold.ttf';
import ZusSansRegular from '@/lib/report/fonts/DejaVuSans.ttf';
import polandTopology from '@/lib/data/poland-topology.json';
import type {
  RetirementReportChart,
  RetirementReportChartSeries,
  RetirementReportData,
  RetirementReportGroup,
  RetirementReportHighlight,
  RetirementReportMapChart,
  RetirementReportSeriesChart,
} from '@/lib/report/types';

import type { ReactElement } from 'react';

import {
  Circle,
  Defs,
  Document,
  Font,
  G,
  LinearGradient,
  Page,
  Path,
  Text,
  Rect,
  Stop,
  StyleSheet,
  Svg,
  View,
} from '@react-pdf/renderer';

Font.register({
  family: 'ZUS Sans',
  fonts: [
    { src: ZusSansRegular, fontWeight: 'normal', format: 'truetype' },
    { src: ZusSansBold, fontWeight: 'bold', format: 'truetype' },
  ],
  fallback: true,
});

const PdfText = Text;
const SvgText = Text;

export interface RetirementReportDocumentProps {
  dataset: RetirementReportData;
  generatedAt: string;
}

const ZUS_COLORS = {
  amber: '#FFB34F',
  green: '#00993F',
  gray: '#BEC3CE',
  blue: '#3F84D2',
  navy: '#00416E',
  coral: '#F05E5E',
  black: '#000000',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 80,
    paddingHorizontal: 36,
    paddingBottom: 36,
    fontFamily: 'ZUS Sans',
    color: ZUS_COLORS.navy,
    fontSize: 11,
    lineHeight: 1.4,
  },
  metaHeader: {
    position: 'absolute',
    top: 24,
    left: 36,
    right: 36,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(63, 132, 210, 0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaLogoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  metaInfo: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    display: 'flex',
    marginLeft: 'auto',
  },
  metaText: {
    fontSize: 9,
    color: '#1F2937',
    textAlign: 'right',
  },
  metaValue: {
    fontWeight: 'bold',
    color: ZUS_COLORS.blue,
  },
  header: {
    backgroundColor: ZUS_COLORS.green,
    color: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    marginTop: 10,
    fontSize: 12,
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 12,
    marginBottom: 8,
  },
  highlightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  highlightCard: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  highlightLabel: {
    fontSize: 10,
    opacity: 0.8,
  },
  highlightValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionAccent: {
    width: 6,
    height: '100%',
    backgroundColor: ZUS_COLORS.amber,
    marginRight: 8,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ZUS_COLORS.black,
  },
  sectionSummary: {
    marginBottom: 8,
    fontSize: 10,
    color: ZUS_COLORS.navy,
  },
  chartsSection: {
    marginTop: 24,
  },
  chartsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartsSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ZUS_COLORS.black,
  },
  chartCard: {
    marginBottom: 18,
    padding: 12,
    backgroundColor: '#FDFDFD',
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: ZUS_COLORS.black,
  },
  chartDescription: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 4,
    marginBottom: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginTop: -1,
  },
  legendLabel: {
    fontSize: 9,
    color: ZUS_COLORS.navy,
    marginLeft: 6,
    marginTop: 4,
  },
  chartAxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartAxisLabel: {
    fontSize: 9,
    color: '#4B5563',
  },
  chartCanvasWrapper: {
    alignItems: 'center',
  },
  chartOverlayText: {
    position: 'absolute',
    fontSize: 9,
    color: '#4B5563',
    fontFamily: 'ZUS Sans',
  },
  chartValueLabel: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: 'bold',
    color: ZUS_COLORS.navy,
    fontFamily: 'ZUS Sans',
    textAlign: 'center',
  },
  chartHintBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ZUS_COLORS.gray,
    backgroundColor: '#F8FAFC',
  },
  chartHintTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: ZUS_COLORS.navy,
    marginBottom: 4,
  },
  chartHintLine: {
    fontSize: 9,
    color: ZUS_COLORS.navy,
    marginBottom: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemMeta: {
    flexBasis: '60%',
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: ZUS_COLORS.navy,
  },
  itemDescription: {
    marginTop: 2,
    fontSize: 10,
    color: '#4B5563',
  },
  itemValue: {
    flexBasis: '40%',
    fontSize: 12,
    fontWeight: 'bold',
    color: ZUS_COLORS.green,
    textAlign: 'right',
  },
  notesBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ZUS_COLORS.amber,
    backgroundColor: '#FFF6E5',
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: ZUS_COLORS.navy,
  },
  noteLine: {
    fontSize: 10,
    marginBottom: 2,
    color: ZUS_COLORS.navy,
  },
  mapLegend: {
    marginTop: 12,
    flexDirection: 'column',
  },
  mapLegendTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: ZUS_COLORS.navy,
  },
  mapLegendRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapLegendValue: {
    fontSize: 10,
    color: ZUS_COLORS.navy,
  },
  mapSummaryBox: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(186, 212, 196, 0.35)',
  },
  mapSummaryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: ZUS_COLORS.navy,
    marginBottom: 4,
  },
  mapSummaryText: {
    fontSize: 10,
    color: ZUS_COLORS.navy,
    marginBottom: 2,
  },
});

const CHART_WIDTH = 520;
const CHART_HEIGHT = 240;
const CHART_MARGIN = { top: 24, right: 28, bottom: 44, left: 60 } as const;
const numberFormatter = new Intl.NumberFormat('pl-PL');
const currencyFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 0,
});

const formatAxisValue = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0';
  }
  return numberFormatter.format(Math.round(value));
};

const formatValueLabel = (value: number) => {
  if (!Number.isFinite(value)) {
    return '';
  }

  if (Number.isInteger(value)) {
    return numberFormatter.format(value);
  }

  return value.toLocaleString('pl-PL', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
};

const formatColumnValue = (
  chart: RetirementReportChart,
  value: number
): string => {
  if (!Number.isFinite(value)) {
    return '';
  }

  const label = chart.yLabel?.toLowerCase() ?? '';
  const formattedBase = formatValueLabel(value);

  if (label.includes('%')) {
    return `${formattedBase}%`;
  }

  if (label.includes('zł')) {
    return `${formattedBase} zł`;
  }

  return formattedBase;
};

const formatMapLegendValue = (
  value: number,
  suffix?: string
): string => {
  if (!Number.isFinite(value)) {
    return '—';
  }

  if (suffix?.trim().startsWith('zł')) {
    return currencyFormatter.format(value);
  }

  const formatted = numberFormatter.format(Math.round(value));
  return suffix ? `${formatted}${suffix}` : formatted;
};

type Coordinate = [number, number];

interface PolygonGeometry {
  polygons: Coordinate[][][]; // polygon -> ring -> coordinate
}

type TopologyShape = {
  arcs: number[][][];
  transform: { scale: [number, number]; translate: [number, number] };
  objects: {
    default: {
      geometries: Array<{
        type: 'Polygon' | 'MultiPolygon';
        arcs: number[][] | number[][][];
        properties: { 'hc-key': string };
      }>;
    };
  };
  bbox: [number, number, number, number];
};

const polandTopologyTyped = polandTopology as TopologyShape;

const decodedArcs: Coordinate[][] = polandTopologyTyped.arcs.map((arc) => {
  const { scale, translate } = polandTopologyTyped.transform;
  let x = 0;
  let y = 0;

  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x * scale[0] + translate[0], y * scale[1] + translate[1]] as Coordinate;
  });
});

const assembleRing = (ringArcs: number[]): Coordinate[] => {
  const ring: Coordinate[] = [];

  ringArcs.forEach((arcIndex, index) => {
    const sourceIndex = arcIndex >= 0 ? arcIndex : ~arcIndex;
    const sourceArc = decodedArcs[sourceIndex];
    const arcPoints = arcIndex >= 0 ? sourceArc : [...sourceArc].reverse();

    if (index > 0) {
      ring.push(...arcPoints.slice(1));
    } else {
      ring.push(...arcPoints);
    }
  });

  return ring;
};

const buildGeometry = (geometry: {
  type: 'Polygon' | 'MultiPolygon';
  arcs: number[][] | number[][][];
}): Coordinate[][][] => {
  if (geometry.type === 'Polygon') {
    return [
      (geometry.arcs as number[][]).map((ring) => assembleRing(ring)),
    ];
  }

  return (geometry.arcs as number[][][]).map((polygon) =>
    polygon.map((ring) => assembleRing(ring))
  );
};

const polandGeometries: Map<string, PolygonGeometry> = new Map(
  polandTopologyTyped.objects.default.geometries.map((geometry) => {
    const hcKey = geometry.properties['hc-key'];
    return [hcKey, { polygons: buildGeometry(geometry) }] as const;
  })
);

const polandBBox = polandTopologyTyped.bbox;

const computeRingCentroid = (
  ring: Coordinate[]
): { centroid: Coordinate; area: number } => {
  if (ring.length === 0) {
    return { centroid: [0, 0], area: 0 };
  }

  let twiceArea = 0;
  let centroidX = 0;
  let centroidY = 0;

  for (let index = 0; index < ring.length; index += 1) {
    const current = ring[index];
    const next = ring[(index + 1) % ring.length];
    const cross = current[0] * next[1] - next[0] * current[1];

    twiceArea += cross;
    centroidX += (current[0] + next[0]) * cross;
    centroidY += (current[1] + next[1]) * cross;
  }

  if (twiceArea === 0) {
    const fallback = ring.reduce<Coordinate>(
      (accumulator, coordinate) => [
        accumulator[0] + coordinate[0],
        accumulator[1] + coordinate[1],
      ],
      [0, 0]
    );
    return {
      centroid: [fallback[0] / ring.length, fallback[1] / ring.length],
      area: 0,
    };
  }

  const area = twiceArea / 2;
  const centroid: Coordinate = [
    centroidX / (3 * twiceArea),
    centroidY / (3 * twiceArea),
  ];

  return { centroid, area: Math.abs(area) };
};

const computeGeometryCentroid = (geometry: PolygonGeometry): Coordinate => {
  let largestArea = 0;
  let bestCentroid: Coordinate | null = null;

  geometry.polygons.forEach((polygon) => {
    if (polygon.length === 0) {
      return;
    }

    const { centroid, area } = computeRingCentroid(polygon[0]);

    if (area > largestArea && Number.isFinite(centroid[0]) && Number.isFinite(centroid[1])) {
      largestArea = area;
      bestCentroid = centroid;
    }
  });

  if (bestCentroid) {
    return bestCentroid;
  }

  const allCoordinates: Coordinate[] = [];
  geometry.polygons.forEach((polygon) => {
    polygon.forEach((ring) => {
      ring.forEach((coordinate) => {
        allCoordinates.push(coordinate);
      });
    });
  });

  if (allCoordinates.length === 0) {
    return [0, 0];
  }

  const sum = allCoordinates.reduce<Coordinate>(
    (accumulator, coordinate) => [
      accumulator[0] + coordinate[0],
      accumulator[1] + coordinate[1],
    ],
    [0, 0]
  );

  return [sum[0] / allCoordinates.length, sum[1] / allCoordinates.length];
};

const polandRegionCentroids: Map<string, Coordinate> = new Map(
  Array.from(polandGeometries.entries()).map(([hcKey, geometry]) => [
    hcKey,
    computeGeometryCentroid(geometry),
  ])
);

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

const hexToRgb = (hex: string): RGBColor => {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized
        .split('')
        .map((char) => `${char}${char}`)
        .join('')
    : normalized;
  const intValue = parseInt(value, 16);
  return {
    r: (intValue >> 16) & 255,
    g: (intValue >> 8) & 255,
    b: intValue & 255,
  };
};

const interpolateHex = (start: string, end: string, t: number): string => {
  const startRgb = hexToRgb(start);
  const endRgb = hexToRgb(end);

  const clamp = (value: number) => Math.max(0, Math.min(255, value));

  const r = clamp(startRgb.r + (endRgb.r - startRgb.r) * t);
  const g = clamp(startRgb.g + (endRgb.g - startRgb.g) * t);
  const b = clamp(startRgb.b + (endRgb.b - startRgb.b) * t);

  const toHex = (value: number) => Math.round(value).toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const getColorForValue = (
  value: number,
  min: number,
  max: number,
  stops: Array<{ offset: number; color: string }>
): string => {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
    return '#E0E4EC';
  }

  if (max === min) {
    return stops[stops.length - 1]?.color ?? '#BAD4C4';
  }

  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const sortedStops = [...stops].sort((a, b) => a.offset - b.offset);

  for (let index = 0; index < sortedStops.length - 1; index += 1) {
    const current = sortedStops[index];
    const next = sortedStops[index + 1];

    if (normalized >= current.offset && normalized <= next.offset) {
      const range = next.offset - current.offset || 1;
      const localT = (normalized - current.offset) / range;
      return interpolateHex(current.color, next.color, localT);
    }
  }

  return sortedStops[sortedStops.length - 1]?.color ?? '#BAD4C4';
};

const getChartHints = (chart: RetirementReportChart): string[] => {
  switch (chart.id) {
    case 'chart-pension-forecast':
      return [
        'Przesuń wiek przejścia na emeryturę w symulatorze, aby sprawdzić jak zmienia się wysokość świadczenia.',
        'Zwróć uwagę na linię realnej wartości – pokazuje siłę nabywczą po uwzględnieniu inflacji.',
      ];
    case 'chart-replacement':
      return [
        'Porównaj wskaźnik zastąpienia z planowanym stylem życia – im wyższy odsetek, tym mniejsza luka dochodowa.',
        'Rozważ dodatkowe oszczędzanie, jeśli słupek „Pozostałe” jest znaczący.',
      ];
    case 'chart-sick-leave':
      return [
        'Krótsze zwolnienia lekarskie i regularne składki pomagają ograniczyć spadek emerytury.',
        'Pomyśl o planie awaryjnym finansowym, jeśli przerwy w pracy są częste.',
      ];
    case 'chart-contribution-history':
      return [
        'Stały wzrost kapitału świadczy o stabilnych wpłatach – sprawdź czy w Twoim przypadku trend jest rosnący.',
        'W razie przerw w opłacaniu składek rozważ nadrobienie braków, aby poprawić prognozę.',
      ];
    case 'chart-scenarios':
      return [
        'Scenariusz pesymistyczny zakłada gorszą koniunkturę – przygotuj poduszkę finansową na tę ewentualność.',
        'Gdy planujesz większe cele, opieraj je na scenariuszu realistycznym lub konserwatywnym.',
      ];
    case 'chart-regional-benchmark':
      return [
        'Porównaj swoją prognozę z województwami – różnice wynikają m.in. z lokalnych zarobków.',
        'Jeśli planujesz przeprowadzkę, sprawdź jak zmieniłaby się średnia emerytura w docelowym regionie.',
      ];
    default:
      return [
        'Wykorzystaj powyższy wykres, aby sprawdzić wpływ swoich decyzji na prognozowaną emeryturę.',
      ];
  }
};

function PdfZusLogo({ width = 64 }: { width?: number }) {
  const height = (width / 110) * 60.712;

  return (
    <Svg width={width} height={height} viewBox="0 0 110 60.712">
      <Path
        d="M42.0402 0.1579l0.2259 0 -0.2259 0.4515 0 -0.4515zm67.9598 45.9687c-0.2484,-2.348 -1.0386,-4.922 -2.4385,-7.6314 -4.1995,-6.7959 -8.3765,-13.5692 -12.576,-20.3653 -4.8316,-7.4732 0.4743,-9.3473 7.067,-8.9183 0.9483,0.0452 1.6032,0.0903 2.5513,0.1356 -1.174,-3.1159 -2.0771,-6.2315 -3.2512,-9.3474 -3.1157,0 -6.209,0 -9.3246,0 -2.6869,0 -4.7866,0.3612 -7.3379,1.4451 -7.4057,3.1382 -8.1056,8.6699 -3.5674,17.2496 3.2512,5.1251 6.5024,10.2729 9.7538,15.4206 3.0931,5.893 1.0837,11.6052 -5.9155,11.6052l-42.9208 0 0 14.9917c16.7981,0 33.5509,0 50.3264,0 2.1901,0 4.0415,0.0226 6.1863,-0.474 6.7961,-1.5129 10.8375,-5.5543 11.4471,-11.0408l0 -3.0706zm-67.9598 -15.353c0.9936,6.5024 5.1253,11.8083 15.5336,12.5307 5.6897,0.4065 11.4471,-0.0903 17.1818,-0.1353l0 -43.0111 -10.747 0.1354 0 33.5283c-2.619,-0.0903 -5.2381,0 -7.7443,-0.9935 -4.38,-1.7384 -4.1318,-5.5992 -2.3932,-12.3049 2.1223,-6.8412 4.222,-13.6823 6.3443,-20.5234l-11.3114 0 -4.9446 15.0145c-0.8353,2.6416 -1.5579,5.5541 -1.9192,8.4441l0 7.3152zm-16.7303 -30.6157l16.7303 0 0 0.4515 -16.0981 33.2122 15.3304 0 -3.6575 9.3474 -12.3051 0 0 -43.0111zm16.7303 23.3005c-0.2934,2.4835 -0.3387,4.9897 0,7.3152l0 -7.3152zm0 22.2619l0 14.9917c-5.5766,0 -11.1534,0 -16.7303,0l0 -14.9917 16.7303 0zm-27.8612 -45.5624l11.1309 0 0 43.0111 -16.9786 0 16.2562 -33.5284 -14.9692 0.1356 4.5607 -9.6183zm11.1309 45.5624l0 14.9917c-8.4441,0 -16.8883,0 -25.3099,0l7.2023 -14.9917 18.1076 0z"
        fill="#00923F"
      />
    </Svg>
  );
}

function Highlights({ items }: { items: RetirementReportHighlight[] }) {
  return (
    <View style={styles.highlightRow}>
      {items.map((item) => (
        <View key={item.id} style={styles.highlightCard}>
          <PdfText style={styles.highlightLabel}>{item.label}</PdfText>
          <PdfText style={styles.highlightValue}>{item.value}</PdfText>
        </View>
      ))}
    </View>
  );
}

function ReportGroup({ title, summary, items }: RetirementReportGroup) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionAccent} />
        <PdfText style={styles.sectionTitle}>{title}</PdfText>
      </View>
      {summary ? (
        <PdfText style={styles.sectionSummary}>{summary}</PdfText>
      ) : null}
      {items.map((item) => (
        <View key={item.id} style={styles.itemRow} wrap={false}>
          <View style={styles.itemMeta}>
            <PdfText style={styles.itemLabel}>{item.label}</PdfText>
            {item.description ? (
              <PdfText style={styles.itemDescription}>
                {item.description}
              </PdfText>
            ) : null}
          </View>
          <PdfText style={styles.itemValue}>{item.formattedValue}</PdfText>
        </View>
      ))}
    </View>
  );
}

function ChartLegend({ series }: { series: RetirementReportChartSeries[] }) {
  if (!series.length) {
    return null;
  }

  return (
    <View style={styles.chartLegend}>
      {series.map((entry) => (
        <View key={entry.id} style={styles.legendItem}>
          <View
            style={[
              styles.legendSwatch,
              { backgroundColor: entry.color ?? ZUS_COLORS.blue },
            ]}
          />
          <PdfText style={styles.legendLabel}>{entry.label}</PdfText>
        </View>
      ))}
    </View>
  );
}

function LineChartSvg({ chart }: { chart: RetirementReportChart }) {
  const width = CHART_WIDTH;
  const height = CHART_HEIGHT;
  const { top, right, bottom, left } = CHART_MARGIN;
  const innerWidth = width - left - right;
  const innerHeight = height - top - bottom;

  const numericSeries = chart.series
    .map((series) => ({
      ...series,
      points: series.points
        .filter((point) => typeof point.x === 'number')
        .sort((a, b) => (a.x as number) - (b.x as number)),
    }))
    .filter((series) => series.points.length > 0);

  const numericPoints = numericSeries.flatMap(
    (series) => series.points
  ) as Array<{ x: number; y: number; color?: string }>;

  if (numericPoints.length === 0) {
    return (
      <View style={{ width, height }}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} />
      </View>
    );
  }

  let minX = Math.min(...numericPoints.map((point) => point.x));
  let maxX = Math.max(...numericPoints.map((point) => point.x));
  if (minX === maxX) {
    minX -= 1;
    maxX += 1;
  }

  let minY = Math.min(0, ...numericPoints.map((point) => point.y));
  let maxY = Math.max(...numericPoints.map((point) => point.y));
  if (minY === maxY) {
    minY = 0;
    maxY = minY + 1;
  }

  const xScale = (value: number) =>
    left + ((value - minX) / (maxX - minX)) * innerWidth;
  const yScale = (value: number) =>
    height - bottom - ((value - minY) / (maxY - minY)) * innerHeight;

  const xTickValues = Array.from(
    new Set(numericPoints.map((point) => point.x))
  ).sort((a, b) => a - b);
  const yTickCount = 4;
  const yTicks = Array.from(
    { length: yTickCount + 1 },
    (_, index) => minY + ((maxY - minY) / yTickCount) * index
  );

  const overlays: ReactElement[] = [];

  xTickValues.forEach((tick) => {
    const x = xScale(tick);
    overlays.push(
      <PdfText
        key={`x-label-${tick}`}
        style={[
          styles.chartOverlayText,
          {
            left: x - 25,
            top: height - bottom + 6,
            width: 50,
            textAlign: 'center',
          },
        ]}
      >
        {tick.toString()}
      </PdfText>
    );
  });

  yTicks.forEach((tickValue, index) => {
    const y = yScale(tickValue);
    overlays.push(
      <PdfText
        key={`y-label-${index}`}
        style={[
          styles.chartOverlayText,
          {
            left: left - 52,
            top: y - 6,
            width: 40,
            textAlign: 'right',
          },
        ]}
      >
        {formatAxisValue(tickValue)}
      </PdfText>
    );
  });

  return (
    <View style={{ width, height, position: 'relative' }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path
          d={`M ${left} ${height - bottom} L ${width - right} ${height - bottom}`}
          stroke="#D1D5DB"
          strokeWidth={1}
        />
        <Path
          d={`M ${left} ${top} L ${left} ${height - bottom}`}
          stroke="#D1D5DB"
          strokeWidth={1}
        />

        {yTicks.map((tickValue, index) => {
          const y = yScale(tickValue);
          return (
            <Path
              key={`y-grid-${index}`}
              d={`M ${left} ${y} L ${width - right} ${y}`}
              stroke="#E2E8F0"
              strokeWidth={index === 0 ? 1.5 : 1}
            />
          );
        })}

        {xTickValues.map((tick) => {
          const x = xScale(tick);
          return (
            <Path
              key={`x-tick-mark-${tick}`}
              d={`M ${x} ${height - bottom} L ${x} ${height - bottom + 6}`}
              stroke="#94A3B8"
              strokeWidth={1}
            />
          );
        })}

        {numericSeries.map((series) => {
          const stroke = series.color ?? ZUS_COLORS.blue;
          const pathDefinition = series.points
            .map((point, index) => {
              const prefix = index === 0 ? 'M' : 'L';
              return `${prefix} ${xScale(point.x as number)} ${yScale(point.y)}`;
            })
            .join(' ');

          return (
            <G key={series.id}>
              <Path
                d={pathDefinition}
                stroke={stroke}
                strokeWidth={2.5}
                fill="none"
              />
              {series.points.map((point, index) => (
                <Circle
                  key={`${series.id}-point-${index}`}
                  cx={xScale(point.x as number)}
                  cy={yScale(point.y)}
                  r={3.5}
                  fill={stroke}
                />
              ))}
            </G>
          );
        })}
      </Svg>

      {overlays}
    </View>
  );
}

function ColumnChartSvg({ chart }: { chart: RetirementReportChart }) {
  const width = CHART_WIDTH;
  const height = CHART_HEIGHT;
  const { top, right, bottom, left } = CHART_MARGIN;
  const innerWidth = width - left - right;
  const innerHeight = height - top - bottom;

  const columnSeries = chart.series.filter(
    (series) => (series.type ?? 'column') !== 'line'
  );
  const lineSeries = chart.series.filter(
    (series) => (series.type ?? 'column') === 'line'
  );

  const categoryOrder: string[] = [];
  chart.series.forEach((series) => {
    series.points.forEach((point) => {
      const key = String(point.x);
      if (!categoryOrder.includes(key)) {
        categoryOrder.push(key);
      }
    });
  });

  if (categoryOrder.length === 0) {
    return (
      <View style={{ width, height }}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} />
      </View>
    );
  }

  const columnValues = columnSeries.flatMap((series) =>
    series.points.map((point) => Math.max(0, point.y))
  );
  const columnMax = columnValues.length > 0 ? Math.max(...columnValues) : 0;
  const columnPadding = columnMax === 0 ? 0 : Math.max(columnMax * 0.12, 2);
  const paddedColumnMax = columnMax + columnPadding;
  const effectiveColumnMax = paddedColumnMax === 0 ? 1 : paddedColumnMax;

  const lineValues = lineSeries.flatMap((series) =>
    series.points.map((point) => Math.max(0, point.y))
  );
  const lineMax = lineValues.length > 0 ? Math.max(...lineValues) : 0;
  const linePadding = lineMax === 0 ? 0 : Math.max(lineMax * 0.12, 2);
  const paddedLineMax = lineMax + linePadding;
  const effectiveLineMax =
    paddedLineMax === 0
      ? effectiveColumnMax
      : Math.max(paddedLineMax, effectiveColumnMax);

  const yScaleColumn = (value: number) =>
    height - bottom - (Math.max(0, value) / effectiveColumnMax) * innerHeight;
  const yScaleLine = (value: number) =>
    height - bottom - (Math.max(0, value) / effectiveLineMax) * innerHeight;

  const step = innerWidth / categoryOrder.length;
  const categoryCenters = categoryOrder.map(
    (_, index) => left + index * step + step / 2
  );

  const yTickCount = 4;
  const columnTicks = Array.from(
    { length: yTickCount + 1 },
    (_, index) => (effectiveColumnMax / yTickCount) * index
  );
  const lineTicks = lineSeries.length
    ? Array.from(
        { length: yTickCount + 1 },
        (_, index) => (effectiveLineMax / yTickCount) * index
      )
    : [];

  const barSpacing = 6;

  const bars: ReactElement[] = [];
  const overlays: ReactElement[] = [];

  categoryOrder.forEach((categoryKey, index) => {
    const categoryCenter = categoryCenters[index];
    const entries = columnSeries
      .map((series) => {
        const point = series.points.find(
          (point) => String(point.x) === categoryKey
        );
        return point
          ? {
              series,
              point,
            }
          : null;
      })
      .filter(
        (
          entry
        ): entry is {
          series: RetirementReportChartSeries;
          point: { x: number | string; y: number; color?: string };
        } => entry !== null
      );

    if (entries.length === 0) {
      return;
    }

    const barWidth = Math.min(32, (step * 0.7) / entries.length);
    const totalWidth =
      entries.length * barWidth + Math.max(0, entries.length - 1) * barSpacing;
    let currentX = categoryCenter - totalWidth / 2;

    entries.forEach((entry, entryIndex) => {
      const barTop = yScaleColumn(entry.point.y);
      const heightValue = Math.max(0, yScaleColumn(0) - barTop);
      const fill = entry.series.color ?? ZUS_COLORS.green;

      const barX = currentX;

      bars.push(
        <Rect
          key={`bar-${categoryKey}-${entry.series.id}-${entryIndex}`}
          x={barX}
          y={barTop}
          width={barWidth}
          height={heightValue}
          fill={fill}
          rx={3}
        />
      );

      const label = formatColumnValue(chart, entry.point.y);
      if (label) {
        const labelX = barX + barWidth / 2;
        const textHeight = 12; // approx text height including padding
        const rawLabelY = barTop - textHeight;
        const lowerBound = top + textHeight / 2;
        const upperBound = barTop - 4;
        const boundedLabelY = Math.min(
          upperBound,
          Math.max(lowerBound, rawLabelY)
        );
        const labelY = Math.max(top + 4, boundedLabelY);
        overlays.push(
          <PdfText
            key={`bar-label-${categoryKey}-${entry.series.id}-${entryIndex}`}
            style={[
              styles.chartValueLabel,
              {
                left: labelX - 30,
                top: labelY,
                width: 60,
              },
            ]}
          >
            {label}
          </PdfText>
        );
      }

      currentX += barWidth + barSpacing;
    });
  });

  columnTicks.forEach((tickValue, index) => {
    const y = yScaleColumn(tickValue);
    overlays.push(
      <PdfText
        key={`column-y-label-${index}`}
        style={[
          styles.chartOverlayText,
          {
            left: left - 52,
            top: y - 6,
            width: 40,
            textAlign: 'right',
          },
        ]}
      >
        {formatAxisValue(tickValue)}
      </PdfText>
    );
  });

  lineTicks.forEach((tickValue, index) => {
    const y = yScaleLine(tickValue);
    overlays.push(
      <PdfText
        key={`line-y-label-${index}`}
        style={[
          styles.chartOverlayText,
          {
            left: width - right + 12,
            top: y - 6,
            width: 40,
            textAlign: 'left',
          },
        ]}
      >
        {formatAxisValue(tickValue)}
      </PdfText>
    );
  });

  categoryOrder.forEach((categoryKey, index) => {
    const x = categoryCenters[index];
    overlays.push(
      <PdfText
        key={`column-x-label-${categoryKey}`}
        style={[
          styles.chartOverlayText,
          {
            left: x - 30,
            top: height - bottom + 6,
            width: 60,
            textAlign: 'center',
          },
        ]}
      >
        {categoryKey}
      </PdfText>
    );
  });

  return (
    <View style={{ width, height, position: 'relative' }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path
          d={`M ${left} ${height - bottom} L ${width - right} ${height - bottom}`}
          stroke="#D1D5DB"
          strokeWidth={1}
        />
        <Path
          d={`M ${left} ${top} L ${left} ${height - bottom}`}
          stroke="#D1D5DB"
          strokeWidth={1}
        />

        {columnTicks.map((tickValue, index) => {
          const y = yScaleColumn(tickValue);
          return (
            <Path
              key={`column-grid-${index}`}
              d={`M ${left} ${y} L ${width - right} ${y}`}
              stroke="#E2E8F0"
              strokeWidth={index === 0 ? 1.5 : 1}
            />
          );
        })}

        {categoryOrder.map((categoryKey, index) => {
          const x = categoryCenters[index];
          return (
            <Path
              key={`column-tick-${categoryKey}`}
              d={`M ${x} ${height - bottom} L ${x} ${height - bottom + 6}`}
              stroke="#94A3B8"
              strokeWidth={1}
            />
          );
        })}

        {bars}

        {lineSeries.map((series) => {
          const coordinates = categoryOrder
            .map((categoryKey, idx) => {
              const point = series.points.find(
                (point) => String(point.x) === categoryKey
              );
              if (!point) {
                return null;
              }
              return {
                x: categoryCenters[idx],
                y: yScaleLine(point.y),
              };
            })
            .filter(
              (coordinate): coordinate is { x: number; y: number } =>
                coordinate !== null
            );

          if (coordinates.length === 0) {
            return null;
          }

          const stroke = series.color ?? ZUS_COLORS.blue;
          const pathDefinition = coordinates
            .map((coordinate, idx) => {
              const prefix = idx === 0 ? 'M' : 'L';
              return `${prefix} ${coordinate.x} ${coordinate.y}`;
            })
            .join(' ');

          return (
            <G key={`line-series-${series.id}`}>
              <Path
                d={pathDefinition}
                stroke={stroke}
                strokeWidth={2.5}
                fill="none"
              />
              {coordinates.map((coordinate, idx) => (
                <Circle
                  key={`line-dot-${series.id}-${idx}`}
                  cx={coordinate.x}
                  cy={coordinate.y}
                  r={3.5}
                  fill={stroke}
                />
              ))}
            </G>
          );
        })}
      </Svg>

      {overlays}
    </View>
  );
}

function MapChartSvg({ chart }: { chart: RetirementReportMapChart }) {
  const width = CHART_WIDTH;
  const margin = 12;

  const { regions, min, max, stops } = chart.map;
  const regionByKey = new Map(regions.map((region) => [region.hcKey, region]));

  const [minX, minY, maxX, maxY] = polandBBox;
  const spanX = maxX - minX;
  const spanY = maxY - minY;

  const baseHeightFromAspect =
    spanX > 0
      ? spanY * ((width - margin * 2) / spanX) + margin * 2
      : CHART_HEIGHT;
  const height = Math.max(CHART_HEIGHT, Math.round(baseHeightFromAspect));

  const usableWidth = width - margin * 2;
  const usableHeight = height - margin * 2;
  const scale =
    spanX > 0 && spanY > 0
      ? Math.min(usableWidth / spanX, usableHeight / spanY)
      : 1;

  const projectedWidth = spanX * scale;
  const projectedHeight = spanY * scale;

  const offsetX = (width - projectedWidth) / 2;
  const offsetY = (height - projectedHeight) / 2;

  const project = (coordinate: Coordinate) => {
    const x = offsetX + (coordinate[0] - minX) * scale;
    const y = height - (offsetY + (coordinate[1] - minY) * scale);
    return { x, y };
  };

  const renderedPolygons = Array.from(polandGeometries.entries())
    .map(([hcKey, geometry]) => {
      const region = regionByKey.get(hcKey);
      const fillColor = region
        ? getColorForValue(region.value, min, max, stops)
        : '#E0E4EC';
      const strokeColor = region?.isSelected ? '#00416E' : '#D1D5DB';
      const strokeWidth = region?.isSelected ? 1.5 : 0.8;

      const paths = geometry.polygons.map((polygon) => {
        const pathSegments = polygon
          .map((ring) => {
            if (!ring.length) {
              return '';
            }

            const commands = ring
              .map((coordinate, index) => {
                const { x, y } = project(coordinate);
                const prefix = index === 0 ? 'M' : 'L';
                return `${prefix} ${x.toFixed(2)} ${y.toFixed(2)}`;
              })
              .join(' ');

            return `${commands} Z`;
          })
          .join(' ');

        return {
          d: pathSegments,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth,
        };
      });

      return paths;
    })
    .flat();

  const labelEntries = chart.map.regions
    .map((region) => {
      const centroid = polandRegionCentroids.get(region.hcKey);

      if (!centroid) {
        return null;
      }

      const projected = project(centroid);
      const clampedX = Math.min(Math.max(projected.x, margin), width - margin);
      const clampedY = Math.min(Math.max(projected.y, margin), height - margin);

      return {
        hcKey: region.hcKey,
        name: region.name,
        value: formatMapLegendValue(region.value, chart.map.valueSuffix),
        isSelected: Boolean(region.isSelected),
        x: clampedX,
        y: clampedY,
      };
    })
    .filter((entry): entry is {
      hcKey: string;
      name: string;
      value: string;
      isSelected: boolean;
      x: number;
      y: number;
    } => entry !== null);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {renderedPolygons.map((polygon, index) => (
          <Path
            key={`map-polygon-${index}`}
            d={polygon.d}
            fill={polygon.fill}
            stroke={polygon.stroke}
            strokeWidth={polygon.strokeWidth}
          />
        ))}
        {labelEntries.map((entry) => (
          <G key={`map-label-${entry.hcKey}`}>
            <SvgText
              x={entry.x}
              y={entry.y - 4}
              fontSize={7}
              fill={entry.isSelected ? ZUS_COLORS.navy : '#1F2937'}
              textAnchor="middle"
              fontWeight={entry.isSelected ? 'bold' : 'normal'}
              fontFamily="ZUS Sans"
            >
              {entry.name}
            </SvgText>
            <SvgText
              x={entry.x}
              y={entry.y + 6}
              fontSize={7}
              fill={entry.isSelected ? ZUS_COLORS.blue : '#475569'}
              textAnchor="middle"
              fontWeight={entry.isSelected ? 'bold' : 'normal'}
              fontFamily="ZUS Sans"
            >
              {entry.value}
            </SvgText>
          </G>
        ))}
      </Svg>
    </View>
  );
}

function MapLegend({ chart }: { chart: RetirementReportMapChart }) {
  const gradientId = `legend-gradient-${chart.id}`;

  return (
    <View style={styles.mapLegend} wrap={false}>
      <PdfText style={styles.mapLegendTitle}>{chart.map.legendLabel}</PdfText>
      <Svg width={180} height={14} viewBox="0 0 180 14">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            {chart.map.stops.map((stop, index) => (
              <Stop
                key={`legend-stop-${chart.id}-${index}`}
                offset={`${Math.round(stop.offset * 100)}%`}
                stopColor={stop.color}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={180}
          height={14}
          rx={7}
          ry={7}
          stroke="#E5E7EB"
          strokeWidth={0.6}
          fill={`url(#${gradientId})`}
        />
      </Svg>
      <View style={styles.mapLegendRange}>
        <PdfText style={styles.mapLegendValue}>
          {formatMapLegendValue(chart.map.min, chart.map.valueSuffix)}
        </PdfText>
        <PdfText style={styles.mapLegendValue}>
          {formatMapLegendValue(chart.map.max, chart.map.valueSuffix)}
        </PdfText>
      </View>
    </View>
  );
}

function MapSelectedSummary({
  chart,
}: {
  chart: RetirementReportMapChart;
}) {
  const selected = chart.map.selectedRegion;

  if (!selected) {
    return null;
  }

  const formattedAverage = formatMapLegendValue(
    selected.average,
    chart.map.valueSuffix
  );
  const formattedUser = formatMapLegendValue(
    selected.user,
    chart.map.valueSuffix
  );
  const difference = selected.user - selected.average;
  const formattedDifference = formatMapLegendValue(
    Math.abs(difference),
    chart.map.valueSuffix
  );

  const differenceText =
    difference > 0
      ? `To o ${formattedDifference} więcej niż średnia w regionie.`
      : difference < 0
        ? `To o ${formattedDifference} mniej niż średnia w regionie.`
        : 'Twoja prognoza odpowiada średniej w regionie.';

  return (
    <View style={styles.mapSummaryBox} wrap={false}>
      <PdfText style={styles.mapSummaryTitle}>
        Wybrane województwo: {selected.name}
      </PdfText>
      <PdfText style={styles.mapSummaryText}>
        Średnia emerytura: {formattedAverage}
      </PdfText>
      <PdfText style={styles.mapSummaryText}>
        Twoja prognoza: {formattedUser}
      </PdfText>
      <PdfText style={styles.mapSummaryText}>{differenceText}</PdfText>
    </View>
  );
}

const isSeriesChart = (
  chart: RetirementReportChart
): chart is RetirementReportSeriesChart =>
  chart.type === 'line' || chart.type === 'column';

const isMapChart = (
  chart: RetirementReportChart
): chart is RetirementReportMapChart => chart.type === 'map';

function ChartRenderer({ chart }: { chart: RetirementReportChart }) {
  if (chart.type === 'line') {
    return <LineChartSvg chart={chart} />;
  }
  if (chart.type === 'column') {
    return <ColumnChartSvg chart={chart} />;
  }
  return <MapChartSvg chart={chart} />;
}

export function RetirementReportDocument({
  dataset,
  generatedAt,
}: RetirementReportDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.metaHeader} fixed>
          <View style={styles.metaLogoWrapper}>
            <PdfZusLogo width={64} />
          </View>
          <View style={styles.metaInfo}>
            <PdfText style={styles.metaText}>
              Raport wygenerowano:{' '}
              <PdfText style={styles.metaValue}>{generatedAt}</PdfText>
            </PdfText>
          </View>
        </View>

        <View style={styles.header}>
          <PdfText style={styles.headerTitle}>
            Raport prognozowanej emerytury
          </PdfText>
          <PdfText style={styles.headerSubtitle}>
            Podsumowanie na podstawie danych wprowadzonych w symulatorze oraz
            założeń statystycznych ZUS.
          </PdfText>
          <View style={styles.headerDivider} />
          <Highlights items={dataset.highlights} />
        </View>

        <ReportGroup {...dataset.derived} />

        {dataset.charts.length > 0 ? (
          <View style={styles.chartsSection} break>
            {dataset.charts.map((chart) => {
              const isSeries = isSeriesChart(chart);
              const isMap = isMapChart(chart);
              const hints = getChartHints(chart);

              return (
                <View key={chart.id} style={styles.chartCard} wrap={false}>
                  <View style={styles.chartsHeaderRow}>
                    <View style={styles.sectionAccent} />
                    <PdfText style={styles.chartsSectionTitle}>
                      {chart.title}
                    </PdfText>
                  </View>
                  {chart.description ? (
                    <PdfText style={styles.chartDescription}>
                      {chart.description}
                    </PdfText>
                  ) : null}
                  <View style={styles.chartCanvasWrapper} wrap={false}>
                    <ChartRenderer chart={chart} />
                  </View>
                  {isSeries ? (
                    <View style={styles.chartAxesRow}>
                      <PdfText style={styles.chartAxisLabel}>
                        Oś Y: {chart.yLabel ?? 'brak opisu'}
                      </PdfText>
                      <PdfText style={styles.chartAxisLabel}>
                        Oś X: {chart.xLabel ?? 'brak opisu'}
                      </PdfText>
                    </View>
                  ) : null}
                  {isSeries ? <ChartLegend series={chart.series} /> : null}
                  {isMap ? (
                    <>
                      <MapLegend chart={chart} />
                      <MapSelectedSummary chart={chart} />
                    </>
                  ) : null}
                  {hints.length ? (
                    <View style={styles.chartHintBox} wrap={false}>
                      <PdfText style={styles.chartHintTitle}>
                        Wskazówki dla Ciebie
                      </PdfText>
                      {hints.map((hint, index) => (
                        <PdfText
                          key={`chart-hint-${chart.id}-${index}`}
                          style={styles.chartHintLine}
                        >
                          • {hint}
                        </PdfText>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.notesBox} wrap={false}>
          <PdfText style={styles.notesTitle}>Uwagi do odczytu</PdfText>
          {dataset.notes.map((note, index) => (
            <PdfText
              key={`${index}-${note.slice(0, 8)}`}
              style={styles.noteLine}
            >
              • {note}
            </PdfText>
          ))}
        </View>
      </Page>
    </Document>
  );
}
