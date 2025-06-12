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
    ],
    write: [],
  },
};

const useHealthData = (date: Date) => {
  const [hasPermissions, setHasPermission] = useState(false);
  const [steps, setSteps] = useState(0);
  const [flights, setFlights] = useState(0);
  const [distance, setDistance] = useState(0);

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

      // Initialize HealthKit with permissions
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

    console.log('FETCHING: Steps...');
    AppleHealthKit.getStepCount(options, (err, results) => {
      if (err) {
        console.log('ERROR: Error getting steps:', err);
        return;
      }
      console.log('SUCCESS: Steps received:', results.value);
      setSteps(results.value);
    });

    console.log('FETCHING: Flights climbed...');
    AppleHealthKit.getFlightsClimbed(options, (err, results) => {
      if (err) {
        console.log('ERROR: Error getting flights climbed:', err);
        return;
      }
      console.log('SUCCESS: Flights received:', results.value);
      setFlights(results.value);
    });

    console.log('FETCHING: Distance...');
    AppleHealthKit.getDistanceWalkingRunning(options, (err, results) => {
      if (err) {
        console.log('ERROR: Error getting distance:', err);
        return;
      }
      console.log('SUCCESS: Distance received:', results.value);
      setDistance(results.value);
    });
  }, [hasPermissions, date]); 
  return { steps, flights, distance };
};

export default useHealthData;