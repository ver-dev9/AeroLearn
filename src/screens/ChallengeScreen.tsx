import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Badge, Button, Card, Equation, Row, Screen, SectionTitle } from '../components/ui';
import { colors, font, radius } from '../theme';
import { CHALLENGES, checkNumeric, TOPIC_LABEL } from '../data/challenges';
import { parseNumber } from '../physics/validation';
import { fmt } from '../utils/format';
import { useProgress } from '../store/progress';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Challenge'>;

export default function ChallengeScreen({ route, navigation }: Props) {
  const c = CHALLENGES.find((x) => x.id === route.params.id);
  const { state, recordChallenge } = useProgress();
  const [text, setText] = useState('');
  const [choice, setChoice] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  if (!c) {
    return (
      <Screen>
        <Text style={font.h2}>Challenge not found</Text>
      </Screen>
    );
  }
  const solvedBefore = state.solvedChallenges.includes(c.id);
  const history = state.challengeHistory.filter((a) => a.challengeId === c.id);

  const submit = () => {
    if (c.kind === 'numeric') {
      const n = parseNumber(text);
      if (n === null) {
        setInputError('Enter a number (e.g. 63.7 or 6.4e3).');
        return;
      }
      setInputError(null);
      const ok = checkNumeric(c, n);
      setResult(ok ? 'correct' : 'wrong');
      recordChallenge(c.id, `${n} ${c.unit}`, ok);
      if (ok) setRevealed(true);
    } else {
      if (choice === null) return;
      const ok = choice === c.correctIndex;
      setResult(ok ? 'correct' : 'wrong');
      recordChallenge(c.id, c.options[choice], ok);
      if (ok) setRevealed(true);
    }
  };

  const idx = CHALLENGES.findIndex((x) => x.id === c.id);
  const next = CHALLENGES[idx + 1];

  return (
    <Screen>
      <Row>
        <Badge text={TOPIC_LABEL[c.topic].toUpperCase()} color={colors.violet} />
        <Badge text={`DIFFICULTY ${c.difficulty}/3`} color={colors.textMuted} />
        {solvedBefore ? <Badge text="SOLVED" color={colors.green} /> : null}
      </Row>
      <Text style={[font.h1, { marginTop: 8 }]}>{c.title}</Text>
      <Card style={{ marginTop: 12 }}>
        <Text style={[font.body, { color: colors.text }]}>{c.prompt}</Text>
      </Card>

      {c.kind === 'numeric' ? (
        <Card>
          <Text style={[font.label, { marginBottom: 8 }]}>Your answer</Text>
          <Row>
            <TextInput
              value={text}
              onChangeText={(t) => {
                setText(t);
                setResult(null);
              }}
              placeholder="e.g. 63.7"
              placeholderTextColor={colors.textDim}
              keyboardType="numeric"
              style={{ flex: 1, color: colors.text, fontSize: 18, fontWeight: '700', borderWidth: 1, borderColor: inputError ? colors.red : colors.border, borderRadius: radius.md, paddingHorizontal: 12, height: 50, backgroundColor: colors.bgElevated }}
              onSubmitEditing={submit}
              returnKeyType="done"
            />
            {c.unit ? <Text style={{ color: colors.textMuted, fontSize: 16 }}>{c.unit}</Text> : null}
          </Row>
          {inputError ? <Text style={{ color: colors.red, marginTop: 6 }}>{inputError}</Text> : null}
          <Text style={[font.small, { marginTop: 8, color: colors.textDim }]}>Answers within ±{Math.round(c.tolerance * 100)} % are accepted, to allow for rounding.</Text>
        </Card>
      ) : (
        <Card>
          {c.options.map((o, i) => {
            const on = choice === i;
            const showRight = result !== null && on;
            return (
              <Pressable
                key={i}
                onPress={() => {
                  setChoice(i);
                  setResult(null);
                }}
                style={{
                  padding: 14,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  marginBottom: 8,
                  borderColor: showRight ? (result === 'correct' ? colors.green : colors.red) : on ? colors.cyan : colors.border,
                  backgroundColor: on ? colors.cyanSoft : colors.bgElevated,
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
              >
                <Text style={{ color: colors.text }}>
                  {String.fromCharCode(65 + i)}.  {o}
                </Text>
              </Pressable>
            );
          })}
        </Card>
      )}

      <Button title="Submit answer" onPress={submit} disabled={c.kind === 'mcq' ? choice === null : !text.trim()} />

      {result === 'correct' ? (
        <Card accent={colors.green} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.green, fontWeight: '800', fontSize: 16 }}>Correct — well reasoned.</Text>
        </Card>
      ) : null}
      {result === 'wrong' ? (
        <Card accent={colors.amber} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.amber, fontWeight: '800', fontSize: 16 }}>Not yet.</Text>
          <Text style={[font.small, { marginTop: 4 }]}>Check your units and which equation applies. Try again, or reveal the full solution to learn from it.</Text>
          {!revealed ? <Button title="Show solution" kind="ghost" onPress={() => setRevealed(true)} style={{ marginTop: 10 }} /> : null}
        </Card>
      ) : null}

      {revealed || solvedBefore ? (
        <>
          <SectionTitle title="Solution" />
          {c.kind === 'numeric' ? (
            <Card>
              <Text style={font.label}>Answer</Text>
              <Text style={{ color: colors.cyan, fontSize: 22, fontWeight: '800', marginTop: 4 }}>
                {fmt(c.answer, c.answer < 1 ? 4 : c.answer < 100 ? 2 : 0)} {c.unit}
              </Text>
            </Card>
          ) : (
            <Card>
              <Text style={font.label}>Answer</Text>
              <Text style={{ color: colors.cyan, fontSize: 18, fontWeight: '800', marginTop: 4 }}>
                {String.fromCharCode(65 + c.correctIndex)}. {c.options[c.correctIndex]}
              </Text>
            </Card>
          )}
          {c.equations.map((e) => (
            <Equation key={e}>{e}</Equation>
          ))}
          <Card>
            <Text style={font.body}>{c.explanation}</Text>
          </Card>
        </>
      ) : null}

      {history.length ? (
        <>
          <SectionTitle title="Your attempts" />
          <Card>
            {history.slice(0, 6).map((h, i) => (
              <View key={h.at + i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text style={{ color: h.correct ? colors.green : colors.textMuted }}>
                  {h.correct ? '✓' : '✗'} {h.answer}
                </Text>
                <Text style={[font.small, { color: colors.textDim }]}>{new Date(h.at).toLocaleString()}</Text>
              </View>
            ))}
          </Card>
        </>
      ) : null}

      {next ? <Button title="Next challenge →" kind="secondary" onPress={() => navigation.replace('Challenge', { id: next.id })} style={{ marginTop: 12 }} /> : null}
    </Screen>
  );
}
