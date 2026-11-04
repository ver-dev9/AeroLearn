import React, { Component, ReactNode } from 'react';
import { Text, View } from 'react-native';
import { colors, font } from '../theme';
import { Button } from './ui';

interface State {
  error: Error | null;
}

/** Catches render errors so one faulty screen never crashes the whole app. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.warn('AeroLearn error boundary:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24 }}>
        <Text style={font.h2}>Something went wrong</Text>
        <Text style={[font.body, { marginVertical: 12 }]}>{this.state.error.message}</Text>
        <Button title="Try again" onPress={() => this.setState({ error: null })} />
      </View>
    );
  }
}
