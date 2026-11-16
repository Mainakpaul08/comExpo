import React, { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { CompanyCard } from '../../src/components/CommonUI';
import { useCorpora } from '../../src/context/CorporaContext';
import { INDUSTRIES } from '../../src/data/demoData';
import { Colors } from '../../src/theme/tokens';

export default function ExploreScreen() {
  const router = useRouter();
  const { companies, exploreFilters, setExploreFilters } = useCorpora();

  const filtered = useMemo(() => {
    const q = exploreFilters.query.trim().toLowerCase();
    return companies
      .filter((c) => {
        if (q && !c.name.toLowerCase().includes(q) && !c.industry.toLowerCase().includes(q)) return false;
        if (exploreFilters.industry !== 'All' && c.industry !== exploreFilters.industry) return false;
        if (exploreFilters.size !== 'All' && c.size !== exploreFilters.size) return false;
        if (c.overallRating < exploreFilters.minRating) return false;
        if (c.ratings.workLifeBalance < exploreFilters.minWlb) return false;
        return true;
      })
      .sort((a, b) => {
        if (exploreFilters.sortBy === 'reviewed') return b.reviewCount - a.reviewCount;
        if (exploreFilters.sortBy === 'recent') return (b.recentlyAddedScore || 0) - (a.recentlyAddedScore || 0);
        return b.overallRating - a.overallRating;
      });
  }, [companies, exploreFilters]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Companies</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.searchBox}>
          <Search size={18} color={Colors.textMuted} />
          <TextInput
            value={exploreFilters.query}
            onChangeText={(q) => setExploreFilters((prev) => ({ ...prev, query: q }))}
            placeholder="Search companies or industries"
            placeholderTextColor={Colors.textSubtle}
            style={styles.searchInput}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {['All', ...INDUSTRIES].map((ind) => {
            const active = exploreFilters.industry === ind;
            return (
              <Pressable
                key={ind}
                onPress={() => setExploreFilters((prev) => ({ ...prev, industry: ind }))}
                style={[styles.filterTab, active && styles.filterTabActive]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{ind}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sortRow}>
          {[
            { key: 'highest', label: 'Highest rated' },
            { key: 'reviewed', label: 'Most reviewed' },
            { key: 'recent', label: 'Recently added' },
          ].map((s) => {
            const active = exploreFilters.sortBy === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setExploreFilters((prev) => ({ ...prev, sortBy: s.key }))}
                style={[styles.sortBtn, active && styles.sortBtnActive]}
              >
                <Text style={[styles.sortText, active && styles.sortTextActive]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ gap: 12 }}>
          {filtered.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onPress={() => router.push(`/company/${company.id}`)}
            />
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
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  searchBox: {
    height: 46,
    backgroundColor: Colors.surface,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  filterRow: { gap: 8 },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: '#FFFFFF' },
  sortRow: { flexDirection: 'row', gap: 6 },
  sortBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
  },
  sortBtnActive: { backgroundColor: Colors.accentSoft },
  sortText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  sortTextActive: { color: Colors.accent },
});
