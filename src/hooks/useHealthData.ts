import { useEffect, useState } from 'react';

const useHealthData = () => {
  const [steps, setSteps] = useState(0);
  const [flights, setFlights] = useState(0);
  const [distance, setDistance] = useState(0);

	// HealthKit implementation

  return { steps, flights, distance };
};

export default useHealthData;