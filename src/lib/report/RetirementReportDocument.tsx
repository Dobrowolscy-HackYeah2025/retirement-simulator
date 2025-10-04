import ZusSansBold from '@/lib/report/fonts/DejaVuSans-Bold.ttf';
import ZusSansRegular from '@/lib/report/fonts/DejaVuSans.ttf';
import type {
  RetirementReportData,
  RetirementReportGroup,
  RetirementReportHighlight,
} from '@/lib/report/types';

import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
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

function Highlights({ items }: { items: RetirementReportHighlight[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.highlightRow}>
      {items.map((item) => (
        <View key={item.id} style={styles.highlightCard}>
          <Text style={styles.highlightLabel}>{item.label}</Text>
          <Text style={styles.highlightValue}>{item.value}</Text>
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
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {summary ? <Text style={styles.sectionSummary}>{summary}</Text> : null}
      {items.map((item) => (
        <View key={item.id} style={styles.itemRow} wrap={false}>
          <View style={styles.itemMeta}>
            <Text style={styles.itemLabel}>{item.label}</Text>
            {item.description ? (
              <Text style={styles.itemDescription}>{item.description}</Text>
            ) : null}
          </View>
          <Text style={styles.itemValue}>{item.formattedValue}</Text>
        </View>
      ))}
    </View>
  );
}

export function RetirementReportDocument({
  dataset,
  generatedAt,
}: RetirementReportDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.metaHeader} fixed>
          <Text style={styles.metaText}>
            Raport wygenerowano:{' '}
            <Text style={styles.metaValue}>{generatedAt}</Text>
          </Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Raport prognozowanej emerytury</Text>
          <Text style={styles.headerSubtitle}>
            Podsumowanie na podstawie danych wprowadzonych w symulatorze oraz
            założeń statystycznych ZUS.
          </Text>
          <View style={styles.headerDivider} />
          <Highlights items={dataset.highlights} />
        </View>

        <ReportGroup {...dataset.derived} />

        {dataset.notes.length > 0 ? (
          <View style={styles.notesBox} wrap={false}>
            <Text style={styles.notesTitle}>Uwagi do odczytu</Text>
            {dataset.notes.map((note, index) => (
              <Text
                key={`${index}-${note.slice(0, 8)}`}
                style={styles.noteLine}
              >
                • {note}
              </Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
