import React, {useEffect, useMemo, useState} from 'react';
import {RotateCcw, Search, SlidersHorizontal, X} from 'lucide-react';
import {Pressable, ScrollView, StyleSheet, Text, TextInput, View} from '../../rn';
import {useCorpora} from '../CorporaContext';
import {INDUSTRIES} from '../demoData';
import {Colors, Typography} from '../theme';
import {CompanySize} from '../types';
import {CompanyListCard, SkeletonBlock} from '../components/CommonUI';

const COMPANY_SIZES: Array<CompanySize | 'All'> = [
  'All',
  '1-200',
  '201-1,000',
  '1,001-5,000',
  '5,000+',
];

const MIN_RATINGS = [
  {label: 'Any rating', value: 0},
  {label: '4.0+ stars', value: 4.0},
  {label: '3.5+ stars', value: 3.5},
  {label: '3.0+ stars', value: 3.0},
];

const MIN_WLB = [
  {label: 'Any WLB', value: 0},
  {label: '4.5+ WLB', value: 4.5},
  {label: '4.0+ WLB', value: 4.0},
  {label: '3.5+ WLB', value: 3.5},
];

const SORT_OPTIONS: Array<{key: 'highest' | 'reviewed' | 'recent'; label: string}> = [
  {key: 'highest', label: 'Highest rated'},
  {key: 'reviewed', label: 'Most reviewed'},
  {key: 'recent', label: 'Recently added'},
];

export const ExploreScreen: React.FC = () => {
  const {
    companies,
    exploreFilters,
    setExploreFilters,
    resetExploreFilters,
    openCompany,
    profile,
    toggleSaveCompany,
  } = useCorpora();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  // Brief realistic loading shimmer when sort or industry filters change
  useEffect(() => {
    setIsFiltering(true);
    const t = setTimeout(() => setIsFiltering(false), 180);
    return () => clearTimeout(t);
  }, [
    exploreFilters.industry,
    exploreFilters.size,
    exploreFilters.minRating,
    exploreFilters.minWlb,
    exploreFilters.sortBy,
  ]);

  const filteredCompanies = useMemo(() => {
    const q = exploreFilters.query.trim().toLowerCase();
    return companies
      .filter((c) => {
        if (
          q &&
          !c.name.toLowerCase().includes(q) &&
          !c.industry.toLowerCase().includes(q) &&
          !c.headquarters.toLowerCase().includes(q) &&
          !c.tagline.toLowerCase().includes(q)
        ) {
          return false;
        }
        if (exploreFilters.industry !== 'All' && c.industry !== exploreFilters.industry) {
          return false;
        }
        if (exploreFilters.size !== 'All' && c.size !== exploreFilters.size) {
          return false;
        }
        if (c.overallRating < exploreFilters.minRating) {
          return false;
        }
        if (c.ratings.workLifeBalance < exploreFilters.minWlb) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (exploreFilters.sortBy === 'highest') {
          return b.overallRating - a.overallRating;
        }
        if (exploreFilters.sortBy === 'reviewed') {
          return b.reviewCount - a.reviewCount;
        }
        return (b.recentlyAddedScore ?? 0) - (a.recentlyAddedScore ?? 0);
      });
  }, [companies, exploreFilters]);

  const activeFilterCount =
    (exploreFilters.industry !== 'All' ? 1 : 0) +
    (exploreFilters.size !== 'All' ? 1 : 0) +
    (exploreFilters.minRating > 0 ? 1 : 0) +
    (exploreFilters.minWlb > 0 ? 1 : 0);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Search & Filter Toggle */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={18} color={Colors.textMuted} />
          <TextInput
            value={exploreFilters.query}
            onChangeText={(text) =>
              setExploreFilters((prev) => ({...prev, query: text}))
            }
            placeholder="Search companies, locations or industries"
            placeholderTextColor={Colors.textSubtle}
            style={styles.searchInput}
          />
          {exploreFilters.query.length > 0 && (
            <Pressable
              onPress={() => setExploreFilters((prev) => ({...prev, query: ''}))}
              accessibilityLabel="Clear search"
              style={styles.clearBtn}
            >
              <X size={16} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={() => setShowAdvancedFilters((v) => !v)}
          accessibilityLabel="Toggle filters"
          style={[
            styles.filterToggleBtn,
            (showAdvancedFilters || activeFilterCount > 0) && styles.filterToggleActive,
          ]}
        >
          <SlidersHorizontal
            size={18}
            color={
              showAdvancedFilters || activeFilterCount > 0
                ? Colors.accent
                : Colors.textPrimary
            }
          />
          {activeFilterCount > 0 && (
            <Text style={styles.filterCountText}>{activeFilterCount}</Text>
          )}
        </Pressable>
      </View>

      {/* Industry Filter Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterTabsRow}
      >
        {(['All', ...INDUSTRIES] as const).map((ind) => {
          const active = exploreFilters.industry === ind;
          return (
            <Pressable
              key={ind}
              onPress={() => setExploreFilters((prev) => ({...prev, industry: ind}))}
              style={[styles.filterTab, active && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                {ind}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Advanced Filters Drawer */}
      {showAdvancedFilters && (
        <View style={styles.advancedBox}>
          <View style={styles.advancedHeader}>
            <Text style={styles.advancedTitle}>Refine companies</Text>
            <Pressable onPress={resetExploreFilters} style={styles.resetLinkBtn}>
              <RotateCcw size={13} color={Colors.accent} />
              <Text style={styles.resetLinkText}>Reset</Text>
            </Pressable>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Company size</Text>
            <View style={styles.optionWrap}>
              {COMPANY_SIZES.map((sz) => {
                const active = exploreFilters.size === sz;
                return (
                  <Pressable
                    key={sz}
                    onPress={() => setExploreFilters((prev) => ({...prev, size: sz}))}
                    style={[styles.optionBtn, active && styles.optionBtnActive]}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {sz === 'All' ? 'All sizes' : `${sz} staff`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Minimum overall rating</Text>
            <View style={styles.optionWrap}>
              {MIN_RATINGS.map((r) => {
                const active = exploreFilters.minRating === r.value;
                return (
                  <Pressable
                    key={r.label}
                    onPress={() =>
                      setExploreFilters((prev) => ({...prev, minRating: r.value}))
                    }
                    style={[styles.optionBtn, active && styles.optionBtnActive]}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {r.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Work-life balance threshold</Text>
            <View style={styles.optionWrap}>
              {MIN_WLB.map((w) => {
                const active = exploreFilters.minWlb === w.value;
                return (
                  <Pressable
                    key={w.label}
                    onPress={() =>
                      setExploreFilters((prev) => ({...prev, minWlb: w.value}))
                    }
                    style={[styles.optionBtn, active && styles.optionBtnActive]}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {w.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* Sort & Result Summary */}
      <View style={styles.sortSummaryRow}>
        <Text style={styles.resultCountText}>
          <Text style={styles.resultCountStrong}>{filteredCompanies.length}</Text>{' '}
          {filteredCompanies.length === 1 ? 'company' : 'companies'} · Demo data
        </Text>

        <View style={styles.sortSegmented}>
          {SORT_OPTIONS.map((opt) => {
            const active = exploreFilters.sortBy === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setExploreFilters((prev) => ({...prev, sortBy: opt.key}))}
                style={[styles.sortBtn, active && styles.sortBtnActive]}
              >
                <Text style={[styles.sortText, active && styles.sortTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Company List / Loading / Empty */}
      {isFiltering ? (
        <View className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((idx) => (
            <View key={idx} style={styles.skeletonCard}>
              <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
                <SkeletonBlock width={44} height={44} radius={12} />
                <View style={{flex: 1, gap: 6}}>
                  <SkeletonBlock width="60%" height={16} />
                  <SkeletonBlock width="45%" height={12} />
                </View>
              </View>
              <SkeletonBlock width="90%" height={14} />
              <SkeletonBlock width="50%" height={12} />
            </View>
          ))}
        </View>
      ) : filteredCompanies.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No matching companies</Text>
          <Text style={styles.emptyBody}>
            No fictional demo organizations matched your current search or rating thresholds.
          </Text>
          <Pressable onPress={resetExploreFilters} style={styles.emptyResetBtn}>
            <RotateCcw size={15} color="#FFFFFF" />
            <Text style={styles.emptyResetText}>Reset all filters</Text>
          </Pressable>
        </View>
      ) : (
        <View className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredCompanies.map((company) => (
            <CompanyListCard
              key={company.id}
              company={company}
              onPress={() => openCompany(company.id)}
              isSaved={profile.savedCompanyIds.includes(company.id)}
              onToggleSave={() => toggleSaveCompany(company.id)}
            />
          ))}
        </View>
      )}
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
    gap: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    height: 46,
    backgroundColor: Colors.surface,
    borderRadius: 13,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  clearBtn: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterToggleBtn: {
    height: 46,
    minWidth: 46,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderRadius: 13,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  filterToggleActive: {
    borderColor: Colors.accentBorder,
    backgroundColor: Colors.accentSoft,
  },
  filterCountText: {
    fontFamily: Typography.monoFont,
    fontSize: 12,
    fontWeight: 700,
    color: Colors.accent,
  },
  filterTabsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  filterTab: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: 600,
    color: Colors.textSecondary,
    whiteSpace: 'nowrap',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  advancedBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 15,
    gap: 14,
  },
  advancedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  advancedTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 15,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  resetLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 6,
  },
  resetLinkText: {
    fontSize: 12.5,
    fontWeight: 600,
    color: Colors.accent,
  },
  filterGroup: {
    gap: 7,
  },
  filterGroupLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: Colors.textMuted,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  optionBtn: {
    minHeight: 36,
    paddingHorizontal: 11,
    borderRadius: 9,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBtnActive: {
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.accentBorder,
  },
  optionText: {
    fontSize: 12.5,
    fontWeight: 500,
    color: Colors.textSecondary,
    whiteSpace: 'nowrap',
  },
  optionTextActive: {
    color: Colors.accent,
    fontWeight: 600,
  },
  sortSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  resultCountText: {
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  resultCountStrong: {
    fontFamily: Typography.monoFont,
    fontWeight: 700,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  sortSegmented: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    padding: 3,
    borderRadius: 10,
    gap: 2,
  },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sortBtnActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  sortText: {
    fontSize: 12,
    fontWeight: 500,
    color: Colors.textMuted,
    whiteSpace: 'nowrap',
  },
  sortTextActive: {
    color: Colors.textPrimary,
    fontWeight: 600,
  },
  skeletonCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 28,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 17,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontSize: 13.5,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 19,
  },
  emptyResetBtn: {
    marginTop: 6,
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  emptyResetText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 600,
  },
});
