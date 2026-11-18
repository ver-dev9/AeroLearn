/** AeroLearn design system tokens. */
export const colors = {
  bg: '#08090D',
  bgElevated: '#11131A',
  card: '#171A23',
  cardAlt: '#20232D',
  border: '#2B2E38',
  borderStrong: '#44424F',
  cyan: '#B4A1FF',
  cyanSoft: 'rgba(180,161,255,0.14)',
  blue: '#7774A8',
  violet: '#A78BFA',
  amber: '#F5C56B',
  green: '#74D6AE',
  red: '#EF8989',
  text: '#FFFFFF',
  textMuted: '#B8BBC8',
  textDim: '#7D8190',
  grid: 'rgba(184,187,204,0.12)',
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
