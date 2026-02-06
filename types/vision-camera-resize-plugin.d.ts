declare module 'vision-camera-resize-plugin' {
  import { Frame } from 'react-native-vision-camera';

  interface ResizeOptions {
    scale: {
      width: number;
      height: number;
    };
    pixelFormat: 'rgb' | 'rgba' | 'bgr' | 'bgra' | 'argb' | 'abgr';
    dataType: 'uint8' | 'float32';
    rotation?: '0deg' | '90deg' | '180deg' | '270deg';
    mirror?: boolean;
    crop?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }

  interface ResizePlugin {
    resize: (frame: Frame, options: ResizeOptions) => ArrayBuffer;
  }

  export function useResizePlugin(): ResizePlugin;
}

