import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export const requestLocationPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location permission',
          message: 'Circl needs your location to show posts from people nearby.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  } catch (err) {
    Alert.alert('Permission error', 'Unable to request location permission.');
    return false;
  }
};

export const getCurrentPosition = () =>
  new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      (pos) =>
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  });
