declare module 'jpeg-js' {
  interface RawImageData<T> {
    width: number;
    height: number;
    data: T;
  }

  interface DecodeOptions {
    useTArray?: boolean;
    colorTransform?: boolean;
    formatAsRGBA?: boolean;
    tolerantDecoding?: boolean;
    maxResolutionInMP?: number;
    maxMemoryUsageInMB?: number;
  }

  interface EncodeOptions {
    quality?: number;
  }

  export function decode(
    jpegData: Uint8Array | ArrayLike<number> | Buffer,
    opts?: DecodeOptions
  ): RawImageData<Uint8Array>;

  export function encode(
    imgData: RawImageData<Uint8Array | Buffer>,
    quality?: number
  ): { data: Uint8Array; width: number; height: number };
}

