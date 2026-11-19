import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Screen, Row, Badge } from '../components/ui';
import { colors, font } from '../theme';
import { useProgress } from '../store/progress';
import type { RootStackParamList } from '../navigation/types';

const LABS = [
  { id: 'flight', route: 'FlightLab' as const, title: 'Flight Lab', desc: 'Projectile motion, launch angle, velocity and trajectory.', model: 'Closed-form analytic solution', color: colors.cyan, symbol: '↗' },
  { id: 'orbit', route: 'OrbitExplorer' as const, title: 'Orbit Explorer', desc: 'Explore satellite paths, orbital speed and escape conditions.', model: 'Velocity-Verlet integration', color: colors.blue, symbol: '◎' },
  { id: 'rocket', route: 'RocketLab' as const, title: 'Rocket Lab', desc: 'Investigate thrust, fuel burn, gravity and atmospheric drag.', model: 'RK4 integration · variable mass', color: colors.amber, symbol: '🚀' },
  { id: 'aero', route: 'AeroLab' as const, title: 'Aerodynamics Lab', desc: 'Study lift, drag, angle of attack and stall behaviour.', model: 'Lift equation + drag polar · ISA', color: colors.green, symbol: '✈' },
];

export default function LabsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state } = useProgress();
  return (
    <Screen>
      <Text style={font.h1}>Laboratories</Text>
      <Text style={[font.body, { marginBottom: 16 }]}>Interactive physics instruments. Change parameters, inspect live models, and connect the visuals to the equations.</Text>
      <Card onPress={() => nav.navigate('ForceFieldLab')} accent={colors.cyan}>
        <Row style={{ alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.navy, borderRadius: 12, padding: 12 }}><Text style={{ color: colors.cyan, fontSize: 24 }}>⊕</Text></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={font.h3}>Gravity & Magnetism Lab</Text>
            <Text style={[font.small, { marginTop: 3 }]}>Explore gravitational attraction, magnetic fields and a live compass needle.</Text>
            <View style={{ marginTop: 8 }}><Badge text="2 INTERACTIVE MODELS" color={colors.cyan} /></View>
          </View>
        </Row>
      </Card>
      <Card onPress={() => nav.navigate('AstronomyExplorer')} accent={colors.amber}>
        <Row style={{ alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.cardAlt, borderRadius: 12, padding: 12 }}><Text style={{ color: colors.amber, fontSize: 22 }}>✦</Text></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={font.h3}>Celestial Bodies Atlas</Text>
            <Text style={[font.small, { marginTop: 3 }]}>Explore 20 celestial bodies and cosmic structures with expanded descriptions and mission context.</Text>
            <View style={{ marginTop: 8 }}><Badge text="20 COSMIC OBJECTS" color={colors.amber} /></View>
          </View>
        </Row>
      </Card>
      {LABS.map((lab) => (
        <Card key={lab.id} onPress={() => nav.navigate(lab.route)} accent={lab.color}>
          <Row style={{ alignItems: 'center' }}>
            <View style={{ width: 48, height: 48, borderRadius: 13, backgroundColor: lab.color + '18', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: lab.color, fontSize: 25, fontWeight: '800' }}>{lab.symbol}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={font.h3}>{lab.title}</Text>
              <Text style={[font.small, { marginTop: 2 }]}>{lab.desc}</Text>
              <View style={{ marginTop: 8 }}><Badge text={lab.model} color={lab.color} /></View>
              <Text style={[font.small, { marginTop: 6, color: colors.textDim }]}>Runs: {state.labRunCounts[lab.id as keyof typeof state.labRunCounts] ?? 0}</Text>
            </View>
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
