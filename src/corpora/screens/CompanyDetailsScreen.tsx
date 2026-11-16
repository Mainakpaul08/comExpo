import React, {useMemo, useState} from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Heart,
  MapPin,
  Newspaper,
  PenSquare,
  ShieldCheck,
  ThumbsUp,
  Users,
  X,
} from 'lucide-react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, View} from '../../rn';
import {useCorpora} from '../CorporaContext';
import {Colors, getRatingTone, Typography} from '../theme';
import {
  CompanyLogo,
  MetricBar,
  RatingBadge,
  SkeletonBlock,
  VerificationBadge,
} from '../components/CommonUI';

type DetailSectionKey =
  | 'reviews'
  | 'culture'
  | 'salary'
  | 'management'
  | 'background'
  | 'reports'
  | 'news';

const SECTIONS: {key: DetailSectionKey; label: string}[] = [
  {key: 'reviews', label: 'Employee Reviews'},
  {key: 'culture', label: 'Workplace Culture'},
  {key: 'salary', label: 'Salary Insights'},
  {key: 'management', label: 'Management Feedback'},
  {key: 'background', label: 'Company Background'},
  {key: 'reports', label: 'Employee Reports'},
  {key: 'news', label: 'Company News'},
];

export const CompanyDetailsScreen: React.FC<{
  companyId: string;
  onOpenWriteReview: (companyId: string) => void;
}> = ({companyId, onOpenWriteReview}) => {
  const {
    companies,
    reviews,
    isLoadingCompany,
    closeCompany,
    profile,
    toggleSaveCompany,
    toggleFollowCompany,
    toggleReviewHelpful,
    addCompareCompany,
    showToast,
  } = useCorpora();

  const [activeSection, setActiveSection] = useState<DetailSectionKey>('reviews');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'current' | 'former'>('all');
  const [websiteModalOpen, setWebsiteModalOpen] = useState(false);

  const company = useMemo(
    () => companies.find((c) => c.id === companyId),
    [companies, companyId],
  );

  const companyReviews = useMemo(() => {
    const base = reviews.filter((r) => r.companyId === companyId);
    if (reviewFilter === 'current') {
      return base.filter((r) => r.employmentStatus === 'Current Employee');
    }
    if (reviewFilter === 'former') {
      return base.filter((r) => r.employmentStatus === 'Former Employee');
    }
    return base;
  }, [reviews, companyId, reviewFilter]);

  if (!company) {
    return (
      <View style={styles.notFoundWrap}>
        <Text style={styles.notFoundTitle}>Company not found</Text>
        <Pressable onPress={closeCompany} style={styles.backFallbackBtn}>
          <Text style={styles.backFallbackText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const isSaved = profile.savedCompanyIds.includes(company.id);
  const isFollowed = profile.followedCompanyIds.includes(company.id);
  const overallTone = getRatingTone(company.overallRating);

  const ratingCards = [
    {label: 'Work-life balance', value: company.ratings.workLifeBalance},
    {label: 'Salary & benefits', value: company.ratings.salaryBenefits},
    {label: 'Management', value: company.ratings.management},
    {label: 'Career growth', value: company.ratings.careerGrowth},
    {label: 'Job security', value: company.ratings.jobSecurity},
    {label: 'Workplace environment', value: company.ratings.workplaceEnvironment},
  ];

  return (
    <View style={styles.screenRoot}>
      {/* Top Sticky Navigation Bar */}
      <View style={styles.navBar}>
        <Pressable
          onPress={closeCompany}
          accessibilityLabel="Back to previous screen"
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} />
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>

        <Text style={styles.navTitle} numberOfLines={1}>
          {company.name}
        </Text>

        <View style={styles.navActions}>
          <Pressable
            onPress={() => addCompareCompany(company.id)}
            accessibilityLabel="Compare this company"
            style={styles.navIconBtn}
          >
            <BarChart2 size={18} color={Colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => toggleSaveCompany(company.id)}
            accessibilityLabel={isSaved ? 'Remove saved' : 'Save company'}
            style={styles.navIconBtn}
          >
            <Bookmark
              size={18}
              color={isSaved ? Colors.accent : Colors.textSecondary}
              fill={isSaved ? Colors.accent : 'transparent'}
            />
          </Pressable>
        </View>
      </View>

      {isLoadingCompany ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
          <View style={styles.headerCard}>
            <View style={{flexDirection: 'row', gap: 14, alignItems: 'center'}}>
              <SkeletonBlock width={60} height={60} radius={16} />
              <View style={{flex: 1, gap: 8}}>
                <SkeletonBlock width="55%" height={20} />
                <SkeletonBlock width="70%" height={14} />
              </View>
            </View>
            <SkeletonBlock width="100%" height={80} radius={14} />
          </View>
          <SkeletonBlock width="100%" height={180} radius={16} />
        </ScrollView>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
          {/* Company Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.headerTopRow}>
              <CompanyLogo company={company} size={60} />
              <View style={{flex: 1, gap: 4}}>
                <View style={styles.titleLine}>
                  <Text style={styles.companyName}>{company.name}</Text>
                </View>
                <Text style={styles.companyTagline}>{company.tagline}</Text>
              </View>
            </View>

            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Briefcase size={14} color={Colors.textMuted} />
                <Text style={styles.metaText}>{company.industry}</Text>
              </View>
              <View style={styles.metaItem}>
                <MapPin size={14} color={Colors.textMuted} />
                <Text style={styles.metaText}>{company.headquarters}</Text>
              </View>
              <View style={styles.metaItem}>
                <Users size={14} color={Colors.textMuted} />
                <Text style={styles.metaText}>{company.size} employees</Text>
              </View>
              <View style={styles.metaItem}>
                <Calendar size={14} color={Colors.textMuted} />
                <Text style={styles.metaText}>Est. {company.foundedYear}</Text>
              </View>
            </View>

            <View style={styles.headerActionsRow}>
              <Pressable
                onPress={() => setWebsiteModalOpen(true)}
                style={styles.secondaryActionBtn}
              >
                <Globe size={15} color={Colors.textPrimary} />
                <Text style={styles.secondaryActionText}>Official website</Text>
              </Pressable>

              <Pressable
                onPress={() => toggleFollowCompany(company.id)}
                style={[
                  styles.secondaryActionBtn,
                  isFollowed && styles.followedBtnActive,
                ]}
              >
                <Heart
                  size={15}
                  color={isFollowed ? Colors.accent : Colors.textPrimary}
                  fill={isFollowed ? Colors.accent : 'transparent'}
                />
                <Text
                  style={[
                    styles.secondaryActionText,
                    isFollowed && {color: Colors.accent},
                  ]}
                >
                  {isFollowed ? 'Following' : 'Follow'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => onOpenWriteReview(company.id)}
                style={styles.primaryWriteBtn}
              >
                <PenSquare size={15} color="#FFFFFF" />
                <Text style={styles.primaryWriteText}>Write an Employee Review</Text>
              </Pressable>
            </View>
          </View>

          {/* Large Overall Rating + 6 Individual Rating Cards */}
          <View style={styles.ratingOverviewCard}>
            <View style={styles.overallScoreRow}>
              <View style={styles.overallLeft}>
                <Text style={styles.overallKicker}>OVERALL WORKPLACE SCORE · DEMO DATA</Text>
                <View style={styles.bigScoreLine}>
                  <Text style={styles.bigScoreNumber}>
                    {company.overallRating.toFixed(1)}
                  </Text>
                  <Text style={styles.bigScoreOutOf}>/ 5.0</Text>
                  <View style={[styles.toneLabelBox, {backgroundColor: overallTone.bg}]}>
                    <Text style={[styles.toneLabelText, {color: overallTone.textColor}]}>
                      {overallTone.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.overallSubMeta}>
                  Based on <Text style={styles.monoBold}>{company.reviewCount.toLocaleString()}</Text> employee reviews
                </Text>
              </View>

              <View style={styles.approvalStatsBox}>
                <View style={styles.approvalStat}>
                  <Text style={styles.approvalVal}>{company.recommendPercent}%</Text>
                  <Text style={styles.approvalLbl}>Recommend</Text>
                </View>
                <View style={styles.approvalDivider} />
                <View style={styles.approvalStat}>
                  <Text style={styles.approvalVal}>{company.ceoApproval}%</Text>
                  <Text style={styles.approvalLbl}>CEO approval</Text>
                </View>
                <View style={styles.approvalDivider} />
                <View style={styles.approvalStat}>
                  <Text style={styles.approvalVal}>{company.cultureScore}</Text>
                  <Text style={styles.approvalLbl}>Culture / 100</Text>
                </View>
              </View>
            </View>

            <View className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {ratingCards.map((item) => {
                const t = getRatingTone(item.value);
                return (
                  <View key={item.label} style={styles.subRatingCard}>
                    <View style={styles.subRatingTop}>
                      <Text style={styles.subRatingLabel}>{item.label}</Text>
                      <Text style={[styles.subRatingVal, {color: t.textColor}]}>
                        {item.value.toFixed(1)}
                      </Text>
                    </View>
                    <View style={styles.subTrack}>
                      <View
                        style={[
                          styles.subFill,
                          {
                            width: `${Math.min(100, (item.value / 5) * 100)}%`,
                            backgroundColor: t.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 7 Section Switcher */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectionTabsRow}
          >
            {SECTIONS.map((sec) => {
              const active = activeSection === sec.key;
              return (
                <Pressable
                  key={sec.key}
                  onPress={() => setActiveSection(sec.key)}
                  style={[styles.sectionTab, active && styles.sectionTabActive]}
                >
                  <Text style={[styles.sectionTabText, active && styles.sectionTabTextActive]}>
                    {sec.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* 1. Employee Reviews */}
          {activeSection === 'reviews' && (
            <View style={styles.sectionBody}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>1. Employee Reviews</Text>
                <View style={styles.reviewFilterBar}>
                  {(['all', 'current', 'former'] as const).map((f) => {
                    const active = reviewFilter === f;
                    return (
                      <Pressable
                        key={f}
                        onPress={() => setReviewFilter(f)}
                        style={[styles.miniTab, active && styles.miniTabActive]}
                      >
                        <Text style={[styles.miniTabText, active && styles.miniTabTextActive]}>
                          {f === 'all' ? 'All' : f === 'current' ? 'Current' : 'Former'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {companyReviews.length === 0 ? (
                <View style={styles.emptySectionCard}>
                  <Text style={styles.emptyTitle}>No reviews in this filter yet</Text>
                  <Text style={styles.emptyBody}>
                    Be the first verified contributor to share an anonymous experience for {company.name}.
                  </Text>
                  <Pressable
                    onPress={() => onOpenWriteReview(company.id)}
                    style={styles.primaryWriteBtn}
                  >
                    <PenSquare size={15} color="#FFFFFF" />
                    <Text style={styles.primaryWriteText}>Write an Employee Review</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={{gap: 12}}>
                  {companyReviews.map((rev) => (
                    <View key={rev.id} style={styles.reviewCard}>
                      <View style={styles.reviewTop}>
                        <View style={{flex: 1, gap: 5}}>
                          <View style={{flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8}}>
                            <VerificationBadge status={rev.verificationBadge} compact />
                            <Text style={styles.reviewMetaLine}>
                              {rev.employmentStatus} · {rev.location} · {rev.date}
                            </Text>
                          </View>
                          <Text style={styles.reviewHeadline}>{rev.headline}</Text>
                        </View>
                        <RatingBadge score={rev.overallRating} />
                      </View>

                      <View style={styles.prosConsBox}>
                        <View style={{gap: 3}}>
                          <Text style={styles.prosLabel}>Pros</Text>
                          <Text style={styles.prosBody}>{rev.pros}</Text>
                        </View>
                        <View style={{gap: 3}}>
                          <Text style={styles.consLabel}>Cons</Text>
                          <Text style={styles.prosBody}>{rev.cons}</Text>
                        </View>
                      </View>

                      <View style={styles.reviewFooter}>
                        <Text style={styles.reviewAuthor}>{rev.authorAlias}</Text>
                        <Pressable
                          onPress={() => toggleReviewHelpful(rev.id)}
                          style={[
                            styles.helpfulBtn,
                            rev.isHelpfulByUser && styles.helpfulBtnActive,
                          ]}
                        >
                          <ThumbsUp
                            size={14}
                            color={rev.isHelpfulByUser ? Colors.accent : Colors.textMuted}
                          />
                          <Text
                            style={[
                              styles.helpfulText,
                              rev.isHelpfulByUser && {color: Colors.accent},
                            ]}
                          >
                            Helpful ({rev.helpfulCount})
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* 2. Workplace Culture */}
          {activeSection === 'culture' && (
            <View style={styles.panelCard}>
              <Text style={styles.sectionHeading}>2. Workplace Culture</Text>
              <View style={styles.infoBanner}>
                <Text style={styles.infoBannerLabel}>Work Model</Text>
                <Text style={styles.infoBannerVal}>{company.cultureHighlights.workModel}</Text>
              </View>
              <Text style={styles.paragraph}>{company.cultureHighlights.summary}</Text>
              <View style={{gap: 8}}>
                <Text style={styles.subHeading}>Observed Cultural Norms</Text>
                {company.cultureHighlights.pillars.map((p) => (
                  <View key={p} style={styles.bulletRow}>
                    <CheckCircle2 size={15} color={Colors.positive} />
                    <Text style={styles.bulletText}>{p}</Text>
                  </View>
                ))}
              </View>
              <View style={{gap: 10, paddingTop: 6}}>
                <MetricBar label="Workplace Environment" score={company.ratings.workplaceEnvironment} />
                <MetricBar label="Work-Life Balance" score={company.ratings.workLifeBalance} />
              </View>
            </View>
          )}

          {/* 3. Salary Insights */}
          {activeSection === 'salary' && (
            <View style={styles.panelCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>3. Salary Insights</Text>
                <Text style={styles.demoInlineNote}>Demo benchmarks · USD</Text>
              </View>
              <View style={styles.salaryTable}>
                {company.salaryInsights.map((row) => (
                  <View key={`${row.role}-${row.level}`} style={styles.salaryRow}>
                    <View style={{flex: 1, gap: 2}}>
                      <Text style={styles.salaryRole}>{row.role}</Text>
                      <Text style={styles.salaryMeta}>
                        Level {row.level} · {row.reportsCount} verified reports
                      </Text>
                    </View>
                    <View style={{alignItems: 'flex-end', gap: 2}}>
                      <Text style={styles.salaryTotal}>{row.totalComp}</Text>
                      <Text style={styles.salaryBase}>Base {row.baseRange}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 4. Management Feedback */}
          {activeSection === 'management' && (
            <View style={styles.panelCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>4. Management Feedback</Text>
                <Text style={styles.monoHighlight}>
                  {company.managementFeedback.transparencyScore}% transparency
                </Text>
              </View>
              <Text style={styles.paragraph}>{company.managementFeedback.summary}</Text>

              <View className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <View style={styles.feedbackCol}>
                  <Text style={styles.prosLabel}>Leadership Strengths</Text>
                  {company.managementFeedback.strengths.map((s) => (
                    <View key={s} style={styles.bulletRow}>
                      <CheckCircle2 size={14} color={Colors.positive} />
                      <Text style={styles.bulletText}>{s}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.feedbackCol}>
                  <Text style={styles.consLabel}>Recurring Concerns</Text>
                  {company.managementFeedback.concerns.map((c) => (
                    <View key={c} style={styles.bulletRow}>
                      <AlertTriangle size={14} color={Colors.warning} />
                      <Text style={styles.bulletText}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* 5. Company Background */}
          {activeSection === 'background' && (
            <View style={styles.panelCard}>
              <Text style={styles.sectionHeading}>5. Company Background</Text>
              <Text style={styles.paragraph}>{company.background.overview}</Text>

              <View className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <View style={styles.kvBox}>
                  <Text style={styles.kvLabel}>Stage</Text>
                  <Text style={styles.kvValue}>{company.background.stage}</Text>
                </View>
                <View style={styles.kvBox}>
                  <Text style={styles.kvLabel}>Chief Executive</Text>
                  <Text style={styles.kvValue}>{company.background.ceo}</Text>
                </View>
                <View style={styles.kvBox}>
                  <Text style={styles.kvLabel}>Founded</Text>
                  <Text style={styles.kvValue}>{company.foundedYear}</Text>
                </View>
              </View>

              <View style={{gap: 10, paddingTop: 4}}>
                <Text style={styles.subHeading}>Key Milestones</Text>
                {company.background.milestones.map((m) => (
                  <View key={m.year} style={styles.milestoneRow}>
                    <Text style={styles.milestoneYear}>{m.year}</Text>
                    <Text style={styles.milestoneEvent}>{m.event}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 6. Employee Reports */}
          {activeSection === 'reports' && (
            <View style={styles.panelCard}>
              <Text style={styles.sectionHeading}>6. Employee Reports</Text>
              <Text style={styles.demoInlineNote}>
                Corroborated workplace signals submitted privately by verified staff.
              </Text>
              <View style={{gap: 10}}>
                {company.employeeReports.map((rep) => {
                  const sevBg =
                    rep.severity === 'Positive'
                      ? Colors.positiveSoft
                      : rep.severity === 'Advisory'
                        ? Colors.warningSoft
                        : Colors.negativeSoft;
                  const sevFg =
                    rep.severity === 'Positive'
                      ? Colors.positiveText
                      : rep.severity === 'Advisory'
                        ? Colors.warningText
                        : Colors.negativeText;
                  return (
                    <View key={rep.id} style={styles.incidentCard}>
                      <View style={styles.incidentTop}>
                        <Text style={styles.incidentMeta}>
                          {rep.category} · {rep.date}
                        </Text>
                        <View style={[styles.sevTag, {backgroundColor: sevBg}]}>
                          <Text style={[styles.sevText, {color: sevFg}]}>{rep.severity}</Text>
                        </View>
                      </View>
                      <Text style={styles.incidentTitle}>{rep.title}</Text>
                      <Text style={styles.paragraph}>{rep.summary}</Text>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                        <ShieldCheck size={14} color={Colors.accent} />
                        <Text style={styles.corroboratedText}>
                          Corroborated by {rep.verifiedCount} verified employees
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* 7. Company News */}
          {activeSection === 'news' && (
            <View style={styles.panelCard}>
              <Text style={styles.sectionHeading}>7. Company News</Text>
              <View style={{gap: 10}}>
                {company.news.map((item) => (
                  <View key={item.id} style={styles.newsCard}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                      <Newspaper size={14} color={Colors.accent} />
                      <Text style={styles.newsMeta}>
                        {item.source} · {item.date}
                      </Text>
                    </View>
                    <Text style={styles.newsTitle}>{item.title}</Text>
                    <Text style={styles.paragraph}>{item.summary}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Official Website Preview Sheet (Avoids window.open inside iframe) */}
      <Modal
        visible={websiteModalOpen}
        onRequestClose={() => setWebsiteModalOpen(false)}
      >
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <Building2 size={18} color={Colors.accent} />
              <Text style={styles.sheetTitle}>Official Company Website</Text>
            </View>
            <Pressable
              onPress={() => setWebsiteModalOpen(false)}
              accessibilityLabel="Close website modal"
              style={styles.closeSheetBtn}
            >
              <X size={18} color={Colors.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.websiteBox}>
            <Text style={styles.websiteCompany}>{company.name}</Text>
            <Text style={styles.websiteUrl}>{company.website}</Text>
            <Text style={styles.websiteNotice}>
              Demo organization domain for CORPORA preview. External links are sandboxed inside the mobile shell.
            </Text>
          </View>

          <View style={{flexDirection: 'row', gap: 10}}>
            <Pressable
              onPress={() => {
                navigator.clipboard?.writeText(company.website).catch(() => {});
                showToast('Website URL copied');
                setWebsiteModalOpen(false);
              }}
              style={styles.copyUrlBtn}
            >
              <Copy size={15} color="#FFFFFF" />
              <Text style={styles.copyUrlText}>Copy official URL</Text>
            </Pressable>
            <Pressable
              onPress={() => setWebsiteModalOpen(false)}
              style={styles.dismissBtn}
            >
              <ExternalLink size={15} color={Colors.textSecondary} />
              <Text style={styles.dismissText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navBar: {
    height: 54,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(12px)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexShrink: 0,
  },
  backBtn: {
    minHeight: 44,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: 600,
    color: Colors.textPrimary,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Typography.displayFont,
    fontSize: 15.5,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  navIconBtn: {
    minWidth: 42,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 16,
    gap: 14,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companyName: {
    fontFamily: Typography.displayFont,
    fontSize: 21,
    fontWeight: 700,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  companyTagline: {
    fontSize: 13.5,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: Colors.surfaceSubtle,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12.5,
    color: Colors.textSecondary,
  },
  headerActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  secondaryActionBtn: {
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 11,
    backgroundColor: Colors.surfaceSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  followedBtnActive: {
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.accentBorder,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: 600,
    color: Colors.textPrimary,
    whiteSpace: 'nowrap',
  },
  primaryWriteBtn: {
    minHeight: 42,
    paddingHorizontal: 15,
    borderRadius: 11,
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    flexGrow: 1,
  },
  primaryWriteText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
  },
  ratingOverviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 16,
    gap: 16,
  },
  overallScoreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  overallLeft: {
    gap: 4,
  },
  overallKicker: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    color: Colors.textMuted,
  },
  bigScoreLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  bigScoreNumber: {
    fontFamily: Typography.monoFont,
    fontSize: 38,
    fontWeight: 700,
    color: Colors.textPrimary,
    lineHeight: 42,
    fontVariant: ['tabular-nums'],
  },
  bigScoreOutOf: {
    fontFamily: Typography.monoFont,
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: 500,
  },
  toneLabelBox: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    alignSelf: 'center',
  },
  toneLabelText: {
    fontSize: 12,
    fontWeight: 700,
  },
  overallSubMeta: {
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  monoBold: {
    fontFamily: Typography.monoFont,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  approvalStatsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 14,
  },
  approvalStat: {
    alignItems: 'center',
    gap: 2,
  },
  approvalVal: {
    fontFamily: Typography.monoFont,
    fontSize: 16,
    fontWeight: 700,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  approvalLbl: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  approvalDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  subRatingCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 12,
    gap: 8,
  },
  subRatingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  subRatingLabel: {
    fontSize: 12.5,
    fontWeight: 600,
    color: Colors.textSecondary,
  },
  subRatingVal: {
    fontFamily: Typography.monoFont,
    fontSize: 14,
    fontWeight: 700,
    fontVariant: ['tabular-nums'],
  },
  subTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 999,
    overflow: 'hidden',
  },
  subFill: {
    height: '100%',
    borderRadius: 999,
  },
  sectionTabsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  sectionTab: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTabActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  sectionTabText: {
    fontSize: 13,
    fontWeight: 600,
    color: Colors.textSecondary,
    whiteSpace: 'nowrap',
  },
  sectionTabTextActive: {
    color: '#FFFFFF',
  },
  sectionBody: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionHeading: {
    fontFamily: Typography.displayFont,
    fontSize: 17,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  subHeading: {
    fontFamily: Typography.displayFont,
    fontSize: 14,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  reviewFilterBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    padding: 3,
    borderRadius: 9,
    gap: 2,
  },
  miniTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  miniTabActive: {
    backgroundColor: Colors.surface,
  },
  miniTabText: {
    fontSize: 12,
    fontWeight: 500,
    color: Colors.textMuted,
  },
  miniTabTextActive: {
    color: Colors.textPrimary,
    fontWeight: 600,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 15,
    gap: 12,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  reviewMetaLine: {
    fontSize: 11.5,
    color: Colors.textMuted,
  },
  reviewHeadline: {
    fontFamily: Typography.displayFont,
    fontSize: 15.5,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  prosConsBox: {
    gap: 10,
  },
  prosLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: Colors.positiveText,
  },
  consLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: Colors.warningText,
  },
  prosBody: {
    fontSize: 13.5,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: Colors.surfaceSubtle,
  },
  reviewAuthor: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  helpfulBtn: {
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: Colors.surfaceSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpfulBtnActive: {
    backgroundColor: Colors.accentSoft,
  },
  helpfulText: {
    fontSize: 12,
    fontWeight: 600,
    color: Colors.textSecondary,
  },
  panelCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 16,
    gap: 14,
  },
  infoBanner: {
    backgroundColor: Colors.accentSoft,
    borderRadius: 12,
    padding: 12,
    gap: 3,
  },
  infoBannerLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: Colors.accent,
  },
  infoBannerVal: {
    fontSize: 13.5,
    fontWeight: 600,
    color: Colors.textPrimary,
  },
  paragraph: {
    fontSize: 13.5,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  demoInlineNote: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  salaryTable: {
    gap: 8,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
  },
  salaryRole: {
    fontSize: 14,
    fontWeight: 600,
    color: Colors.textPrimary,
  },
  salaryMeta: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  salaryTotal: {
    fontFamily: Typography.monoFont,
    fontSize: 14,
    fontWeight: 700,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  salaryBase: {
    fontFamily: Typography.monoFont,
    fontSize: 11.5,
    color: Colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  monoHighlight: {
    fontFamily: Typography.monoFont,
    fontSize: 13,
    fontWeight: 700,
    color: Colors.accent,
  },
  feedbackCol: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
  },
  kvBox: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    gap: 3,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
  },
  kvLabel: {
    fontSize: 11.5,
    color: Colors.textMuted,
  },
  kvValue: {
    fontSize: 13.5,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: Colors.surfaceSubtle,
  },
  milestoneYear: {
    fontFamily: Typography.monoFont,
    fontSize: 13,
    fontWeight: 700,
    color: Colors.accent,
    width: 44,
  },
  milestoneEvent: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  incidentCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 13,
    gap: 8,
  },
  incidentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  incidentMeta: {
    fontSize: 12,
    fontWeight: 600,
    color: Colors.textMuted,
  },
  sevTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sevText: {
    fontSize: 11.5,
    fontWeight: 700,
  },
  incidentTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 14.5,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  corroboratedText: {
    fontSize: 12,
    fontWeight: 600,
    color: Colors.accent,
  },
  newsCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 13,
    gap: 6,
  },
  newsMeta: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  newsTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 14.5,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  emptySectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 16,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  backFallbackBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backFallbackText: {
    color: '#FFFFFF',
    fontWeight: 600,
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 17,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  closeSheetBtn: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.surfaceSubtle,
  },
  websiteBox: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 14,
    gap: 6,
  },
  websiteCompany: {
    fontSize: 15,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  websiteUrl: {
    fontFamily: Typography.monoFont,
    fontSize: 13.5,
    color: Colors.accent,
  },
  websiteNotice: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
    marginTop: 4,
  },
  copyUrlBtn: {
    flex: 1,
    minHeight: 44,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  copyUrlText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: 600,
  },
  dismissBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dismissText: {
    color: Colors.textSecondary,
    fontSize: 13.5,
    fontWeight: 600,
  },
});
