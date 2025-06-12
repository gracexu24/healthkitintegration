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
    // CRITICAL: Only run on iOS platform
    if (Platform.OS !== 'ios') {
      console.log('HealthKit only available on iOS');
      return;
    }

    // Check if HealthKit is available (fails on simulator)
    AppleHealthKit.isAvailable((err, isAvailable) => {
      if (err) {
        console.log('Error checking HealthKit availability:', err);
        return;
      }
      
      if (!isAvailable) {
        console.log('HealthKit not available - running on simulator or HealthKit disabled');
        return;
      }

      // Initialize HealthKit with permissions
      AppleHealthKit.initHealthKit(permissions, (err) => {
        if (err) {
          console.log('Error initializing HealthKit:', err);
          return;
        }
        console.log('HealthKit initialized successfully');
        setHasPermission(true);
      });
    });
  }, []);

  useEffect(() => {
    if (!hasPermissions) {
      return;
    }

    // CRITICAL: Use the date parameter, not new Date()
    const options: HealthInputOptions = {
      date: date.toISOString(), // Use the passed date parameter
      includeManuallyAdded: false,
    };

    AppleHealthKit.getStepCount(options, (err, results) => {
      if (err) {
        console.log('Error getting steps:', err);
        return;
      }
      setSteps(results.value);
    });

    AppleHealthKit.getFlightsClimbed(options, (err, results) => {
      if (err) {
        console.log('Error getting flights climbed:', err);
        return;
      }
      setFlights(results.value);
    });

    AppleHealthKit.getDistanceWalkingRunning(options, (err, results) => {
      if (err) {
        console.log('Error getting distance:', err);
        return;
      }
      setDistance(results.value);
    });
  }, [hasPermissions, date]); // CRITICAL: Include date in dependencies

  return { steps, flights, distance };
};

export default useHealthData;