import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import useHealthData from './src/hooks/useHealthData';
import Value from './src/components/Value';
import WorkoutList from './src/components/WorkoutList';
import DataCard from './src/components/DataCard';

export default function App() {
  const [date, setDate] = useState(new Date());
  const { 
    steps, 
    flights, 
    distance, 
    weight, 
    sleep, 
    caloriesBurned, 
    BMI, 
    workouts, 
    bloodGlucose,
    bodyFat,
    muscleMass,
    refreshData
  } = useHealthData(date);

  const changeDate = (numDays: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    setDate(newDate);
  };

	console.log(`Steps: ${steps} | Distance: ${distance}m | Flights: ${flights} | Weight: ${weight}kg | Sleep: ${sleep.totalTimeAsleep / 60}h | Calories: ${caloriesBurned}`);
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="light" />
      
      <Text style={styles.title}>Health Activity</Text>

      <View style={styles.datePicker}>
        <AntDesign
          onPress={() => changeDate(-1)}
          name="left"
          size={24}
          color="#C3FF53"
        />
        <Text style={styles.date}>{date.toDateString()}</Text>

        <AntDesign
          onPress={() => changeDate(1)}
          name="right"
          size={24}
          color="#C3FF53"
        />
        <AntDesign
          onPress={refreshData}
          name="reload1"
          size={24}
          color="#C3FF53"
          style={{ marginLeft: 20 }}
        />
      </View>

      <View style={styles.dataContainer}>
        <DataCard title="Steps" value={steps.value} />
        <DataCard title="Flights" value={flights.value} />
        <DataCard title="Distance" value={distance.value} unit="km" />
        <DataCard title="Weight" value={weight.value} unit="kg" />
        <DataCard title="Sleep" value={sleep.totalTimeAsleep / 60} unit="hrs" />
        <DataCard title="Calories" value={caloriesBurned.value} />
        <DataCard title="BMI" value={BMI.value} unit="" />
        <DataCard 
          title="Blood Glucose" 
          value={bloodGlucose.value} 
          unit={bloodGlucose.unit}
        />
        <DataCard 
          title="Body Fat" 
          value={bodyFat.value} 
          unit={bodyFat.unit}
        />
        <DataCard 
          title="Muscle Mass" 
          value={muscleMass.value} 
          unit={muscleMass.unit}
        />
      </View>

      <View style={styles.messagesContainer}>
        {(steps.message || flights.message || distance.message || weight.message || 
          caloriesBurned.message || BMI.message || bloodGlucose.message || 
          bodyFat.message || muscleMass.message) && (
          <View style={styles.messageBox}>
            {steps.message && (
              <Text style={styles.messageText}>{steps.message}</Text>
            )}
            {flights.message && (
              <Text style={styles.messageText}>{flights.message}</Text>
            )}
            {distance.message && (
              <Text style={styles.messageText}>{distance.message}</Text>
            )}
            {weight.message && (
              <Text style={styles.messageText}>{weight.message}</Text>
            )}
            {caloriesBurned.message && (
              <Text style={styles.messageText}>{caloriesBurned.message}</Text>
            )}
            {BMI.message && (
              <Text style={styles.messageText}>{BMI.message}</Text>
            )}
            {bloodGlucose.message && (
              <Text style={styles.messageText}>{bloodGlucose.message}</Text>
            )}
            {bodyFat.message && (
              <Text style={styles.messageText}>{bodyFat.message}</Text>
            )}
            {muscleMass.message && (
              <Text style={styles.messageText}>{muscleMass.message}</Text>
            )}
          </View>
        )}
      </View>

      {bloodGlucose.value > 0 && (
        <View style={styles.bloodGlucoseContainer}>
          <Text style={styles.bloodGlucoseTime}>
            Last reading: {bloodGlucose.date}
          </Text>
        </View>
      )}

      <View style={styles.workoutContainer}>
        <Text style={styles.workoutTitle}>Workouts</Text>
        {workouts.length > 0 ? (
          workouts.map((workout, index) => (
            <View key={index} style={styles.workoutCard}>
              <Text style={styles.workoutName}>{workout.activityName}</Text>
              <Text style={styles.workoutTime}>
                {workout.startDate} - {workout.endDate}
              </Text>
              <Text>Calories: {workout.calories.toFixed(0)}</Text>
              <Text>Source: {workout.sourceName}</Text>
              <Text>Duration: {workout.duration} min</Text>
              {workout.heartRate.average > 0 && (
                <View style={styles.heartRateContainer}>
                  <Text>Heart Rate:</Text>
                  <Text>Avg: {workout.heartRate.average.toFixed(0)} bpm</Text>
                  <Text>Min: {workout.heartRate.min.toFixed(0)} bpm</Text>
                  <Text>Max: {workout.heartRate.max.toFixed(0)} bpm</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noWorkouts}>No workouts recorded</Text>
        )}
      </View>

      <View style={styles.sleepContainer}>
        <Text style={styles.sleepTitle}>Sleep Timeline</Text>
        {sleep.timeline.length > 0 ? (
          sleep.timeline.map((entry, index) => (
            <View key={index} style={styles.sleepCard}>
              <Text style={styles.sleepState}>{entry.state}</Text>
              <Text>Start: {entry.startTime}</Text>
              <Text>End: {entry.endTime}</Text>
              <Text>Duration: {(entry.duration / 60).toFixed(1)} hrs</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noSleep}>No sleep data recorded</Text>
        )}
      </View>
    </ScrollView>
  ); 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
    textAlign: 'center',
  },
  values: {
    flexDirection: 'row',
    gap: 15,
    flexWrap: 'wrap',
    marginTop: 20,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  datePicker: {
    alignItems: 'center',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    marginHorizontal: 20,
  },
  date: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
    marginHorizontal: 20,
  },
  dataContainer: {
    flexDirection: 'row',
    gap: 15,
    flexWrap: 'wrap',
    marginTop: 20,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  workoutContainer: {
    marginTop: 20,
    padding: 10,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  workoutCard: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  workoutTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  heartRateContainer: {
    marginTop: 5,
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  noWorkouts: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 10,
  },
  sleepContainer: {
    marginTop: 20,
    padding: 10,
  },
  sleepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sleepCard: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  sleepState: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noSleep: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 10,
  },
  bloodGlucoseContainer: {
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  bloodGlucoseTime: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  messagesContainer: {
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  messageBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '100%',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 5,
  },
});
