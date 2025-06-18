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
      Permissions.HeartRate,
      Permissions.Workout,
      Permissions.WorkoutRoute,
      Permissions.BloodGlucose,
      Permissions.BodyFatPercentage,
      Permissions.LeanBodyMass,
    ],
    write: [
      Permissions.Weight,
      Permissions.SleepAnalysis,
      Permissions.Workout,
      Permissions.BloodGlucose,
      Permissions.BodyFatPercentage,
      Permissions.LeanBodyMass,
    ],
  },
};

type Workout = {
  activityName: string;
  calories: number;
  sourceName: string;
  workoutEventType: string;
  startDate: string;
  endDate: string;
  duration: number;
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
  const [steps, setSteps] = useState<{
    value: number;
    message: string;
  }>({
    value: 0,
    message: 'No step data available',
  });
  const [flights, setFlights] = useState<{
    value: number;
    message: string;
  }>({
    value: 0,
    message: 'No flights climbed data available',
  });
  const [distance, setDistance] = useState<{
    value: number;
    message: string;
  }>({
    value: 0,
    message: 'No distance data available',
  });
  const [weight, setWeight] = useState<{
    value: number;
    message: string;
  }>({
    value: 0,
    message: 'No weight data available',
  });
  const [sleep, setSleep] = useState<{
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
    message: string;
  }>({
    totalTimeInBed: 0,
    totalTimeAsleep: 0,
    stages: {
      deep: 0,
      core: 0,
      rem: 0,
      light: 0
    },
    timeline: [],
    message: 'No sleep data available',
  });
  const [caloriesBurned, setCaloriesBurned] = useState<{
    value: number;
    message: string;
  }>({
    value: 0,
    message: 'No calories burned data available',
  });
  const [BMI, setBMI] = useState<{
    value: number;
    message: string;
  }>({
    value: 0,
    message: 'No BMI data available',
  });
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [bloodGlucose, setBloodGlucose] = useState<{
    value: number;
    unit: string;
    date: string;
    message: string;
  }>({
    value: 0,
    unit: 'mg/dL',
    date: '',
    message: 'No blood glucose data available',
  });
  const [bodyFat, setBodyFat] = useState<{
    value: number;
    unit: string;
    date: string;
    message: string;
  }>({
    value: 0,
    unit: '%',
    date: '',
    message: 'No body fat data available',
  });
  const [muscleMass, setMuscleMass] = useState<{
    value: number;
    unit: string;
    date: string;
    message: string;
  }>({
    value: 0,
    unit: 'kg',
    date: '',
    message: 'No muscle mass data available',
  });

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
    const stepsOptions = {
      startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
      endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString(),
      includeManuallyAdded: true
    };
    
    AppleHealthKit.getStepCount(stepsOptions, (err: string | null, results: any) => {
      if (err) {
        console.log('ERROR: Error getting steps:', err);
        setSteps({
          value: 0,
          message: 'Error fetching step data',
        });
        return;
      }
      
      if (results && results.value !== undefined) {
        console.log('SUCCESS: Steps received:', results.value);
        setSteps({
          value: results.value,
          message: '',
        });
      } else {
        console.log('INFO: No steps found for this date');
        setSteps({
          value: 0,
          message: 'No step data available',
        });
      }
    });

    // Flights
    console.log('FETCHING: Flights...');
    const flightsOptions = {
      startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
      endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString(),
      includeManuallyAdded: true
    };
    
    AppleHealthKit.getFlightsClimbed(flightsOptions, (err: string | null, results: any) => {
      if (err) {
        console.log('ERROR: Error getting flights:', err);
        setFlights({
          value: 0,
          message: 'Error fetching flights climbed data',
        });
        return;
      }
      
      if (results && results.value !== undefined) {
        console.log('SUCCESS: Flights received:', results.value);
        setFlights({
          value: results.value,
          message: '',
        });
      } else {
        console.log('INFO: No flights found for this date');
        setFlights({
          value: 0,
          message: 'No flights climbed data available',
        });
      }
    });

    // Distance
    console.log('FETCHING: Distance...');
    const distanceOptions = {
      startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
      endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString(),
      includeManuallyAdded: true
    };
    
    AppleHealthKit.getDistanceWalkingRunning(distanceOptions, (err: string | null, results: any) => {
      if (err) {
        console.log('ERROR: Error getting distance:', err);
        setDistance({
          value: 0,
          message: 'Error fetching distance data',
        });
        return;
      }
      
      if (results && results.value !== undefined) {
        console.log('SUCCESS: Distance received:', results.value);
        setDistance({
          value: results.value,
          message: '',
        });
      } else {
        console.log('INFO: No distance found for this date');
        setDistance({
          value: 0,
          message: 'No distance data available',
        });
      }
    });

    // Weight
    console.log('FETCHING: Weight...');
    const weightOptions = {
      startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
      endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString(),
      unit: 'kg' as HealthUnit,
      includeManuallyAdded: true
    };
    
    AppleHealthKit.getLatestWeight(weightOptions, (err: string | null, results: any) => {
      if (err) {
        console.log('ERROR: Error getting weight:', err);
        setWeight({
          value: 0,
          message: 'Error fetching weight data',
        });
        return;
      }
      
      if (results && results.value !== undefined) {
        console.log('SUCCESS: Weight received:', results.value);
        setWeight({
          value: results.value,
          message: '',
        });
      } else {
        console.log('INFO: No weight found for this date');
        setWeight({
          value: 0,
          message: 'No weight data available',
        });
      }
    });

    // BMI
    console.log('FETCHING: BMI...');
    const BMIOptions = {
      startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
      endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString(),
      includeManuallyAdded: true
    };
    
    AppleHealthKit.getLatestBmi(BMIOptions, (err: string | null, results: any) => {
      if (err) {
        console.log('ERROR: Error getting BMI:', err);
        setBMI({
          value: 0,
          message: 'Error fetching BMI data',
        });
        return;
      }
      
      if (results && results.value !== undefined) {
        console.log('SUCCESS: BMI received:', results.value);
        setBMI({
          value: results.value,
          message: '',
        });
      } else {
        console.log('INFO: No BMI found for this date');
        setBMI({
          value: 0,
          message: 'No BMI data available',
        });
      }
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
          console.log('Processing workout:', JSON.stringify(workout, null, 2));
          
          // Get heart rate data for this workout
          const heartRateOptions = {
            startDate: workout.start,
            endDate: workout.end,
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

              // Format the workout data
              const workoutData: Workout = {
                activityName: workout.activityName || 'Unknown Activity',
                calories: workout.calories || 0,
                sourceName: workout.sourceName || 'Unknown Source',
                workoutEventType: workout.workoutEventType || 'Unknown Type',
                startDate: new Date(workout.start).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                }),
                endDate: new Date(workout.end).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                }),
                duration: Math.round(workout.duration / 60), // Convert seconds to minutes
                heartRate: heartRateData
              };

              console.log('Formatted workout:', workoutData);
              resolve(workoutData);
            });
          });
        }));

        console.log('SUCCESS: Workouts processed:', formattedWorkouts);
        setWorkouts(formattedWorkouts);
      } else {
        console.log('INFO: No workouts found for this date');
        setWorkouts([]);
      }
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
          timeline: [],
          message: 'Error fetching sleep data',
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

        // Sort results by start time to ensure chronological order
        results.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        console.log('Processing sleep records...');
        results.forEach((record) => {
          const duration = (new Date(record.endDate).getTime() - new Date(record.startDate).getTime()) / (1000 * 60); // in minutes
          const startTime = new Date(record.startDate).toLocaleTimeString();
          const endTime = new Date(record.endDate).toLocaleTimeString();
          
          console.log('Sleep record:', {
            state: record.value,
            duration,
            startTime,
            endTime
          });
          
          timeline.push({
            state: record.value,
            startTime,
            endTime,
            duration
          });
          
          // Count all sleep states for total sleep time
          if (record.value === 'INBED') {
            totalTimeInBed += duration;
            console.log('Added to time in bed:', duration, 'minutes');
          } else if (record.value === 'ASLEEP' || 
                    record.value === 'CORE' || 
                    record.value === 'DEEP' || 
                    record.value === 'REM' || 
                    record.value === 'LIGHT') {
            totalTimeAsleep += duration;
            console.log('Added to total sleep time:', duration, 'minutes');
            
            // Track individual stages
            if (record.value === 'CORE') {
              stages.core += duration;
            } else if (record.value === 'DEEP') {
              stages.deep += duration;
            } else if (record.value === 'REM') {
              stages.rem += duration;
            } else if (record.value === 'LIGHT') {
              stages.light += duration;
            }
          }
        });

        console.log('Final sleep calculations:', {
          totalTimeInBed,
          totalTimeAsleep,
          stages,
          timeline
        });
        
        setSleep({
          totalTimeInBed,
          totalTimeAsleep,
          stages,
          timeline,
          message: '',
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
          timeline: [],
          message: 'No sleep data available',
        });
      }
    });

    // Calories
    console.log('FETCHING: Calories...');
    const caloriesOptions = {
      startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
      endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString(),
      includeManuallyAdded: true
    };
    
    AppleHealthKit.getActiveEnergyBurned(caloriesOptions, (err: string | null, results: any) => {
      if (err) {
        console.log('ERROR: Error getting calories:', err);
        setCaloriesBurned({
          value: 0,
          message: 'Error fetching calories burned data',
        });
        return;
      }
      
      if (results && results.value !== undefined) {
        console.log('SUCCESS: Calories received:', results.value);
        setCaloriesBurned({
          value: results.value,
          message: '',
        });
      } else {
        console.log('INFO: No calories found for this date');
        setCaloriesBurned({
          value: 0,
          message: 'No calories burned data available',
        });
      }
    });

    // Blood Glucose
    console.log('FETCHING: Blood Glucose...');
    const bloodGlucoseOptions = {
      startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
      endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString(),
      unit: 'mg/dL' as HealthUnit,
      includeManuallyAdded: true
    };
    
    AppleHealthKit.getBloodGlucoseSamples(bloodGlucoseOptions, (err: string | null, results: any[]) => {
      if (err) {
        console.log('ERROR: Error getting blood glucose:', err);
        setBloodGlucose({
          value: 0,
          unit: 'mg/dL',
          date: '',
          message: 'Error fetching blood glucose data',
        });
        return;
      }
      
      console.log('Raw blood glucose results:', JSON.stringify(results, null, 2));
      
      if (results && results.length > 0) {
        const latestReading = results[0];
        console.log('SUCCESS: Blood glucose received:', latestReading);
        setBloodGlucose({
          value: latestReading.value,
          unit: latestReading.unit,
          date: new Date(latestReading.startDate).toLocaleTimeString(),
          message: '',
        });
      } else {
        console.log('INFO: No blood glucose data found for this date');
        setBloodGlucose({
          value: 0,
          unit: 'mg/dL',
          date: '',
          message: 'No blood glucose data available',
        });
      }
    });

    // Body Fat
    console.log('FETCHING: Body Fat...');
    const bodyFatOptions = {
      startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
      endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString(),
      unit: 'percent' as HealthUnit,
      includeManuallyAdded: true
    };
    
    AppleHealthKit.getBodyFatPercentageSamples(bodyFatOptions, (err: string | null, results: any[]) => {
      if (err) {
        console.log('ERROR: Error getting body fat:', err);
        setBodyFat({
          value: 0,
          unit: '%',
          date: '',
          message: 'Error fetching body fat data',
        });
        return;
      }
      
      if (results && results.length > 0) {
        const latestReading = results[0];
        console.log('SUCCESS: Body fat received:', latestReading);
        setBodyFat({
          value: latestReading.value,
          unit: '%',
          date: new Date(latestReading.startDate).toLocaleTimeString(),
          message: '',
        });
      } else {
        console.log('INFO: No body fat data found for this date');
        setBodyFat({
          value: 0,
          unit: '%',
          date: '',
          message: 'No body fat data available',
        });
      }
    });

    // Muscle Mass
    console.log('FETCHING: Muscle Mass...');
    const muscleMassOptions = {
      startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
      endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString(),
      unit: 'kg' as HealthUnit,
      includeManuallyAdded: true
    };
    
    AppleHealthKit.getLeanBodyMassSamples(muscleMassOptions, (err: string | null, results: any[]) => {
      if (err) {
        console.log('ERROR: Error getting muscle mass:', err);
        setMuscleMass({
          value: 0,
          unit: 'kg',
          date: '',
          message: 'Error fetching muscle mass data',
        });
        return;
      }
      
      if (results && results.length > 0) {
        const latestReading = results[0];
        console.log('SUCCESS: Muscle mass received:', latestReading);
        setMuscleMass({
          value: latestReading.value,
          unit: 'kg',
          date: new Date(latestReading.startDate).toLocaleTimeString(),
          message: '',
        });
      } else {
        console.log('INFO: No muscle mass data found for this date');
        setMuscleMass({
          value: 0,
          unit: 'kg',
          date: '',
          message: 'No muscle mass data available',
        });
      }
    });

  }, [hasPermissions, date]); 

  return { 
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
    muscleMass
  };
};

export default useHealthData;