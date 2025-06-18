import { StyleSheet, Text, View, ScrollView } from 'react-native';

type Workout = {
  activityName: string;
  calories: number;
  sourceName: string;
  workoutEventType: string;
  startDate: string;
  endDate: string;
};

type WorkoutListProps = {
  workouts: Workout[];
};

const WorkoutList = ({ workouts }: WorkoutListProps) => {
  if (workouts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noWorkouts}>No workouts for this day</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {workouts.map((workout, index) => (
        <View key={index} style={styles.workoutCard}>
          <Text style={styles.activityName}>{workout.activityName}</Text>
          <View style={styles.details}>
            <Text style={styles.detailText}>Calories: {workout.calories.toFixed(0)} kcal</Text>
            <Text style={styles.detailText}>Source: {workout.sourceName}</Text>
            <Text style={styles.detailText}>Type: {workout.workoutEventType}</Text>
            <Text style={styles.detailText}>Time: {workout.startDate} - {workout.endDate}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  noWorkouts: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  workoutCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
  },
  activityName: {
    color: '#C3FF53',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  details: {
    gap: 5,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default WorkoutList; 