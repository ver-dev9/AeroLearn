import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Screen, Row, Badge } from '../components/ui';
import { colors, font } from '../theme';
import { LAB_CARDS } from './HomeScreen';
import { useProgress } from '../store/progress';
import type { RootStackParamList } from '../navigation/types';

const MODEL: Record<string, string> = {
  flight: 'Closed-form analytic solution',
  rocket: 'RK4 integration, variable mass',
  orbit: 'Velocity-Verlet integration',
  aero: 'Lift equation + drag polar, ISA',
};

export default function LabsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state } = useProgress();
  return (
    <Screen>
      <Text style={font.h1}>Laboratories</Text>
      <Text style={[font.body, { marginBottom: 16 }]}>Four interactive models. Each states its equations and assumptions.</Text>
      {LAB_CARDS.filter((c) => c.id !== 'challenges').map((c) => (
        <Card key={c.id} onPress={() => nav.navigate(c.route as 'FlightLab')} accent={c.color}>
          <Row style={{ alignItems: 'center' }}>
            <View style={{ backgroundColor: c.color + '14', borderRadius: 12, padding: 4 }}>
              <c.Art />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={font.h3}>{c.title}</Text>
              <Text style={[font.small, { marginTop: 2 }]}>{c.desc}</Text>
              <View style={{ marginTop: 8 }}>
                <Badge text={MODEL[c.id]} color={c.color} />
              </View>
              <Text style={[font.small, { marginTop: 6, color: colors.textDim }]}>Runs: {state.labRunCounts[c.id as 'flight'] ?? 0}</Text>
            </View>
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
