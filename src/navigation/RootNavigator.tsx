import React from 'react';
import { DarkTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';
import type { RootStackParamList, TabParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import LabsScreen from '../screens/LabsScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FlightLabScreen from '../screens/FlightLabScreen';
import OrbitExplorerScreen from '../screens/OrbitExplorerScreen';
import RocketLabScreen from '../screens/RocketLabScreen';
import AeroLabScreen from '../screens/AeroLabScreen';
import LessonScreen from '../screens/LessonScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
import AstronomyExplorerScreen from '../screens/AstronomyExplorerScreen';
import RocketGalleryScreen from '../screens/RocketGalleryScreen';
import { HomeIcon, LabIcon, TargetIcon, UserIcon } from '../components/Icons';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const theme: Theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bgElevated, text: colors.text, border: colors.border, primary: colors.cyan, notification: colors.amber },
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.cyan,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: { backgroundColor: colors.bgElevated, borderTopColor: colors.border, height: 64, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <HomeIcon color={color} /> }} />
      <Tab.Screen name="Labs" component={LabsScreen} options={{ tabBarIcon: ({ color }) => <LabIcon color={color} /> }} />
      <Tab.Screen name="Challenges" component={ChallengesScreen} options={{ tabBarIcon: ({ color }) => <TargetIcon color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <UserIcon color={color} /> }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="FlightLab" component={FlightLabScreen} options={{ title: 'Flight Lab' }} />
        <Stack.Screen name="OrbitExplorer" component={OrbitExplorerScreen} options={{ title: 'Orbit Explorer' }} />
        <Stack.Screen name="RocketLab" component={RocketLabScreen} options={{ title: 'Rocket Lab' }} />
        <Stack.Screen name="AeroLab" component={AeroLabScreen} options={{ title: 'Aerodynamics Lab' }} />
        <Stack.Screen name="Lesson" component={LessonScreen} options={{ title: 'Lesson' }} />
        <Stack.Screen name="Challenge" component={ChallengeScreen} options={{ title: 'Challenge' }} />
        <Stack.Screen name="AstronomyExplorer" component={AstronomyExplorerScreen} options={{ title: 'Astronomy Atlas' }} />
        <Stack.Screen name="RocketGallery" component={RocketGalleryScreen} options={{ title: 'Rocket Hangar' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
