import { useMemo } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { lightColors, darkColors } from './colors';

export const useColors = () => {
  const isDark = useThemeStore((s) => s.isDark);
  return isDark ? darkColors : lightColors;
};

export const useThemedStyles = (factory) => {
  const colors = useColors();
  return useMemo(() => factory(colors), [colors, factory]);
};
