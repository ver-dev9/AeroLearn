import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Badge, Card, Chip, ProgressBar, Row, Screen } from '../components/ui';
import { CheckIcon } from '../components/Icons';
import { colors, font } from '../theme';
import { CHALLENGES, Topic, TOPIC_LABEL } from '../data/challenges';
import { BADGES } from '../data/badges';
import { useProgress } from '../store/progress';
import type { RootStackParamList } from '../navigation/types';

const TOPICS: (Topic | 'all')[] = ['all', 'projectile', 'orbit', 'rocket', 'aero', 'concept'];

export default function ChallengesScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state } = useProgress();
  const [topic, setTopic] = useState<Topic | 'all'>('all');
  const list = CHALLENGES.filter((c) => topic === 'all' || c.topic === topic);
  const solved = state.solvedChallenges.length;

  return (
    <Screen>
      <Text style={font.h1}>Aerospace Challenges</Text>
      <Text style={[font.body, { marginBottom: 12 }]}>Work each problem through. There is no timer — every answer comes with the full reasoning and equations.</Text>
      <Card>
        <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>Solved</Text>
          <Text style={{ color: colors.violet, fontWeight: '700' }}>
            {solved}/{CHALLENGES.length}
          </Text>
        </Row>
        <ProgressBar value={solved / CHALLENGES.length} color={colors.violet} />
        <Text style={[font.small, { marginTop: 8 }]}>{BADGES.filter((b) => b.progress(state) >= 1).length} badges earned · see Profile for all achievements</Text>
      </Card>
      <Row style={{ flexWrap: 'wrap', marginBottom: 12 }}>
        {TOPICS.map((t) => (
          <Chip key={t} label={t === 'all' ? 'All' : TOPIC_LABEL[t]} active={topic === t} onPress={() => setTopic(t)} color={colors.violet} />
        ))}
      </Row>
      {list.map((c) => {
        const done = state.solvedChallenges.includes(c.id);
        const attempts = state.challengeHistory.filter((a) => a.challengeId === c.id).length;
        return (
          <Card key={c.id} onPress={() => nav.navigate('Challenge', { id: c.id })} accent={done ? colors.green : undefined}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row>
                <Badge text={TOPIC_LABEL[c.topic].toUpperCase()} color={colors.violet} />
                <Badge text={c.kind === 'mcq' ? 'MULTIPLE CHOICE' : 'NUMERIC'} color={colors.textMuted} />
              </Row>
              {done ? <CheckIcon /> : null}
            </Row>
            <Text style={[font.h3, { marginTop: 8 }]}>{c.title}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={font.small}>Difficulty {'●'.repeat(c.difficulty) + '○'.repeat(3 - c.difficulty)}</Text>
              <Text style={font.small}>{attempts ? `${attempts} attempt${attempts > 1 ? 's' : ''}` : 'Not attempted'}</Text>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
