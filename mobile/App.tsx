import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

interface Summary {
  monthly_spending: number;
  daily_target: number;
  savings_forecast: number;
}

export default function App() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/insights/summary')
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Risparmio — Dashboard</Text>
      {summary && (
        <>
          <Text>Spesa mensile: {summary.monthly_spending}€</Text>
          <Text>Target giornaliero: {summary.daily_target}€</Text>
          <Text>Forecast risparmio: {summary.savings_forecast}€</Text>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
