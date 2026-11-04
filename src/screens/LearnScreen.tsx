import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, ProgressBar, Row, Screen, Badge } from '../components/ui';
import { CheckIcon } from '../components/Icons';
import { colors, font } from '../theme';
import { LESSONS } from '../data/lessons';
import { useProgress } from '../store/progress';
import type { RootStackParamList } from '../navigation/types';

export default function LearnScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state } = useProgress();
  const done = state.completedLessons.length;
  return (
    <Screen>
      <Text style={font.h1}>Learning Library</Text>
      <Text style={[font.body, { marginBottom: 12 }]}>Structured lessons from Newton’s laws to flight. Each has equations, a diagram, a worked example and a knowledge check.</Text>
      <Card>
        <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>Library progress</Text>
          <Text style={{ color: colors.cyan, fontWeight: '700' }}>
            {done}/{LESSONS.length}
          </Text>
        </Row>
        <ProgressBar value={done / LESSONS.length} />
      </Card>
      {LESSONS.map((l, i) => {
        const complete = state.completedLessons.includes(l.id);
        return (
          <Card key={l.id} onPress={() => nav.navigate('Lesson', { id: l.id })} accent={complete ? colors.green : undefined}>
            <Row style={{ alignItems: 'flex-start' }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: complete ? colors.green + '22' : colors.cyanSoft, alignItems: 'center', justifyContent: 'center' }}>
                {complete ? <CheckIcon /> : <Text style={{ color: colors.cyan, fontWeight: '800' }}>{i + 1}</Text>}
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={font.h3}>{l.title}</Text>
                <Text style={[font.small, { marginTop: 2 }]}>{l.subtitle}</Text>
                <Row style={{ marginTop: 8 }}>
                  <Badge text={`${l.minutes} MIN`} color={colors.textMuted} />
                  {complete ? <Badge text="COMPLETED" color={colors.green} /> : null}
                </Row>
              </View>
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}
