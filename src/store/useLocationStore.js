import { create } from 'zustand';

export const useLocationStore = create((set) => ({
  city: 'Surat',
  region: 'Gujarat',
  coords: null,
  setLocation: (loc) => set(loc),
}));
