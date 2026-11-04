import React from 'react';
import { Text, View } from 'react-native';
import { colors, font } from '../theme';
import { Badge } from './ui';

export function LabHeader({ title, subtitle, tag, color = colors.cyan }: { title: string; subtitle: string; tag: string; color?: string }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Badge text={tag} color={color} />
      <Text style={[font.h1, { marginTop: 8 }]}>{title}</Text>
      <Text style={[font.body, { marginTop: 4 }]}>{subtitle}</Text>
    </View>
  );
}

export function ControlsRow({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 12 }}>{children}</View>;
}
