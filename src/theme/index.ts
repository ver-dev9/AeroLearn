/** AeroLearn design system tokens. */
export const colors = {
  bg: '#050B1A',
  bgElevated: '#0A1530',
  card: '#0E1B3A',
  cardAlt: '#122347',
  border: '#1E3363',
  borderStrong: '#2C4A8A',
  cyan: '#22D3EE',
  cyanSoft: 'rgba(34,211,238,0.14)',
  blue: '#3B82F6',
  violet: '#8B5CF6',
  amber: '#F59E0B',
  green: '#34D399',
  red: '#F87171',
  text: '#FFFFFF',
  textMuted: '#9FB3D9',
  textDim: '#6B7FA8',
  grid: 'rgba(159,179,217,0.12)',
};

export const series = [colors.cyan, colors.amber, colors.violet, colors.green, colors.blue];

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 12, lg: 18, xl: 24, pill: 999 };

export const font = {
  h1: { fontSize: 28, fontWeight: '800' as const, color: colors.text, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, lineHeight: 22, color: colors.textMuted },
  small: { fontSize: 13, lineHeight: 18, color: colors.textMuted },
  label: { fontSize: 11, fontWeight: '700' as const, color: colors.textDim, letterSpacing: 1.2, textTransform: 'uppercase' as const },
  mono: { fontFamily: 'monospace', fontSize: 14, color: colors.cyan },
};
