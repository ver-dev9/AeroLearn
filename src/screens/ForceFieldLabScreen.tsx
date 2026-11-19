import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Text as SvgText } from 'react-native-svg';
import { Badge, Card, Chip, Equation, InfoBox, LabHeader, ParamSlider as Missing, Row, Screen, SectionTitle, Stat, StatGrid } from '../components/ui';
import { ParamSlider } from '../components/ParamSlider';
import { colors, font } from '../theme';

const G = 6.67430e-11;

export default function ForceFieldLabScreen() {
  const [mode, setMode] = useState<'gravity' | 'magnet'>('gravity');
  const [m1, setM1] = useState(5.97);
  const [m2, setM2] = useState(2);
  const [distance, setDistance] = useState(6.37);
  const [field, setField] = useState(50);
  const [angle, setAngle] = useState(35);
  const force = useMemo(() => G * (m1 * 1e24) * (m2 * 1e3) / Math.pow(distance * 1e6, 2), [m1, m2, distance]);
  const compassAngle = angle;
  return (
    <Screen>
      <Text style={font.h1}>Gravity & Magnetism</Text>
      <Text style={[font.body, { marginBottom: 16 }]}>Two interactive field models. Adjust the physical inputs and watch the diagrams and calculated values respond immediately.</Text>
      <Row style={{ gap: 8, marginBottom: 14 }}>
        <Chip label="Gravity force" active={mode === 'gravity'} onPress={() => setMode('gravity')} color={colors.amber} />
        <Chip label="Magnets & compass" active={mode === 'magnet'} onPress={() => setMode('magnet')} color={colors.cyan} />
      </Row>
      {mode === 'gravity' ? (
        <>
          <LabHeader tag="NEWTONIAN MECHANICS" color={colors.amber} title="Universal Gravitation" subtitle="Two masses attract one another. Change either mass or their separation to see the force update in real time." />
          <Card>
            <GravityDiagram massA={m1} massB={m2} distance={distance} />
            <StatGrid>
              <Stat label="Attractive force" value={force.toExponential(3)} unit="N" color={colors.amber} />
              <Stat label="Separation" value={distance.toFixed(2)} unit="×10⁶ m" color={colors.cyan} />
            </StatGrid>
            <ParamSlider label="Primary mass" symbol="m₁" value={m1} min={1} max={10} step={0.1} unit="×10²⁴ kg" decimals={1} onChange={setM1} />
            <ParamSlider label="Secondary mass" symbol="m₂" value={m2} min={0.1} max={10} step={0.1} unit="×10³ kg" decimals={1} onChange={setM2} />
            <ParamSlider label="Centre-to-centre distance" symbol="r" value={distance} min={1} max={20} step={0.1} unit="×10⁶ m" decimals={1} onChange={setDistance} />
            <Badge text="LIVE CALCULATION · NEWTON'S LAW" color={colors.amber} />
          </Card>
          <Equation caption="Newton's law of universal gravitation">F = G m₁m₂ / r²</Equation>
          <InfoBox title="How to read this model" items={['The force acts along the line joining the centres of mass.', 'Both objects experience forces of equal magnitude and opposite direction (Newton’s third law).', 'Doubling either mass doubles the force; doubling separation reduces it to one quarter.']} />
        </>
      ) : (
        <>
          <LabHeader tag="ELECTROMAGNETISM" color={colors.cyan} title="Magnetic Field & Compass" subtitle="Rotate the magnetic field and change its strength. The compass needle aligns with the local field direction." />
          <Card>
            <CompassDiagram angle={compassAngle} field={field} />
            <StatGrid>
              <Stat label="Field strength" value={field.toFixed(0)} unit="µT" color={colors.cyan} />
              <Stat label="Field direction" value={angle.toFixed(0)} unit="°" color={colors.amber} />
            </StatGrid>
            <ParamSlider label="Magnetic field strength" symbol="B" value={field} min={10} max={100} step={1} unit="µT" decimals={0} onChange={setField} />
            <ParamSlider label="Field direction" symbol="θ" value={angle} min={-180} max={180} step={1} unit="°" decimals={0} onChange={setAngle} />
            <Badge text="LIVE COMPASS ALIGNMENT" color={colors.cyan} />
          </Card>
          <Equation caption="Magnetic torque aligns a compass dipole with the field">τ = μ × B</Equation>
          <InfoBox title="How a compass works" items={['A compass needle is a small magnetic dipole.', 'The needle experiences torque and rotates until its magnetic moment aligns with the local magnetic field.', 'The field-line curves in the diagram are schematic; the needle angle follows the selected field direction.']} />
        </>
      )}
      <SectionTitle title="Experiment notes" />
      <Text style={font.small}>These are idealised educational models. They omit local geological magnetic anomalies, extended-body effects, and relativistic corrections.</Text>
    </Screen>
  );
}

function GravityDiagram({ massA, massB, distance }: { massA: number; massB: number; distance: number }) {
  const ra = 17 + massA * 2.2; const rb = 13 + massB * 1.6;
  return <View style={{ marginBottom: 10 }}>
    <Svg width="100%" height={220} viewBox="0 0 340 220">
      <Path d="M28 110H312" stroke={colors.grid} strokeDasharray="4 5" />
      <Circle cx={76} cy={110} r={ra} fill="#C49A63" opacity={0.9} />
      <Circle cx={264} cy={110} r={rb} fill="#557DA6" opacity={0.95} />
      <Line x1={76 + ra + 8} y1={110} x2={264 - rb - 8} y2={110} stroke={colors.amber} strokeWidth={2} />
      <Polygon points="76,110 88,104 88,116" fill={colors.amber} />
      <Polygon points="264,110 252,104 252,116" fill={colors.amber} />
      <Path d="M76 68V54H264V68" stroke={colors.textDim} fill="none" />
      <SvgText x="170" y="45" fill={colors.textMuted} fontSize="11" textAnchor="middle">r = {distance.toFixed(2)} × 10⁶ m</SvgText>
      <SvgText x="76" y="164" fill={colors.text} fontSize="12" textAnchor="middle">m₁</SvgText>
      <SvgText x="264" y="164" fill={colors.text} fontSize="12" textAnchor="middle">m₂</SvgText>
      <SvgText x="170" y="198" fill={colors.amber} fontSize="11" textAnchor="middle">Equal and opposite attraction</SvgText>
    </Svg>
  </View>;
}

function CompassDiagram({ angle, field }: { angle: number; field: number }) {
  const rad = angle * Math.PI / 180; const dx = Math.cos(rad) * 78; const dy = -Math.sin(rad) * 78;
  const strength = 0.15 + field / 130;
  return <View style={{ marginBottom: 10 }}>
    <Svg width="100%" height={260} viewBox="0 0 340 260">
      {[...Array(9)].map((_, i) => <Ellipse key={i} cx="170" cy="128" rx={50 + i * 12} ry={28 + i * 7} fill="none" stroke={colors.cyan} strokeOpacity={strength * (1 - i * 0.07)} strokeWidth="1.1" />)}
      <Circle cx="170" cy="128" r="40" fill={colors.cardAlt} stroke={colors.borderStrong} strokeWidth="2" />
      <Circle cx="170" cy="128" r="3" fill={colors.text} />
      <Line x1={170 - dx} y1={128 - dy} x2={170 + dx} y2={128 + dy} stroke={colors.textDim} strokeWidth="1.5" strokeDasharray="3 4" />
      <Polygon points={`${170 + dx},${128 + dy} ${170 - dy * 0.16},${128 + dx * 0.16} ${170 - dx},${128 - dy}`} fill={colors.red} />
      <Polygon points={`${170 - dx},${128 - dy} ${170 + dy * 0.16},${128 - dx * 0.16} ${170 + dx},${128 + dy}`} fill={colors.cyan} />
      <SvgText x="170" y="22" fill={colors.textMuted} fontSize="10" textAnchor="middle">N</SvgText>
      <SvgText x="170" y="246" fill={colors.textMuted} fontSize="10" textAnchor="middle">S</SvgText>
      <SvgText x="170" y="254" fill={colors.cyan} fontSize="9" textAnchor="middle">Compass needle follows B</SvgText>
    </Svg>
  </View>;
}
