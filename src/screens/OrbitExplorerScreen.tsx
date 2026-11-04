import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, LayoutChangeEvent, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Chip, Equation, InfoBox, Row, Screen, SectionTitle, Stat, StatGrid, Badge } from '../components/ui';
import { ParamSlider } from '../components/ParamSlider';
import { LineChart } from '../components/LineChart';
import { LabHeader, ControlsRow } from '../components/LabHeader';
import { PauseIcon, PlayIcon, ResetIcon, SaveIcon } from '../components/Icons';
import { colors, font } from '../theme';
import {
  R_EARTH,
  OrbitState,
  Vec2,
  chooseTimeStep,
  circularSpeed,
  conicPoints,
  escapeSpeed,
  initialState,
  norm,
  orbitalElements,
  propagate,
  specificEnergy,
  validateOrbit,
} from '../physics';
import { fmt, fmtDuration } from '../utils/format';
import { useProgress } from '../store/progress';
import type { RootStackParamList } from '../navigation/types';

interface Params {
  altitudeKm: number;
  speedKms: number;
  fpaDeg: number;
}

const DEFAULTS: Params = { altitudeKm: 400, speedKms: 7.67, fpaDeg: 0 };
const WARPS = [60, 300, 1000, 3000];
const CLASS_COLOR: Record<string, string> = {
  circular: colors.green,
  elliptical: colors.cyan,
  parabolic: colors.amber,
  hyperbolic: colors.amber,
  suborbital: colors.red,
};
const CLASS_LABEL: Record<string, string> = {
  circular: 'Circular orbit',
  elliptical: 'Elliptical orbit',
  parabolic: 'Parabolic escape',
  hyperbolic: 'Hyperbolic escape',
  suborbital: 'Sub-orbital (impacts Earth)',
};

type Props = NativeStackScreenProps<RootStackParamList, 'OrbitExplorer'>;

const toInput = (p: Params) => ({ altitude: p.altitudeKm * 1000, speed: p.speedKms * 1000, flightPathAngleDeg: p.fpaDeg });

export default function OrbitExplorerScreen({ route }: Props) {
  const preset = route.params?.preset as Partial<Params> | undefined;
  const [params, setParams] = useState<Params>({ ...DEFAULTS, ...(preset ?? {}) });
  const [warp, setWarp] = useState(300);
  const [running, setRunning] = useState(false);
  const [stopReason, setStopReason] = useState<'none' | 'impact' | 'escaped'>('none');
  const [, force] = useState(0);
  const { recordSimRun, saveExperiment } = useProgress();

  const issues = validateOrbit(toInput(params));
  const s0 = useMemo<OrbitState | null>(() => (issues.length ? null : initialState(toInput(params))), [params, issues.length]);
  const el0 = useMemo(() => (s0 ? orbitalElements(s0) : null), [s0]);

  const viewR = useMemo(() => {
    if (!el0) return 4 * R_EARTH;
    const base = Number.isFinite(el0.apoapsis) ? el0.apoapsis * 1.15 : 8 * R_EARTH;
    return Math.min(Math.max(base, (R_EARTH + params.altitudeKm * 1000) * 1.25, 1.6 * R_EARTH), 70 * R_EARTH);
  }, [el0, params.altitudeKm]);

  const state = useRef<OrbitState | null>(s0);
  const trail = useRef<Vec2[]>([]);
  const history = useRef<{ t: number; r: number; v: number }[]>([]);
  const raf = useRef<number | null>(null);
  const frame = useRef(0);
  const [chartVersion, setChartVersion] = useState(0);
  const last = useRef<number | null>(null);
  const dt = useMemo(() => (s0 ? chooseTimeStep(s0) : 1), [s0]);
  const predicted = useMemo(() => (s0 ? conicPoints(s0, viewR * 1.5) : []), [s0, viewR]);

  const resetSim = useCallback(() => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
    last.current = null;
    setRunning(false);
    setStopReason('none');
    state.current = s0;
    trail.current = s0 ? [s0.r] : [];
    history.current = s0 ? [{ t: 0, r: norm(s0.r), v: norm(s0.v) }] : [];
    force((n) => n + 1);
    setChartVersion((v) => v + 1);
  }, [s0]);

  // Any parameter change resets the simulation to the new initial state.
  useEffect(() => {
    resetSim();
  }, [resetSim]);

  useEffect(() => {
    if (!running) return;
    const tick = (now: number) => {
      if (last.current === null) last.current = now;
      const realDt = Math.min(0.05, (now - last.current) / 1000);
      last.current = now;
      const cur = state.current;
      if (!cur) return;
      try {
        const res = propagate(cur, realDt * warp, { dt, maxRadius: viewR * 1.6 });
        state.current = res.state;
        trail.current.push(...res.path);
        if (trail.current.length > 4000) trail.current.splice(0, trail.current.length - 4000);
        const h = history.current;
        if (!h.length || res.state.t - h[h.length - 1].t > Math.max(dt * 4, warp / 30)) {
          h.push({ t: res.state.t, r: norm(res.state.r), v: norm(res.state.v) });
          if (h.length > 1500) h.splice(0, h.length - 1500);
        }
        if (res.stop !== 'none') {
          setStopReason(res.stop);
          setRunning(false);
          force((n) => n + 1);
          setChartVersion((v) => v + 1);
          return;
        }
      } catch {
        setRunning(false);
        Alert.alert('Simulation stopped', 'The integrator became numerically unstable. Try different parameters.');
        return;
      }
      frame.current++;
      // Re-render the live view at ~30 fps and the charts at ~2 fps to keep the UI smooth.
      if (frame.current % 2 === 0) force((n) => n + 1);
      if (frame.current % 30 === 0) setChartVersion((v) => v + 1);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      raf.current = null;
      last.current = null;
    };
  }, [running, warp, dt, viewR]);

  const start = () => {
    if (!s0) return;
    if (stopReason !== 'none') resetSim();
    if (state.current && state.current.t === 0 && el0) {
      recordSimRun('orbit', `${CLASS_LABEL[el0.classification]} · h ${params.altitudeKm} km, v ${params.speedKms} km/s`);
    }
    setRunning(true);
  };

  const cur = state.current;
  const elNow = cur ? orbitalElements(cur) : null;
  const energyDrift = cur && el0 ? Math.abs((specificEnergy(cur) - el0.energy) / el0.energy) : 0;
  const r0 = R_EARTH + params.altitudeKm * 1000;

  const save = () => {
    if (!el0) return;
    saveExperiment({
      lab: 'orbit',
      title: `${CLASS_LABEL[el0.classification]} from ${params.altitudeKm} km`,
      params: { ...params },
      summary: `v₀ ${params.speedKms} km/s · e ${fmt(el0.eccentricity, 3)} · ${el0.period ? 'T ' + fmtDuration(el0.period) : 'unbound'}`,
    });
    Alert.alert('Saved', 'Experiment saved to your profile.');
  };

  const presets: { label: string; p: Params }[] = [
    { label: 'Circular LEO', p: { altitudeKm: 400, speedKms: Number((circularSpeed(R_EARTH + 400e3) / 1000).toFixed(3)), fpaDeg: 0 } },
    { label: 'Elliptical', p: { altitudeKm: 400, speedKms: 9.2, fpaDeg: 0 } },
    { label: 'GEO', p: { altitudeKm: 35786, speedKms: Number((circularSpeed(R_EARTH + 35786e3) / 1000).toFixed(3)), fpaDeg: 0 } },
    { label: 'Escape', p: { altitudeKm: 400, speedKms: Number(((escapeSpeed(R_EARTH + 400e3) * 1.02) / 1000).toFixed(2)), fpaDeg: 0 } },
    { label: 'Sub-orbital', p: { altitudeKm: 400, speedKms: 6.0, fpaDeg: 0 } },
  ];

  return (
    <Screen>
      <LabHeader tag="ORBIT EXPLORER" color={colors.violet} title="Two-Body Orbits" subtitle="Give a satellite a speed and watch Newtonian gravity bend its path — integrated step by step." />

      <Card style={{ padding: 10 }}>
        <OrbitView state={cur} trail={trail.current} viewR={viewR} predicted={predicted} />
        <Row style={{ justifyContent: 'space-between', marginTop: 8, flexWrap: 'wrap' }}>
          {el0 ? <Badge text={CLASS_LABEL[el0.classification]} color={CLASS_COLOR[el0.classification]} /> : null}
          <Text style={font.small}>t = {fmtDuration(cur?.t ?? 0)}</Text>
        </Row>
        {stopReason === 'impact' ? <Text style={{ color: colors.red, marginTop: 6 }}>Impact: the trajectory intersected Earth’s surface.</Text> : null}
        {stopReason === 'escaped' ? <Text style={{ color: colors.amber, marginTop: 6 }}>The satellite left the view on an escape trajectory.</Text> : null}
        <ControlsRow>
          <Button title={running ? 'Pause' : 'Start'} onPress={running ? () => setRunning(false) : start} disabled={!s0} icon={running ? <PauseIcon /> : <PlayIcon />} style={{ flex: 1 }} />
          <Button title="Reset" kind="secondary" onPress={resetSim} icon={<ResetIcon />} style={{ flex: 1 }} />
          <Button title="Save" kind="ghost" onPress={save} disabled={!el0} icon={<SaveIcon />} style={{ flex: 0.8 }} />
        </ControlsRow>
        <Text style={[font.label, { marginBottom: 6 }]}>Time warp</Text>
        <Row style={{ flexWrap: 'wrap' }}>
          {WARPS.map((w) => (
            <Chip key={w} label={`${w}×`} active={warp === w} onPress={() => setWarp(w)} color={colors.violet} />
          ))}
        </Row>
      </Card>

      <StatGrid>
        <Stat label="Speed |v|" value={fmt((cur ? norm(cur.v) : 0) / 1000, 3)} unit="km/s" color={colors.cyan} />
        <Stat label="Distance |r|" value={fmt((cur ? norm(cur.r) : 0) / 1000, 0)} unit="km" />
        <Stat label="Altitude" value={fmt((cur ? norm(cur.r) - R_EARTH : 0) / 1000, 0)} unit="km" />
        <Stat label="Period T" value={elNow?.period ? fmtDuration(elNow.period) : 'unbound'} color={colors.violet} />
        <Stat label="Specific energy ε" value={fmt((elNow?.energy ?? 0) / 1e6, 3)} unit="MJ/kg" color={colors.amber} />
        <Stat label="Eccentricity e" value={fmt(elNow?.eccentricity ?? 0, 4)} />
        <Stat label="Periapsis alt." value={fmt(((elNow?.periapsis ?? 0) - R_EARTH) / 1000, 0)} unit="km" />
        <Stat label="Apoapsis alt." value={elNow && Number.isFinite(elNow.apoapsis) ? fmt((elNow.apoapsis - R_EARTH) / 1000, 0) : '∞'} unit="km" />
      </StatGrid>
      <Text style={[font.small, { marginBottom: 12, color: colors.textDim }]}>
        Numerical energy drift since start: {energyDrift < 1e-9 ? '< 1e-9' : energyDrift.toExponential(2)} (velocity Verlet, Δt = {fmt(dt, 2)} s). A symplectic integrator keeps this tiny and bounded.
      </Text>

      <Card>
        <Text style={[font.h3, { marginBottom: 12 }]}>Initial conditions</Text>
        <ParamSlider label="Initial altitude" symbol="h" value={params.altitudeKm} min={160} max={40000} step={10} unit="km" decimals={0} onChange={(altitudeKm) => setParams((p) => ({ ...p, altitudeKm }))} disabled={running} />
        <ParamSlider label="Initial speed" symbol="v₀" value={params.speedKms} min={1} max={15} step={0.01} unit="km/s" decimals={3} onChange={(speedKms) => setParams((p) => ({ ...p, speedKms }))} disabled={running} />
        <ParamSlider label="Flight-path angle" symbol="γ" value={params.fpaDeg} min={-30} max={30} step={0.5} unit="°" decimals={1} onChange={(fpaDeg) => setParams((p) => ({ ...p, fpaDeg }))} disabled={running} />
        <Text style={[font.small, { marginBottom: 8 }]}>
          At this altitude: circular speed {fmt(circularSpeed(r0) / 1000, 3)} km/s · escape speed {fmt(escapeSpeed(r0) / 1000, 3)} km/s
        </Text>
        {issues.map((i) => (
          <Text key={i.field} style={{ color: colors.red }}>
            {i.message}
          </Text>
        ))}
        <Text style={[font.label, { marginTop: 6, marginBottom: 6 }]}>Presets</Text>
        <Row style={{ flexWrap: 'wrap' }}>
          {presets.map((p) => (
            <Chip key={p.label} label={p.label} onPress={() => !running && setParams(p.p)} color={colors.violet} />
          ))}
        </Row>
      </Card>

      <OrbitCharts history={history.current} version={chartVersion} />

      <SectionTitle title="The mathematics" />
      <Equation caption="Newtonian gravity — the only force in this model">a = −μ r / |r|³,   μ = GM⊕ = 3.986×10¹⁴ m³/s²</Equation>
      <Equation caption="Velocity Verlet: second-order, symplectic, time-reversible">{'v½ = vₙ + ½ a(rₙ) Δt\nrₙ₊₁ = rₙ + v½ Δt\nvₙ₊₁ = v½ + ½ a(rₙ₊₁) Δt'}</Equation>
      <Equation caption="Conserved quantities used for the analytic readouts">{'ε = v²/2 − μ/r      h = |r × v|\ne = √(1 + 2εh²/μ²)  T = 2π√(a³/μ)'}</Equation>

      <InfoBox
        title="Idealised model — not real satellite operations"
        tone="warn"
        items={[
          'Earth is a perfect sphere with all its mass at the centre; the satellite’s mass is negligible.',
          'No atmospheric drag, no J2 oblateness, no Moon/Sun perturbations, no solar pressure.',
          'Motion is confined to one plane; Earth’s rotation is ignored.',
          'Real missions use high-fidelity force models, orbit determination from tracking, and planned station-keeping manoeuvres.',
        ]}
      />
      <InfoBox title="What you see" items={['Solid line: numerically integrated path. Faint dashed line: analytic conic predicted from the initial state. They should coincide.']} />
    </Screen>
  );
}

const OrbitCharts = React.memo(
  function OrbitCharts({ history }: { history: { t: number; r: number; v: number }[]; version: number }) {
    const rData = history.map((h) => ({ x: h.t / 60, y: h.r / 1000 }));
    const vData = history.map((h) => ({ x: h.t / 60, y: h.v / 1000 }));
    return (
      <Card>
        <LineChart title="Distance from Earth's centre vs time" xLabel="t (min)" yLabel="r (km)" includeZero={false} series={[{ label: 'r', color: colors.violet, data: rData }]} />
        <LineChart title="Orbital speed vs time" xLabel="t (min)" yLabel="v (km/s)" includeZero={false} series={[{ label: 'v', color: colors.cyan, data: vData }]} />
        <Text style={font.small}>Notice speed is highest where r is smallest — conservation of angular momentum (Kepler’s second law).</Text>
      </Card>
    );
  },
  (a, b) => a.version === b.version,
);

function OrbitView({ state, trail, viewR, predicted }: { state: OrbitState | null; trail: Vec2[]; viewR: number; predicted: Vec2[][] }) {
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
  const size = w;
  const c = size / 2;
  const k = (size / 2 - 8) / viewR;
  const X = (p: Vec2) => c + p.x * k;
  const Y = (p: Vec2) => c - p.y * k;
  const toPath = (pts: Vec2[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${X(p).toFixed(1)},${Y(p).toFixed(1)}`).join(' ');
  const earthR = Math.max(3, R_EARTH * k);
  const v = state ? state.v : { x: 0, y: 0 };
  const vn = norm(v) || 1;
  return (
    <View onLayout={onLayout}>
      {size > 0 ? (
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="earthG" cx="40%" cy="35%" r="70%">
              <Stop offset="0" stopColor="#60A5FA" />
              <Stop offset="0.6" stopColor="#1D4ED8" />
              <Stop offset="1" stopColor="#0B1E5B" />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={size} height={size} rx={14} fill="#030713" />
          {[...Array(26)].map((_, i) => (
            <Circle key={i} cx={(i * 97) % size} cy={(i * 53 + 17) % size} r={i % 3 === 0 ? 1.1 : 0.6} fill="#ffffff" opacity={0.35} />
          ))}
          <Line x1={c} y1={8} x2={c} y2={size - 8} stroke={colors.grid} />
          <Line x1={8} y1={c} x2={size - 8} y2={c} stroke={colors.grid} />
          {predicted.map((seg, i) => (
            <Path key={i} d={toPath(seg)} stroke={colors.textMuted} strokeOpacity={0.45} strokeWidth={1} strokeDasharray="4,5" fill="none" />
          ))}
          <Circle cx={c} cy={c} r={earthR * 1.04} fill="#22D3EE" opacity={0.12} />
          <Circle cx={c} cy={c} r={earthR} fill="url(#earthG)" />
          {trail.length > 1 ? <Path d={toPath(trail)} stroke={colors.cyan} strokeWidth={1.8} fill="none" /> : null}
          {state ? (
            <G>
              <Line x1={X(state.r)} y1={Y(state.r)} x2={X(state.r) + (v.x / vn) * 26} y2={Y(state.r) - (v.y / vn) * 26} stroke={colors.green} strokeWidth={2} />
              <Line x1={X(state.r)} y1={Y(state.r)} x2={X(state.r) - (state.r.x / norm(state.r)) * 18} y2={Y(state.r) + (state.r.y / norm(state.r)) * 18} stroke={colors.amber} strokeWidth={2} />
              <Circle cx={X(state.r)} cy={Y(state.r)} r={5} fill={colors.text} stroke={colors.cyan} strokeWidth={2} />
            </G>
          ) : null}
        </Svg>
      ) : (
        <View style={{ height: 300 }} />
      )}
      <Text style={[font.small, { color: colors.textDim, marginTop: 6 }]}>
        Green = velocity · amber = gravitational acceleration (towards centre) · view radius {fmt(viewR / 1000, 0)} km · Earth to scale
      </Text>
    </View>
  );
}

