import type { ReactElement } from 'react';

import ZusSansBold from '@/lib/report/fonts/DejaVuSans-Bold.ttf';
import ZusSansRegular from '@/lib/report/fonts/DejaVuSans.ttf';
import type {
  RetirementReportChart,
  RetirementReportChartSeries,
  RetirementReportData,
  RetirementReportGroup,
  RetirementReportHighlight,
} from '@/lib/report/types';

import {
  Circle,
  Document,
  Font,
  G,
  Page,
  Path,
  Rect,
  StyleSheet,
  Svg,
  Text as PdfText,
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
    paddingTop: 90,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  },
  legendLabel: {
    fontSize: 9,
    color: ZUS_COLORS.navy,
    marginLeft: 4,
  },
  chartAxisCaption: {
    fontSize: 9,
    color: '#4B5563',
    marginBottom: 4,
  },
  chartAxisCaptionBottom: {
    fontSize: 9,
    color: '#4B5563',
    marginTop: 6,
    textAlign: 'center',
  },
  chartCanvasWrapper: {
    alignItems: 'center',
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
    borderColor: ZUS_COLORS.gray,
    backgroundColor: '#F8FAFC',
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
});

const CHART_WIDTH = 520;
const CHART_HEIGHT = 240;
const CHART_MARGIN = { top: 24, right: 28, bottom: 44, left: 60 } as const;
const numberFormatter = new Intl.NumberFormat('pl-PL');

const formatAxisValue = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0';
  }
  return numberFormatter.format(Math.round(value));
};

const SvgText: typeof PdfText =
  (Svg as unknown as { Text?: typeof PdfText }).Text ?? PdfText;

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
      {summary ? <PdfText style={styles.sectionSummary}>{summary}</PdfText> : null}
      {items.map((item) => (
        <View key={item.id} style={styles.itemRow} wrap={false}>
          <View style={styles.itemMeta}>
            <PdfText style={styles.itemLabel}>{item.label}</PdfText>
            {item.description ? (
              <PdfText style={styles.itemDescription}>{item.description}</PdfText>
            ) : null}
          </View>
          <PdfText style={styles.itemValue}>{item.formattedValue}</PdfText>
        </View>
      ))}
    </View>
  );
}

function ChartLegend({
  series,
}: {
  series: RetirementReportChartSeries[];
}) {
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

  const numericPoints = numericSeries.flatMap((series) => series.points) as Array<
    { x: number; y: number; color?: string }
  >;

  if (numericPoints.length === 0) {
    return (
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} />
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
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, index) =>
    minY + ((maxY - minY) / yTickCount) * index
  );

  return (
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

      {xTickValues.map((tick) => {
        const x = xScale(tick);
        return (
          <G key={`x-tick-${tick}`}>
            <Path
              d={`M ${x} ${height - bottom} L ${x} ${height - bottom + 6}`}
              stroke="#94A3B8"
              strokeWidth={1}
            />
            <SvgText
              x={x}
              y={height - bottom + 20}
              fontSize={9}
              fill="#4B5563"
              textAnchor="middle"
            >
              {tick.toString()}
            </SvgText>
          </G>
        );
      })}

      {yTicks.map((tickValue, index) => {
        const y = yScale(tickValue);
        return (
          <G key={`y-tick-${index}`}>
            <Path
              d={`M ${left - 4} ${y} L ${width - right} ${y}`}
              stroke="#E2E8F0"
              strokeWidth={index === 0 ? 1.5 : 1}
            />
            <SvgText
              x={left - 8}
              y={y + 3}
              fontSize={9}
              fill="#4B5563"
              textAnchor="end"
            >
              {formatAxisValue(tickValue)}
            </SvgText>
          </G>
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
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} />
    );
  }

  const allValues = chart.series.flatMap((series) =>
    series.points.map((point) => point.y)
  );
  const maxValue = Math.max(...allValues, 0);
  const adjustedMax = maxValue === 0 ? 1 : maxValue;

  const step = innerWidth / categoryOrder.length;
  const categoryCenters = categoryOrder.map(
    (_, index) => left + index * step + step / 2
  );

  const yScale = (value: number) =>
    height - bottom - (value / adjustedMax) * innerHeight;

  const yTickCount = 4;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, index) =>
    (adjustedMax / yTickCount) * index
  );

  const barSpacing = 6;

  const bars: ReactElement[] = [];

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
      .filter((entry): entry is { series: RetirementReportChartSeries; point: { x: number | string; y: number; color?: string } } =>
        entry !== null
      );

    if (entries.length === 0) {
      return;
    }

    const barWidth = Math.min(32, (step * 0.7) / entries.length);
    const totalWidth =
      entries.length * barWidth + Math.max(0, entries.length - 1) * barSpacing;
    let currentX = categoryCenter - totalWidth / 2;

    entries.forEach((entry, entryIndex) => {
      const heightValue = Math.max(0, yScale(0) - yScale(entry.point.y));
      const barTop = yScale(entry.point.y);
      const fill = entry.series.color ?? ZUS_COLORS.green;

      bars.push(
        <Rect
          key={`bar-${categoryKey}-${entry.series.id}-${entryIndex}`}
          x={currentX}
          y={barTop}
          width={barWidth}
          height={heightValue}
          fill={fill}
          rx={3}
        />
      );

      currentX += barWidth + barSpacing;
    });
  });

  return (
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
          <G key={`column-y-${index}`}>
            <Path
              d={`M ${left - 4} ${y} L ${width - right} ${y}`}
              stroke="#E2E8F0"
              strokeWidth={index === 0 ? 1.5 : 1}
            />
            <SvgText
              x={left - 8}
              y={y + 3}
              fontSize={9}
              fill="#4B5563"
              textAnchor="end"
            >
              {formatAxisValue(tickValue)}
            </SvgText>
          </G>
        );
      })}

      {categoryOrder.map((categoryKey, index) => {
        const x = categoryCenters[index];
        return (
          <G key={`column-x-${categoryKey}`}>
            <Path
              d={`M ${x} ${height - bottom} L ${x} ${height - bottom + 6}`}
              stroke="#94A3B8"
              strokeWidth={1}
            />
            <SvgText
              x={x}
              y={height - bottom + 20}
              fontSize={9}
              fill="#4B5563"
              textAnchor="middle"
            >
              {categoryKey}
            </SvgText>
          </G>
        );
      })}

      {bars}

      {lineSeries.map((series) => {
        const coordinates = categoryOrder
          .map((categoryKey, index) => {
            const point = series.points.find(
              (point) => String(point.x) === categoryKey
            );
            if (!point) {
              return null;
            }
            return {
              x: categoryCenters[index],
              y: yScale(point.y),
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
          .map((coordinate, index) => {
            const prefix = index === 0 ? 'M' : 'L';
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
            {coordinates.map((coordinate, index) => (
              <Circle
                key={`line-dot-${series.id}-${index}`}
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
  );
}

function ChartRenderer({ chart }: { chart: RetirementReportChart }) {
  if (chart.type === 'line') {
    return <LineChartSvg chart={chart} />;
  }
  return <ColumnChartSvg chart={chart} />;
}

export function RetirementReportDocument({
  dataset,
  generatedAt,
}: RetirementReportDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.metaHeader} fixed>
          <PdfText style={styles.metaText}>
            Raport wygenerowano:{' '}
            <PdfText style={styles.metaValue}>{generatedAt}</PdfText>
          </PdfText>
        </View>

        <View style={styles.header}>
          <PdfText style={styles.headerTitle}>Raport prognozowanej emerytury</PdfText>
          <PdfText style={styles.headerSubtitle}>
            Podsumowanie na podstawie danych wprowadzonych w symulatorze oraz
            założeń statystycznych ZUS.
          </PdfText>
          <View style={styles.headerDivider} />
          <Highlights items={dataset.highlights} />
        </View>

        <ReportGroup {...dataset.derived} />

        {dataset.charts.length > 0 ? (
          <View style={styles.chartsSection}>
            <View style={styles.chartsHeaderRow}>
              <View style={styles.sectionAccent} />
              <PdfText style={styles.chartsSectionTitle}>Wizualizacje prognoz</PdfText>
            </View>

            {dataset.charts.map((chart) => (
              <View key={chart.id} style={styles.chartCard} wrap={false}>
                <PdfText style={styles.chartTitle}>{chart.title}</PdfText>
                {chart.description ? (
                  <PdfText style={styles.chartDescription}>{chart.description}</PdfText>
                ) : null}
                {chart.yLabel ? (
                  <PdfText style={styles.chartAxisCaption}>
                    Oś Y: {chart.yLabel}
                  </PdfText>
                ) : null}
                <View style={styles.chartCanvasWrapper} wrap={false}>
                  <ChartRenderer chart={chart} />
                </View>
                {chart.xLabel ? (
                  <PdfText style={styles.chartAxisCaptionBottom}>
                    Oś X: {chart.xLabel}
                  </PdfText>
                ) : null}
                <ChartLegend series={chart.series} />
              </View>
            ))}
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
