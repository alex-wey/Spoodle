import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>⚠️ App Error</Text>
            <Text style={styles.subtitle}>Something went wrong</Text>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Error Message:</Text>
              <Text style={styles.errorText}>
                {this.state.error?.toString() || 'Unknown error'}
              </Text>
            </View>

            {this.state.error?.stack && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Stack Trace:</Text>
                <Text style={styles.stackText}>
                  {this.state.error.stack}
                </Text>
              </View>
            )}

            {this.state.errorInfo && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Component Stack:</Text>
                <Text style={styles.stackText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#d32f2f',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    fontFamily: 'monospace',
  },
  stackText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ErrorBoundary;

