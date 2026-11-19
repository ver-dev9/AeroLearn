import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Card, ProgressBar, Screen, SectionTitle, Badge, Row } from '../components/ui';
import { Logo } from '../components/Icons';
import { AeroArt, ChallengeArt, FlightArt, OrbitArt, RocketArt } from '../components/Illustrations';
import { colors, font, radius, spacing } from '../theme';
import { useProgress, LabId } from '../store/progress';
import { LESSONS } from '../data/lessons';
import { CHALLENGES, dailyChallenge, TOPIC_LABEL } from '../data/challenges';
import { BADGES } from '../data/badges';
import { dayOfYear, relativeDate } from '../utils/format';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const LAB_CARDS: { id: LabId | 'challenges'; route: keyof RootStackParamList | 'Challenges'; title: string; desc: string; color: string; Art: () => React.ReactElement }[] = [
  { id: 'flight', route: 'FlightLab', title: 'Flight Lab', desc: 'Projectile motion with exact analytic solutions.', color: colors.cyan, Art: FlightArt },
  { id: 'rocket', route: 'RocketLab', title: 'Rocket Lab', desc: 'Variable-mass rocket with thrust, gravity and drag.', color: colors.amber, Art: RocketArt },
  { id: 'orbit', route: 'OrbitExplorer', title: 'Orbit Explorer', desc: 'Numerically integrated two-body orbits.', color: colors.amber, Art: OrbitArt },
  { id: 'aero', route: 'AeroLab', title: 'Aerodynamics Lab', desc: 'Lift, drag and the four forces of flight.', color: colors.green, Art: AeroArt },
  { id: 'challenges', route: 'Challenges', title: 'Aerospace Challenges', desc: 'Solve problems and see the full reasoning.', color: colors.blue, Art: ChallengeArt },
];

const LAB_NAMES: Record<LabId, string> = { flight: 'Flight Lab', orbit: 'Orbit Explorer', rocket: 'Rocket Lab', aero: 'Aerodynamics Lab' };

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const { state } = useProgress();
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fade]);

  const go = (route: string) => {
    if (route === 'Challenges') nav.navigate('Tabs', { screen: 'Challenges' });
    else nav.navigate(route as 'FlightLab');
  };

  const daily = dailyChallenge(dayOfYear());
  const dailyDone = state.solvedChallenges.includes(daily.id);
  const lessonsPct = state.completedLessons.length / LESSONS.length;
  const challengesPct = state.solvedChallenges.length / CHALLENGES.length;
  const labsPct = Object.values(state.labRunCounts).filter((n) => n > 0).length / 4;
  const overall = (lessonsPct + challengesPct + labsPct) / 3;
  const earned = BADGES.filter((b) => b.progress(state) >= 1).length;

  return (
    <Screen>
      <Animated.View style={{ opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
        <View style={styles.hero}>
          <HeroBackdrop />
          <Row>
            <Logo size={44} />
            <View>
              <Text style={styles.brand}>AeroLearn</Text>
              <Text style={styles.tagline}>Explore Beyond the Horizon.</Text>
            </View>
          </Row>
          <Text style={[font.h2, { marginTop: spacing.xl }]}>Welcome back, {state.profileName}.</Text>
          <Text style={[font.body, { marginTop: 4 }]}>Your aerospace laboratory is ready. Change a parameter, run the model, and see the mathematics behind it.</Text>
          <View style={{ marginTop: spacing.lg }}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={font.label}>Overall progress</Text>
              <Text style={{ color: colors.cyan, fontWeight: '700' }}>{Math.round(overall * 100)}%</Text>
            </Row>
            <ProgressBar value={overall} />
          </View>
        </View>
      </Animated.View>

      <SectionTitle title="Featured simulations" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 8 }} style={{ marginHorizontal: -4 }}>
        {LAB_CARDS.map((c) => (
          <Pressable key={c.id} onPress={() => go(c.route)} style={({ pressed }) => [styles.labCard, { borderColor: c.color + '55', opacity: pressed ? 0.85 : 1 }]} accessibilityRole="button" accessibilityLabel={`Open ${c.title}`}>
            <View style={[styles.artWrap, { backgroundColor: c.color + '12' }]}>
              <c.Art />
            </View>
            <Text style={[font.h3, { marginTop: 10 }]}>{c.title}</Text>
            <Text style={[font.small, { marginTop: 4 }]} numberOfLines={2}>
              {c.desc}
            </Text>
            <Text style={{ color: c.color, fontWeight: '700', marginTop: 10 }}>Open →</Text>
          </Pressable>
        ))}
      </ScrollView>

      <SectionTitle title="Rocket hangar" />
      <Card onPress={() => nav.navigate('RocketGallery')} accent={colors.amber}>
        <Row style={{ alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.amber + '12', borderRadius: 14, padding: 8 }}><RocketArt /></View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Badge text="NASA 3D COLLECTION" color={colors.amber} />
            <Text style={[font.h3, { marginTop: 7 }]}>Explore real launch vehicles</Text>
            <Text style={[font.small, { marginTop: 3 }]}>Rotate the Saturn V and Space Shuttle, then inspect their stages and systems.</Text>
            <Text style={{ color: colors.amber, fontWeight: '700', marginTop: 8 }}>Enter the hangar →</Text>
          </View>
        </Row>
      </Card>

      <SectionTitle title="Daily challenge" />
      <Card onPress={() => nav.navigate('Challenge', { id: daily.id })} accent={colors.violet}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Badge text={TOPIC_LABEL[daily.topic].toUpperCase()} color={colors.violet} />
          {dailyDone ? <Badge text="SOLVED" color={colors.green} /> : <Badge text={'●'.repeat(daily.difficulty) + '○'.repeat(3 - daily.difficulty)} color={colors.textMuted} />}
        </Row>
        <Text style={[font.h3, { marginTop: 8 }]}>{daily.title}</Text>
        <Text style={[font.small, { marginTop: 4 }]} numberOfLines={3}>
          {daily.prompt}
        </Text>
        <Text style={{ color: colors.violet, fontWeight: '700', marginTop: 10 }}>{dailyDone ? 'Review solution →' : 'Take your time and solve it →'}</Text>
      </Card>

      <SectionTitle title="Mission progress" action="Profile" onAction={() => nav.navigate('Tabs', { screen: 'Profile' })} />
      <Card>
        <ProgressRow label="Lessons" value={lessonsPct} text={`${state.completedLessons.length}/${LESSONS.length}`} color={colors.cyan} />
        <ProgressRow label="Challenges solved" value={challengesPct} text={`${state.solvedChallenges.length}/${CHALLENGES.length}`} color={colors.violet} />
        <ProgressRow label="Labs explored" value={labsPct} text={`${Math.round(labsPct * 4)}/4`} color={colors.amber} />
        <Text style={[font.small, { marginTop: 4 }]}>
          {earned} of {BADGES.length} achievement badges earned
        </Text>
      </Card>

      <SectionTitle title="Recent experiments" />
      {state.simRuns.length === 0 ? (
        <Card>
          <Text style={font.small}>No experiments yet. Open a lab above and run your first simulation.</Text>
        </Card>
      ) : (
        <Card>
          {state.simRuns.slice(0, 5).map((r, i) => (
            <Pressable key={r.at + i} onPress={() => go(LAB_CARDS.find((c) => c.id === r.lab)!.route)} style={[styles.runRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>{LAB_NAMES[r.lab]}</Text>
                <Text style={font.small} numberOfLines={1}>
                  {r.summary}
                </Text>
              </View>
              <Text style={[font.small, { color: colors.textDim }]}>{relativeDate(r.at)}</Text>
            </Pressable>
          ))}
        </Card>
      )}
    </Screen>
  );
}

function ProgressRow({ label, value, text, color }: { label: string; value: number; text: string; color: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: colors.text }}>{label}</Text>
        <Text style={{ color, fontWeight: '700' }}>{text}</Text>
      </Row>
      <ProgressBar value={value} color={color} />
    </View>
  );
}

function HeroBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 360 260" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="hero" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#292319" />
            <Stop offset="1" stopColor="#171510" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={360} height={260} fill="url(#hero)" />
        <Path d="M-20 240 Q 180 -60 400 200" stroke={colors.cyan} strokeOpacity={0.18} strokeWidth={1.5} fill="none" />
        <Path d="M-20 260 Q 200 0 400 240" stroke={colors.amber} strokeOpacity={0.10} strokeWidth={1} fill="none" strokeDasharray="4,6" />
        {[...Array(18)].map((_, i) => (
          <Circle key={i} cx={(i * 71) % 360} cy={(i * 37 + 11) % 200} r={i % 4 === 0 ? 1.2 : 0.7} fill="#fff" opacity={0.3} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.xl, overflow: 'hidden', padding: spacing.xl, borderWidth: 1, borderColor: colors.border, marginTop: spacing.sm },
  brand: { color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  tagline: { color: colors.cyan, fontSize: 12, fontWeight: '600', marginTop: 2 },
  labCard: { width: 220, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginLeft: 4 },
  artWrap: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  runRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
});
