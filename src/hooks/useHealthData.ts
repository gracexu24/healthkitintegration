import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
  HealthUnit,
  HKErrorResponse,
  AnchoredQueryResults,
  HKWorkoutQueriedSampleType,
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
      Permissions.BodyMassIndex,
      Permissions.Workout,
      Permissions.WorkoutRoute,
      Permissions.HeartRate,
    ],
    write: [],
  },
};

type Workout = {
  activityName: string;
  calories: number;
  sourceName: string;
  workoutEventType: string;
  startDate: string;
  endDate: string;
  heartRate: {
    average: number;
    min: number;
    max: number;
  };
};

type RawWorkout = {
  activityName?: string;
  calories?: number;
  sourceName?: string;
  workoutEventType?: string;
  startDate: string;
  endDate: string;
};

type Sleep = {
  totalTimeInBed: number;
  totalTimeAsleep: number;
  stages: {
    deep: number;
    core: number;
    rem: number;
    light: number;
  };
  timeline: Array<{
    state: string;
    startTime: string;
    endTime: string;
    duration: number;
  }>;
};

const useHealthData = (date: Date) => {
  const [hasPermissions, setHasPermission] = useState(false);
  const [steps, setSteps] = useState(0);
  const [flights, setFlights] = useState(0);
  const [distance, setDistance] = useState(0);
  const [weight, setWeight] = useState(0);
  const [sleep, setSleep] = useState<Sleep>({
    totalTimeInBed: 0,
    totalTimeAsleep: 0,
    stages: {
      deep: 0,
      core: 0,
      rem: 0,
      light: 0
    },
    timeline: []
  });
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [BMI, setBMI] = useState(0);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

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

    // Weight
    console.log('FETCHING: Weight...');
    const weightOptions = {
      unit: 'kg' as HealthUnit,
      includeManuallyAdded: true
    };
    AppleHealthKit.getLatestWeight(weightOptions, (err: string | null, results: any) => {
      if (err) {
        console.log('ERROR: Error getting weight:', err);
        setWeight(0);
        return;
      }
      if (!results || !results.value) {
        console.log('INFO: No weight data available');
        setWeight(0);
        return;
      }
      console.log('SUCCESS: Weight received:', results.value);
      setWeight(results.value);
    });

    // BMI
    console.log('FETCHING: BMI...');
    const bmiOptions = {
      unit: 'count' as HealthUnit,
      includeManuallyAdded: true
    };
    AppleHealthKit.getLatestBmi(bmiOptions, (err: string | null, results: any) => {
      if (err) {
        console.log('ERROR: Error getting BMI:', err);
        setBMI(0);
        return;
      }
      if (!results || !results.value) {
        console.log('INFO: No BMI data available');
        setBMI(0);
        return;
      }
      console.log('SUCCESS: BMI received:', results.value);
      setBMI(results.value);
    });

    // Sleep
    console.log('FETCHING: Sleep...');
    const sleepOptions = {
      startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
      endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString(),
      includeManuallyAdded: true
    };
    
    AppleHealthKit.getSleepSamples(sleepOptions, (err: string | null, results: any[]) => {
      if (err) {
        console.log('ERROR: Error getting sleep:', err);
        setSleep({
          totalTimeInBed: 0,
          totalTimeAsleep: 0,
          stages: {
            deep: 0,
            core: 0,
            rem: 0,
            light: 0
          },
          timeline: []
        });
        return;
      }
      
      console.log('Raw sleep results:', JSON.stringify(results, null, 2));
      
      if (results && results.length > 0) {
        let totalTimeInBed = 0;
        let totalTimeAsleep = 0;
        const stages = {
          deep: 0,
          core: 0,
          rem: 0,
          light: 0
        };
        const timeline: Sleep['timeline'] = [];

        results.forEach((record) => {
          const duration = (new Date(record.endDate).getTime() - new Date(record.startDate).getTime()) / (1000 * 60); // in minutes
          const startTime = new Date(record.startDate).toLocaleTimeString();
          const endTime = new Date(record.endDate).toLocaleTimeString();
          
          timeline.push({
            state: record.value,
            startTime,
            endTime,
            duration
          });
          
          if (record.value === 'INBED') {
            totalTimeInBed += duration;
          } else if (record.value === 'ASLEEP') {
            totalTimeAsleep += duration;
          } else if (record.value === 'ASLEEP_CORE') {
            stages.core += duration;
          } else if (record.value === 'ASLEEP_DEEP') {
            stages.deep += duration;
          } else if (record.value === 'ASLEEP_REM') {
            stages.rem += duration;
          } else if (record.value === 'ASLEEP_LIGHT') {
            stages.light += duration;
          }
        });

        // Sort timeline by start time
        timeline.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        
        console.log('SUCCESS: Sleep data processed:', {
          totalTimeInBed,
          totalTimeAsleep,
          stages,
          timeline
        });
        
        setSleep({
          totalTimeInBed,
          totalTimeAsleep,
          stages,
          timeline
        });
      } else {
        console.log('INFO: No sleep data found for this date');
        setSleep({
          totalTimeInBed: 0,
          totalTimeAsleep: 0,
          stages: {
            deep: 0,
            core: 0,
            rem: 0,
            light: 0
          },
          timeline: []
        });
      }
    });

    // Active Energy Burned (Calories)
    console.log('FETCHING: Calories burned...');
    const caloriesOptions = {
      startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
      endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString(),
    };
    AppleHealthKit.getActiveEnergyBurned(caloriesOptions, (err, results) => {
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

    // Workouts
    console.log('FETCHING: Workouts...');
    const workoutOptions = {
      startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
      endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString(),
      limit: 100, // Get up to 100 workouts for the day
      includeManuallyAdded: true
    };
    
    AppleHealthKit.getAnchoredWorkouts(workoutOptions, async (err: HKErrorResponse | null, results: AnchoredQueryResults) => {
      if (err) {
        console.log('ERROR: Error getting workouts:', err);
        setWorkouts([]);
        return;
      }
      
      console.log('Raw workout results:', JSON.stringify(results, null, 2));
      
      if (results && results.data && results.data.length > 0) {
        const formattedWorkouts = await Promise.all(results.data.map(async (workout: any) => {
          console.log('Individual workout:', JSON.stringify(workout, null, 2));
          
          // Get heart rate data for this workout
          const heartRateOptions = {
            startDate: workout.startDate,
            endDate: workout.endDate,
            unit: 'bpm' as HealthUnit,
          };

          return new Promise<Workout>((resolve) => {
            AppleHealthKit.getHeartRateSamples(heartRateOptions, (hrErr: string | null, hrResults: any[]) => {
              let heartRateData = {
                average: 0,
                min: 0,
                max: 0
              };

              if (!hrErr && hrResults && hrResults.length > 0) {
                const values = hrResults.map(sample => sample.value);
                heartRateData = {
                  average: values.reduce((a, b) => a + b, 0) / values.length,
                  min: Math.min(...values),
                  max: Math.max(...values)
                };
              }

              resolve({
                activityName: workout.workoutActivityType || 'Unknown Activity',
                calories: workout.totalEnergyBurned || 0,
                sourceName: workout.sourceName || 'Unknown Source',
                workoutEventType: workout.workoutEventType || 'Unknown Type',
                startDate: new Date(workout.startDate).toLocaleTimeString(),
                endDate: new Date(workout.endDate).toLocaleTimeString(),
                heartRate: heartRateData
              });
            });
          });
        }));

        console.log('SUCCESS: Workouts received:', formattedWorkouts);
        setWorkouts(formattedWorkouts);
      } else {
        console.log('INFO: No workouts found for this date');
        setWorkouts([]);
      }
    });

  }, [hasPermissions, date]); 

  return { steps, flights, distance, weight, sleep, caloriesBurned, BMI, workouts };
};

export default useHealthData;