import { Dimensions, Platform, PixelRatio, useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const MIN_RATIO = 0.82;
const MAX_RATIO = 1.18;

function clampRatio(ratio: number): number {
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio));
}

function getEffectiveWidth(): number {
  const { width } = Dimensions.get('window');
  if (Platform.OS === 'web' && width > 500) {
    return BASE_WIDTH;
  }
  return width;
}

export function scale(size: number): number {
  const width = getEffectiveWidth();
  const ratio = clampRatio(width / BASE_WIDTH);
  return Math.round(PixelRatio.roundToNearestPixel(size * ratio));
}

export function moderateScale(size: number, factor: number = 0.5): number {
  const width = getEffectiveWidth();
  const ratio = clampRatio(width / BASE_WIDTH);
  return Math.round(PixelRatio.roundToNearestPixel(size + (size * (ratio - 1) * factor)));
}

export function getScreenWidth(): number {
  return Dimensions.get('window').width;
}

export function getScreenHeight(): number {
  return Dimensions.get('window').height;
}

export function useResponsive() {
  const { width: rawWidth, height: rawHeight } = useWindowDimensions();

  return useMemo(() => {
    const width = (Platform.OS === 'web' && rawWidth > 500) ? BASE_WIDTH : rawWidth;
    const height = (Platform.OS === 'web' && rawHeight > 1000) ? BASE_HEIGHT : rawHeight;

    const wRatio = clampRatio(width / BASE_WIDTH);
    const hRatio = clampRatio(height / BASE_HEIGHT);
    const minRatio = Math.min(wRatio, hRatio);

    const s = (size: number) =>
      Math.round(PixelRatio.roundToNearestPixel(size * wRatio));

    const ms = (size: number, factor: number = 0.5) =>
      Math.round(PixelRatio.roundToNearestPixel(size + (size * (wRatio - 1) * factor)));

    const vs = (size: number) =>
      Math.round(PixelRatio.roundToNearestPixel(size * hRatio));

    const fs = (size: number) =>
      Math.round(PixelRatio.roundToNearestPixel(size * Math.min(wRatio, 1.15)));

    const circleSize = Math.round(Math.min(width * 0.39, height * 0.21));

    return {
      width: rawWidth,
      height: rawHeight,
      wRatio,
      hRatio,
      minRatio,
      s,
      ms,
      vs,
      fs,
      circleSize,
      isSmallScreen: rawHeight < 700,
      isMediumScreen: rawHeight >= 700 && rawHeight < 850,
    };
  }, [rawWidth, rawHeight]);
}
