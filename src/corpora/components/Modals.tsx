import React, {useState} from 'react';
import {Bell, CheckCheck, Lock, Star, X} from 'lucide-react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from '../../rn';
import {useCorpora} from '../CorporaContext';
import {Colors, Typography} from '../theme';
import {CompanyRatings} from '../types';

const RATING_DIMENSIONS: Array<{key: keyof CompanyRatings; label: string}> = [
  {key: 'workLifeBalance', label: 'Work-life balance'},
  {key: 'salaryBenefits', label: 'Salary & benefits'},
  {key: 'management', label: 'Management'},
  {key: 'careerGrowth', label: 'Career growth'},
  {key: 'jobSecurity', label: 'Job security'},
  {key: 'workplaceEnvironment', label: 'Workplace environment'},
];

export const WriteReviewModal: React.FC<{
  companyId: string | null;
  onClose: () => void;
}> = ({companyId, onClose}) => {
  const {companies, profile, submitReview} = useCorpora();
  const company = companies.find((c) => c.id === companyId);

  const [employmentStatus, setEmploymentStatus] = useState<
    'Current Employee' | 'Former Employee'
  >('Current Employee');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [headline, setHeadline] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [ratings, setRatings] = useState<CompanyRatings>({
    workLifeBalance: 4,
    salaryBenefits: 4,
    management: 4,
    careerGrowth: 4,
    jobSecurity: 4,
    workplaceEnvironment: 4,
  });
  const [error, setError] = useState('');

  if (!company) return null;

  const handlePublish = () => {
    if (!role.trim() || headline.trim().length < 5 || pros.trim().length < 10 || cons.trim().length < 10) {
      setError('Please include your role, a headline, and meaningful pros & cons.');
      return;
    }
    setError('');
    submitReview({
      companyId: company.id,
      employmentStatus,
      role,
      location,
      headline,
      pros,
      cons,
      ratings,
    });
    setRole('');
    setLocation('');
    setHeadline('');
    setPros('');
    setCons('');
    onClose();
  };

  return (
    <Modal visible={Boolean(companyId)} onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <View style={{flex: 1}}>
            <Text style={styles.sheetTitle}>Review {company.name}</Text>
            <Text style={styles.sheetSub}>
              Posted anonymously · Badge: {profile.verification.status}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            accessibilityLabel="Close review form"
            style={styles.closeBtn}
          >
            <X size={18} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <ScrollView style={{maxHeight: 520}} contentContainerStyle={{gap: 14}}>
          <View style={styles.anonNotice}>
            <Lock size={14} color={Colors.accent} />
            <Text style={styles.anonNoticeText}>
              Your real name and verification proof are never attached to published reviews.
            </Text>
          </View>

          <View style={{gap: 6}}>
            <Text style={styles.label}>Employment Relationship</Text>
            <View style={{flexDirection: 'row', gap: 8}}>
              {(['Current Employee', 'Former Employee'] as const).map((status) => {
                const active = employmentStatus === status;
                return (
                  <Pressable
                    key={status}
                    onPress={() => setEmploymentStatus(status)}
                    style={[styles.toggleBox, active && styles.toggleBoxActive]}
                  >
                    <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
                      {status}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <View style={{gap: 5}}>
              <Text style={styles.label}>Role / Title</Text>
              <TextInput
                value={role}
                onChangeText={setRole}
                placeholder="e.g. Product Designer"
                style={styles.input}
              />
            </View>
            <View style={{gap: 5}}>
              <Text style={styles.label}>Location (optional)</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. San Francisco, CA"
                style={styles.input}
              />
            </View>
          </View>

          <View style={{gap: 8}}>
            <Text style={styles.label}>Rate Workplace Dimensions (1–5)</Text>
            {RATING_DIMENSIONS.map((dim) => (
              <View key={dim.key} style={styles.ratingPickerRow}>
                <Text style={styles.ratingPickerLabel}>{dim.label}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((num) => {
                    const filled = ratings[dim.key] >= num;
                    return (
                      <Pressable
                        key={num}
                        onPress={() =>
                          setRatings((prev) => ({...prev, [dim.key]: num}))
                        }
                        accessibilityLabel={`Rate ${dim.label} ${num} out of 5`}
                        style={styles.starHitbox}
                      >
                        <Star
                          size={18}
                          color={filled ? Colors.accent : Colors.borderStrong}
                          fill={filled ? Colors.accent : 'transparent'}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          <View style={{gap: 5}}>
            <Text style={styles.label}>Review Headline</Text>
            <TextInput
              value={headline}
              onChangeText={setHeadline}
              placeholder="Summarize your overall experience in one line"
              style={styles.input}
            />
          </View>

          <View style={{gap: 5}}>
            <Text style={styles.label}>Pros</Text>
            <TextInput
              value={pros}
              onChangeText={setPros}
              multiline
              numberOfLines={3}
              placeholder="What works well at this organization?"
              style={styles.textarea}
            />
          </View>

          <View style={{gap: 5}}>
            <Text style={styles.label}>Cons & Advice to Management</Text>
            <TextInput
              value={cons}
              onChangeText={setCons}
              multiline
              numberOfLines={3}
              placeholder="Where should candidates be cautious or ask questions?"
              style={styles.textarea}
            />
          </View>

          {error !== '' && <Text style={styles.errorText}>{error}</Text>}

          <Pressable onPress={handlePublish} style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>Publish Anonymous Review</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

export const NotificationsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({visible, onClose}) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    openCompany,
  } = useCorpora();

  return (
    <Modal visible={visible} onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Bell size={18} color={Colors.accent} />
            <Text style={styles.sheetTitle}>Notifications</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Pressable onPress={markAllNotificationsRead} style={styles.markAllBtn}>
              <CheckCheck size={14} color={Colors.accent} />
              <Text style={styles.markAllText}>Mark read</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              accessibilityLabel="Close notifications"
              style={styles.closeBtn}
            >
              <X size={18} color={Colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <ScrollView style={{maxHeight: 420}} contentContainerStyle={{gap: 8}}>
          {notifications.map((n) => (
            <Pressable
              key={n.id}
              onPress={() => {
                markNotificationRead(n.id);
                if (n.companyId) {
                  onClose();
                  openCompany(n.companyId);
                }
              }}
              style={[styles.notifCard, n.unread && styles.notifCardUnread]}
            >
              <View style={styles.notifTop}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifTime}>{n.time}</Text>
              </View>
              <Text style={styles.notifBody}>{n.body}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheet: {
    width: '100%',
    maxWidth: 520,
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
    gap: 10,
  },
  sheetTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 17,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  sheetSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    minWidth: 40,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anonNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 11,
    borderRadius: 11,
    backgroundColor: Colors.accentSoft,
  },
  anonNoticeText: {
    flex: 1,
    fontSize: 12.5,
    color: Colors.accent,
    lineHeight: 17,
  },
  label: {
    fontSize: 12.5,
    fontWeight: 600,
    color: Colors.textSecondary,
  },
  toggleBox: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBoxActive: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accentBorder,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: 600,
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.accent,
  },
  input: {
    minHeight: 42,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    paddingHorizontal: 12,
    fontSize: 13.5,
  },
  textarea: {
    minHeight: 76,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 11,
    fontSize: 13.5,
  },
  ratingPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
  },
  ratingPickerLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: Colors.textPrimary,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starHitbox: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12.5,
    color: Colors.negativeText,
    fontWeight: 500,
  },
  submitBtn: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 600,
  },
  markAllBtn: {
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: Colors.accentSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: 600,
    color: Colors.accent,
  },
  notifCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 12,
    gap: 4,
  },
  notifCardUnread: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accentBorder,
  },
  notifTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  notifTitle: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  notifTime: {
    fontSize: 11.5,
    color: Colors.textMuted,
  },
  notifBody: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
