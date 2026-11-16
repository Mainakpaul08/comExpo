import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Search, TrendingUp } from 'lucide-react-native';
import { CompanyLogo, RatingBadge, VerificationBadge } from '../../src/components/CommonUI';
import { useCorpora } from '../../src/context/CorporaContext';
import { INDUSTRIES } from '../../src/data/demoData';
import { Colors } from '../../src/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const { companies, reviews, setExploreFilters } = useCorpora();
  const [searchText, setSearchText] = useState('');

  const trending = useMemo(
    () => companies.filter((c) => c.trendingRank).sort((a, b) => a.trendingRank - b.trendingRank),
    [companies]
  );

  const insights = useMemo(() => {
    const bestWlb = [...companies].sort((a, b) => b.ratings.workLifeBalance - a.ratings.workLifeBalance)[0];
    const bestSat = [...companies].sort((a, b) => b.employeeSatisfaction - a.employeeSatisfaction)[0];
    const bestGrowth = [...companies].sort((a, b) => b.ratings.careerGrowth - a.ratings.careerGrowth)[0];
    const mostReviewed = [...companies].sort((a, b) => b.reviewCount - a.reviewCount)[0];
    return [
      { label: 'Best work-life balance', company: bestWlb, stat: `${bestWlb.ratings.workLifeBalance.toFixed(1)} / 5.0` },
      { label: 'Highest satisfaction', company: bestSat, stat: `${bestSat.employeeSatisfaction.toFixed(1)} / 5.0` },
      { label: 'Best career growth', company: bestGrowth, stat: `${bestGrowth.ratings.careerGrowth.toFixed(1)} / 5.0` },
      { label: 'Most reviewed', company: mostReviewed, stat: `${mostReviewed.reviewCount.toLocaleString()} reviews` },
    ];
  }, [companies]);

  const handleSearch = () => {
    setExploreFilters((prev) => ({ ...prev, query: searchText.trim() }));
    router.push('/(tabs)/explore');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.brandWordmark}>CORPORA</Text>
        <Pressable accessibilityLabel="Notifications" style={styles.iconBtn}>
          <Bell size={20} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>Good morning, Mainak</Text>

        <View style={styles.searchBox}>
          <Search size={18} color={Colors.textMuted} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            placeholder="Search companies, industries or roles"
            placeholderTextColor={Colors.textSubtle}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroKicker}>YOUR CAREER INTELLIGENCE</Text>
          <Text style={styles.heroTitle}>
            Know where you&apos;re working before you start working.
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/explore')}
            style={styles.heroBtn}
          >
            <Text style={styles.heroBtnText}>Explore companies</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Companies · Demo data</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {trending.map((comp) => (
              <Pressable
                key={comp.id}
                onPress={() => router.push(`/company/${comp.id}`)}
                style={styles.trendingCard}
              >
                <View style={styles.trendingTop}>
                  <CompanyLogo company={comp} size={40} />
                  <RatingBadge score={comp.overallRating} compact />
                </View>
                <Text style={styles.trendingName} numberOfLines={1}>{comp.name}</Text>
                <Text style={styles.trendingMeta} numberOfLines={1}>
                  {comp.industry} · {comp.reviewCount} reviews
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workplace Insights</Text>
          <View style={styles.grid}>
            {insights.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => router.push(`/company/${item.company.id}`)}
                style={styles.insightCard}
              >
                <View style={styles.insightHeader}>
                  <Text style={styles.insightLabel}>{item.label}</Text>
                  <TrendingUp size={14} color={Colors.accent} />
                </View>
                <Text style={styles.insightCompany}>{item.company.name}</Text>
                <Text style={styles.insightStat}>{item.stat}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Employee Reports</Text>
          {reviews.slice(0, 3).map((rev) => {
            const comp = companies.find((c) => c.id === rev.companyId);
            return (
              <Pressable
                key={rev.id}
                onPress={() => router.push(`/company/${rev.companyId}`)}
                style={styles.reportCard}
              >
                <View style={styles.reportTop}>
                  <VerificationBadge status={rev.verificationBadge} />
                  <RatingBadge score={rev.overallRating} compact />
                </View>
                <Text style={styles.reportMeta}>
                  {rev.employmentStatus} · {rev.role} · {comp?.name} · {rev.date}
                </Text>
                <Text style={styles.reportBody} numberOfLines={2}>
                  {rev.shortReview}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore by Industry</Text>
          <View style={styles.industryWrap}>
            {INDUSTRIES.map((ind) => (
              <Pressable
                key={ind}
                onPress={() => {
                  setExploreFilters((prev) => ({ ...prev, industry: ind }));
                  router.push('/(tabs)/explore');
                }}
                style={styles.industryTile}
              >
                <Text style={styles.industryName}>{ind}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    height: 54,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandWordmark: { fontSize: 16, fontWeight: '800', letterSpacing: 1.1, color: Colors.textPrimary },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  container: { padding: 16, gap: 20, paddingBottom: 32 },
  greeting: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  searchBox: {
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14.5, color: Colors.textPrimary },
  heroCard: {
    backgroundColor: Colors.navy,
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  heroKicker: { fontSize: 11, fontWeight: '700', letterSpacing: 0.7, color: '#C7D2FE' },
  heroTitle: { fontSize: 19, fontWeight: '700', lineHeight: 25, color: '#FFFFFF' },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  heroBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  hList: { gap: 12 },
  trendingCard: {
    width: 220,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 8,
  },
  trendingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  trendingName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  trendingMeta: { fontSize: 12, color: Colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  insightCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 5,
  },
  insightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  insightLabel: { fontSize: 11.5, fontWeight: '600', color: Colors.textMuted, flex: 1 },
  insightCompany: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  insightStat: { fontSize: 12.5, fontWeight: '700', color: Colors.accent },
  reportCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 6,
  },
  reportTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportMeta: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  reportBody: { fontSize: 13, lineHeight: 19, color: Colors.textMuted },
  industryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  industryTile: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  industryName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
});
