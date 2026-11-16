import React from 'react';
import {
  BarChart2,
  Bell,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Compass,
  Home,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Star,
  User,
} from 'lucide-react';
import {Pressable, StyleSheet, Text, View} from '../../rn';
import {Colors, getRatingTone, Typography} from '../theme';
import {Company, TabKey, VerificationBadgeType} from '../types';

export const CompanyLogo: React.FC<{
  company: Pick<Company, 'monogram' | 'brandColor' | 'brandAccent' | 'name'>;
  size?: number;
}> = ({company, size = 44}) => (
  <View
    style={[
      styles.logoBox,
      {
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.26),
        backgroundColor: company.brandColor,
      },
    ]}
    aria-label={`${company.name} logo`}
  >
    <Text
      style={{
        color: '#FFFFFF',
        fontFamily: Typography.displayFont,
        fontWeight: 700,
        fontSize: Math.round(size * 0.36),
        letterSpacing: -0.3,
      }}
    >
      {company.monogram}
    </Text>
  </View>
);

export const RatingBadge: React.FC<{
  score: number;
  compact?: boolean;
}> = ({score, compact = false}) => {
  const tone = getRatingTone(score);
  return (
    <View
      style={[
        styles.ratingBadge,
        {
          backgroundColor: tone.bg,
          paddingHorizontal: compact ? 8 : 10,
          paddingVertical: compact ? 3 : 4,
        },
      ]}
    >
      <Star size={12} color={tone.color} fill={tone.color} />
      <Text
        style={[
          styles.ratingScoreText,
          {color: tone.textColor, fontSize: compact ? 12 : 13},
        ]}
      >
        {score.toFixed(1)}
      </Text>
      {!compact && (
        <Text style={[styles.ratingLabelText, {color: tone.textColor}]}>
          {tone.label}
        </Text>
      )}
    </View>
  );
};

export const VerificationBadge: React.FC<{
  status: VerificationBadgeType;
  compact?: boolean;
}> = ({status, compact = false}) => {
  const isCurrent = status === 'Verified Current Employee';
  const isFormer = status === 'Verified Former Employee';

  const bg = isCurrent
    ? Colors.positiveSoft
    : isFormer
      ? Colors.accentSoft
      : Colors.surfaceSubtle;
  const fg = isCurrent
    ? Colors.positiveText
    : isFormer
      ? Colors.accent
      : Colors.textMuted;

  return (
    <View
      style={[
        styles.verifyBadge,
        {
          backgroundColor: bg,
          paddingHorizontal: compact ? 7 : 9,
          paddingVertical: compact ? 2 : 4,
        },
      ]}
    >
      {isCurrent || isFormer ? (
        <ShieldCheck size={12} color={fg} />
      ) : (
        <ShieldAlert size={12} color={fg} />
      )}
      <Text style={[styles.verifyText, {color: fg, fontSize: compact ? 11 : 12}]}>
        {status}
      </Text>
    </View>
  );
};

export const MetricBar: React.FC<{
  label: string;
  score: number;
  max?: number;
}> = ({label, score, max = 5}) => {
  const pct = Math.max(4, Math.min(100, (score / max) * 100));
  const tone = getRatingTone(score);
  return (
    <View style={styles.metricRow}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <View style={styles.metricValueWrap}>
          <Text style={styles.metricValue}>{score.toFixed(1)}</Text>
          <Text style={styles.metricSub}>{tone.label}</Text>
        </View>
      </View>
      <View style={styles.metricTrack}>
        <View
          style={[
            styles.metricFill,
            {width: `${pct}%`, backgroundColor: tone.color},
          ]}
        />
      </View>
    </View>
  );
};

export const CompanyListCard: React.FC<{
  company: Company;
  onPress: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}> = ({company, onPress, isSaved, onToggleSave}) => {
  return (
    <Pressable onPress={onPress} style={styles.companyCard}>
      <View style={styles.companyCardTop}>
        <View style={styles.companyIdentityRow}>
          <CompanyLogo company={company} size={44} />
          <View style={{flex: 1, gap: 2}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Text style={styles.companyName} numberOfLines={1}>
                {company.name}
              </Text>
            </View>
            <Text style={styles.companyMeta} numberOfLines={1}>
              {company.industry} · {company.headquarters}
            </Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <RatingBadge score={company.overallRating} />
          {onToggleSave && (
            <Pressable
              onPress={() => {
                onToggleSave();
              }}
              accessibilityLabel={isSaved ? 'Remove saved company' : 'Save company'}
              style={styles.iconHitbox}
            >
              <Bookmark
                size={18}
                color={isSaved ? Colors.accent : Colors.textMuted}
                fill={isSaved ? Colors.accent : 'transparent'}
              />
            </Pressable>
          )}
        </View>
      </View>

      <Text style={styles.companyTagline} numberOfLines={2}>
        {company.tagline}
      </Text>

      <View style={styles.companyCardFooter}>
        <Text style={styles.companyFooterMeta}>
          <Text style={styles.tabularStrong}>{company.reviewCount.toLocaleString()}</Text> reviews · Culture{' '}
          <Text style={styles.tabularStrong}>{company.cultureScore}/100</Text> · Demo data
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 2}}>
          <Text style={styles.viewDetailsLink}>Details</Text>
          <ChevronRight size={15} color={Colors.accent} />
        </View>
      </View>
    </Pressable>
  );
};

export const SkeletonBlock: React.FC<{
  height?: number;
  width?: number | string;
  radius?: number;
}> = ({height = 16, width = '100%', radius = 10}) => (
  <View
    className="corpora-skeleton"
    style={{
      height,
      width,
      borderRadius: radius,
    }}
  />
);

export const TopAppBar: React.FC<{
  title?: string;
  showBrand?: boolean;
  unreadCount: number;
  onOpenNotifications: () => void;
  rightAction?: React.ReactNode;
}> = ({title, showBrand = true, unreadCount, onOpenNotifications, rightAction}) => {
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarLeft}>
        {showBrand ? (
          <View style={styles.brandLockup}>
            <View style={styles.brandMark}>
              <View style={styles.brandMarkInner} />
            </View>
            <Text style={styles.brandText}>CORPORA</Text>
          </View>
        ) : (
          <Text style={styles.pageHeaderTitle} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>

      <View style={styles.topBarRight}>
        {rightAction}
        <Pressable
          onPress={onOpenNotifications}
          accessibilityLabel="Open notifications"
          style={styles.bellButton}
        >
          <Bell size={20} color={Colors.textPrimary} />
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const TABS: {key: TabKey; label: string; Icon: React.ComponentType<{size?: number; color?: string; strokeWidth?: number}>}[] = [
  {key: 'home', label: 'Home', Icon: Home},
  {key: 'explore', label: 'Explore', Icon: Compass},
  {key: 'compare', label: 'Compare', Icon: BarChart2},
  {key: 'community', label: 'Community', Icon: MessageSquare},
  {key: 'profile', label: 'Profile', Icon: User},
];

export const BottomTabBar: React.FC<{
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}> = ({activeTab, onSelectTab}) => {
  return (
    <View style={styles.tabBar}>
      {TABS.map(({key, label, Icon}) => {
        const active = activeTab === key;
        const color = active ? Colors.accent : Colors.textMuted;
        return (
          <Pressable
            key={key}
            onPress={() => onSelectTab(key)}
            accessibilityLabel={label}
            style={styles.tabItem}
          >
            <View style={[styles.tabIconWrap, active && styles.tabIconWrapActive]}>
              <Icon size={20} color={color} strokeWidth={active ? 2.4 : 1.9} />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color,
                  fontWeight: active ? 600 : 500,
                },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export const ToastBanner: React.FC<{message: string | null}> = ({message}) => {
  if (!message) return null;
  return (
    <View style={styles.toastWrap} pointerEvents="none">
      <View style={styles.toastPill}>
        <CheckCircle2 size={15} color="#4ADE80" />
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoBox: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    flexShrink: 0,
  },
  ratingScoreText: {
    fontFamily: Typography.monoFont,
    fontWeight: 600,
    fontVariant: ['tabular-nums'],
  },
  ratingLabelText: {
    fontSize: 11,
    fontWeight: 600,
  },
  verifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  verifyText: {
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  metricRow: {
    gap: 6,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: Colors.textSecondary,
  },
  metricValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: 600,
    fontFamily: Typography.monoFont,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  metricSub: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: 500,
  },
  metricTrack: {
    height: 7,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 999,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    borderRadius: 999,
  },
  companyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  companyCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  companyIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  companyName: {
    fontFamily: Typography.displayFont,
    fontSize: 16,
    fontWeight: 700,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  companyMeta: {
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  companyTagline: {
    fontSize: 13.5,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  companyCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: Colors.surfaceSubtle,
    gap: 8,
  },
  companyFooterMeta: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  tabularStrong: {
    fontFamily: Typography.monoFont,
    fontWeight: 600,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  viewDetailsLink: {
    fontSize: 12.5,
    fontWeight: 600,
    color: Colors.accent,
  },
  iconHitbox: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  topBar: {
    height: 54,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(12px)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    zIndex: 20,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  brandMark: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkInner: {
    width: 10,
    height: 10,
    borderRadius: 2.5,
    borderWidth: 2.5,
    borderStyle: 'solid',
    borderColor: '#818CF8',
  },
  brandText: {
    fontFamily: Typography.displayFont,
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: 1.1,
    color: Colors.textPrimary,
  },
  pageHeaderTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 17,
    fontWeight: 700,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bellButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 99,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: Typography.monoFont,
  },
  tabBar: {
    height: 64,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(255,255,255,0.96)',
    backdropFilter: 'blur(12px)',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexShrink: 0,
    zIndex: 25,
  },
  tabItem: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabIconWrap: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: Colors.accentSoft,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: -0.1,
    whiteSpace: 'nowrap',
  },
  toastWrap: {
    position: 'fixed',
    bottom: 82,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 140,
  },
  toastPill: {
    backgroundColor: Colors.navy,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 500,
  },
});
