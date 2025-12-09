import * as Location from 'expo-location';
import { useState, useEffect } from 'react';

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      const placeName = address[0]?.district || address[0]?.city || 'Current Location';
      setLocation(placeName);
    } catch (err) {
      setError('Unable to get location');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return { location, isLoading, error, refetch: getLocation };
};