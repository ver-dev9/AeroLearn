import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect, Line, G } from 'react-native-svg';
import { colors } from '../theme';

type P = { size?: number; color?: string };

export const HomeIcon = ({ size = 24, color = colors.text }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
  </Svg>
);
export const LabIcon = ({ size = 24, color = colors.text }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M7 15h10" stroke={color} strokeWidth={1.8} />
  </Svg>
);
export const BookIcon = ({ size = 24, color = colors.text }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M4 19a2 2 0 0 1 2-2h13v4H6a2 2 0 0 1-2-2z" stroke={color} strokeWidth={1.8} />
  </Svg>
);
export const TargetIcon = ({ size = 24, color = colors.text }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
    <Circle cx={12} cy={12} r={5} stroke={color} strokeWidth={1.8} />
    <Circle cx={12} cy={12} r={1.5} fill={color} />
  </Svg>
);
export const UserIcon = ({ size = 24, color = colors.text }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
    <Path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);
export const PlayIcon = ({ size = 18, color = colors.bg }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M7 4.5v15l12-7.5z" fill={color} />
  </Svg>
);
export const PauseIcon = ({ size = 18, color = colors.bg }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x={6} y={4.5} width={4} height={15} rx={1} fill={color} />
    <Rect x={14} y={4.5} width={4} height={15} rx={1} fill={color} />
  </Svg>
);
export const ResetIcon = ({ size = 18, color = colors.text }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
export const SaveIcon = ({ size = 18, color = colors.cyan }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 3h10l4 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke={color} strokeWidth={1.8} />
    <Path d="M8 3v5h7V3M8 21v-6h8v6" stroke={color} strokeWidth={1.8} />
  </Svg>
);
export const CheckIcon = ({ size = 18, color = colors.green }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12.5l4.5 4.5L19 7" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/** AeroLearn mark: an orbit ellipse crossed by a rising trajectory. */
export const Logo = ({ size = 40 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect x={1} y={1} width={46} height={46} rx={14} fill={colors.bgElevated} stroke={colors.cyan + '66'} />
    <G rotation={-25} originX={24} originY={24}>
      <Ellipse cx={24} cy={24} rx={17} ry={7} stroke={colors.cyan} strokeWidth={1.8} fill="none" />
    </G>
    <Circle cx={24} cy={24} r={5} fill={colors.blue} />
    <Path d="M10 37 Q 22 4 38 13" stroke={colors.text} strokeWidth={2.2} fill="none" strokeLinecap="round" />
    <Circle cx={38} cy={13} r={2.6} fill={colors.text} />
    <Line x1={8} y1={40} x2={40} y2={40} stroke={colors.textDim} strokeWidth={1} />
  </Svg>
);
