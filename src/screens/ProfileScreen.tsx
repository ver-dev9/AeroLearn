import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Badge, Button, Card, ProgressBar, Row, Screen, SectionTitle } from '../components/ui';
import { CheckIcon, Logo } from '../components/Icons';
import { colors, font, radius } from '../theme';
import { useProgress, LabId } from '../store/progress';
import { BADGES } from '../data/badges';
import { LESSONS } from '../data/lessons';
import { CHALLENGES } from '../data/challenges';
import { relativeDate } from '../utils/format';
import type { RootStackParamList } from '../navigation/types';

const LAB_ROUTE: Record<LabId, 'FlightLab' | 'OrbitExplorer' | 'RocketLab' | 'AeroLab'> = { flight: 'FlightLab', orbit: 'OrbitExplorer', rocket: 'RocketLab', aero: 'AeroLab' };
const LAB_NAME: Record<LabId, string> = { flight: 'Flight Lab', orbit: 'Orbit Explorer', rocket: 'Rocket Lab', aero: 'Aerodynamics Lab' };

export default function ProfileScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state, setProfileName, deleteExperiment, resetAll } = useProgress();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(state.profileName);

  const confirmReset = () =>
    Alert.alert('Reset all progress?', 'This deletes lessons, challenges, saved experiments and badges stored on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetAll },
    ]);

  return (
    <Screen>
      <Card>
        <Row>
          <Logo size={52} />
          <View style={{ flex: 1 }}>
            {editing ? (
              <TextInput
                value={name}
                onChangeText={setName}
                autoFocus
                maxLength={40}
                onSubmitEditing={() => {
                  setProfileName(name.trim());
                  setEditing(false);
                }}
                style={{ color: colors.text, fontSize: 20, fontWeight: '800', borderBottomWidth: 1, borderBottomColor: colors.cyan, paddingVertical: 4 }}
              />
            ) : (
              <Text style={font.h2}>{state.profileName}</Text>
            )}
            <Text style={font.small}>Learning since {new Date(state.createdAt).toLocaleDateString()} · stored on this device</Text>
          </View>
        </Row>
        <Button
          title={editing ? 'Save name' : 'Edit name'}
          kind="ghost"
          onPress={() => {
            if (editing) setProfileName(name.trim());
            else setName(state.profileName);
            setEditing(!editing);
          }}
          style={{ marginTop: 12 }}
        />
      </Card>

      <SectionTitle title="Learning progress" />
      <Card>
        <Metric label="Lessons completed" n={state.completedLessons.length} total={LESSONS.length} color={colors.cyan} />
        <Metric label="Challenges solved" n={state.solvedChallenges.length} total={CHALLENGES.length} color={colors.violet} />
        <Metric label="Labs explored" n={Object.values(state.labRunCounts).filter((x) => x > 0).length} total={4} color={colors.amber} />
        <Text style={font.small}>
          Simulations run: {Object.values(state.labRunCounts).reduce((a, b) => a + b, 0)} (Flight {state.labRunCounts.flight} · Orbit {state.labRunCounts.orbit} · Rocket {state.labRunCounts.rocket} · Aero {state.labRunCounts.aero})
        </Text>
      </Card>

      <SectionTitle title="Achievement badges" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        {BADGES.map((b) => {
          const p = b.progress(state);
          const earned = p >= 1;
          return (
            <View key={b.id} style={{ flexBasis: '47%', flexGrow: 1, backgroundColor: earned ? colors.cyanSoft : colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: earned ? colors.cyan : colors.border, padding: 12 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text style={{ color: earned ? colors.cyan : colors.text, fontWeight: '700', flexShrink: 1 }}>{b.title}</Text>
                {earned ? <CheckIcon color={colors.cyan} /> : null}
              </Row>
              <Text style={[font.small, { marginVertical: 6 }]}>{b.description}</Text>
              <ProgressBar value={p} height={4} />
            </View>
          );
        })}
      </View>

      <SectionTitle title="Completed lessons" />
      <Card>
        {state.completedLessons.length === 0 ? <Text style={font.small}>None yet — start in the Learn tab.</Text> : null}
        {LESSONS.filter((l) => state.completedLessons.includes(l.id)).map((l) => (
          <Pressable key={l.id} onPress={() => nav.navigate('Lesson', { id: l.id })} style={{ paddingVertical: 6 }}>
            <Text style={{ color: colors.text }}>✓ {l.title}</Text>
          </Pressable>
        ))}
      </Card>

      <SectionTitle title="Saved experiments" />
      {state.savedExperiments.length === 0 ? (
        <Card>
          <Text style={font.small}>Use “Save” in any lab to keep a configuration and its results here.</Text>
        </Card>
      ) : (
        state.savedExperiments.map((e) => (
          <Card key={e.id}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Badge text={LAB_NAME[e.lab].toUpperCase()} />
              <Text style={[font.small, { color: colors.textDim }]}>{relativeDate(e.savedAt)}</Text>
            </Row>
            <Text style={[font.h3, { marginTop: 6 }]}>{e.title}</Text>
            <Text style={[font.small, { marginTop: 4 }]}>{e.summary}</Text>
            <Row style={{ marginTop: 10 }}>
              <Button title="Open in lab" kind="ghost" onPress={() => nav.push(LAB_ROUTE[e.lab], { preset: e.params as Record<string, number> })} style={{ flex: 1 }} />
              <Button title="Delete" kind="danger" onPress={() => deleteExperiment(e.id)} style={{ flex: 1 }} />
            </Row>
          </Card>
        ))
      )}

      <SectionTitle title="Challenge history" />
      <Card>
        {state.challengeHistory.length === 0 ? <Text style={font.small}>No attempts yet.</Text> : null}
        {state.challengeHistory.slice(0, 12).map((h, i) => {
          const c = CHALLENGES.find((x) => x.id === h.challengeId);
          return (
            <Pressable key={h.at + i} onPress={() => c && nav.navigate('Challenge', { id: c.id })} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ color: h.correct ? colors.green : colors.textMuted, flex: 1 }} numberOfLines={1}>
                {h.correct ? '✓' : '✗'} {c?.title ?? h.challengeId}
              </Text>
              <Text style={[font.small, { color: colors.textDim }]}>{relativeDate(h.at)}</Text>
            </Pressable>
          );
        })}
      </Card>

      <SectionTitle title="Coming soon" />
      <Card>
        <Text style={font.small}>Cloud sync and accounts are not part of this version — all data stays on your device.</Text>
        <Badge text="COMING SOON" color={colors.textMuted} />
      </Card>

      <Button title="Reset all progress" kind="danger" onPress={confirmReset} style={{ marginTop: 8 }} />
      <Text style={[font.small, { textAlign: 'center', marginTop: 16, color: colors.textDim }]}>AeroLearn v1.0 · Understand the Science. Explore the Sky.</Text>
    </Screen>
  );
}

function Metric({ label, n, total, color }: { label: string; n: number; total: number; color: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: colors.text }}>{label}</Text>
        <Text style={{ color, fontWeight: '700' }}>
          {n}/{total}
        </Text>
      </Row>
      <ProgressBar value={n / total} color={color} />
    </View>
  );
}
