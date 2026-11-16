import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Lock, ShieldCheck } from 'lucide-react-native';
import { VerificationBadge } from '../../src/components/CommonUI';
import { useCorpora } from '../../src/context/CorporaContext';
import { Colors } from '../../src/theme/tokens';

export default function ProfileScreen() {
  const { profile, reviews, submitVerification, updatePrivacySetting, resetDemoData } = useCorpora();
  const submittedCount = reviews.filter((r) => r.isUserSubmitted).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile & Verification</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>MP</Text>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.handle}>{profile.handle}</Text>
          <VerificationBadge status={profile.verification.status} />

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{submittedCount}</Text>
              <Text style={styles.statLbl}>Reviews</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{profile.savedCompanyIds.length}</Text>
              <Text style={styles.statLbl}>Saved</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{profile.followedCompanyIds.length}</Text>
              <Text style={styles.statLbl}>Followed</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.rowHeader}>
            <Lock size={16} color={Colors.accent} />
            <Text style={styles.cardTitle}>Private Employment Verification</Text>
          </View>
          <Text style={styles.bodyText}>
            Public profiles display your verification badge only — private documents and corporate emails stay hidden.
          </Text>
          <Pressable
            onPress={() =>
              submitVerification({
                status: 'Verified Current Employee',
                companyId: 'veltrix-cloud',
                role: 'Senior Product Engineer',
                method: 'Work Email',
                evidenceInput: 'm***@veltrixcloud.example.com',
              })
            }
            style={styles.verifyBtn}
          >
            <ShieldCheck size={16} color="#FFFFFF" />
            <Text style={styles.verifyBtnText}>Verify as Current Employee</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Privacy Settings</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Always post reviews anonymously</Text>
            <Switch
              value={profile.privacySettings.defaultAnonymousReviews}
              onValueChange={(v) => updatePrivacySetting('defaultAnonymousReviews', v)}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Hide employer name in Community</Text>
            <Switch
              value={profile.privacySettings.hideFormerEmployerInCommunity}
              onValueChange={(v) => updatePrivacySetting('hideFormerEmployerInCommunity', v)}
            />
          </View>
          <Pressable onPress={resetDemoData} style={styles.resetBtn}>
            <Text style={styles.resetBtnText}>Reset Demo Data</Text>
          </Pressable>
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
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  avatar: { width: 64, height: 64, borderRadius: 20, backgroundColor: Colors.navy, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  name: { fontSize: 19, fontWeight: '700', color: Colors.textPrimary },
  handle: { fontSize: 13, color: Colors.textMuted },
  statsRow: { flexDirection: 'row', width: '100%', paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.surfaceSubtle },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  statLbl: { fontSize: 12, color: Colors.textMuted },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15.5, fontWeight: '700', color: Colors.textPrimary },
  bodyText: { fontSize: 13, lineHeight: 18, color: Colors.textSecondary },
  verifyBtn: {
    height: 44,
    borderRadius: 11,
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  verifyBtnText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '600' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingText: { fontSize: 13.5, color: Colors.textPrimary, flex: 1 },
  resetBtn: { paddingVertical: 11, borderRadius: 10, backgroundColor: Colors.negativeSoft, alignItems: 'center' },
  resetBtnText: { color: Colors.negativeText, fontWeight: '600', fontSize: 13 },
});
