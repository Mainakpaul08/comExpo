import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ShieldAlert, ShieldCheck, Star } from 'lucide-react-native';
import { Colors, getRatingTone } from '../theme/tokens';

export function CompanyLogo({ company, size = 44 }) {
  return (
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
    >
      <Text style={[styles.logoText, { fontSize: Math.round(size * 0.36) }]}>
        {company.monogram}
      </Text>
    </View>
  );
}

export function RatingBadge({ score, compact = false }) {
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
      <Text style={[styles.ratingScore, { color: tone.textColor, fontSize: compact ? 12 : 13 }]}>
        {score.toFixed(1)}
      </Text>
      {!compact && <Text style={[styles.ratingLabel, { color: tone.textColor }]}>{tone.label}</Text>}
    </View>
  );
}

export function VerificationBadge({ status }) {
  const isCurrent = status === 'Verified Current Employee';
  const isFormer = status === 'Verified Former Employee';
  const bg = isCurrent ? Colors.positiveSoft : isFormer ? Colors.accentSoft : Colors.surfaceSubtle;
  const fg = isCurrent ? Colors.positiveText : isFormer ? Colors.accent : Colors.textMuted;

  return (
    <View style={[styles.verifyBadge, { backgroundColor: bg }]}>
      {isCurrent || isFormer ? (
        <ShieldCheck size={12} color={fg} />
      ) : (
        <ShieldAlert size={12} color={fg} />
      )}
      <Text style={[styles.verifyText, { color: fg }]}>{status}</Text>
    </View>
  );
}

export function CompanyCard({ company, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardIdentity}>
          <CompanyLogo company={company} size={44} />
          <View style={styles.cardTitleCol}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {company.name}
            </Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {company.industry} · {company.headquarters}
            </Text>
          </View>
        </View>
        <RatingBadge score={company.overallRating} />
      </View>

      <Text style={styles.cardTagline} numberOfLines={2}>
        {company.tagline}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>
          {company.reviewCount.toLocaleString()} reviews · Culture {company.cultureScore}/100 · Demo data
        </Text>
        <Text style={styles.detailsLink}>Details</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  logoBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
  },
  ratingScore: {
    fontWeight: '700',
  },
  ratingLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  verifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  verifyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 15,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardTitleCol: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardMeta: {
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  cardTagline: {
    fontSize: 13.5,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceSubtle,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  detailsLink: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.accent,
  },
});
