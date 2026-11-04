import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, LayoutChangeEvent, Text, View } from 'react-native';
import Svg, { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Badge, Button, Card, Equation, InfoBox, Row, Screen, SectionTitle, Stat, StatGrid } from '../components/ui';
import { ParamSlider } from '../components/ParamSlider';
import { LineChart } from '../components/LineChart';
import { LabHeader, ControlsRow } from '../components/LabHeader';
import { ResetIcon, SaveIcon } from '../components/Icons';
import { colors, font } from '../theme';
import { WingInput, WingResult, analyseWing, clSweep, liftSweep, validateWing } from '../physics';
import { fmt, fmtSI } from '../utils/format';
import { useProgress } from '../store/progress';
import type { RootStackParamList } from '../navigation/types';

const DEFAULTS: WingInput = { airspeed: 55, wingArea: 16.2, angleOfAttackDeg: 4, altitude: 0, mass: 1100, aspectRatio: 7.4 };

type Props = NativeStackScreenProps<RootStackParamList, 'AeroLab'>;

export default function AeroLabScreen({ route }: Props) {
  const preset = route.params?.preset as Partial<WingInput> | undefined;
  const [p, setP] = useState<WingInput>({ ...DEFAULTS, ...(preset ?? {}) });
  const issues = validateWing(p);
  const { recordSimRun, saveExperiment } = useProgress();
  const lastRecorded = useRef<{ key: string; at: number }>({ key: '', at: 0 });

  const r: WingResult | null = useMemo(() => (issues.length ? null : analyseWing(p)), [p, issues.length]);
  const sweepV = useMemo(() => (r ? liftSweep(p, Math.max(120, p.airspeed * 1.5)) : []), [p, r]);
  const sweepA = useMemo(() => clSweep(p.aspectRatio), [p.aspectRatio]);

  // Count an experiment once the user settles on a configuration for 2 s.
  useEffect(() => {
    if (!r) return;
    const key = JSON.stringify(p);
    const id = setTimeout(() => {
      const now = Date.now();
      if (key !== lastRecorded.current.key && now - lastRecorded.current.at > 20000) {
        lastRecorded.current = { key, at: now };
        recordSimRun('aero', `v ${p.airspeed} m/s, α ${p.angleOfAttackDeg}° → L ${fmtSI(r.lift, 'N')} (L/W ${fmt(r.lift / r.weight, 2)})`);
      }
    }, 2000);
    return () => clearTimeout(id);
  }, [p, r, recordSimRun]);

  const set = <K extends keyof WingInput>(k: K) => (v: WingInput[K]) => setP((d) => ({ ...d, [k]: v }));

  const save = () => {
    if (!r) return;
    saveExperiment({
      lab: 'aero',
      title: `Wing ${p.wingArea} m² @ ${p.airspeed} m/s, α ${p.angleOfAttackDeg}°`,
      params: { ...p },
      summary: `L ${fmtSI(r.lift, 'N')} · D ${fmtSI(r.drag, 'N')} · L/D ${fmt(r.liftToDrag, 1)} · V_stall ${fmt(r.stallSpeed, 1)} m/s`,
    });
    Alert.alert('Saved', 'Experiment saved to your profile.');
  };

  const state = !r ? '' : r.stalled ? 'STALLED' : r.netVertical > r.weight * 0.02 ? 'LIFT > WEIGHT · would climb' : r.netVertical < -r.weight * 0.02 ? 'LIFT < WEIGHT · would descend' : 'LIFT ≈ WEIGHT · level flight';
  const stateColor = !r ? colors.textMuted : r.stalled ? colors.red : Math.abs(r.netVertical) <= r.weight * 0.02 ? colors.green : colors.amber;

  return (
    <Screen>
      <LabHeader tag="AERODYNAMICS LAB" color={colors.green} title="Lift, Drag & Flight" subtitle="Adjust a wing and its flight condition. Every value updates instantly from the lift and drag equations." />

      <Card style={{ padding: 10 }}>
        {r ? <AirflowView alphaDeg={p.angleOfAttackDeg} result={r} /> : <View style={{ height: 220 }} />}
        <Row style={{ marginTop: 8, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          {r ? <Badge text={state} color={stateColor} /> : null}
          <Text style={[font.small, { color: colors.textDim }]}>Schematic flow — not CFD</Text>
        </Row>
      </Card>

      {r ? (
        <StatGrid>
          <Stat label="Lift L" value={fmtSI(r.lift, 'N')} color={colors.green} />
          <Stat label="Weight W" value={fmtSI(r.weight, 'N')} color={colors.red} />
          <Stat label="Drag D" value={fmtSI(r.drag, 'N')} color={colors.amber} />
          <Stat label="Thrust req. (= D)" value={fmtSI(r.thrustRequired, 'N')} color={colors.cyan} />
          <Stat label="Lift coeff. C_L" value={fmt(r.cl, 3)} />
          <Stat label="Drag coeff. C_D" value={fmt(r.cd, 4)} />
          <Stat label="L/D" value={fmt(r.liftToDrag, 1)} />
          <Stat label="Stall speed" value={fmt(r.stallSpeed, 1)} unit="m/s" />
          <Stat label="Air density ρ" value={fmt(r.density, 4)} unit="kg/m³" />
          <Stat label="Dynamic pressure q" value={fmtSI(r.dynamicPressure, 'Pa')} />
        </StatGrid>
      ) : null}

      <Card>
        <Text style={[font.h3, { marginBottom: 12 }]}>Wing & flight condition</Text>
        <ParamSlider label="Airspeed" symbol="v" value={p.airspeed} min={0} max={150} step={0.5} unit="m/s" decimals={1} onChange={set('airspeed')} />
        <ParamSlider label="Angle of attack" symbol="α" value={p.angleOfAttackDeg} min={-6} max={22} step={0.5} unit="°" decimals={1} onChange={set('angleOfAttackDeg')} />
        <ParamSlider label="Wing area" symbol="S" value={p.wingArea} min={1} max={150} step={0.1} unit="m²" decimals={1} onChange={set('wingArea')} />
        <ParamSlider label="Altitude (ISA)" symbol="h" value={p.altitude} min={0} max={15000} step={100} unit="m" decimals={0} onChange={set('altitude')} />
        <ParamSlider label="Aircraft mass" symbol="m" value={p.mass} min={1} max={80000} step={10} unit="kg" decimals={0} onChange={set('mass')} />
        <ParamSlider label="Aspect ratio" symbol="AR" value={p.aspectRatio} min={2} max={30} step={0.1} decimals={1} onChange={set('aspectRatio')} />
        {issues.map((i) => (
          <Text key={i.field} style={{ color: colors.red }}>
            {i.message}
          </Text>
        ))}
        <ControlsRow>
          <Button title="Reset" kind="secondary" onPress={() => setP(DEFAULTS)} icon={<ResetIcon />} style={{ flex: 1 }} />
          <Button title="Save" kind="ghost" onPress={save} disabled={!r} icon={<SaveIcon />} style={{ flex: 1 }} />
        </ControlsRow>
      </Card>

      {r ? (
        <>
          <Card>
            <LineChart
              title="Lift vs airspeed (current α, S, ρ)"
              xLabel="v (m/s)"
              yLabel="L (N)"
              series={[{ label: 'L', color: colors.green, data: sweepV.map((s) => ({ x: s.v, y: s.lift })) }]}
              refY={{ y: r.weight, label: 'weight', color: colors.red }}
              markers={[{ x: p.airspeed, y: r.lift }]}
            />
            <Text style={font.small}>Lift grows with v²: doubling airspeed quadruples lift. Where the curve crosses the weight line is the level-flight speed for this α.</Text>
          </Card>
          <Card>
            <LineChart
              title="Lift coefficient vs angle of attack"
              xLabel="α (°)"
              yLabel="C_L"
              includeZero={false}
              series={[{ label: 'C_L', color: colors.cyan, data: sweepA.map((s) => ({ x: s.alpha, y: s.cl })) }]}
              markers={[{ x: p.angleOfAttackDeg, y: r.cl }]}
            />
            <Text style={font.small}>
              Linear region slope a = {fmt(r.liftCurveSlope, 2)} /rad ({fmt((r.liftCurveSlope * Math.PI) / 180, 3)} /°). Beyond ≈15° the flow separates (stall); the post-stall curve is only illustrative.
            </Text>
          </Card>
        </>
      ) : null}

      <SectionTitle title="The mathematics" />
      <Equation caption="ρ air density · v airspeed · S wing area · C_L lift coefficient">L = ½ ρ v² S C_L</Equation>
      <Equation caption="Thin-aerofoil slope corrected for a finite wing (lifting line)">{'C_L = a (α − α₀),  α₀ = −2°\na = 2π / (1 + 2π / (π e AR)),  e = 0.8'}</Equation>
      <Equation caption="Parasite + induced drag">{'D = ½ ρ v² S C_D\nC_D = 0.025 + C_L² / (π e AR)'}</Equation>
      <Equation caption="Minimum level-flight speed">V_stall = √(2W / (ρ S C_L,max))</Equation>
      <Card>
        <Text style={[font.h3, { marginBottom: 6 }]}>Relationships</Text>
        <Text style={font.small}>
          • Lift ∝ v²: speed is the most powerful lever.{'\n'}• Lift ∝ S and ∝ ρ: bigger wings and denser air lift more.{'\n'}• C_L ∝ α (until stall): pitching up increases lift.{'\n'}• Induced drag ∝ C_L² / AR: slow flight at high α costs drag; long slender wings help.{'\n'}• Steady level flight needs L = W and thrust T = D.
        </Text>
      </Card>
      <InfoBox
        title="Simplified model"
        tone="warn"
        items={[
          'Incompressible, steady flow; no Reynolds-number or Mach effects (reasonable below ~100 m/s).',
          'Wing only: no fuselage, tail, flaps or ground effect. Generic aerofoil (α₀ = −2°, stall at 15°).',
          'Post-stall behaviour is a crude illustration, not a prediction.',
          'The airflow picture is a schematic. Real design uses wind-tunnel data and CFD.',
        ]}
      />
    </Screen>
  );
}

function AirflowView({ alphaDeg, result }: { alphaDeg: number; result: WingResult }) {
  const [w, setW] = useState(0);
  const [phase, setPhase] = useState(0);
  const h = 230;
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  useEffect(() => {
    let id: number;
    let last = 0;
    const tick = (now: number) => {
      if (now - last > 33) {
        last = now;
        setPhase((p) => (p + 1.6) % 40);
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  if (!w) return <View onLayout={onLayout} style={{ height: h }} />;
  const cx = w / 2;
  const cy = h / 2 + 6;
  const chord = Math.min(w * 0.5, 220);
  const deflect = Math.max(-1.5, Math.min(2.2, result.cl)) * 14; // downwash cue scales with C_L
  const lines = [-80, -55, -32, 32, 55, 80];
  const forces = [result.lift, result.weight, result.drag, result.thrustRequired];
  const fmax = Math.max(...forces.map(Math.abs), 1);
  const len = (f: number) => 12 + 58 * Math.sqrt(Math.abs(f) / fmax);

  const stream = (off: number) => {
    const above = off < 0;
    const near = Math.max(0, 1 - Math.abs(off) / 110);
    const bump = (above ? -1 : 1) * near * 10;
    const down = deflect * near;
    if (result.stalled && above) {
      // Separated, turbulent wake behind the upper surface.
      const y0 = cy + off;
      return `M0 ${y0} C ${cx - chord * 0.6} ${y0} ${cx - chord * 0.3} ${y0 + bump} ${cx} ${y0 + bump * 0.6} q 20 18 40 0 q 20 -18 40 0 q 20 18 40 0 L ${w} ${y0 + 10}`;
    }
    return `M0 ${cy + off} C ${cx - chord * 0.5} ${cy + off} ${cx - chord * 0.2} ${cy + off + bump} ${cx} ${cy + off + bump * 0.7} S ${cx + chord * 0.7} ${cy + off + down} ${w} ${cy + off + down * 1.4}`;
  };

  const arrow = (x: number, y: number, dx: number, dy: number, color: string, label: string) => {
    const x2 = x + dx;
    const y2 = y + dy;
    const a = Math.atan2(dy, dx);
    const hd = 7;
    return (
      <G>
        <Line x1={x} y1={y} x2={x2} y2={y2} stroke={color} strokeWidth={3} />
        <Path d={`M${x2},${y2} L${x2 - hd * Math.cos(a - 0.45)},${y2 - hd * Math.sin(a - 0.45)} L${x2 - hd * Math.cos(a + 0.45)},${y2 - hd * Math.sin(a + 0.45)} Z`} fill={color} />
        <SvgText x={x2 + (dx === 0 ? 8 : dx > 0 ? -4 : 4)} y={y2 + (dy < 0 ? -6 : dy > 0 ? 14 : -6)} fontSize={11} fill={color} fontWeight="bold" textAnchor={dx > 0 ? 'end' : dx < 0 ? 'start' : 'start'}>
          {label}
        </SvgText>
      </G>
    );
  };

  return (
    <View onLayout={onLayout}>
      <Svg width={w} height={h}>
        <Rect x={0} y={0} width={w} height={h} rx={12} fill="#030713" />
        {lines.map((off) => (
          <Path key={off} d={stream(off)} stroke={colors.cyan} strokeOpacity={0.55} strokeWidth={1.3} fill="none" strokeDasharray="10,30" strokeDashoffset={-phase} />
        ))}
        <Line x1={cx - chord * 0.75} y1={cy} x2={cx + chord * 0.75} y2={cy} stroke={colors.textDim} strokeDasharray="3,4" />
        <G rotation={alphaDeg} originX={cx} originY={cy}>
          <Path
            d={`M${cx - chord / 2} ${cy} C ${cx - chord * 0.35} ${cy - chord * 0.16} ${cx + chord * 0.15} ${cy - chord * 0.12} ${cx + chord / 2} ${cy} C ${cx + chord * 0.1} ${cy + chord * 0.03} ${cx - chord * 0.35} ${cy + chord * 0.05} ${cx - chord / 2} ${cy} Z`}
            fill={colors.text}
          />
          <Line x1={cx - chord * 0.7} y1={cy} x2={cx + chord * 0.7} y2={cy} stroke={colors.amber} strokeWidth={1} strokeDasharray="2,3" />
        </G>
        <SvgText x={cx + chord * 0.72} y={cy - 8} fontSize={11} fill={colors.amber}>
          {`α = ${alphaDeg}°`}
        </SvgText>
        {arrow(cx, cy - 6, 0, -len(result.lift) * Math.sign(result.lift || 1), colors.green, 'L')}
        {arrow(cx, cy + 6, 0, len(result.weight), colors.red, 'W')}
        {arrow(cx + chord * 0.5, cy, len(result.drag), 0, colors.amber, 'D')}
        {arrow(cx - chord * 0.5, cy, -len(result.thrustRequired), 0, colors.cyan, 'T')}
      </Svg>
      <Text style={[font.small, { color: colors.textDim, marginTop: 4 }]}>Arrow lengths ∝ √force (comparative). Relative wind from the left; T drawn as the thrust needed to balance D.</Text>
    </View>
  );
}
