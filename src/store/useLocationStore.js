import { create } from 'zustand';
import { requestLocationPermission, getCurrentPosition } from '../utils/permissions';

const FALLBACK = {
  city: 'Surat',
  region: 'Gujarat',
  coords: { lat: 21.1702, lng: 72.8311 },
};

export const useLocationStore = create((set, get) => ({
  city: FALLBACK.city,
  region: FALLBACK.region,
  coords: FALLBACK.coords,
  initialized: false,
  setLocation: (loc) => set(loc),
  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });

    const granted = await requestLocationPermission();
    if (!granted) {
      set(FALLBACK);
      return;
    }

    const coords = await getCurrentPosition();
    if (!coords) {
      set(FALLBACK);
      return;
    }

    set({ coords });

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`,
        { headers: { 'User-Agent': 'Circl/1.0' } },
      );
      const json = await res.json();
      const addr = json?.address || {};
      const city =
        addr.city || addr.town || addr.village || addr.suburb || FALLBACK.city;
      const region = addr.state || addr.region || FALLBACK.region;
      set({ city, region });
    } catch (_) {
      // keep fallback city/region; coords are still real
    }
  },
}));
