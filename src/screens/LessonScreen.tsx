import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Equation, Screen, SectionTitle, Badge, Row } from '../components/ui';
import { LessonDiagram } from '../components/Diagrams';
import { colors, font, radius } from '../theme';
import { getLesson, LESSONS } from '../data/lessons';
import { useProgress } from '../store/progress';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Lesson'>;

export default function LessonScreen({ route, navigation }: Props) {
  const lesson = getLesson(route.params.id);
  const { state, openLesson, completeLesson, recordLessonCheck } = useProgress();
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    if (lesson) openLesson(lesson.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  useEffect(() => {
    if (lesson) navigation.setOptions({ title: lesson.title });
  }, [lesson, navigation]);

  if (!lesson) {
    return (
      <Screen>
        <Text style={font.h2}>Lesson not found</Text>
      </Screen>
    );
  }

  const allCorrect = lesson.checks.every((c, i) => answers[i] === c.correct);
  const complete = state.completedLessons.includes(lesson.id);
  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  const next = LESSONS[idx + 1];

  return (
    <Screen>
      <Badge text={`LESSON ${idx + 1} · ${lesson.minutes} MIN`} />
      <Text style={[font.h1, { marginTop: 8 }]}>{lesson.title}</Text>
      <Text style={[font.body, { marginBottom: 16 }]}>{lesson.subtitle}</Text>

      <LessonDiagram kind={lesson.diagram} />

      {lesson.sections.map((s) => (
        <View key={s.heading} style={{ marginBottom: 14 }}>
          <Text style={[font.h3, { marginBottom: 4 }]}>{s.heading}</Text>
          <Text style={font.body}>{s.body}</Text>
        </View>
      ))}

      <SectionTitle title="Key equations" />
      {lesson.equations.map((e) => (
        <Equation key={e.eq} caption={e.caption}>
          {e.eq}
        </Equation>
      ))}

      <SectionTitle title="Worked example" />
      <Card accent={colors.amber}>
        <Text style={[font.body, { color: colors.text }]}>{lesson.example.problem}</Text>
        {lesson.example.steps.map((s, i) => (
          <Text key={i} style={[font.small, { marginTop: 6, fontFamily: 'monospace', color: colors.textMuted }]}>
            {i + 1}. {s}
          </Text>
        ))}
        <Text style={{ color: colors.amber, fontWeight: '800', marginTop: 10, fontSize: 16 }}>{lesson.example.answer}</Text>
      </Card>

      <SectionTitle title="Knowledge check" />
      {lesson.checks.map((c, qi) => {
        const chosen = answers[qi];
        const answered = chosen !== undefined;
        return (
          <Card key={qi}>
            <Text style={[font.body, { color: colors.text, marginBottom: 10 }]}>{c.q}</Text>
            {c.options.map((o, oi) => {
              const isChosen = chosen === oi;
              const isRight = oi === c.correct;
              const bg = answered && isChosen ? (isRight ? colors.green + '22' : colors.red + '22') : colors.bgElevated;
              const border = answered && isChosen ? (isRight ? colors.green : colors.red) : colors.border;
              return (
                <Pressable
                  key={oi}
                  onPress={() => {
                    setAnswers((a) => ({ ...a, [qi]: oi }));
                    recordLessonCheck(`${lesson.id}:${qi}`, oi === c.correct);
                  }}
                  style={{ padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: border, backgroundColor: bg, marginBottom: 8 }}
                  accessibilityRole="button"
                >
                  <Text style={{ color: colors.text }}>{o}</Text>
                </Pressable>
              );
            })}
            {answered ? (
              <Text style={{ color: chosen === c.correct ? colors.green : colors.amber, marginTop: 4 }}>
                {chosen === c.correct ? 'Correct. ' : 'Not quite — try another option. '}
                {chosen === c.correct ? c.why : ''}
              </Text>
            ) : null}
          </Card>
        );
      })}

      {complete ? (
        <Card accent={colors.green}>
          <Text style={{ color: colors.green, fontWeight: '700' }}>Lesson completed</Text>
        </Card>
      ) : (
        <Button title={allCorrect ? 'Mark lesson complete' : 'Answer the checks correctly to complete'} onPress={() => completeLesson(lesson.id)} disabled={!allCorrect} style={{ marginTop: 8 }} />
      )}

      <Row style={{ marginTop: 12 }}>
        {lesson.relatedLab ? <Button title="Try it in the lab" kind="ghost" onPress={() => navigation.navigate(lesson.relatedLab!)} style={{ flex: 1 }} /> : null}
        {next ? <Button title="Next lesson →" kind="secondary" onPress={() => navigation.replace('Lesson', { id: next.id })} style={{ flex: 1 }} /> : null}
      </Row>
    </Screen>
  );
}
