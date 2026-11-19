/** AeroLearn warm-space design tokens. */
export const colors = {
  bg: '#100F0D',
  bgElevated: '#191713',
  card: '#211E18',
  cardAlt: '#2A261F',
  border: '#3A3429',
  borderStrong: '#514735',
  cyan: '#C7A46A',
  cyanSoft: 'rgba(199,164,106,0.14)',
  blue: '#B99B6A',
  violet: '#C7A46A',
  amber: '#D6B77F',
  green: '#B5AA8F',
  red: '#C88772',
  text: '#F4EFE5',
  textMuted: '#C7BFAF',
  textDim: '#918878',
  grid: 'rgba(220,204,174,0.10)',
};

export const series = [colors.cyan, colors.amber, colors.green, colors.blue, colors.textMuted];
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
