/** AeroLearn graphite, warm-metal and deep-navy design tokens. */
export const colors = {
  bg: '#111315',
  bgElevated: '#19212A',
  card: '#202832',
  cardAlt: '#293440',
  border: '#35414D',
  borderStrong: '#526170',
  cyan: '#72AFCB',
  cyanSoft: 'rgba(114,175,203,0.15)',
  blue: '#557DA6',
  violet: '#A78BC4',
  amber: '#D6AD70',
  green: '#83B69B',
  red: '#D47E79',
  text: '#F2F0E9',
  textMuted: '#C1C7C9',
  textDim: '#89949B',
  grid: 'rgba(185,205,218,0.13)',
  bronze: '#C49A63',
  navy: '#172A40',
  graphite: '#30363D',
};

export const series = [colors.cyan, colors.amber, colors.green, colors.violet, colors.red, colors.blue];
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
