import React, { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CompanyLogo, RatingBadge } from '../../src/components/CommonUI';
import { useCorpora } from '../../src/context/CorporaContext';
import { Colors } from '../../src/theme/tokens';

const METRICS = [
  { key: 'overall', label: 'Overall Rating', get: (c) => c.overallRating },
  { key: 'wlb', label: 'Work-Life Balance', get: (c) => c.ratings.workLifeBalance },
  { key: 'salary', label: 'Salary Satisfaction', get: (c) => c.ratings.salaryBenefits },
  { key: 'mgmt', label: 'Management', get: (c) => c.ratings.management },
  { key: 'growth', label: 'Career Growth', get: (c) => c.ratings.careerGrowth },
  { key: 'sec', label: 'Job Security', get: (c) => c.ratings.jobSecurity },
  { key: 'sat', label: 'Employee Satisfaction', get: (c) => c.employeeSatisfaction },
];

export default function CompareScreen() {
  const { companies, compareIds, setCompareIds } = useCorpora();

  const selected = useMemo(
    () => compareIds.map((id) => companies.find((c) => c.id === id)).filter(Boolean),
    [companies, compareIds]
  );

  const cycleCompany = (slotIdx) => {
    const currentId = compareIds[slotIdx];
    const idx = companies.findIndex((c) => c.id === currentId);
    const nextComp = companies[(idx + 1) % companies.length];
    setCompareIds((prev) => prev.map((id, i) => (i === slotIdx ? nextComp.id : id)));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Compare Companies</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.slotsRow}>
          {selected.map((comp, idx) => (
            <Pressable key={`${comp.id}-${idx}`} onPress={() => cycleCompany(idx)} style={styles.slotCard}>
              <CompanyLogo company={comp} size={36} />
              <Text style={styles.slotName} numberOfLines={1}>{comp.name}</Text>
              <RatingBadge score={comp.overallRating} compact />
              <Text style={styles.swapHint}>Tap to switch</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.chartCard}>
          {METRICS.map((m) => (
            <View key={m.key} style={styles.metricBlock}>
              <Text style={styles.metricTitle}>{m.label}</Text>
              {selected.map((comp, idx) => {
                const val = m.get(comp);
                return (
                  <View key={`${m.key}-${comp.id}-${idx}`} style={styles.barRow}>
                    <Text style={styles.barLabel} numberOfLines={1}>{comp.monogram}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${(val / 5) * 100}%`,
                            backgroundColor: idx === 0 ? Colors.accent : '#0D9488',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barValue}>{val.toFixed(1)}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 54,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  scroll: { flex: 1 },
  container: { padding: 16, gap: 14, paddingBottom: 32 },
  slotsRow: { flexDirection: 'row', gap: 10 },
  slotCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 6,
  },
  slotName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  swapHint: { fontSize: 11, color: Colors.accent, fontWeight: '600' },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 16,
  },
  metricBlock: { gap: 6 },
  metricTitle: { fontSize: 13.5, fontWeight: '700', color: Colors.textPrimary },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { width: 28, fontSize: 11.5, fontWeight: '700', color: Colors.textMuted },
  barTrack: { flex: 1, height: 9, borderRadius: 99, backgroundColor: Colors.surfaceSubtle, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99 },
  barValue: { width: 32, textAlign: 'right', fontSize: 12.5, fontWeight: '700', color: Colors.textPrimary },
});
