import React, { useEffect, useMemo, useState } from 'react';
import { Alert, LayoutChangeEvent, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Chip, Equation, InfoBox, Row, Screen, Stat, StatGrid, SectionTitle } from '../components/ui';
import { ParamSlider } from '../components/ParamSlider';
import { LineChart } from '../components/LineChart';
import { LabHeader, ControlsRow } from '../components/LabHeader';
import { PlayIcon, PauseIcon, ResetIcon, SaveIcon } from '../components/Icons';
import { colors, font } from '../theme';
import { DEG, GRAVITY_PRESETS, PROJECTILE_LIMITS, ProjectileInput, ProjectileResult, solveProjectile, validateProjectile } from '../physics';
import { fmt } from '../utils/format';
import { useAnimationClock, sampleAt } from '../utils/useAnimationClock';
import { useProgress } from '../store/progress';
import type { RootStackParamList } from '../navigation/types';

const DEFAULTS: ProjectileInput = { v0: 30, angleDeg: 45, g: 9.80665 };

type Props = NativeStackScreenProps<RootStackParamList, 'FlightLab'>;

export default function FlightLabScreen({ route }: Props) {
  const preset = route.params?.preset as Partial<ProjectileInput> | undefined;
  const start = { ...DEFAULTS, ...(preset ?? {}) };
  const [draft, setDraft] = useState<ProjectileInput>(start);
  const [input, setInput] = useState<ProjectileInput>(start);
  const [ghost, setGhost] = useState<ProjectileResult | null>(null);
  const { recordSimRun, saveExperiment } = useProgress();

  const issues = validateProjectile(draft);
  const result = useMemo(() => solveProjectile(input, 160), [input]);
  const clock = useAnimationClock(result.timeOfFlight, Math.min(4, Math.max(1.5, result.timeOfFlight / 3)));
  const dirty = draft.v0 !== input.v0 || draft.angleDeg !== input.angleDeg || draft.g !== input.g;

  useEffect(() => {
    clock.restart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const run = () => {
    if (issues.length) return;
    setGhost(result);
    setInput({ ...draft });
    const r = solveProjectile(draft);
    recordSimRun('flight', `v₀ ${draft.v0} m/s, θ ${draft.angleDeg}° → R ${fmt(r.range, 1)} m`);
  };

  const reset = () => {
    setDraft(DEFAULTS);
    setInput(DEFAULTS);
    setGhost(null);
    clock.reset();
  };

  const save = () => {
    saveExperiment({
      lab: 'flight',
      title: `Projectile ${input.v0} m/s @ ${input.angleDeg}°`,
      params: { ...input },
      summary: `Range ${fmt(result.range, 1)} m · H ${fmt(result.maxHeight, 1)} m · T ${fmt(result.timeOfFlight, 2)} s`,
    });
    Alert.alert('Saved', 'Experiment saved to your profile.');
  };

  const cur = sampleAt(result.samples, clock.t, ['x', 'y', 'vx', 'vy']);

  return (
    <Screen>
      <LabHeader tag="FLIGHT LAB" title="Projectile Motion" subtitle="Launch a projectile and see exactly how speed, angle and gravity shape its path." />

      <Card style={{ padding: 10 }}>
        <TrajectoryScene result={result} ghost={ghost} t={clock.t} pos={{ x: cur.x ?? 0, y: cur.y ?? 0 }} vel={{ x: cur.vx ?? 0, y: cur.vy ?? 0 }} angle={input.angleDeg} />
        <Row style={{ justifyContent: 'space-between', marginTop: 6 }}>
          <Text style={font.small}>t = {fmt(clock.t, 2)} s</Text>
          <Text style={font.small}>
            x = {fmt(cur.x ?? 0, 1)} m · y = {fmt(cur.y ?? 0, 1)} m
          </Text>
        </Row>
      </Card>

      <StatGrid>
        <Stat label="Max height" value={fmt(result.maxHeight, 2)} unit="m" color={colors.cyan} />
        <Stat label="Range" value={fmt(result.range, 2)} unit="m" color={colors.amber} />
        <Stat label="Flight time" value={fmt(result.timeOfFlight, 2)} unit="s" />
        <Stat label="Time to apex" value={fmt(result.timeToApex, 2)} unit="s" />
      </StatGrid>

      <Card>
        <Text style={[font.h3, { marginBottom: 12 }]}>Parameters</Text>
        <ParamSlider label="Initial velocity" symbol="v₀" value={draft.v0} min={1} max={150} step={0.5} unit="m/s" onChange={(v0) => setDraft((d) => ({ ...d, v0 }))} decimals={1} />
        <ParamSlider label="Launch angle" symbol="θ" value={draft.angleDeg} min={1} max={90} step={0.5} unit="°" onChange={(angleDeg) => setDraft((d) => ({ ...d, angleDeg }))} decimals={1} />
        <ParamSlider label="Gravity" symbol="g" value={draft.g} min={PROJECTILE_LIMITS.g.min} max={30} step={0.01} unit="m/s²" onChange={(g) => setDraft((d) => ({ ...d, g }))} decimals={3} />
        <Row style={{ flexWrap: 'wrap', marginBottom: 8 }}>
          {GRAVITY_PRESETS.map((p) => (
            <Chip key={p.label} label={`${p.label} ${p.g}`} active={Math.abs(draft.g - p.g) < 1e-6} onPress={() => setDraft((d) => ({ ...d, g: p.g }))} />
          ))}
        </Row>
        {issues.map((i) => (
          <Text key={i.field} style={{ color: colors.red, fontSize: 13 }}>
            {i.message}
          </Text>
        ))}
        {dirty && !issues.length ? <Text style={{ color: colors.amber, fontSize: 13, marginBottom: 6 }}>Parameters changed — press Run to recompute.</Text> : null}
        <ControlsRow>
          <Button title="Run" onPress={run} disabled={!!issues.length} icon={<PlayIcon />} style={{ flex: 1 }} />
          <Button
            title={clock.playing ? 'Pause' : 'Replay'}
            kind="secondary"
            onPress={clock.playing ? clock.pause : clock.play}
            icon={clock.playing ? <PauseIcon color={colors.text} /> : <PlayIcon color={colors.text} />}
            style={{ flex: 1 }}
          />
        </ControlsRow>
        <ControlsRow>
          <Button title="Reset" kind="ghost" onPress={reset} icon={<ResetIcon color={colors.cyan} />} style={{ flex: 1 }} />
          <Button title="Save" kind="ghost" onPress={save} icon={<SaveIcon />} style={{ flex: 1 }} />
        </ControlsRow>
      </Card>

      <Card>
        <LineChart
          title="Trajectory  y vs x"
          xLabel="x (m)"
          yLabel="y (m)"
          series={[
            { label: 'Current', color: colors.cyan, data: result.samples.map((s) => ({ x: s.x, y: s.y })) },
            ...(ghost ? [{ label: 'Previous run', color: colors.textDim, dashed: true, data: ghost.samples.map((s) => ({ x: s.x, y: s.y })) }] : []),
          ]}
          markers={[{ x: cur.x ?? 0, y: cur.y ?? 0 }]}
        />
      </Card>
      <Card>
        <LineChart
          title="Position vs time"
          xLabel="t (s)"
          yLabel="position (m)"
          series={[
            { label: 'x(t)', color: colors.amber, data: result.samples.map((s) => ({ x: s.t, y: s.x })) },
            { label: 'y(t)', color: colors.cyan, data: result.samples.map((s) => ({ x: s.t, y: s.y })) },
          ]}
          cursorX={clock.t}
          markers={[{ x: clock.t, y: cur.x ?? 0 }, { x: clock.t, y: cur.y ?? 0 }]}
        />
      </Card>
      <Card>
        <LineChart
          title="Velocity components vs time"
          xLabel="t (s)"
          yLabel="velocity (m/s)"
          series={[
            { label: 'vₓ (constant)', color: colors.amber, data: result.samples.map((s) => ({ x: s.t, y: s.vx })) },
            { label: 'v_y = v₀ sinθ − g t', color: colors.violet, data: result.samples.map((s) => ({ x: s.t, y: s.vy })) },
          ]}
          cursorX={clock.t}
        />
      </Card>

      <SectionTitle title="The mathematics" />
      <Equation caption="Horizontal position: no horizontal force, so constant velocity">x(t) = v₀ cos(θ) t</Equation>
      <Equation caption="Vertical position: constant downward acceleration g">y(t) = v₀ sin(θ) t − ½ g t²</Equation>
      <Equation caption="Setting y(T) = 0, dy/dt = 0 at the apex">{'T = 2v₀ sinθ / g\nH = v₀² sin²θ / 2g\nR = v₀² sin2θ / g'}</Equation>
      <Card>
        <Text style={font.small}>
          With your inputs: v₀ cosθ = {fmt(input.v0 * Math.cos(input.angleDeg * DEG), 3)} m/s, v₀ sinθ = {fmt(input.v0 * Math.sin(input.angleDeg * DEG), 3)} m/s, so T = 2 × {fmt(input.v0 * Math.sin(input.angleDeg * DEG), 3)} / {fmt(input.g, 3)} = {fmt(result.timeOfFlight, 3)} s.
        </Text>
      </Card>

      <InfoBox
        title="Model assumptions"
        items={['Constant gravitational acceleration g (flat Earth approximation).', 'No air resistance or wind.', 'Launch and landing at the same elevation.', 'The projectile is a point mass (no spin or lift).']}
      />
      <InfoBox title="About the animation" tone="warn" items={['Results are computed from the closed-form equations above. The animation simply replays those computed positions at an accelerated pace.']} />
    </Screen>
  );
}

function TrajectoryScene({
  result,
  ghost,
  pos,
  vel,
  angle,
}: {
  result: ProjectileResult;
  ghost: ProjectileResult | null;
  t: number;
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  angle: number;
}) {
  const [w, setW] = useState(0);
  const h = 210;
  const pad = 18;
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
  const maxX = Math.max(result.range, ghost?.range ?? 0, 1);
  const maxY = Math.max(result.maxHeight, ghost?.maxHeight ?? 0, 1);
  // Equal scale on both axes so the true shape of the parabola is shown.
  const scale = Math.min((w - 2 * pad) / maxX, (h - 2 * pad - 10) / maxY);
  const ox = pad;
  const oy = h - pad;
  const X = (x: number) => ox + x * scale;
  const Y = (y: number) => oy - y * scale;
  const path = (r: ProjectileResult) => r.samples.map((s, i) => `${i ? 'L' : 'M'}${X(s.x).toFixed(1)},${Y(s.y).toFixed(1)}`).join(' ');
  const drawn = result.samples.filter((s) => s.x <= pos.x + 1e-9);
  const trail = drawn.map((s, i) => `${i ? 'L' : 'M'}${X(s.x).toFixed(1)},${Y(s.y).toFixed(1)}`).join(' ') + ` L${X(pos.x)},${Y(pos.y)}`;
  const speed = Math.hypot(vel.x, vel.y) || 1;
  const vlen = 28;
  return (
    <View onLayout={onLayout}>
      {w > 0 ? (
        <Svg width={w} height={h}>
          <Rect x={0} y={0} width={w} height={h} rx={12} fill={colors.bgElevated} />
          {[0.25, 0.5, 0.75].map((f) => (
            <Line key={f} x1={0} x2={w} y1={pad + (h - 2 * pad) * f} y2={pad + (h - 2 * pad) * f} stroke={colors.grid} />
          ))}
          <Line x1={0} y1={oy} x2={w} y2={oy} stroke={colors.textDim} strokeWidth={1.5} />
          {ghost ? <Path d={path(ghost)} stroke={colors.textDim} strokeDasharray="4,4" strokeWidth={1.5} fill="none" /> : null}
          <Path d={path(result)} stroke={colors.cyan + '33'} strokeWidth={1.5} fill="none" />
          <Path d={trail} stroke={colors.cyan} strokeWidth={2.5} fill="none" />
          <Line x1={X(0)} y1={Y(0)} x2={X(0) + 22 * Math.cos(angle * DEG)} y2={Y(0) - 22 * Math.sin(angle * DEG)} stroke={colors.text} strokeWidth={4} strokeLinecap="round" />
          <Line x1={X(result.range / 2)} y1={Y(0)} x2={X(result.range / 2)} y2={Y(result.maxHeight)} stroke={colors.textDim} strokeDasharray="2,4" />
          <SvgText x={X(result.range / 2) + 4} y={Y(result.maxHeight) + 12} fill={colors.textMuted} fontSize={10}>
            {`H = ${fmt(result.maxHeight, 1)} m`}
          </SvgText>
          <SvgText x={Math.min(X(result.range), w - 60)} y={oy - 6} fill={colors.amber} fontSize={10}>
            {`R = ${fmt(result.range, 1)} m`}
          </SvgText>
          <Line x1={X(pos.x)} y1={Y(pos.y)} x2={X(pos.x) + (vel.x / speed) * vlen} y2={Y(pos.y) - (vel.y / speed) * vlen} stroke={colors.green} strokeWidth={2} />
          <Circle cx={X(pos.x)} cy={Y(pos.y)} r={6} fill={colors.text} stroke={colors.cyan} strokeWidth={2} />
        </Svg>
      ) : (
        <View style={{ height: h }} />
      )}
      <Text style={[font.small, { color: colors.textDim, marginTop: 4 }]}>Equal x/y scale · green arrow = velocity direction · dashed = previous run</Text>
    </View>
  );
}
