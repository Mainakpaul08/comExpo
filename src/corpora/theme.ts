export const Colors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',

  accent: '#4F46E5',
  accentHover: '#4338CA',
  accentSoft: '#EEF2FF',
  accentBorder: '#C7D2FE',

  positive: '#16A34A',
  positiveSoft: '#DCFCE7',
  positiveText: '#15803D',

  warning: '#D97706',
  warningSoft: '#FEF3C7',
  warningText: '#B45309',

  negative: '#DC2626',
  negativeSoft: '#FEE2E2',
  negativeText: '#B91C1C',

  navy: '#0B1120',
};

export const Typography = {
  displayFont: 'var(--font-display)',
  bodyFont: 'var(--font-body)',
  monoFont: 'var(--font-mono)',
};

export function getRatingTone(score: number): {
  label: string;
  color: string;
  bg: string;
  textColor: string;
} {
  if (score >= 4.2) {
    return {
      label: 'Strong',
      color: Colors.positive,
      bg: Colors.positiveSoft,
      textColor: Colors.positiveText,
    };
  }
  if (score >= 3.5) {
    return {
      label: 'Solid',
      color: Colors.accent,
      bg: Colors.accentSoft,
      textColor: Colors.accent,
    };
  }
  if (score >= 2.9) {
    return {
      label: 'Mixed',
      color: Colors.warning,
      bg: Colors.warningSoft,
      textColor: Colors.warningText,
    };
  }
  return {
    label: 'Caution',
    color: Colors.negative,
    bg: Colors.negativeSoft,
    textColor: Colors.negativeText,
  };
}
