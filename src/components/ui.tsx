import React, { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle, StyleProp, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';

export function Screen({ children, scroll = true, padded = true }: { children: ReactNode; scroll?: boolean; padded?: boolean }) {
  const insets = useSafeAreaInsets();
  const content = <View style={[padded && { padding: spacing.lg }, { paddingBottom: spacing.xxl + insets.bottom }]}>{children}</View>;
  return (
    <View style={styles.screen}>
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
}

export function Card({ children, style, onPress, accent }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accent?: string }) {
  const body = (
    <View style={[styles.card, accent ? { borderColor: accent + '55' } : null, style]}>{children}</View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]} accessibilityRole="button">
      {body}
    </Pressable>
  );
}

type ButtonKind = 'primary' | 'secondary' | 'ghost' | 'danger';
export function Button({
  title,
  onPress,
  kind = 'primary',
  disabled,
  loading,
  style,
  icon,
}: {
  title: string;
  onPress: () => void;
  kind?: ButtonKind;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: ReactNode;
}) {
  const bg = kind === 'primary' ? colors.cyan : kind === 'danger' ? colors.red + '22' : kind === 'secondary' ? colors.cardAlt : 'transparent';
  const fg = kind === 'primary' ? colors.bg : kind === 'danger' ? colors.red : kind === 'ghost' ? colors.cyan : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        kind === 'secondary' && { borderWidth: 1, borderColor: colors.border },
        kind === 'ghost' && { borderWidth: 1, borderColor: colors.cyan + '55' },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon}
      <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Row({ children, gap = spacing.sm, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={font.h3}>{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={{ color: colors.cyan, fontWeight: '600' }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Stat({ label, value, unit, color = colors.text, wide }: { label: string; value: string; unit?: string; color?: string; wide?: boolean }) {
  return (
    <View style={[styles.stat, wide && { flexBasis: '100%' }]}>
      <Text style={font.label}>{label}</Text>
      <Text style={[styles.statValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
        {unit ? <Text style={styles.statUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <View style={styles.statGrid}>{children}</View>;
}

export function InfoBox({ title, items, tone = 'info', children }: { title: string; items?: string[]; tone?: 'info' | 'warn' | 'success'; children?: ReactNode }) {
  const c = tone === 'warn' ? colors.amber : tone === 'success' ? colors.green : colors.cyan;
  return (
    <View style={[styles.info, { borderLeftColor: c, backgroundColor: c + '12' }]}>
      <Text style={[font.label, { color: c, marginBottom: 6 }]}>{title}</Text>
      {items?.map((it) => (
        <Text key={it} style={[font.small, { marginBottom: 3 }]}>
          •  {it}
        </Text>
      ))}
      {children}
    </View>
  );
}

export function Equation({ children, caption }: { children: string; caption?: string }) {
  return (
    <View style={styles.eq}>
      <Text style={styles.eqText}>{children}</Text>
      {caption ? <Text style={[font.small, { marginTop: 4, color: colors.textDim }]}>{caption}</Text> : null}
    </View>
  );
}

export function ProgressBar({ value, color = colors.cyan, height = 6 }: { value: number; color?: string; height?: number }) {
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: colors.border, overflow: 'hidden' }}>
      <View style={{ width: `${v * 100}%`, height, borderRadius: height, backgroundColor: color }} />
    </View>
  );
}

export function Chip({ label, active, onPress, color = colors.cyan }: { label: string; active?: boolean; onPress?: () => void; color?: string }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[styles.chip, active ? { backgroundColor: color + '26', borderColor: color } : null]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected: !!active }}
    >
      <Text style={{ color: active ? color : colors.textMuted, fontSize: 13, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={[styles.segment, on && { backgroundColor: colors.cyan }]} accessibilityState={{ selected: on }}>
            <Text style={{ color: on ? colors.bg : colors.textMuted, fontWeight: '700', fontSize: 13 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Badge({ text, color = colors.cyan }: { text: string; color?: string }) {
  return (
    <View style={{ alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: color + '22' }}>
      <Text style={{ color, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>{text}</Text>
    </View>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <Text style={{ color: colors.red, fontSize: 13, marginTop: 4 }}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  button: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    minHeight: 46,
  },
  buttonText: { fontSize: 15, fontWeight: '700' },
  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.md },
  stat: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  statUnit: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  info: { borderLeftWidth: 3, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.md },
  eq: { backgroundColor: colors.bgElevated, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  eqText: { fontFamily: 'monospace', fontSize: 15, color: colors.cyan, lineHeight: 22 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgElevated },
  segmented: { flexDirection: 'row', backgroundColor: colors.bgElevated, borderRadius: radius.md, padding: 3, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.sm },
});
