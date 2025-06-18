import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DataCardProps {
  title: string;
  value: number;
  unit?: string;
}

const DataCard: React.FC<DataCardProps> = ({ title, value, unit }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>
        {value.toFixed(1)}
        {unit && <Text style={styles.unit}> {unit}</Text>}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 14,
    color: '#666',
  },
});

export default DataCard; 