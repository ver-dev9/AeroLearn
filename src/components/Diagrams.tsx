/** Lesson diagrams drawn with SVG. Labels use SI symbols. */
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect, Text as T } from 'react-native-svg';
import { colors } from '../theme';
import type { DiagramKey } from '../data/lessons';

const VB = '0 0 320 180';

function Arrow({ x1, y1, x2, y2, color, label, lx, ly }: { x1: number; y1: number; x2: number; y2: number; color: string; label?: string; lx?: number; ly?: number }) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const h = 8;
  const p1 = `${x2 - h * Math.cos(ang - 0.4)},${y2 - h * Math.sin(ang - 0.4)}`;
  const p2 = `${x2 - h * Math.cos(ang + 0.4)},${y2 - h * Math.sin(ang + 0.4)}`;
  return (
    <G>
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.4} />
      <Path d={`M${x2},${y2} L${p1} L${p2} Z`} fill={color} />
      {label ? (
        <T x={lx ?? x2} y={ly ?? y2} fill={color} fontSize={12} fontWeight="bold" textAnchor="middle">
          {label}
        </T>
      ) : null}
    </G>
  );
}

function Forces() {
  return (
    <>
      <Rect x={130} y={70} width={60} height={40} rx={6} fill={colors.cardAlt} stroke={colors.borderStrong} />
      <T x={160} y={95} fill={colors.text} fontSize={13} textAnchor="middle">m</T>
      <Arrow x1={190} y1={90} x2={270} y2={90} color={colors.cyan} label="F" lx={280} ly={94} />
      <Arrow x1={130} y1={90} x2={80} y2={90} color={colors.amber} label="f" lx={70} ly={94} />
      <Arrow x1={160} y1={110} x2={160} y2={160} color={colors.red} label="W = mg" lx={205} ly={160} />
      <Arrow x1={160} y1={70} x2={160} y2={22} color={colors.green} label="N" lx={175} ly={26} />
      <T x={20} y={170} fill={colors.textMuted} fontSize={11}>ΣF = F − f = m a</T>
    </>
  );
}

function Projectile() {
  return (
    <>
      <Line x1={20} y1={160} x2={300} y2={160} stroke={colors.textDim} />
      <Path d="M30 160 Q 160 -40 290 160" stroke={colors.cyan} strokeWidth={2} fill="none" strokeDasharray="5,4" />
      <Arrow x1={30} y1={160} x2={80} y2={100} color={colors.text} label="v₀" lx={62} ly={98} />
      <Path d="M58 160 A 28 28 0 0 0 48 139" stroke={colors.amber} fill="none" />
      <T x={66} y={152} fill={colors.amber} fontSize={12}>θ</T>
      <Line x1={160} y1={60} x2={160} y2={160} stroke={colors.textDim} strokeDasharray="3,3" />
      <T x={168} y={112} fill={colors.textMuted} fontSize={12}>H</T>
      <Arrow x1={160} y1={60} x2={205} y2={60} color={colors.green} label="vₓ" lx={215} ly={56} />
      <Arrow x1={240} y1={88} x2={240} y2={118} color={colors.red} label="g" lx={252} ly={112} />
      <T x={160} y={176} fill={colors.textMuted} fontSize={12} textAnchor="middle">R</T>
    </>
  );
}

function Circular() {
  return (
    <>
      <Circle cx={160} cy={90} r={65} stroke={colors.borderStrong} strokeWidth={1.5} fill="none" strokeDasharray="4,4" />
      <Circle cx={160} cy={90} r={4} fill={colors.textDim} />
      <Circle cx={206} cy={44} r={8} fill={colors.text} />
      <Arrow x1={206} y1={44} x2={256} y2={94} color={colors.cyan} label="v" lx={266} ly={98} />
      <Arrow x1={206} y1={44} x2={175} y2={75} color={colors.amber} label="a_c" lx={168} ly={60} />
      <Line x1={160} y1={90} x2={206} y2={44} stroke={colors.textDim} strokeDasharray="3,3" />
      <T x={190} y={82} fill={colors.textMuted} fontSize={12}>r</T>
      <T x={20} y={170} fill={colors.textMuted} fontSize={11}>a_c = v²/r  (towards the centre)</T>
    </>
  );
}

function Gravitation() {
  return (
    <>
      <Circle cx={90} cy={90} r={40} fill={colors.blue} />
      <T x={90} y={95} fill={colors.text} fontSize={13} textAnchor="middle">M</T>
      <Circle cx={250} cy={90} r={12} fill={colors.textMuted} />
      <T x={250} y={94} fill={colors.bg} fontSize={11} textAnchor="middle">m</T>
      <Arrow x1={238} y1={90} x2={180} y2={90} color={colors.amber} label="F" lx={200} ly={82} />
      <Line x1={90} y1={130} x2={250} y2={130} stroke={colors.textDim} />
      <T x={170} y={146} fill={colors.textMuted} fontSize={12} textAnchor="middle">r</T>
      <T x={170} y={172} fill={colors.cyan} fontSize={13} textAnchor="middle">F = G M m / r²</T>
    </>
  );
}

function Conics() {
  return (
    <>
      <Circle cx={110} cy={90} r={18} fill={colors.blue} />
      <Circle cx={110} cy={90} r={40} stroke={colors.green} strokeWidth={1.6} fill="none" />
      <Ellipse cx={150} cy={90} rx={80} ry={50} stroke={colors.cyan} strokeWidth={1.6} fill="none" />
      <Path d="M70 90 Q 70 10 300 10" stroke={colors.amber} strokeWidth={1.6} fill="none" strokeDasharray="5,4" />
      <Path d="M70 90 Q 70 170 300 170" stroke={colors.amber} strokeWidth={1.6} fill="none" strokeDasharray="5,4" />
      <T x={110} y={140} fill={colors.green} fontSize={11} textAnchor="middle">circle e=0</T>
      <T x={232} y={96} fill={colors.cyan} fontSize={11}>ellipse</T>
      <T x={236} y={30} fill={colors.amber} fontSize={11}>escape e≥1</T>
    </>
  );
}

function Rocket() {
  return (
    <>
      <Path d="M160 20 C 176 36 178 70 176 110 L 144 110 C 142 70 144 36 160 20 Z" fill={colors.text} />
      <Path d="M147 110 Q 160 150 173 110 Z" fill={colors.amber} />
      <Arrow x1={160} y1={20} x2={160} y2={2} color={colors.cyan} />
      <T x={182} y={14} fill={colors.cyan} fontSize={12}>T (thrust)</T>
      <Arrow x1={120} y1={60} x2={120} y2={110} color={colors.red} label="mg" lx={100} ly={100} />
      <Arrow x1={200} y1={40} x2={200} y2={80} color={colors.violet} label="D" lx={214} ly={76} />
      <Arrow x1={160} y1={150} x2={160} y2={176} color={colors.amber} />
      <T x={182} y={172} fill={colors.amber} fontSize={12}>exhaust v_e</T>
    </>
  );
}

function Airfoil() {
  return (
    <>
      {[30, 55, 125, 150].map((y, i) => (
        <Path key={y} d={`M0 ${y} C 100 ${y + (i < 2 ? -10 : 8)} 220 ${y + (i < 2 ? -14 : 14)} 320 ${y + (i < 2 ? 4 : 20)}`} stroke={colors.cyan} strokeWidth={1} fill="none" opacity={0.6} />
      ))}
      <G rotation={8} originX={160} originY={92}>
        <Path d="M70 92 C 100 66 200 66 250 92 C 200 100 100 104 70 92 Z" fill={colors.text} />
        <Line x1={40} y1={92} x2={280} y2={92} stroke={colors.textDim} strokeDasharray="3,3" />
      </G>
      <Line x1={20} y1={92} x2={300} y2={92} stroke={colors.amber} strokeDasharray="2,4" />
      <T x={286} y={86} fill={colors.amber} fontSize={12}>α</T>
      <Arrow x1={160} y1={78} x2={160} y2={20} color={colors.green} label="L" lx={174} ly={26} />
      <Arrow x1={200} y1={92} x2={250} y2={92} color={colors.red} label="D" lx={260} ly={106} />
      <T x={10} y={174} fill={colors.textMuted} fontSize={11}>low pressure above, high pressure below</T>
    </>
  );
}

function FourForces() {
  return (
    <>
      <Path d="M80 90 L 230 84 L 250 90 L 230 96 Z" fill={colors.text} />
      <Path d="M140 87 L 170 50 L 182 50 L 170 87 Z M140 93 L 170 130 L 182 130 L 170 93 Z" fill={colors.textMuted} />
      <Path d="M84 90 L 72 70 L 80 70 L 96 89 Z" fill={colors.textMuted} />
      <Arrow x1={165} y1={70} x2={165} y2={14} color={colors.green} label="Lift" lx={196} ly={22} />
      <Arrow x1={165} y1={110} x2={165} y2={170} color={colors.red} label="Weight" lx={210} ly={168} />
      <Arrow x1={250} y1={90} x2={310} y2={90} color={colors.cyan} label="Thrust" lx={290} ly={80} />
      <Arrow x1={80} y1={90} x2={20} y2={90} color={colors.amber} label="Drag" lx={36} ly={80} />
    </>
  );
}

const MAP: Record<DiagramKey, () => React.ReactElement> = {
  forces: Forces,
  projectile: Projectile,
  circular: Circular,
  gravitation: Gravitation,
  conics: Conics,
  rocket: Rocket,
  airfoil: Airfoil,
  fourForces: FourForces,
};

export function LessonDiagram({ kind }: { kind: DiagramKey }) {
  const C = MAP[kind];
  return (
    <View style={{ backgroundColor: colors.bgElevated, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 8, marginBottom: 12 }}>
      <Svg width="100%" height={180} viewBox={VB} preserveAspectRatio="xMidYMid meet">
        <C />
      </Svg>
    </View>
  );
}
