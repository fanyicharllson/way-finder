import * as Location from 'expo-location';
import { useState } from 'react';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface UseLocationReturn {
  coords: LocationCoords | null;
  permissionStatus: Location.PermissionStatus | null;
  isLoading: boolean;
  error: string | null;
  checkPermission: () => Promise<Location.PermissionStatus>;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationCoords | null>;
}

export const useLocation = (): UseLocationReturn => {
  const [coords, setCoords] = useState<LocationCoords | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check current permission status without requesting
   */
  const checkPermission = async (): Promise<Location.PermissionStatus> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      return status;
    } catch (err: any) {
      setError(err.message || 'Failed to check permissions');
      return Location.PermissionStatus.UNDETERMINED;
    }
  };

  /**
   * Request location permission
   */
  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      return status === Location.PermissionStatus.GRANTED;
    } catch (err: any) {
      setError(err.message || 'Failed to request permissions');
      return false;
    }
  };

  /**
   * Get current location coordinates
   */
  const getCurrentLocation = async (): Promise<LocationCoords | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if we have permission
      const status = await checkPermission();
      
      if (status !== Location.PermissionStatus.GRANTED) {
        // Try to request permission
        const granted = await requestPermission();
        if (!granted) {
          setError('Location permission denied');
          setIsLoading(false);
          return null;
        }
      }

      // Get location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationCoords: LocationCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCoords(locationCoords);
      return locationCoords;
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
      console.error('Location error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    coords,
    permissionStatus,
    isLoading,
    error,
    checkPermission,
    requestPermission,
    getCurrentLocation,
  };
};

// Legacy hook for backward compatibility
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

  return { location, isLoading, error, refetch: getLocation };
};