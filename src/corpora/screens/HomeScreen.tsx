import React, {useMemo, useState} from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Cpu,
  HeartPulse,
  Landmark,
  Search,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import {Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from '../../rn';
import {useCorpora} from '../CorporaContext';
import {HERO_OFFICE_IMAGE, INDUSTRIES} from '../demoData';
import {Colors, Typography} from '../theme';
import {Industry} from '../types';
import {
  CompanyLogo,
  RatingBadge,
  VerificationBadge,
} from '../components/CommonUI';

const INDUSTRY_ICONS: Record<Industry, React.ComponentType<{size?: number; color?: string}>> = {
  Technology: Cpu,
  Finance: Landmark,
  Healthcare: HeartPulse,
  Education: BookOpen,
  'E-commerce': ShoppingBag,
  Consulting: Briefcase,
};

export const HomeScreen: React.FC = () => {
  const {
    companies,
    reviews,
    openCompany,
    navigateToExploreWith,
  } = useCorpora();
  const [searchText, setSearchText] = useState('');

  const trendingCompanies = useMemo(
    () =>
      [...companies]
        .filter((c) => c.trendingRank !== undefined)
        .sort((a, b) => (a.trendingRank ?? 99) - (b.trendingRank ?? 99)),
    [companies],
  );

  const insights = useMemo(() => {
    const bestWlb = [...companies].sort(
      (a, b) => b.ratings.workLifeBalance - a.ratings.workLifeBalance,
    )[0];
    const bestSat = [...companies].sort(
      (a, b) => b.employeeSatisfaction - a.employeeSatisfaction,
    )[0];
    const bestGrowth = [...companies].sort(
      (a, b) => b.ratings.careerGrowth - a.ratings.careerGrowth,
    )[0];
    const mostReviewed = [...companies].sort(
      (a, b) => b.reviewCount - a.reviewCount,
    )[0];

    return [
      {
        label: 'Best work-life balance',
        company: bestWlb,
        stat: `${bestWlb.ratings.workLifeBalance.toFixed(1)} / 5.0`,
      },
      {
        label: 'Highest satisfaction',
        company: bestSat,
        stat: `${bestSat.employeeSatisfaction.toFixed(1)} / 5.0`,
      },
      {
        label: 'Best career growth',
        company: bestGrowth,
        stat: `${bestGrowth.ratings.careerGrowth.toFixed(1)} / 5.0`,
      },
      {
        label: 'Most reviewed',
        company: mostReviewed,
        stat: `${mostReviewed.reviewCount.toLocaleString()} reviews`,
      },
    ];
  }, [companies]);

  const recentReviews = useMemo(() => reviews.slice(0, 4), [reviews]);

  const quickSearchMatches = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return [];
    return companies
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q),
      )
      .slice(0, 4);
  }, [companies, searchText]);

  const handleSearchSubmit = () => {
    navigateToExploreWith({query: searchText.trim()});
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      {/* Greeting & Search */}
      <View style={styles.greetingBlock}>
        <Text style={styles.greetingDate}>Monday, November 16</Text>
        <Text style={styles.greetingTitle}>Good morning, Mainak</Text>

        <View style={styles.searchBarWrap}>
          <Search size={18} color={Colors.textMuted} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search companies, industries or roles"
            placeholderTextColor={Colors.textSubtle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit();
            }}
            style={styles.searchInput}
          />
          {searchText.trim().length > 0 && (
            <Pressable onPress={handleSearchSubmit} style={styles.searchGoBtn}>
              <Text style={styles.searchGoText}>Search</Text>
            </Pressable>
          )}
        </View>

        {quickSearchMatches.length > 0 && (
          <View style={styles.quickMatchesBox}>
            {quickSearchMatches.map((comp) => (
              <Pressable
                key={comp.id}
                onPress={() => openCompany(comp.id)}
                style={styles.quickMatchRow}
              >
                <CompanyLogo company={comp} size={32} />
                <View style={{flex: 1}}>
                  <Text style={styles.quickMatchName}>{comp.name}</Text>
                  <Text style={styles.quickMatchMeta}>
                    {comp.industry} · {comp.headquarters}
                  </Text>
                </View>
                <RatingBadge score={comp.overallRating} compact />
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* A. Your Career Intelligence */}
      <View style={styles.heroCard}>
        <View style={styles.heroImageWrap}>
          <Image
            source={{uri: HERO_OFFICE_IMAGE}}
            alt="Minimalist architectural workplace interior"
            style={styles.heroImage}
          />
          <View style={styles.heroScrim} />
          <View style={styles.heroOverlayContent}>
            <Text style={styles.heroKicker}>YOUR CAREER INTELLIGENCE</Text>
            <Text style={styles.heroHeadline}>
              Know where you&apos;re working before you start working.
            </Text>
          </View>
        </View>
        <View style={styles.heroFooter}>
          <Text style={styles.heroSubcopy}>
            Verified employee reports, salary bands, and culture metrics across 9 sample organizations.
          </Text>
          <Pressable
            onPress={() => navigateToExploreWith({})}
            style={styles.heroCta}
          >
            <Text style={styles.heroCtaText}>Explore companies</Text>
            <ArrowRight size={15} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* B. Trending Companies */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={{flex: 1}}>
            <Text style={styles.sectionTitle}>Trending Companies</Text>
            <Text style={styles.sectionSubtitle}>
              Most researched employers this week · Demo data
            </Text>
          </View>
          <Pressable
            onPress={() => navigateToExploreWith({sortBy: 'reviewed'})}
            style={styles.sectionLinkBtn}
          >
            <Text style={styles.sectionLink}>See all</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {trendingCompanies.map((comp) => (
            <Pressable
              key={comp.id}
              onPress={() => openCompany(comp.id)}
              style={styles.trendingCard}
            >
              <View style={styles.trendingCardTop}>
                <CompanyLogo company={comp} size={42} />
                <RatingBadge score={comp.overallRating} />
              </View>

              <View style={{gap: 3}}>
                <Text style={styles.trendingName} numberOfLines={1}>
                  {comp.name}
                </Text>
                <Text style={styles.trendingIndustry} numberOfLines={1}>
                  {comp.industry} · {comp.headquarters}
                </Text>
              </View>

              <View style={styles.trendingFooter}>
                <Text style={styles.trendingReviews}>
                  <Text style={styles.monoNum}>{comp.reviewCount.toLocaleString()}</Text> reviews
                </Text>
                <Text style={styles.demoTag}>Demo data</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* C. Workplace Insights */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={{flex: 1}}>
            <Text style={styles.sectionTitle}>Workplace Insights</Text>
            <Text style={styles.sectionSubtitle}>
              Category leaders across verified employee benchmarks
            </Text>
          </View>
        </View>

        <View className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {insights.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => openCompany(item.company.id)}
              style={styles.insightCard}
            >
              <View style={styles.insightTop}>
                <Text style={styles.insightLabel}>{item.label}</Text>
                <TrendingUp size={14} color={Colors.accent} />
              </View>
              <View style={styles.insightCompanyRow}>
                <CompanyLogo company={item.company} size={32} />
                <View style={{flex: 1}}>
                  <Text style={styles.insightCompanyName} numberOfLines={1}>
                    {item.company.name}
                  </Text>
                  <Text style={styles.insightStat}>{item.stat}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* D. Recent Employee Reports */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={{flex: 1}}>
            <Text style={styles.sectionTitle}>Recent Employee Reports</Text>
            <Text style={styles.sectionSubtitle}>
              Candid workplace reviews from verified contributors
            </Text>
          </View>
        </View>

        <View className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {recentReviews.map((rev) => {
            const comp = companies.find((c) => c.id === rev.companyId);
            return (
              <Pressable
                key={rev.id}
                onPress={() => openCompany(rev.companyId)}
                style={styles.reportCard}
              >
                <View style={styles.reportTop}>
                  <View style={{flex: 1, gap: 4}}>
                    <View style={styles.reportBadgeRow}>
                      <VerificationBadge status={rev.verificationBadge} compact />
                      <Text style={styles.reportStatusMeta}>
                        {rev.employmentStatus} · {rev.date}
                      </Text>
                    </View>
                    <Text style={styles.reportRoleMeta}>
                      {rev.role} · {comp?.name ?? rev.companyId}
                    </Text>
                  </View>
                  <RatingBadge score={rev.overallRating} compact />
                </View>

                <Text style={styles.reportHeadline} numberOfLines={1}>
                  {rev.headline}
                </Text>
                <Text style={styles.reportExcerpt} numberOfLines={2}>
                  {rev.shortReview}
                </Text>

                <View style={styles.reportFooter}>
                  <Text style={styles.reportAlias}>{rev.authorAlias}</Text>
                  <Text style={styles.reportOpenLink}>Read company profile</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* E. Explore by Industry */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={{flex: 1}}>
            <Text style={styles.sectionTitle}>Explore by Industry</Text>
            <Text style={styles.sectionSubtitle}>
              Filter company intelligence by sector
            </Text>
          </View>
        </View>

        <View className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {INDUSTRIES.map((industry) => {
            const Icon = INDUSTRY_ICONS[industry] ?? Building2;
            const count = companies.filter((c) => c.industry === industry).length;
            return (
              <Pressable
                key={industry}
                onPress={() => navigateToExploreWith({industry})}
                style={styles.industryTile}
              >
                <View style={styles.industryIconBox}>
                  <Icon size={18} color={Colors.accent} />
                </View>
                <Text style={styles.industryName} numberOfLines={1}>
                  {industry}
                </Text>
                <Text style={styles.industryCount}>
                  {count} {count === 1 ? 'company' : 'companies'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.demoFooterNote}>
        <Award size={14} color={Colors.textMuted} />
        <Text style={styles.demoFooterText}>
          All sample organizations, compensation bands, and reports are fictional demo data for evaluation.
        </Text>
      </View>
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
    gap: 24,
  },
  greetingBlock: {
    gap: 8,
  },
  greetingDate: {
    fontSize: 12.5,
    fontWeight: 500,
    color: Colors.textMuted,
  },
  greetingTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 25,
    fontWeight: 700,
    letterSpacing: -0.5,
    color: Colors.textPrimary,
  },
  searchBarWrap: {
    marginTop: 4,
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    color: Colors.textPrimary,
  },
  searchGoBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
  },
  searchGoText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: 600,
  },
  quickMatchesBox: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  quickMatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: Colors.surfaceSubtle,
  },
  quickMatchName: {
    fontSize: 14,
    fontWeight: 600,
    color: Colors.textPrimary,
  },
  quickMatchMeta: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },
  heroImageWrap: {
    height: 170,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroScrim: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(15,23,42,0.12) 0%, rgba(15,23,42,0.82) 100%)',
  },
  heroOverlayContent: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    gap: 4,
  },
  heroKicker: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.8,
    color: '#C7D2FE',
  },
  heroHeadline: {
    fontFamily: Typography.displayFont,
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 25,
    color: '#FFFFFF',
    maxWidth: 420,
  },
  heroFooter: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  heroSubcopy: {
    flex: 1,
    minWidth: 200,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  heroCta: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 42,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  heroCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 18,
    fontWeight: 700,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sectionLinkBtn: {
    minHeight: 36,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: 600,
    color: Colors.accent,
  },
  horizontalList: {
    gap: 12,
    paddingRight: 8,
  },
  trendingCard: {
    width: 248,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
  },
  trendingCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  trendingName: {
    fontFamily: Typography.displayFont,
    fontSize: 15.5,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  trendingIndustry: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  trendingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: Colors.surfaceSubtle,
  },
  trendingReviews: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  monoNum: {
    fontFamily: Typography.monoFont,
    fontWeight: 600,
    fontVariant: ['tabular-nums'],
  },
  demoTag: {
    fontSize: 11,
    color: Colors.textSubtle,
    fontWeight: 500,
  },
  insightCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 13,
    gap: 10,
  },
  insightTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: Colors.textMuted,
  },
  insightCompanyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  insightCompanyName: {
    fontSize: 14,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  insightStat: {
    fontFamily: Typography.monoFont,
    fontSize: 12.5,
    fontWeight: 600,
    color: Colors.accent,
    fontVariant: ['tabular-nums'],
  },
  reportCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 14,
    gap: 8,
  },
  reportTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  reportBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  reportStatusMeta: {
    fontSize: 11.5,
    color: Colors.textMuted,
  },
  reportRoleMeta: {
    fontSize: 12.5,
    fontWeight: 600,
    color: Colors.textSecondary,
  },
  reportHeadline: {
    fontFamily: Typography.displayFont,
    fontSize: 14.5,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  reportExcerpt: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  reportFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: Colors.surfaceSubtle,
  },
  reportAlias: {
    fontSize: 11.5,
    color: Colors.textMuted,
  },
  reportOpenLink: {
    fontSize: 12,
    fontWeight: 600,
    color: Colors.accent,
  },
  industryTile: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 13,
    gap: 8,
  },
  industryIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  industryName: {
    fontFamily: Typography.displayFont,
    fontSize: 13.5,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  industryCount: {
    fontSize: 11.5,
    color: Colors.textMuted,
  },
  demoFooterNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSubtle,
  },
  demoFooterText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
});
