import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font, radius } from '../theme';
import { parseNumber } from '../physics/validation';

interface Props {
  label: string;
  symbol?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
  /** Decimal places shown in the text field */
  decimals?: number;
  disabled?: boolean;
}

const THUMB = 24;

function snap(v: number, min: number, max: number, step: number) {
  const s = Math.round((v - min) / step) * step + min;
  const c = Math.min(max, Math.max(min, s));
  // Remove floating dust like 0.30000000000000004
  return Number(c.toFixed(10));
}

/**
 * Slider + numeric text field. The text field accepts any typed value and
 * validates it against [min, max]; invalid text is shown in red and is NOT
 * passed to the model.
 */
export function ParamSlider({ label, symbol, value, min, max, step, unit, onChange, decimals = 2, disabled }: Props) {
  const [width, setWidth] = useState(0);
  const [text, setText] = useState(String(value));
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const startX = useRef(0);
  const widthRef = useRef(0);
  const propsRef = useRef({ min, max, step, onChange, value, disabled });
  propsRef.current = { min, max, step, onChange, value, disabled };

  useEffect(() => {
    if (!editing) {
      setText(Number(value.toFixed(decimals)).toString());
      setError(null);
    }
  }, [value, editing, decimals]);

  const toValue = (x: number) => {
    const { min: mn, max: mx, step: st } = propsRef.current;
    const w = Math.max(1, widthRef.current - THUMB);
    const frac = Math.min(1, Math.max(0, (x - THUMB / 2) / w));
    return snap(mn + frac * (mx - mn), mn, mx, st);
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !propsRef.current.disabled,
      onMoveShouldSetPanResponder: () => !propsRef.current.disabled,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        startX.current = e.nativeEvent.locationX;
        const v = toValue(startX.current);
        if (v !== propsRef.current.value) propsRef.current.onChange(v);
      },
      onPanResponderMove: (_e, g) => {
        const v = toValue(startX.current + g.dx);
        if (v !== propsRef.current.value) propsRef.current.onChange(v);
      },
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
    setWidth(e.nativeEvent.layout.width);
  };

  const frac = max > min ? (Math.min(max, Math.max(min, value)) - min) / (max - min) : 0;
  const thumbX = frac * Math.max(0, width - THUMB);

  const commit = (t: string) => {
    const n = parseNumber(t);
    if (n === null) {
      setError('Enter a number');
      return;
    }
    if (n < min || n > max) {
      setError(`Allowed range ${min} – ${max}${unit ? ' ' + unit : ''}`);
      return;
    }
    setError(null);
    onChange(n);
  };

  return (
    <View style={[styles.wrap, disabled && { opacity: 0.5 }]}>
      <View style={styles.header}>
        <Text style={styles.label}>
          {label}
          {symbol ? <Text style={styles.symbol}>  {symbol}</Text> : null}
        </Text>
        <View style={[styles.inputBox, error ? { borderColor: colors.red } : null]}>
          <TextInput
            value={text}
            editable={!disabled}
            onFocus={() => setEditing(true)}
            onChangeText={(t) => {
              setText(t);
              commit(t);
            }}
            onBlur={() => {
              setEditing(false);
              if (error) {
                setText(Number(value.toFixed(decimals)).toString());
                setError(null);
              }
            }}
            keyboardType="numeric"
            returnKeyType="done"
            style={styles.input}
            accessibilityLabel={`${label} value`}
            selectTextOnFocus
          />
          {unit ? <Text style={styles.unit}>{unit}</Text> : null}
        </View>
      </View>
      <View style={styles.track} onLayout={onLayout} {...responder.panHandlers} accessibilityRole="adjustable" accessibilityLabel={label}>
        <View style={styles.rail} pointerEvents="none" />
        <View style={[styles.fill, { width: thumbX + THUMB / 2 }]} pointerEvents="none" />
        <View style={[styles.thumb, { left: thumbX }]} pointerEvents="none" />
      </View>
      <View style={styles.rangeRow}>
        <Text style={styles.range}>{min}</Text>
        <Text style={styles.range}>{max}</Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { ...font.small, color: colors.text, fontWeight: '600', flexShrink: 1 },
  symbol: { color: colors.cyan, fontFamily: 'monospace' },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    minWidth: 96,
    height: 34,
  },
  input: { color: colors.text, fontSize: 14, fontWeight: '700', flex: 1, paddingVertical: 0, textAlign: 'right' },
  unit: { color: colors.textDim, fontSize: 12, marginLeft: 4 },
  track: { height: 34, justifyContent: 'center' },
  rail: { position: 'absolute', left: THUMB / 2, right: THUMB / 2, height: 4, borderRadius: 2, backgroundColor: colors.border },
  fill: { position: 'absolute', left: 0, height: 4, borderRadius: 2, backgroundColor: colors.cyan },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.text,
    borderWidth: 4,
    borderColor: colors.cyan,
  },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  range: { color: colors.textDim, fontSize: 11 },
  error: { color: colors.red, fontSize: 12, marginTop: 2 },
});
