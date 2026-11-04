import React, { useEffect, useMemo, useState } from 'react';
import { Alert, LayoutChangeEvent, Switch, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Equation, InfoBox, Row, Screen, SectionTitle, Stat, StatGrid, ProgressBar } from '../components/ui';
import { ParamSlider } from '../components/ParamSlider';
import { LineChart } from '../components/LineChart';
import { LabHeader, ControlsRow } from '../components/LabHeader';
import { PauseIcon, PlayIcon, ResetIcon, SaveIcon } from '../components/Icons';
import { colors, font } from '../theme';
import { G0, RocketInput, RocketResult, RocketSample, simulateRocket, validateRocket } from '../physics';
import { fmt, fmtSI } from '../utils/format';
import { sampleAt, useAnimationClock } from '../utils/useAnimationClock';
import { useProgress } from '../store/progress';
import type { RootStackParamList } from '../navigation/types';

const DEFAULTS: RocketInput = {
  initialMass: 1000,
  fuelMass: 600,
  thrust: 30000,
  burnTime: 60,
  dragCoefficient: 0.5,
  diameter: 0.5,
  dragEnabled: true,
  variableGravity: true,
};

type Props = NativeStackScreenProps<RootStackParamList, 'RocketLab'>;

export default function RocketLabScreen({ route }: Props) {
  const preset = route.params?.preset as Partial<RocketInput> | undefined;
  const start = { ...DEFAULTS, ...(preset ?? {}) };
  const [draft, setDraft] = useState<RocketInput>(start);
  const [input, setInput] = useState<RocketInput>(start);
  const { recordSimRun, saveExperiment } = useProgress();
  const issues = validateRocket(draft);

  const { result, error } = useMemo<{ result: RocketResult | null; error: string | null }>(() => {
    try {
      return { result: simulateRocket(input), error: null };
    } catch (e) {
      return { result: null, error: e instanceof Error ? e.message : 'Simulation failed.' };
    }
  }, [input]);

  const duration = result?.flightTime ?? 1;
  const clock = useAnimationClock(duration, Math.min(8, Math.max(3, duration / 40)));
  useEffect(() => {
    clock.restart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(input);
  const run = () => {
    if (issues.length) return;
    setInput({ ...draft });
    try {
      const r = simulateRocket(draft);
      recordSimRun('rocket', `F ${fmtSI(draft.thrust, 'N')}, m₀ ${draft.initialMass} kg → apogee ${fmtSI(r.maxAltitude, 'm')}`);
    } catch {
      /* surfaced through `error` */
    }
  };
  const reset = () => {
    setDraft(DEFAULTS);
    setInput(DEFAULTS);
    clock.reset();
  };
  const save = () => {
    if (!result) return;
    saveExperiment({
      lab: 'rocket',
      title: `Rocket ${fmtSI(input.thrust, 'N')} / ${input.initialMass} kg`,
      params: { ...input },
      summary: `Apogee ${fmtSI(result.maxAltitude, 'm')} · v_max ${fmt(result.maxVelocity, 0)} m/s · Δv_ideal ${fmt(result.idealDeltaV, 0)} m/s`,
    });
    Alert.alert('Saved', 'Experiment saved to your profile.');
  };

  const cur = result ? (sampleAt<RocketSample>(result.samples, clock.t, ['altitude', 'velocity', 'acceleration', 'mass', 'fuelRemaining', 'thrust', 'drag']) as Record<keyof RocketSample, number>) : null;
  const set = <K extends keyof RocketInput>(k: K) => (v: RocketInput[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const twr = draft.thrust / (draft.initialMass * G0);

  return (
    <Screen>
      <LabHeader tag="ROCKET LAB" color={colors.amber} title="Variable-Mass Rocket" subtitle="A single-stage rocket flying straight up. Mass falls as fuel burns; thrust, gravity and drag fight it out." />

      {result && cur ? (
        <Card style={{ padding: 10 }}>
          <Row style={{ alignItems: 'stretch' }}>
            <RocketScene result={result} altitude={cur.altitude} thrusting={cur.thrust > 0} />
            <View style={{ flex: 1, gap: 8 }}>
              <Stat label="Altitude" value={fmtSI(cur.altitude, 'm')} color={colors.cyan} wide />
              <Stat label="Velocity" value={fmt(cur.velocity, 1)} unit="m/s" wide />
              <Stat label="Acceleration" value={fmt(cur.acceleration, 2)} unit="m/s²" color={colors.amber} wide />
              <View>
                <Text style={font.label}>Fuel remaining</Text>
                <Text style={{ color: colors.text, fontWeight: '700', marginVertical: 4 }}>
                  {fmt(cur.fuelRemaining, 1)} kg ({fmt(input.fuelMass ? (100 * cur.fuelRemaining) / input.fuelMass : 0, 0)} %)
                </Text>
                <ProgressBar value={input.fuelMass ? cur.fuelRemaining / input.fuelMass : 0} color={colors.amber} />
              </View>
              <Text style={font.small}>t = {fmt(clock.t, 1)} s · m = {fmt(cur.mass, 1)} kg</Text>
            </View>
          </Row>
          <ControlsRow>
            <Button title="Launch" onPress={run} disabled={!!issues.length} icon={<PlayIcon />} style={{ flex: 1 }} />
            <Button title={clock.playing ? 'Pause' : 'Replay'} kind="secondary" onPress={clock.playing ? clock.pause : clock.play} icon={clock.playing ? <PauseIcon color={colors.text} /> : <PlayIcon color={colors.text} />} style={{ flex: 1 }} />
          </ControlsRow>
          {!result.liftedOff ? <Text style={{ color: colors.red }}>The rocket never lifts off: thrust never exceeds weight, even at dry mass.</Text> : null}
        </Card>
      ) : (
        <InfoBox title="Simulation error" tone="warn" items={[error ?? 'Unknown error']} />
      )}

      {result ? (
        <StatGrid>
          <Stat label="Apogee" value={fmtSI(result.maxAltitude, 'm')} color={colors.cyan} />
          <Stat label="Time to apogee" value={fmt(result.timeAtApogee, 1)} unit="s" />
          <Stat label="Max velocity" value={fmt(result.maxVelocity, 0)} unit="m/s" />
          <Stat label="Burnout altitude" value={fmtSI(result.burnoutAltitude, 'm')} />
          <Stat label="Lift-off T/W" value={fmt(result.thrustToWeight, 2)} color={result.thrustToWeight > 1 ? colors.green : colors.red} />
          <Stat label="Specific impulse" value={fmt(result.specificImpulse, 0)} unit="s" />
          <Stat label="Ideal Δv (Tsiolkovsky)" value={fmt(result.idealDeltaV, 0)} unit="m/s" color={colors.amber} />
          <Stat label="Burnout velocity" value={fmt(result.burnoutVelocity, 0)} unit="m/s" />
        </StatGrid>
      ) : null}
      {result ? (
        <Text style={[font.small, { marginBottom: 12 }]}>
          Δv lost to gravity and drag during the burn: {fmt(result.idealDeltaV - result.burnoutVelocity, 0)} m/s ({fmt((100 * (result.idealDeltaV - result.burnoutVelocity)) / Math.max(1, result.idealDeltaV), 0)} % of the ideal).
        </Text>
      ) : null}

      <Card>
        <Text style={[font.h3, { marginBottom: 12 }]}>Rocket design</Text>
        <ParamSlider label="Initial mass (incl. fuel)" symbol="m₀" value={draft.initialMass} min={10} max={20000} step={10} unit="kg" decimals={0} onChange={set('initialMass')} />
        <ParamSlider label="Fuel mass" symbol="m_fuel" value={draft.fuelMass} min={0} max={19000} step={10} unit="kg" decimals={0} onChange={set('fuelMass')} />
        <ParamSlider label="Engine thrust" symbol="F" value={draft.thrust} min={0} max={500000} step={500} unit="N" decimals={0} onChange={set('thrust')} />
        <ParamSlider label="Burn duration" symbol="t_b" value={draft.burnTime} min={1} max={300} step={1} unit="s" decimals={0} onChange={set('burnTime')} />
        <ParamSlider label="Drag coefficient" symbol="C_d" value={draft.dragCoefficient} min={0} max={1.5} step={0.01} decimals={2} onChange={set('dragCoefficient')} disabled={!draft.dragEnabled} />
        <ParamSlider label="Body diameter" symbol="d" value={draft.diameter} min={0.05} max={5} step={0.01} unit="m" decimals={2} onChange={set('diameter')} disabled={!draft.dragEnabled} />
        <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: colors.text }}>Aerodynamic drag</Text>
          <Switch value={draft.dragEnabled} onValueChange={set('dragEnabled')} trackColor={{ true: colors.cyan, false: colors.border }} />
        </Row>
        <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: colors.text }}>Inverse-square gravity</Text>
          <Switch value={draft.variableGravity ?? true} onValueChange={set('variableGravity')} trackColor={{ true: colors.cyan, false: colors.border }} />
        </Row>
        <Text style={font.small}>
          Dry mass {fmt(draft.initialMass - draft.fuelMass, 0)} kg · burn rate ṁ = {fmt(draft.fuelMass / Math.max(draft.burnTime, 1e-9), 2)} kg/s · lift-off T/W = {fmt(twr, 2)}
        </Text>
        {issues.map((i) => (
          <Text key={i.field} style={{ color: colors.red, marginTop: 4 }}>
            {i.message}
          </Text>
        ))}
        {dirty && !issues.length ? <Text style={{ color: colors.amber, marginTop: 6 }}>Design changed — press Launch to simulate.</Text> : null}
        <ControlsRow>
          <Button title="Launch" onPress={run} disabled={!!issues.length} icon={<PlayIcon />} style={{ flex: 1 }} />
          <Button title="Reset" kind="ghost" onPress={reset} icon={<ResetIcon color={colors.cyan} />} style={{ flex: 1 }} />
          <Button title="Save" kind="ghost" onPress={save} disabled={!result} icon={<SaveIcon />} style={{ flex: 1 }} />
        </ControlsRow>
      </Card>

      {result ? (
        <>
          <Card>
            <LineChart title="Altitude vs time" xLabel="t (s)" yLabel="h (m)" series={[{ label: 'h', color: colors.cyan, data: result.samples.map((s) => ({ x: s.t, y: s.altitude })) }]} cursorX={clock.t} markers={[{ x: clock.t, y: cur?.altitude ?? 0 }]} />
          </Card>
          <Card>
            <LineChart title="Velocity vs time" xLabel="t (s)" yLabel="v (m/s)" series={[{ label: 'v', color: colors.amber, data: result.samples.map((s) => ({ x: s.t, y: s.velocity })) }]} cursorX={clock.t} markers={[{ x: clock.t, y: cur?.velocity ?? 0 }]} />
          </Card>
          <Card>
            <LineChart
              title="Acceleration vs time"
              xLabel="t (s)"
              yLabel="a (m/s²)"
              series={[{ label: 'a', color: colors.violet, data: result.samples.map((s) => ({ x: s.t, y: s.acceleration })) }]}
              cursorX={clock.t}
              refY={{ y: -G0, label: '−g₀ (free fall)' }}
            />
            <Text style={font.small}>Acceleration climbs during the burn as mass falls, then drops to about −g at burnout (minus drag).</Text>
          </Card>
        </>
      ) : null}

      <SectionTitle title="The physics" />
      <Equation caption="Newton’s 2nd law for the rocket (positive up)">m(t) dv/dt = F − m(t) g(h) − D</Equation>
      <Equation caption="Mass falls linearly at the burn rate ṁ = m_fuel / t_b">m(t) = m₀ − ṁ t   (t ≤ t_b)</Equation>
      <Equation caption="Quadratic drag with an exponential atmosphere">{'D = ½ ρ(h) v|v| C_d A\nρ(h) = 1.225 e^(−h / 8500 m)'}</Equation>
      <Equation caption="Inverse-square gravity">g(h) = g₀ (R⊕ / (R⊕ + h))²</Equation>
      <Equation caption="Ideal rocket equation, v_e = F / ṁ">Δv = v_e ln(m₀ / m_f)</Equation>
      <Card>
        <Text style={[font.h3, { marginBottom: 6 }]}>Concepts</Text>
        <Text style={font.small}>• Newton’s 3rd law: the engine pushes exhaust down; the exhaust pushes the rocket up with force F = ṁ v_e.{'\n'}• Gravity pulls with m g, which shrinks as the rocket burns fuel and climbs.{'\n'}• Drag opposes motion and grows with v², but the air thins rapidly with height.{'\n'}• Because m(t) decreases, the same thrust produces ever-larger acceleration — the reason staging is so effective.</Text>
      </Card>
      <InfoBox
        title="Model assumptions — not a launch prediction"
        tone="warn"
        items={[
          'Purely vertical 1-D flight; no gravity turn, guidance or wind.',
          'Constant thrust and constant burn rate; thrust does not vary with altitude.',
          'Single stage; constant drag coefficient (no Mach effects).',
          'Exponential atmosphere approximation; no heating or structural limits.',
          'Integrated with RK4 (Δt ≤ 0.05 s), burnout instant resolved exactly. The animation replays these computed samples.',
        ]}
      />
    </Screen>
  );
}

function RocketScene({ result, altitude, thrusting }: { result: RocketResult; altitude: number; thrusting: boolean }) {
  const [h, setH] = useState(260);
  const w = 110;
  const onLayout = (e: LayoutChangeEvent) => setH(Math.max(260, e.nativeEvent.layout.height));
  const maxH = Math.max(result.maxAltitude * 1.1, 10);
  const top = 16;
  const ground = h - 22;
  const y = ground - (Math.max(0, altitude) / maxH) * (ground - top - 30);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxH);
  return (
    <View onLayout={onLayout} style={{ width: w, marginRight: 12 }}>
      <Svg width={w} height={h}>
        <Rect x={0} y={0} width={w} height={h} rx={12} fill="#030713" />
        {ticks.map((t) => {
          const ty = ground - (t / maxH) * (ground - top - 30);
          return (
            <G key={t}>
              <Line x1={0} x2={w} y1={ty} y2={ty} stroke={colors.grid} />
              <SvgText x={4} y={ty - 3} fontSize={9} fill={colors.textDim}>
                {fmtSI(t, 'm', 2)}
              </SvgText>
            </G>
          );
        })}
        <Rect x={0} y={ground} width={w} height={22} fill="#0B2A1F" />
        <G x={w / 2 + 14} y={y}>
          {thrusting ? (
            <>
              <Path d="M-6 0 Q 0 30 6 0 Z" fill={colors.amber} />
              <Path d="M-3 0 Q 0 16 3 0 Z" fill="#FDE68A" />
            </>
          ) : null}
          <Path d="M0 -34 C 7 -26 8 -12 7 0 L -7 0 C -8 -12 -7 -26 0 -34 Z" fill={colors.text} />
          <Circle cx={0} cy={-20} r={2.5} fill={colors.blue} />
          <Path d="M-7 -8 L -12 2 L -7 0 Z M7 -8 L 12 2 L 7 0 Z" fill={colors.cyan} />
        </G>
      </Svg>
    </View>
  );
}
