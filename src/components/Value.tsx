import { StyleSheet, Text, View } from 'react-native';

type ValueProps = {
  label: string;
  value: string | number;
  unit?: string;
};

const Value = ({ label, value, unit }: ValueProps) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>
      {typeof value === 'number' ? value.toLocaleString() : value}
      {unit ? ` ${unit}` : ''}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    minWidth: 100,
    alignItems: 'center',
    marginVertical: 5,
  },
  label: {
    color: '#C3FF53',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  value: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Value;