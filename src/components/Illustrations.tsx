/** Small decorative vector illustrations for the lab cards (not data). */
import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme';

const W = 120;
const H = 80;

export function FlightArt() {
  return (
    <Svg width={W} height={H} viewBox="0 0 120 80">
      <Line x1={6} y1={70} x2={114} y2={70} stroke={colors.textDim} strokeWidth={1} />
      <Path d="M10 70 Q 60 -10 110 70" stroke={colors.cyan} strokeWidth={2} fill="none" strokeDasharray="4,3" />
      <Path d="M10 70 Q 45 20 80 70" stroke={colors.amber} strokeWidth={2} fill="none" opacity={0.7} />
      <Circle cx={60} cy={30} r={4} fill={colors.text} />
      <Line x1={10} y1={70} x2={26} y2={52} stroke={colors.text} strokeWidth={2} />
    </Svg>
  );
}

export function OrbitArt() {
  return (
    <Svg width={W} height={H} viewBox="0 0 120 80">
      <Defs>
        <LinearGradient id="earth" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#3B82F6" />
          <Stop offset="1" stopColor="#0E3A8A" />
        </LinearGradient>
      </Defs>
      <Ellipse cx={60} cy={40} rx={52} ry={26} stroke={colors.cyan} strokeWidth={1.5} fill="none" strokeDasharray="3,3" />
      <Ellipse cx={60} cy={40} rx={34} ry={34} stroke={colors.violet} strokeWidth={1.2} fill="none" opacity={0.6} />
      <Circle cx={60} cy={40} r={14} fill="url(#earth)" />
      <Circle cx={112} cy={40} r={3.5} fill={colors.text} />
    </Svg>
  );
}

export function RocketArt() {
  return (
    <Svg width={W} height={H} viewBox="0 0 120 80">
      <G>
        <Path d="M60 6 C 70 16 72 32 70 50 L 50 50 C 48 32 50 16 60 6 Z" fill={colors.text} />
        <Circle cx={60} cy={26} r={4} fill={colors.blue} />
        <Path d="M50 40 L 42 54 L 50 52 Z M70 40 L 78 54 L 70 52 Z" fill={colors.cyan} />
        <Path d="M53 50 Q 60 78 67 50 Z" fill={colors.amber} />
        <Path d="M56 50 Q 60 66 64 50 Z" fill="#FDE68A" />
      </G>
      <Line x1={14} y1={74} x2={106} y2={74} stroke={colors.textDim} strokeWidth={1} />
    </Svg>
  );
}

export function AeroArt() {
  return (
    <Svg width={W} height={H} viewBox="0 0 120 80">
      {[18, 30, 52, 64].map((y, i) => (
        <Path key={y} d={`M4 ${y} C 40 ${y + (i < 2 ? -6 : 4)} 80 ${y + (i < 2 ? -8 : 6)} 116 ${y + (i < 2 ? 2 : 8)}`} stroke={colors.cyan} strokeWidth={1.2} fill="none" opacity={0.6} />
      ))}
      <G rotation={8} originX={60} originY={42}>
        <Path d="M26 42 C 40 30 80 30 96 42 C 80 46 40 48 26 42 Z" fill={colors.text} />
      </G>
      <Line x1={60} y1={38} x2={60} y2={12} stroke={colors.green} strokeWidth={2} />
      <Path d="M56 16 L 60 8 L 64 16 Z" fill={colors.green} />
    </Svg>
  );
}

export function ChallengeArt() {
  return (
    <Svg width={W} height={H} viewBox="0 0 120 80">
      <Rect x={20} y={14} width={80} height={52} rx={10} stroke={colors.violet} strokeWidth={1.5} fill="none" />
      <Path d="M36 30 h48 M36 40 h30 M36 50 h40" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={92} cy={60} r={12} fill={colors.green} />
      <Path d="M86 60 l4 4 l8 -8" stroke={colors.bg} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </Svg>
  );
}
