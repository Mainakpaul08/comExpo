import React, {useMemo, useState} from 'react';
import {ArrowLeftRight, Check, Plus, Trophy, X} from 'lucide-react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, View} from '../../rn';
import {useCorpora} from '../CorporaContext';
import {Colors, Typography} from '../theme';
import {Company} from '../types';
import {CompanyLogo, RatingBadge} from '../components/CommonUI';

const COMPARE_METRICS: Array<{
  key: string;
  label: string;
  getValue: (c: Company) => number;
}> = [
  {key: 'overall', label: 'Overall Rating', getValue: (c) => c.overallRating},
  {key: 'wlb', label: 'Work-Life Balance', getValue: (c) => c.ratings.workLifeBalance},
  {key: 'salary', label: 'Salary Satisfaction', getValue: (c) => c.ratings.salaryBenefits},
  {key: 'management', label: 'Management', getValue: (c) => c.ratings.management},
  {key: 'growth', label: 'Career Growth', getValue: (c) => c.ratings.careerGrowth},
  {key: 'security', label: 'Job Security', getValue: (c) => c.ratings.jobSecurity},
  {key: 'satisfaction', label: 'Employee Satisfaction', getValue: (c) => c.employeeSatisfaction},
];

const SLOT_COLORS = ['#4F46E5', '#0D9488', '#0F172A'];

export const CompareScreen: React.FC = () => {
  const {
    companies,
    compareIds,
    setCompareSlot,
    addCompareCompany,
    removeCompareSlot,
    openCompany,
  } = useCorpora();

  const [pickingSlotIndex, setPickingSlotIndex] = useState<number | null>(null);

  const selectedCompanies = useMemo(
    () =>
      compareIds
        .map((id) => companies.find((c) => c.id === id))
        .filter((c): c is Company => Boolean(c)),
    [companies, compareIds],
  );

  const unusedCompany = useMemo(
    () => companies.find((c) => !compareIds.includes(c.id)),
    [companies, compareIds],
  );

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.introHeader}>
        <View style={{flex: 1, gap: 3}}>
          <Text style={styles.screenTitle}>Company Comparison</Text>
          <Text style={styles.screenSubtitle}>
            Side-by-side workplace intelligence across {selectedCompanies.length} organizations · Demo data
          </Text>
        </View>
        {selectedCompanies.length < 3 && unusedCompany && (
          <Pressable
            onPress={() => addCompareCompany(unusedCompany.id)}
            style={styles.addThirdBtn}
          >
            <Plus size={15} color={Colors.accent} />
            <Text style={styles.addThirdText}>Add 3rd</Text>
          </Pressable>
        )}
      </View>

      {/* Selected Company Selector Slots */}
      <View className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        {selectedCompanies.map((comp, idx) => (
          <View key={`${comp.id}-${idx}`} style={styles.slotCard}>
            <View style={styles.slotTopBar}>
              <View style={styles.slotLabelRow}>
                <View style={[styles.slotMarker, {backgroundColor: SLOT_COLORS[idx % SLOT_COLORS.length]}]} />
                <Text style={styles.slotIndexText}>Company {idx + 1}</Text>
              </View>
              {selectedCompanies.length > 2 && (
                <Pressable
                  onPress={() => removeCompareSlot(idx)}
                  accessibilityLabel={`Remove ${comp.name} from comparison`}
                  style={styles.removeSlotBtn}
                >
                  <X size={14} color={Colors.textMuted} />
                </Pressable>
              )}
            </View>

            <Pressable onPress={() => openCompany(comp.id)} style={styles.slotIdentity}>
              <CompanyLogo company={comp} size={38} />
              <View style={{flex: 1, gap: 2}}>
                <Text style={styles.slotName} numberOfLines={1}>
                  {comp.name}
                </Text>
                <Text style={styles.slotIndustry} numberOfLines={1}>
                  {comp.industry}
                </Text>
              </View>
            </Pressable>

            <View style={styles.slotFooterRow}>
              <RatingBadge score={comp.overallRating} compact />
              <Pressable
                onPress={() => setPickingSlotIndex(idx)}
                style={styles.swapBtn}
              >
                <ArrowLeftRight size={13} color={Colors.accent} />
                <Text style={styles.swapBtnText}>Change</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Presets */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetsRow}
      >
        <Pressable
          onPress={() => {
            setCompareSlot(0, 'veltrix-cloud');
            setCompareSlot(1, 'meridian-ledger');
          }}
          style={styles.presetChip}
        >
          <Text style={styles.presetText}>Tech vs Finance: Veltrix & Meridian</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setCompareSlot(0, 'aurelia-biohealth');
            setCompareSlot(1, 'lumis-learning');
          }}
          style={styles.presetChip}
        >
          <Text style={styles.presetText}>Work-Life Leaders: Aurelia & Lumis</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setCompareSlot(0, 'kestrel-systems');
            setCompareSlot(1, 'cartwell-commerce');
          }}
          style={styles.presetChip}
        >
          <Text style={styles.presetText}>Enterprise Scale: Kestrel & Cartwell</Text>
        </Pressable>
      </ScrollView>

      {/* Side-by-Side Metric Charts */}
      <View style={styles.chartCard}>
        <Text style={styles.chartHeading}>Workplace Dimension Breakdown</Text>
        <Text style={styles.chartSubheading}>
          Scored out of 5.0 · Leading organization highlighted per metric
        </Text>

        <View style={{gap: 18, marginTop: 6}}>
          {COMPARE_METRICS.map((metric) => {
            const values = selectedCompanies.map((c) => metric.getValue(c));
            const maxVal = Math.max(...values);

            return (
              <View key={metric.key} style={styles.metricBlock}>
                <View style={styles.metricBlockHeader}>
                  <Text style={styles.metricBlockTitle}>{metric.label}</Text>
                </View>

                <View style={{gap: 8}}>
                  {selectedCompanies.map((comp, idx) => {
                    const val = metric.getValue(comp);
                    const isLeader = val === maxVal && values.filter((v) => v === maxVal).length === 1;
                    const pct = Math.max(8, (val / 5) * 100);
                    const barColor = SLOT_COLORS[idx % SLOT_COLORS.length];

                    return (
                      <View key={`${metric.key}-${comp.id}-${idx}`} style={styles.barRow}>
                        <View style={styles.barLabelCol}>
                          <Text style={styles.barCompanyName} numberOfLines={1}>
                            {comp.name}
                          </Text>
                        </View>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                width: `${pct}%`,
                                backgroundColor: barColor,
                                opacity: isLeader ? 1 : 0.72,
                              },
                            ]}
                          />
                        </View>
                        <View style={styles.barScoreCol}>
                          <Text
                            style={[
                              styles.barScoreText,
                              isLeader && {color: Colors.accent, fontWeight: 700},
                            ]}
                          >
                            {val.toFixed(1)}
                          </Text>
                          {isLeader && <Trophy size={12} color={Colors.accent} />}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Structural Snapshot Comparison */}
      <View style={styles.chartCard}>
        <Text style={styles.chartHeading}>Organization Snapshot</Text>
        <View style={styles.snapshotTable}>
          {[
            {
              label: 'Recommend to friend',
              render: (c: Company) => `${c.recommendPercent}%`,
            },
            {
              label: 'Culture score',
              render: (c: Company) => `${c.cultureScore} / 100`,
            },
            {
              label: 'CEO approval',
              render: (c: Company) => `${c.ceoApproval}%`,
            },
            {
              label: 'Company size',
              render: (c: Company) => c.size,
            },
            {
              label: 'Headquarters',
              render: (c: Company) => c.headquarters,
            },
            {
              label: 'Founded',
              render: (c: Company) => String(c.foundedYear),
            },
          ].map((row) => (
            <View key={row.label} style={styles.snapshotRow}>
              <Text style={styles.snapshotRowLabel}>{row.label}</Text>
              <View style={styles.snapshotValuesRow}>
                {selectedCompanies.map((c, idx) => (
                  <View key={`${row.label}-${c.id}-${idx}`} style={styles.snapshotCell}>
                    <Text style={styles.snapshotCellCompany} numberOfLines={1}>
                      {c.monogram}
                    </Text>
                    <Text style={styles.snapshotCellValue} numberOfLines={1}>
                      {row.render(c)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Company Picker Modal */}
      <Modal
        visible={pickingSlotIndex !== null}
        onRequestClose={() => setPickingSlotIndex(null)}
      >
        <View style={styles.pickerSheet}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>
              Select Company {(pickingSlotIndex ?? 0) + 1}
            </Text>
            <Pressable
              onPress={() => setPickingSlotIndex(null)}
              accessibilityLabel="Close company picker"
              style={styles.closeBtn}
            >
              <X size={18} color={Colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView style={{maxHeight: 400}} contentContainerStyle={{gap: 8}}>
            {companies.map((c) => {
              const isCurrent =
                pickingSlotIndex !== null && compareIds[pickingSlotIndex] === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    if (pickingSlotIndex !== null) {
                      setCompareSlot(pickingSlotIndex, c.id);
                    }
                    setPickingSlotIndex(null);
                  }}
                  style={[styles.pickerRow, isCurrent && styles.pickerRowActive]}
                >
                  <CompanyLogo company={c} size={36} />
                  <View style={{flex: 1}}>
                    <Text style={styles.pickerName}>{c.name}</Text>
                    <Text style={styles.pickerMeta}>
                      {c.industry} · {c.overallRating.toFixed(1)} / 5.0
                    </Text>
                  </View>
                  {isCurrent && <Check size={18} color={Colors.accent} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 36,
    gap: 16,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  screenTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 22,
    fontWeight: 700,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  addThirdBtn: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.accentBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addThirdText: {
    fontSize: 12.5,
    fontWeight: 600,
    color: Colors.accent,
  },
  slotCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 12,
    gap: 10,
  },
  slotTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slotMarker: {
    width: 10,
    height: 4,
    borderRadius: 2,
  },
  slotIndexText: {
    fontSize: 11.5,
    fontWeight: 600,
    color: Colors.textMuted,
  },
  removeSlotBtn: {
    minWidth: 28,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: Colors.surfaceSubtle,
  },
  slotIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slotName: {
    fontFamily: Typography.displayFont,
    fontSize: 14,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  slotIndustry: {
    fontSize: 11.5,
    color: Colors.textMuted,
  },
  slotFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: Colors.surfaceSubtle,
  },
  swapBtn: {
    minHeight: 34,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: Colors.accentSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swapBtnText: {
    fontSize: 12,
    fontWeight: 600,
    color: Colors.accent,
  },
  presetsRow: {
    gap: 8,
  },
  presetChip: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    justifyContent: 'center',
  },
  presetText: {
    fontSize: 12,
    fontWeight: 600,
    color: Colors.textSecondary,
    whiteSpace: 'nowrap',
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 16,
    gap: 10,
  },
  chartHeading: {
    fontFamily: Typography.displayFont,
    fontSize: 16.5,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  chartSubheading: {
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  metricBlock: {
    gap: 7,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: Colors.surfaceSubtle,
  },
  metricBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricBlockTitle: {
    fontSize: 13.5,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barLabelCol: {
    width: 108,
  },
  barCompanyName: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: 500,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  barScoreCol: {
    width: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  barScoreText: {
    fontFamily: Typography.monoFont,
    fontSize: 12.5,
    fontWeight: 600,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  snapshotTable: {
    gap: 10,
    marginTop: 4,
  },
  snapshotRow: {
    gap: 6,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: Colors.surfaceSubtle,
  },
  snapshotRowLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: Colors.textMuted,
  },
  snapshotValuesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  snapshotCell: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  snapshotCellCompany: {
    fontFamily: Typography.monoFont,
    fontSize: 10.5,
    fontWeight: 700,
    color: Colors.accent,
  },
  snapshotCellValue: {
    fontSize: 13,
    fontWeight: 600,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  pickerSheet: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 17,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  closeBtn: {
    minWidth: 40,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
  },
  pickerRowActive: {
    borderColor: Colors.accentBorder,
    backgroundColor: Colors.accentSoft,
  },
  pickerName: {
    fontSize: 14,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  pickerMeta: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
