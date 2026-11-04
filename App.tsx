import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { ProgressProvider } from './src/store/progress';
import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ProgressProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </ProgressProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
