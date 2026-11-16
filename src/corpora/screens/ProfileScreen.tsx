import React, {useMemo, useState} from 'react';
import {
  Bookmark,
  ChevronRight,
  Eye,
  FileCheck2,
  Heart,
  Lock,
  Mail,
  RotateCcw,
  Settings,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from '../../rn';
import {useCorpora} from '../CorporaContext';
import {Colors, Typography} from '../theme';
import {
  CompanyListCard,
  CompanyLogo,
  RatingBadge,
  VerificationBadge,
} from '../components/CommonUI';

type ProfileSectionTab = 'saved' | 'followed' | 'reviews' | 'settings';

export const ProfileScreen: React.FC = () => {
  const {
    profile,
    companies,
    reviews,
    openCompany,
    toggleSaveCompany,
    toggleFollowCompany,
    submitVerification,
    clearVerificationToUnverified,
    updatePrivacySetting,
    resetDemoData,
  } = useCorpora();

  const [subTab, setSubTab] = useState<ProfileSectionTab>('saved');
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [publicPreviewOpen, setPublicPreviewOpen] = useState(false);

  const [verifyStatus, setVerifyStatus] = useState<
    'Verified Current Employee' | 'Verified Former Employee'
  >('Verified Current Employee');
  const [verifyCompanyId, setVerifyCompanyId] = useState(
    profile.verification.companyId ?? companies[0]?.id ?? 'veltrix-cloud',
  );
  const [verifyRole, setVerifyRole] = useState(
    profile.verification.role ?? 'Senior Product Engineer',
  );
  const [verifyMethod, setVerifyMethod] = useState<'Work Email' | 'Private Document'>(
    'Work Email',
  );
  const [verifyEvidence, setVerifyEvidence] = useState('mainak@veltrixcloud.example.com');
  const [verifyError, setVerifyError] = useState('');

  const savedCompanies = useMemo(
    () => companies.filter((c) => profile.savedCompanyIds.includes(c.id)),
    [companies, profile.savedCompanyIds],
  );

  const followedCompanies = useMemo(
    () => companies.filter((c) => profile.followedCompanyIds.includes(c.id)),
    [companies, profile.followedCompanyIds],
  );

  const submittedReviews = useMemo(
    () => reviews.filter((r) => r.isUserSubmitted),
    [reviews],
  );

  const handleSubmitVerification = () => {
    if (!verifyRole.trim()) {
      setVerifyError('Please enter your job role.');
      return;
    }
    if (verifyMethod === 'Work Email' && !verifyEvidence.includes('@')) {
      setVerifyError('Please enter a valid corporate email address.');
      return;
    }
    if (verifyMethod === 'Private Document' && !verifyEvidence.trim()) {
      setVerifyError('Please attach or name your private employment proof.');
      return;
    }
    setVerifyError('');
    submitVerification({
      status: verifyStatus,
      companyId: verifyCompanyId,
      role: verifyRole,
      method: verifyMethod,
      evidenceInput: verifyEvidence.trim(),
    });
    setVerifyModalOpen(false);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Profile Identity Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileTop}>
          <Image
            source={{uri: profile.avatarUri}}
            alt={`${profile.name} portrait`}
            style={styles.avatar}
          />
          <View style={{flex: 1, gap: 5}}>
            <Text style={styles.userName}>{profile.name}</Text>
            <Text style={styles.userHandle}>{profile.handle}</Text>
            <VerificationBadge status={profile.verification.status} />
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsStrip}>
          <Pressable onPress={() => setSubTab('reviews')} style={styles.statBox}>
            <Text style={styles.statNumber}>{submittedReviews.length}</Text>
            <Text style={styles.statLabel}>Reviews submitted</Text>
          </Pressable>
          <View style={styles.statDivider} />
          <Pressable onPress={() => setSubTab('saved')} style={styles.statBox}>
            <Text style={styles.statNumber}>{savedCompanies.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </Pressable>
          <View style={styles.statDivider} />
          <Pressable onPress={() => setSubTab('followed')} style={styles.statBox}>
            <Text style={styles.statNumber}>{followedCompanies.length}</Text>
            <Text style={styles.statLabel}>Followed</Text>
          </Pressable>
        </View>
      </View>

      {/* Private Employment Verification Box */}
      <View style={styles.verificationCard}>
        <View style={styles.verifyHeader}>
          <View style={styles.verifyIconBox}>
            <Lock size={17} color={Colors.accent} />
          </View>
          <View style={{flex: 1, gap: 2}}>
            <Text style={styles.verifyTitle}>Private Employment Verification</Text>
            <Text style={styles.verifySub}>
              Public profiles show your badge only — never private documents or emails.
            </Text>
          </View>
        </View>

        {profile.verification.status !== 'Unverified Contributor' ? (
          <View style={styles.verifiedRecordBox}>
            <View style={{flex: 1, gap: 3}}>
              <Text style={styles.recordLabel}>Private Record (Hidden from Public)</Text>
              <Text style={styles.recordValue}>
                {profile.verification.companyName} · {profile.verification.role}
              </Text>
              <Text style={styles.recordVault}>
                {profile.verification.method}: {profile.verification.privateReferenceLabel}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.unverifiedBox}>
            <Text style={styles.unverifiedText}>
              You are currently posting as an Unverified Contributor. Submit work email or private proof to earn a Verified badge.
            </Text>
          </View>
        )}

        <View style={styles.verifyActionsRow}>
          <Pressable
            onPress={() => setVerifyModalOpen(true)}
            style={styles.verifyPrimaryBtn}
          >
            <ShieldCheck size={15} color="#FFFFFF" />
            <Text style={styles.verifyPrimaryText}>
              {profile.verification.status === 'Unverified Contributor'
                ? 'Verify employment privately'
                : 'Update verification'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setPublicPreviewOpen(true)}
            style={styles.previewPublicBtn}
          >
            <Eye size={15} color={Colors.textPrimary} />
            <Text style={styles.previewPublicText}>Public view</Text>
          </Pressable>
        </View>
      </View>

      {/* Section Tabs */}
      <View style={styles.subTabBar}>
        {(
          [
            {key: 'saved', label: 'Saved'},
            {key: 'followed', label: 'Followed'},
            {key: 'reviews', label: 'My Reviews'},
            {key: 'settings', label: 'Settings'},
          ] as const
        ).map((tab) => {
          const active = subTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setSubTab(tab.key)}
              style={[styles.subTabBtn, active && styles.subTabBtnActive]}
            >
              <Text style={[styles.subTabText, active && styles.subTabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Saved Companies */}
      {subTab === 'saved' && (
        <View style={{gap: 10}}>
          {savedCompanies.length === 0 ? (
            <View style={styles.emptyBox}>
              <Bookmark size={22} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No saved companies yet</Text>
              <Text style={styles.emptySub}>
                Bookmark companies while browsing Explore or Company Details to compare them later.
              </Text>
            </View>
          ) : (
            savedCompanies.map((c) => (
              <CompanyListCard
                key={c.id}
                company={c}
                onPress={() => openCompany(c.id)}
                isSaved
                onToggleSave={() => toggleSaveCompany(c.id)}
              />
            ))
          )}
        </View>
      )}

      {/* Followed Companies */}
      {subTab === 'followed' && (
        <View style={{gap: 10}}>
          {followedCompanies.length === 0 ? (
            <View style={styles.emptyBox}>
              <Heart size={22} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Not following any companies</Text>
              <Text style={styles.emptySub}>
                Follow organizations on their profile to track new salary updates and employee reports.
              </Text>
            </View>
          ) : (
            followedCompanies.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => openCompany(c.id)}
                style={styles.followedRowCard}
              >
                <CompanyLogo company={c} size={40} />
                <View style={{flex: 1, gap: 2}}>
                  <Text style={styles.followedName}>{c.name}</Text>
                  <Text style={styles.followedMeta}>
                    {c.industry} · {c.headquarters}
                  </Text>
                </View>
                <RatingBadge score={c.overallRating} compact />
                <Pressable
                  onPress={() => toggleFollowCompany(c.id)}
                  style={styles.unfollowBtn}
                >
                  <Text style={styles.unfollowText}>Following</Text>
                </Pressable>
              </Pressable>
            ))
          )}
        </View>
      )}

      {/* My Submitted Reviews */}
      {subTab === 'reviews' && (
        <View style={{gap: 10}}>
          {submittedReviews.length === 0 ? (
            <View style={styles.emptyBox}>
              <FileCheck2 size={22} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No reviews submitted yet</Text>
              <Text style={styles.emptySub}>
                Open any company profile and tap &ldquo;Write an Employee Review&rdquo; to publish an anonymous review.
              </Text>
            </View>
          ) : (
            submittedReviews.map((r) => {
              const comp = companies.find((c) => c.id === r.companyId);
              return (
                <Pressable
                  key={r.id}
                  onPress={() => openCompany(r.companyId)}
                  style={styles.myReviewCard}
                >
                  <View style={styles.myReviewTop}>
                    <View style={{flex: 1, gap: 3}}>
                      <Text style={styles.myReviewCompany}>
                        {comp?.name ?? r.companyId} · {r.role}
                      </Text>
                      <VerificationBadge status={r.verificationBadge} compact />
                    </View>
                    <RatingBadge score={r.overallRating} compact />
                  </View>
                  <Text style={styles.myReviewHeadline}>{r.headline}</Text>
                  <Text style={styles.myReviewDate}>
                    Published {r.date} · {r.employmentStatus}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>
      )}

      {/* Account & Privacy Settings */}
      {subTab === 'settings' && (
        <View style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <Settings size={16} color={Colors.accent} />
            <Text style={styles.settingsTitle}>Privacy & Account Settings</Text>
          </View>

          {[
            {
              key: 'defaultAnonymousReviews' as const,
              title: 'Always post reviews anonymously',
              sub: 'Masks your name across all public reviews and reports.',
            },
            {
              key: 'hideFormerEmployerInCommunity' as const,
              title: 'Hide specific employer in Community',
              sub: 'Shows verification badge only without revealing your employer name.',
            },
            {
              key: 'suppressLocationOnReviews' as const,
              title: 'Suppress city/office location',
              sub: 'Recommended for small teams to protect anonymity.',
            },
            {
              key: 'notifySavedCompanyAlerts' as const,
              title: 'Saved company alerts',
              sub: 'Notify when new salary reports or advisories are posted.',
            },
          ].map((item) => (
            <View key={item.key} style={styles.settingRow}>
              <View style={{flex: 1, gap: 2}}>
                <Text style={styles.settingLabel}>{item.title}</Text>
                <Text style={styles.settingSub}>{item.sub}</Text>
              </View>
              <Switch
                value={profile.privacySettings[item.key]}
                onValueChange={(v) => updatePrivacySetting(item.key, v)}
                accessibilityLabel={item.title}
              />
            </View>
          ))}

          <View style={styles.settingsActions}>
            {profile.verification.status !== 'Unverified Contributor' && (
              <Pressable
                onPress={clearVerificationToUnverified}
                style={styles.secondarySettingBtn}
              >
                <Text style={styles.secondarySettingText}>
                  Switch to Unverified Contributor
                </Text>
                <ChevronRight size={15} color={Colors.textSecondary} />
              </Pressable>
            )}

            <Pressable onPress={resetDemoData} style={styles.resetDemoBtn}>
              <RotateCcw size={15} color={Colors.negativeText} />
              <Text style={styles.resetDemoText}>Reset demo data & local state</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Private Employment Verification Modal */}
      <Modal
        visible={verifyModalOpen}
        onRequestClose={() => setVerifyModalOpen(false)}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Verify Employment Privately</Text>
            <Pressable
              onPress={() => setVerifyModalOpen(false)}
              accessibilityLabel="Close verification modal"
              style={styles.closeBtn}
            >
              <X size={18} color={Colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView style={{maxHeight: 500}} contentContainerStyle={{gap: 14}}>
            <View style={styles.privacyVaultCallout}>
              <Lock size={15} color={Colors.accent} />
              <Text style={styles.privacyVaultText}>
                Private verification evidence is stored locally for badge issuance and never displayed on public reviews or profiles.
              </Text>
            </View>

            <View style={{gap: 6}}>
              <Text style={styles.fieldLabel}>Employment Status</Text>
              <View style={{flexDirection: 'row', gap: 8}}>
                {(
                  [
                    'Verified Current Employee',
                    'Verified Former Employee',
                  ] as const
                ).map((st) => {
                  const active = verifyStatus === st;
                  return (
                    <Pressable
                      key={st}
                      onPress={() => setVerifyStatus(st)}
                      style={[styles.choiceBox, active && styles.choiceBoxActive]}
                    >
                      <Text style={[styles.choiceBoxText, active && styles.choiceBoxTextActive]}>
                        {st === 'Verified Current Employee' ? 'Current Employee' : 'Former Employee'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{gap: 6}}>
              <Text style={styles.fieldLabel}>Employer</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 6}}>
                {companies.map((c) => {
                  const active = verifyCompanyId === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setVerifyCompanyId(c.id)}
                      style={[styles.companyChip, active && styles.companyChipActive]}
                    >
                      <Text style={[styles.companyChipText, active && styles.companyChipTextActive]}>
                        {c.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={{gap: 6}}>
              <Text style={styles.fieldLabel}>Job Role</Text>
              <TextInput
                value={verifyRole}
                onChangeText={setVerifyRole}
                placeholder="e.g. Senior Product Engineer"
                style={styles.textInputBox}
              />
            </View>

            <View style={{gap: 6}}>
              <Text style={styles.fieldLabel}>Verification Method</Text>
              <View style={{flexDirection: 'row', gap: 8}}>
                <Pressable
                  onPress={() => {
                    setVerifyMethod('Work Email');
                    setVerifyEvidence('mainak@veltrixcloud.example.com');
                  }}
                  style={[
                    styles.choiceBox,
                    verifyMethod === 'Work Email' && styles.choiceBoxActive,
                  ]}
                >
                  <Mail size={14} color={verifyMethod === 'Work Email' ? Colors.accent : Colors.textMuted} />
                  <Text
                    style={[
                      styles.choiceBoxText,
                      verifyMethod === 'Work Email' && styles.choiceBoxTextActive,
                    ]}
                  >
                    Work Email
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setVerifyMethod('Private Document');
                    setVerifyEvidence('offer_letter_redacted_2026.pdf');
                  }}
                  style={[
                    styles.choiceBox,
                    verifyMethod === 'Private Document' && styles.choiceBoxActive,
                  ]}
                >
                  <Upload
                    size={14}
                    color={verifyMethod === 'Private Document' ? Colors.accent : Colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.choiceBoxText,
                      verifyMethod === 'Private Document' && styles.choiceBoxTextActive,
                    ]}
                  >
                    Offer / Paystub
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={{gap: 6}}>
              <Text style={styles.fieldLabel}>
                {verifyMethod === 'Work Email'
                  ? 'Corporate Email (kept strictly private)'
                  : 'Document Reference (simulated encrypted upload)'}
              </Text>
              <TextInput
                value={verifyEvidence}
                onChangeText={setVerifyEvidence}
                placeholder={
                  verifyMethod === 'Work Email'
                    ? 'name@company.com'
                    : 'paystub_nov_2026.pdf'
                }
                style={styles.textInputBox}
              />
            </View>

            {verifyError !== '' && <Text style={styles.errorText}>{verifyError}</Text>}

            <Pressable onPress={handleSubmitVerification} style={styles.submitVerifyBtn}>
              <Text style={styles.submitVerifyText}>Verify privately & issue badge</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* Public Profile Preview Modal */}
      <Modal
        visible={publicPreviewOpen}
        onRequestClose={() => setPublicPreviewOpen(false)}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Public Profile View</Text>
            <Pressable
              onPress={() => setPublicPreviewOpen(false)}
              accessibilityLabel="Close public profile preview"
              style={styles.closeBtn}
            >
              <X size={18} color={Colors.textPrimary} />
            </Pressable>
          </View>

          <Text style={styles.previewExplain}>
            This is everything other CORPORA members see when you contribute reviews or community posts:
          </Text>

          <View style={styles.publicMockBox}>
            <Text style={styles.publicAlias}>Anonymous Contributor</Text>
            <VerificationBadge status={profile.verification.status} />
            <Text style={styles.publicMetaLine}>
              {submittedReviews.length} reviews contributed · Member since 2026
            </Text>
            <View style={styles.hiddenNoticeLine}>
              <Lock size={13} color={Colors.positiveText} />
              <Text style={styles.hiddenNoticeText}>
                Private email, documents, and real identity are completely hidden.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => setPublicPreviewOpen(false)}
            style={styles.submitVerifyBtn}
          >
            <Text style={styles.submitVerifyText}>Close preview</Text>
          </Pressable>
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
    gap: 14,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 16,
    gap: 16,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 20,
    flexShrink: 0,
  },
  userName: {
    fontFamily: Typography.displayFont,
    fontSize: 20,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  userHandle: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    paddingVertical: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontFamily: Typography.monoFont,
    fontSize: 17,
    fontWeight: 700,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 11.5,
    color: Colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: Colors.border,
  },
  verificationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  verifyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  verifyIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 15.5,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  verifySub: {
    fontSize: 12.5,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  verifiedRecordBox: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 12,
  },
  recordLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: Colors.positiveText,
  },
  recordValue: {
    fontSize: 13.5,
    fontWeight: 600,
    color: Colors.textPrimary,
  },
  recordVault: {
    fontFamily: Typography.monoFont,
    fontSize: 11.5,
    color: Colors.textMuted,
  },
  unverifiedBox: {
    backgroundColor: Colors.warningSoft,
    borderRadius: 12,
    padding: 12,
  },
  unverifiedText: {
    fontSize: 12.5,
    color: Colors.warningText,
    lineHeight: 18,
  },
  verifyActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  verifyPrimaryBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 11,
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  verifyPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 600,
  },
  previewPublicBtn: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 11,
    backgroundColor: Colors.surfaceSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  previewPublicText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: 600,
  },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  subTabBtn: {
    flex: 1,
    minHeight: 38,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTabBtnActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  subTabText: {
    fontSize: 12.5,
    fontWeight: 500,
    color: Colors.textMuted,
    whiteSpace: 'nowrap',
  },
  subTabTextActive: {
    color: Colors.textPrimary,
    fontWeight: 700,
  },
  emptyBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 15.5,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 19,
  },
  followedRowCard: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  followedName: {
    fontSize: 14.5,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  followedMeta: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  unfollowBtn: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Colors.accentSoft,
    justifyContent: 'center',
  },
  unfollowText: {
    fontSize: 12,
    fontWeight: 600,
    color: Colors.accent,
  },
  myReviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 14,
    gap: 8,
  },
  myReviewTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  myReviewCompany: {
    fontSize: 13,
    fontWeight: 700,
    color: Colors.textSecondary,
  },
  myReviewHeadline: {
    fontFamily: Typography.displayFont,
    fontSize: 15,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  myReviewDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  settingsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 16,
    gap: 14,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 15.5,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: Colors.surfaceSubtle,
  },
  settingLabel: {
    fontSize: 13.5,
    fontWeight: 600,
    color: Colors.textPrimary,
  },
  settingSub: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  settingsActions: {
    gap: 8,
    paddingTop: 2,
  },
  secondarySettingBtn: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 11,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondarySettingText: {
    fontSize: 13,
    fontWeight: 600,
    color: Colors.textSecondary,
  },
  resetDemoBtn: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 11,
    backgroundColor: Colors.negativeSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resetDemoText: {
    fontSize: 13,
    fontWeight: 600,
    color: Colors.negativeText,
  },
  sheet: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderRadius: 20,
    padding: 20,
    gap: 14,
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
  closeBtn: {
    minWidth: 40,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyVaultCallout: {
    backgroundColor: Colors.accentSoft,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  privacyVaultText: {
    flex: 1,
    fontSize: 12.5,
    color: Colors.accent,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: 600,
    color: Colors.textSecondary,
  },
  choiceBox: {
    flex: 1,
    minHeight: 42,
    borderRadius: 11,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  choiceBoxActive: {
    borderColor: Colors.accentBorder,
    backgroundColor: Colors.accentSoft,
  },
  choiceBoxText: {
    fontSize: 12.5,
    fontWeight: 600,
    color: Colors.textSecondary,
  },
  choiceBoxTextActive: {
    color: Colors.accent,
  },
  companyChip: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: Colors.surfaceSubtle,
    justifyContent: 'center',
  },
  companyChipActive: {
    backgroundColor: Colors.navy,
  },
  companyChipText: {
    fontSize: 12.5,
    fontWeight: 500,
    color: Colors.textSecondary,
    whiteSpace: 'nowrap',
  },
  companyChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 600,
  },
  textInputBox: {
    minHeight: 42,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    paddingHorizontal: 12,
    fontSize: 13.5,
  },
  errorText: {
    fontSize: 12.5,
    color: Colors.negativeText,
    fontWeight: 500,
  },
  submitVerifyBtn: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitVerifyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 600,
  },
  previewExplain: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  publicMockBox: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 16,
    gap: 10,
  },
  publicAlias: {
    fontFamily: Typography.displayFont,
    fontSize: 16,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  publicMetaLine: {
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  hiddenNoticeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: Colors.border,
  },
  hiddenNoticeText: {
    fontSize: 12,
    fontWeight: 600,
    color: Colors.positiveText,
  },
});
