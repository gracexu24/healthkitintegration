import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
  HealthUnit,
} from "react-native-health";

const { Permissions } = AppleHealthKit.Constants;

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      Permissions.Steps,
      Permissions.FlightsClimbed,
      Permissions.DistanceWalkingRunning,
      Permissions.Weight,
      Permissions.SleepAnalysis,
      Permissions.ActiveEnergyBurned,
    ],
    write: [],
  },
};

const useHealthData = (date: Date) => {
  const [hasPermissions, setHasPermission] = useState(false);
  const [steps, setSteps] = useState(0);
  const [flights, setFlights] = useState(0);
  const [distance, setDistance] = useState(0);
  const [weight, setWeight] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  useEffect(() => {
    console.log('Initializing HealthKit...');
    
    if (Platform.OS !== 'ios') {
      console.log('ERROR: Not on iOS platform');
      return;
    }

    AppleHealthKit.isAvailable((err, isAvailable) => {
      if (err) {
        console.log('ERROR: Error checking HealthKit availability:', err);
        return;
      }
      
      if (!isAvailable) {
        console.log('ERROR: HealthKit not available - running on simulator or HealthKit disabled');
        return;
      }

      console.log('SUCCESS: HealthKit is available');

      AppleHealthKit.initHealthKit(permissions, (err) => {
        if (err) {
          console.log('ERROR: Error initializing HealthKit:', err);
          return;
        }
        console.log('SUCCESS: HealthKit initialized successfully');
        setHasPermission(true);
      });
    });
  }, []);

  useEffect(() => {
    if (!hasPermissions) {
      console.log('WAITING: Waiting for HealthKit permissions...');
      return;
    }

    console.log('FETCHING: Health data for:', date.toDateString());

    const options: HealthInputOptions = {
      date: date.toISOString(),
      includeManuallyAdded: false,
    };

    // Steps
    console.log('FETCHING: Steps...');
    AppleHealthKit.getStepCount(options, (err, results) => {
      if (err) {
        console.log('ERROR: Error getting steps:', err);
        return;
      }
      console.log('SUCCESS: Steps received:', results.value);
      setSteps(results.value);
    });

    // Flights Climbed
    console.log('FETCHING: Flights climbed...');
    AppleHealthKit.getFlightsClimbed(options, (err, results) => {
      if (err) {
        console.log('ERROR: Error getting flights climbed:', err);
        return;
      }
      console.log('SUCCESS: Flights received:', results.value);
      setFlights(results.value);
    });

    // Distance
    console.log('FETCHING: Distance...');
    AppleHealthKit.getDistanceWalkingRunning(options, (err, results) => {
      if (err) {
        console.log('ERROR: Error getting distance:', err);
        return;
      }
      console.log('SUCCESS: Distance received:', results.value);
      setDistance(results.value);
    });

    // Weight (get latest weight)
    console.log('FETCHING: Weight...');
    AppleHealthKit.getLatestWeight({}, (err, results) => {
      if (err) {
        console.log('ERROR: Error getting weight:', err);
        return;
      }
      console.log('SUCCESS: Weight received:', results.value);
      setWeight(results.value);
    });

    // Sleep Analysis
    console.log('FETCHING: Sleep data...');
    const sleepOptions = {
      startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
      endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString(),
    };
    
    AppleHealthKit.getSleepSamples(sleepOptions, (err, results) => {
      if (err) {
        console.log('ERROR: Error getting sleep data:', err);
        return;
      }
      
      // Calculate total sleep hours
      let totalSleepMinutes = 0;
      if (results && results.length > 0) {
        results.forEach(sample => {
          // Sleep samples have different structure - check for sleep state
          const start = new Date(sample.startDate);
          const end = new Date(sample.endDate);
          totalSleepMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
        });
      }
      
      const sleepHours = totalSleepMinutes / 60;
      console.log('SUCCESS: Sleep hours received:', sleepHours);
      setSleepHours(sleepHours);
    });

    // Active Energy Burned (Calories)
    console.log('FETCHING: Calories burned...');
    AppleHealthKit.getActiveEnergyBurned(options, (err, results) => {
      if (err) {
        console.log('ERROR: Error getting calories burned:', err);
        return;
      }
      
      // Sum up all calorie values for the day
      let totalCalories = 0;
      if (results && results.length > 0) {
        totalCalories = results.reduce((sum, sample) => sum + sample.value, 0);
      }
      
      console.log('SUCCESS: Calories burned received:', totalCalories);
      setCaloriesBurned(totalCalories);
    });

  }, [hasPermissions, date]); 

  return { steps, flights, distance, weight, sleepHours, caloriesBurned };
};

export default useHealthData;