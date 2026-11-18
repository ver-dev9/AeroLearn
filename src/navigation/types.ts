import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Labs: undefined;
  Learn: undefined;
  Challenges: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  FlightLab: { preset?: Record<string, number> } | undefined;
  OrbitExplorer: { preset?: Record<string, number> } | undefined;
  RocketLab: { preset?: Record<string, number | boolean> } | undefined;
  AeroLab: { preset?: Record<string, number> } | undefined;
  Lesson: { id: string };
  Challenge: { id: string };
  AstronomyExplorer: undefined;
};
