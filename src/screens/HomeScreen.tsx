import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';
import { Screen, Row } from '../components/ui';
import { Logo } from '../components/Icons';
import { colors, font, radius, spacing } from '../theme';

export default function HomeScreen() {
  const spin = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const orbit = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 42000, easing: Easing.linear, useNativeDriver: true }));
    const float = Animated.loop(Animated.sequence([
      Animated.timing(drift, { toValue: 1, duration: 6500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(drift, { toValue: 0, duration: 6500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    orbit.start(); float.start();
    return () => { orbit.stop(); float.stop(); };
  }, [spin, drift]);
  const rotation = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [8, -10] });

  return (
    <Screen>
      <View style={styles.hero}>
        <UniverseBackdrop rotation={rotation} translateY={translateY} />
        <View style={styles.content}>
          <Row style={{ alignItems: 'center', gap: 12 }}>
            <Logo size={48} />
            <View>
              <Text style={styles.brand}>AeroLearn</Text>
              <Text style={styles.eyebrow}>SCIENCE · FLIGHT · THE COSMOS</Text>
            </View>
          </Row>
          <View style={{ flex: 1, justifyContent: 'center', paddingTop: 54, paddingBottom: 42 }}>
            <Text style={styles.kicker}>YOUR UNIVERSE OF DISCOVERY</Text>
            <Text style={styles.headline}>Understand the science.{"\n"}Explore the sky.</Text>
            <Text style={styles.description}>AeroLearn is an interactive aerospace laboratory. Experiment with the forces that shape flight, explore gravity and magnetism, and discover the worlds and systems beyond Earth.</Text>
            <View style={styles.rule} />
            <Text style={styles.footerLabel}>FROM THE LAWS OF PHYSICS TO THE EDGE OF SPACE</Text>
          </View>
          <Text style={styles.bottom}>WELCOME TO AEROLEARN</Text>
        </View>
      </View>
    </Screen>
  );
}

function UniverseBackdrop({ rotation, translateY }: { rotation: Animated.AnimatedInterpolation<string>; translateY: Animated.AnimatedInterpolation<number> }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 390 760" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="spaceBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#17283B" />
            <Stop offset="0.48" stopColor="#171B20" />
            <Stop offset="1" stopColor="#30271D" />
          </LinearGradient>
          <LinearGradient id="planetFill" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#D7B783" />
            <Stop offset="0.48" stopColor="#8C6948" />
            <Stop offset="1" stopColor="#293D52" />
          </LinearGradient>
        </Defs>
        <Path d="M0 0H390V760H0Z" fill="url(#spaceBg)" />
        {[...Array(76)].map((_, i) => <Circle key={i} cx={(i * 73 + 13) % 390} cy={(i * 131 + 19) % 760} r={i % 9 === 0 ? 1.5 : i % 3 === 0 ? 1 : 0.55} fill="#F5E9D2" opacity={0.22 + (i % 5) * 0.09} />)}
        <Ellipse cx="198" cy="330" rx="168" ry="62" transform="rotate(-24 198 330)" fill="none" stroke="#9AB4C7" strokeOpacity="0.18" strokeWidth="1.2" />
        <Ellipse cx="198" cy="330" rx="220" ry="92" transform="rotate(-24 198 330)" fill="none" stroke="#D3AD76" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="3 8" />
        <Circle cx="198" cy="330" r="105" fill="#D6AD70" opacity="0.055" />
        <Circle cx="198" cy="330" r="76" fill="url(#planetFill)" />
        <Path d="M139 302 Q194 276 256 296 M127 337 Q198 313 267 334 M147 368 Q202 348 248 365" fill="none" stroke="#F0D6A8" strokeOpacity="0.22" strokeWidth="7" />
        <Circle cx="305" cy="185" r="25" fill="#5C7892" opacity="0.75" />
        <Circle cx="298" cy="177" r="7" fill="#A9C2D0" opacity="0.24" />
        <Circle cx="76" cy="505" r="13" fill="#B88D62" opacity="0.7" />
        <Path d="M0 570 Q120 520 230 585 T390 560V760H0Z" fill="#101519" opacity="0.55" />
      </Svg>
      <Animated.View style={{ position: 'absolute', width: 320, height: 320, left: '8%', top: '27%', transform: [{ rotate: rotation }, { translateY }] }}>
        <Svg width="100%" height="100%" viewBox="0 0 320 320">
          <Ellipse cx="160" cy="160" rx="145" ry="52" fill="none" stroke="#D6AD70" strokeOpacity="0.42" strokeWidth="1.2" />
          <Circle cx="304" cy="160" r="5" fill="#D6AD70" />
          <Circle cx="16" cy="160" r="3" fill="#72AFCB" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, minHeight: 650, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgElevated },
  content: { flex: 1, padding: spacing.xl, justifyContent: 'space-between' },
  brand: { color: colors.text, fontSize: 25, fontWeight: '900', letterSpacing: 0.4 },
  eyebrow: { color: colors.amber, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginTop: 3 },
  kicker: { color: colors.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 2.1, marginBottom: 14 },
  headline: { color: colors.text, fontSize: 34, lineHeight: 41, fontWeight: '900', letterSpacing: -0.8 },
  description: { color: '#E0DED6', fontSize: 15, lineHeight: 24, marginTop: 18, maxWidth: 320 },
  rule: { width: 68, height: 3, backgroundColor: colors.amber, marginTop: 26, borderRadius: 3 },
  footerLabel: { color: '#C5C9C8', fontSize: 9, fontWeight: '800', letterSpacing: 1.25, marginTop: 14 },
  bottom: { color: colors.amber, fontSize: 9, fontWeight: '800', letterSpacing: 2, textAlign: 'center' },
});
