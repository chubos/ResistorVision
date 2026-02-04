/**
 * Utility do analizy kolorów rezystora z obrazu kamery
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export type ColorName =
  | "black"
  | "brown"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "violet"
  | "gray"
  | "white"
  | "gold"
  | "silver";

/**
 * Mapowanie kolorów rezystorów na zakresy RGB
 */
const COLOR_RANGES: Record<ColorName, { rgb: RGB; tolerance: number }> = {
  black: { rgb: { r: 0, g: 0, b: 0 }, tolerance: 50 },
  brown: { rgb: { r: 139, g: 69, b: 19 }, tolerance: 60 },
  red: { rgb: { r: 255, g: 0, b: 0 }, tolerance: 70 },
  orange: { rgb: { r: 255, g: 165, b: 0 }, tolerance: 70 },
  yellow: { rgb: { r: 255, g: 255, b: 0 }, tolerance: 80 },
  green: { rgb: { r: 0, g: 158, b: 0 }, tolerance: 70 },
  blue: { rgb: { r: 0, g: 0, b: 255 }, tolerance: 70 },
  violet: { rgb: { r: 139, g: 0, b: 255 }, tolerance: 70 },
  gray: { rgb: { r: 128, g: 128, b: 128 }, tolerance: 60 },
  white: { rgb: { r: 255, g: 255, b: 255 }, tolerance: 50 },
  gold: { rgb: { r: 181, g: 151, b: 0 }, tolerance: 70 },
  silver: { rgb: { r: 192, g: 192, b: 192 }, tolerance: 60 },
};

/**
 * Oblicza odległość między dwoma kolorami w przestrzeni RGB
 */
function colorDistance(color1: RGB, color2: RGB): number {
  const dr = color1.r - color2.r;
  const dg = color1.g - color2.g;
  const db = color1.b - color2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Identyfikuje kolor rezystora na podstawie wartości RGB
 */
export function identifyResistorColor(rgb: RGB): ColorName | null {
  let closestColor: ColorName | null = null;
  let minDistance = Infinity;

  for (const [colorName, { rgb: colorRgb, tolerance }] of Object.entries(COLOR_RANGES)) {
    const distance = colorDistance(rgb, colorRgb);

    if (distance < tolerance && distance < minDistance) {
      minDistance = distance;
      closestColor = colorName as ColorName;
    }
  }

  return closestColor;
}

/**
 * Ekstrahuje średnią wartość RGB z obszaru obrazu
 */
export function extractAverageColor(
  imageData: Uint8Array,
  x: number,
  y: number,
  width: number,
  height: number,
  imageWidth: number
): RGB {
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;

  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const pixelX = x + dx;
      const pixelY = y + dy;
      const index = (pixelY * imageWidth + pixelX) * 4;

      totalR += imageData[index];
      totalG += imageData[index + 1];
      totalB += imageData[index + 2];
      count++;
    }
  }

  return {
    r: Math.round(totalR / count),
    g: Math.round(totalG / count),
    b: Math.round(totalB / count),
  };
}

/**
 * Wykrywa paski rezystora na obrazie
 *
 * To jest uproszczona wersja - w produkcji należy użyć
 * bardziej zaawansowanych algorytmów wykrywania obiektów
 */
export function detectResistorBands(
  imageData: Uint8Array,
  imageWidth: number,
  imageHeight: number
): ColorName[] | null {
  // TODO: Implementacja detekcji pasków rezystora
  // Możliwe podejścia:
  // 1. Użycie TensorFlow Lite z wytrenowanym modelem
  // 2. Klasyczna analiza obrazu (wykrywanie krawędzi, segmentacja kolorów)
  // 3. Użycie OpenCV via react-native-opencv

  // Placeholder - zwraca null, bo wymaga implementacji z ML
  return null;
}

/**
 * Funkcja pomocnicza do konwersji frame z vision-camera do formatu RGB
 */
export function frameToRGBData(frame: any): { data: Uint8Array; width: number; height: number } | null {
  'worklet';

  // TODO: Implementacja konwersji frame do RGB
  // Vision Camera 4.0+ ma wbudowane API do konwersji formatów
  // np. frame.toArrayBuffer() lub integracja z frame processors

  return null;
}

