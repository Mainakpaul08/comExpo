import React, { useMemo, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Bookmark, Globe, PenSquare, ThumbsUp, X } from 'lucide-react-native';
import { CompanyLogo, RatingBadge, VerificationBadge } from '../../src/components/CommonUI';
import { useCorpora } from '../../src/context/CorporaContext';
import { Colors } from '../../src/theme/tokens';

const SECTIONS = [
  { key: 'reviews', label: 'Employee Reviews' },
  { key: 'culture', label: 'Workplace Culture' },
  { key: 'salary', label: 'Salary Insights' },
  { key: 'management', label: 'Management Feedback' },
  { key: 'background', label: 'Company Background' },
  { key: 'reports', label: 'Employee Reports' },
  { key: 'news', label: 'Company News' },
];

export default function CompanyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { companies, reviews, profile, toggleSaveCompany, toggleReviewHelpful, submitReview } = useCorpora();

  const [section, setSection] = useState('reviews');
  const [modalVisible, setModalVisible] = useState(false);
  const [role, setRole] = useState('');
  const [headline, setHeadline] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');

  const company = useMemo(() => companies.find((c) => c.id === id), [companies, id]);
  const companyReviews = useMemo(() => reviews.filter((r) => r.companyId === id), [reviews, id]);

  if (!company) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ padding: 24 }}>Company not found.</Text>
      </SafeAreaView>
    );
  }

  const isSaved = profile.savedCompanyIds.includes(company.id);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>{company.name}</Text>
        <Pressable onPress={() => toggleSaveCompany(company.id)} style={styles.backBtn}>
          <Bookmark size={18} color={isSaved ? Colors.accent : Colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <CompanyLogo company={company} size={56} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.companyName}>{company.name}</Text>
              <Text style={styles.metaLine}>
                {company.industry} · {company.headquarters} · {company.size} · Est. {company.foundedYear}
              </Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Pressable onPress={() => Linking.openURL(company.website)} style={styles.secondaryBtn}>
              <Globe size={15} color={Colors.textPrimary} />
              <Text style={styles.secondaryBtnText}>Official Website</Text>
            </Pressable>
            <Pressable onPress={() => setModalVisible(true)} style={styles.primaryBtn}>
              <PenSquare size={15} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Write an Employee Review</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.bigRating}>{company.overallRating.toFixed(1)} / 5.0</Text>
          <Text style={styles.metaLine}>{company.reviewCount} employee reviews · Demo data</Text>
          <View style={styles.subGrid}>
            {[
              ['Work-life balance', company.ratings.workLifeBalance],
              ['Salary & benefits', company.ratings.salaryBenefits],
              ['Management', company.ratings.management],
              ['Career growth', company.ratings.careerGrowth],
              ['Job security', company.ratings.jobSecurity],
              ['Workplace environment', company.ratings.workplaceEnvironment],
            ].map(([label, score]) => (
              <View key={label} style={styles.subCard}>
                <Text style={styles.subLabel}>{label}</Text>
                <Text style={styles.subScore}>{score.toFixed(1)}</Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {SECTIONS.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => setSection(s.key)}
              style={[styles.secTab, section === s.key && styles.secTabActive]}
            >
              <Text style={[styles.secTabText, section === s.key && styles.secTabTextActive]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {section === 'reviews' &&
          companyReviews.map((rev) => (
            <View key={rev.id} style={styles.card}>
              <View style={styles.reviewHeader}>
                <VerificationBadge status={rev.verificationBadge} />
                <RatingBadge score={rev.overallRating} compact />
              </View>
              <Text style={styles.reviewTitle}>{rev.headline}</Text>
              <Text style={styles.bodyText}>Pros: {rev.pros}</Text>
              <Text style={styles.bodyText}>Cons: {rev.cons}</Text>
              <Pressable onPress={() => toggleReviewHelpful(rev.id)} style={styles.helpfulBtn}>
                <ThumbsUp size={14} color={Colors.accent} />
                <Text style={styles.helpfulText}>Helpful ({rev.helpfulCount})</Text>
              </Pressable>
            </View>
          ))}

        {section === 'culture' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Workplace Culture</Text>
            <Text style={styles.bodyText}>{company.cultureHighlights.workModel}</Text>
            <Text style={styles.bodyText}>{company.cultureHighlights.summary}</Text>
          </View>
        )}

        {section === 'salary' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Salary Insights</Text>
            {company.salaryInsights.map((s) => (
              <View key={s.role} style={styles.salaryRow}>
                <Text style={styles.salaryRole}>{s.role} ({s.level})</Text>
                <Text style={styles.salaryVal}>{s.totalComp}</Text>
              </View>
            ))}
          </View>
        )}

        {section === 'management' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Management Feedback</Text>
            <Text style={styles.bodyText}>{company.managementFeedback.summary}</Text>
          </View>
        )}

        {section === 'background' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Company Background</Text>
            <Text style={styles.bodyText}>{company.background.overview}</Text>
            <Text style={styles.metaLine}>CEO: {company.background.ceo} · {company.background.stage}</Text>
          </View>
        )}

        {section === 'reports' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Employee Reports</Text>
            {company.employeeReports.map((r) => (
              <View key={r.id} style={{ gap: 4 }}>
                <Text style={styles.reviewTitle}>{r.title}</Text>
                <Text style={styles.bodyText}>{r.summary}</Text>
              </View>
            ))}
          </View>
        )}

        {section === 'news' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Company News</Text>
            {company.news.map((n) => (
              <View key={n.id} style={{ gap: 4 }}>
                <Text style={styles.reviewTitle}>{n.title}</Text>
                <Text style={styles.bodyText}>{n.summary}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.sectionTitle}>Review {company.name}</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <X size={20} color={Colors.textPrimary} />
              </Pressable>
            </View>
            <TextInput value={role} onChangeText={setRole} placeholder="Your role" style={styles.input} />
            <TextInput value={headline} onChangeText={setHeadline} placeholder="Review headline" style={styles.input} />
            <TextInput value={pros} onChangeText={setPros} placeholder="Pros" multiline style={styles.input} />
            <TextInput value={cons} onChangeText={setCons} placeholder="Cons" multiline style={styles.input} />
            <Pressable
              onPress={() => {
                if (!role.trim() || !headline.trim()) return;
                submitReview({
                  companyId: company.id,
                  employmentStatus: 'Current Employee',
                  role,
                  headline,
                  pros: pros || 'Strong peers',
                  cons: cons || 'Fast pace',
                  ratings: { workLifeBalance: 4, salaryBenefits: 4, management: 4, careerGrowth: 4, jobSecurity: 4, workplaceEnvironment: 4 },
                });
                setModalVisible(false);
              }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Publish Anonymous Review</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  navBar: {
    height: 54,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8 },
  backText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  navTitle: { fontSize: 15.5, fontWeight: '700', color: Colors.textPrimary, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  container: { padding: 16, gap: 14, paddingBottom: 36 },
  headerCard: { backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 12 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  companyName: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  metaLine: { fontSize: 12.5, color: Colors.textMuted },
  actionsRow: { flexDirection: 'row', gap: 8 },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.surfaceSubtle },
  secondaryBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  primaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 10, backgroundColor: Colors.accent },
  primaryBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  card: { backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 10 },
  bigRating: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary },
  subGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subCard: { width: '48%', backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 10 },
  subLabel: { fontSize: 12, color: Colors.textSecondary },
  subScore: { fontSize: 15, fontWeight: '700', color: Colors.accent },
  secTab: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 10, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  secTabActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  secTabText: { fontSize: 12.5, fontWeight: '600', color: Colors.textSecondary },
  secTabTextActive: { color: '#FFFFFF' },
  sectionTitle: { fontSize: 16.5, fontWeight: '700', color: Colors.textPrimary },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  bodyText: { fontSize: 13.5, lineHeight: 19, color: Colors.textSecondary },
  helpfulBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 6 },
  helpfulText: { fontSize: 12.5, fontWeight: '600', color: Colors.accent },
  salaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.surfaceSubtle },
  salaryRole: { fontSize: 13.5, fontWeight: '600', color: Colors.textPrimary },
  salaryVal: { fontSize: 13.5, fontWeight: '700', color: Colors.accent },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 11, fontSize: 14 },
});
