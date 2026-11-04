import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { colors, font } from '../theme';
import { niceTicks, tickLabel } from '../utils/format';

export interface Series {
  label: string;
  color: string;
  data: { x: number; y: number }[];
  dashed?: boolean;
}

interface Props {
  title?: string;
  series: Series[];
  xLabel: string;
  yLabel: string;
  height?: number;
  /** Optional moving marker (e.g. current animation time) per series index */
  markers?: ({ x: number; y: number } | null)[];
  /** Vertical cursor at this x value */
  cursorX?: number;
  /** Force axis minimums to include 0 */
  includeZero?: boolean;
  /** Draw a horizontal reference line */
  refY?: { y: number; label: string; color?: string };
}

const PAD = { l: 46, r: 12, t: 12, b: 34 };

/** Lightweight SVG line chart with nice ticks, axis labels and legend. */
export function LineChart({ title, series, xLabel, yLabel, height = 200, markers, cursorX, includeZero = true, refY }: Props) {
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  const bounds = useMemo(() => {
    let xmin = Infinity;
    let xmax = -Infinity;
    let ymin = Infinity;
    let ymax = -Infinity;
    for (const s of series)
      for (const p of s.data) {
        if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
        xmin = Math.min(xmin, p.x);
        xmax = Math.max(xmax, p.x);
        ymin = Math.min(ymin, p.y);
        ymax = Math.max(ymax, p.y);
      }
    if (refY) {
      ymin = Math.min(ymin, refY.y);
      ymax = Math.max(ymax, refY.y);
    }
    if (!Number.isFinite(xmin)) return null;
    if (includeZero) {
      ymin = Math.min(0, ymin);
      xmin = Math.min(0, xmin);
    }
    if (ymax - ymin < 1e-12) ymax = ymin + 1;
    if (xmax - xmin < 1e-12) xmax = xmin + 1;
    const yt = niceTicks(ymin, ymax, 4);
    const xt = niceTicks(xmin, xmax, 4);
    ymax = Math.max(ymax, yt[yt.length - 1]);
    ymin = Math.min(ymin, yt[0]);
    return { xmin, xmax, ymin, ymax, yt, xt };
  }, [series, includeZero, refY]);

  const iw = Math.max(1, w - PAD.l - PAD.r);
  const ih = height - PAD.t - PAD.b;

  return (
    <View onLayout={onLayout} style={{ marginBottom: 8 }}>
      {title ? <Text style={[font.label, { marginBottom: 6 }]}>{title}</Text> : null}
      {w > 0 && bounds ? (
        <Svg width={w} height={height}>
          {(() => {
            const sx = (x: number) => PAD.l + ((x - bounds.xmin) / (bounds.xmax - bounds.xmin)) * iw;
            const sy = (y: number) => PAD.t + ih - ((y - bounds.ymin) / (bounds.ymax - bounds.ymin)) * ih;
            return (
              <G>
                <Rect x={PAD.l} y={PAD.t} width={iw} height={ih} fill={colors.bgElevated} rx={6} />
                {bounds.yt.map((t) => (
                  <G key={`y${t}`}>
                    <Line x1={PAD.l} x2={PAD.l + iw} y1={sy(t)} y2={sy(t)} stroke={colors.grid} strokeWidth={1} />
                    <SvgText x={PAD.l - 6} y={sy(t) + 4} fontSize={10} fill={colors.textDim} textAnchor="end">
                      {tickLabel(t)}
                    </SvgText>
                  </G>
                ))}
                {bounds.xt.map((t) => (
                  <G key={`x${t}`}>
                    <Line x1={sx(t)} x2={sx(t)} y1={PAD.t} y2={PAD.t + ih} stroke={colors.grid} strokeWidth={1} />
                    <SvgText x={sx(t)} y={PAD.t + ih + 14} fontSize={10} fill={colors.textDim} textAnchor="middle">
                      {tickLabel(t)}
                    </SvgText>
                  </G>
                ))}
                {refY ? (
                  <G>
                    <Line x1={PAD.l} x2={PAD.l + iw} y1={sy(refY.y)} y2={sy(refY.y)} stroke={refY.color ?? colors.amber} strokeDasharray="5,4" strokeWidth={1.5} />
                    <SvgText x={PAD.l + iw - 4} y={sy(refY.y) - 4} fontSize={10} fill={refY.color ?? colors.amber} textAnchor="end">
                      {refY.label}
                    </SvgText>
                  </G>
                ) : null}
                {series.map((s) => {
                  const pts = s.data.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
                  if (pts.length < 2) return null;
                  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
                  return <Path key={s.label} d={d} stroke={s.color} strokeWidth={2.2} fill="none" strokeDasharray={s.dashed ? '6,4' : undefined} strokeLinejoin="round" />;
                })}
                {cursorX !== undefined && Number.isFinite(cursorX) ? (
                  <Line x1={sx(cursorX)} x2={sx(cursorX)} y1={PAD.t} y2={PAD.t + ih} stroke={colors.text + '55'} strokeWidth={1} />
                ) : null}
                {markers?.map((m, i) =>
                  m && Number.isFinite(m.x) && Number.isFinite(m.y) ? (
                    <Circle key={`m${i}`} cx={sx(m.x)} cy={sy(m.y)} r={4.5} fill={series[i]?.color ?? colors.cyan} stroke={colors.bg} strokeWidth={2} />
                  ) : null,
                )}
                <SvgText x={PAD.l + iw / 2} y={height - 4} fontSize={11} fill={colors.textMuted} textAnchor="middle">
                  {xLabel}
                </SvgText>
                <SvgText x={12} y={PAD.t + ih / 2} fontSize={11} fill={colors.textMuted} textAnchor="middle" rotation={-90} originX={12} originY={PAD.t + ih / 2}>
                  {yLabel}
                </SvgText>
              </G>
            );
          })()}
        </Svg>
      ) : (
        <View style={{ height }} />
      )}
      {series.length > 1 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
          {series.map((s) => (
            <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 14, height: 3, backgroundColor: s.color, borderRadius: 2 }} />
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{s.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
