/**
 * Processing resistor photos using ML model (TensorFlow Lite)
 * Two-stage detection:
 * 1. Resistor detection model (resistor32.tflite) - finds resistor position
 * 2. Color model (best_float32.tflite) - analyzes band colors
 */

import { TensorflowModel } from 'react-native-fast-tflite';


// Type for color names
type ColorName =
  | 'black' | 'brown' | 'red' | 'orange' | 'yellow' | 'green'
  | 'blue' | 'violet' | 'gray' | 'white' | 'gold' | 'silver';

interface ResistorDetection {
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
}

/**
 * Detects resistor position on image using object detection model
 * @param model - TFLite model (resistor32.tflite) - detects resistor
 * @param imageData - Image data as Float32Array (640x640x3, values 0-1)
 * @returns Resistor position or null if not found
 */
export async function detectResistorPosition(
  model: TensorflowModel,
  imageData: Float32Array
): Promise<ResistorDetection | null> {
  try {
    const outputs = model.runSync([imageData]);

    if (!outputs || outputs.length === 0) {
      return null;
    }

    const output = outputs[0];
    const numProposals = 8400;

    let bestDetection: ResistorDetection | null = null;
    let maxConfidence = 0;

    // Iterate through all proposals
    for (let i = 0; i < numProposals; i++) {
      // Get bbox (x_center, y_center, width, height)
      const xCenter = Number(output[i]) || 0;
      const yCenter = Number(output[i + numProposals]) || 0;
      const w = Number(output[i + 2 * numProposals]) || 0;
      const h = Number(output[i + 3 * numProposals]) || 0;

      // Confidence is in 5th channel (index 4)
      const confidence = Number(output[i + 4 * numProposals]) || 0;

      // Accept detections with confidence > 0.3
      if (confidence > 0.3 && confidence > maxConfidence) {
        maxConfidence = confidence;
        bestDetection = {
          x: xCenter,
          y: yCenter,
          w,
          h,
          confidence
        };
      }
    }

    return bestDetection;
  } catch (error) {
    console.error('[DetectResistor] Error:', error);
    return null;
  }
}

/**
 * Crops image fragment based on bounding box
 * @param imageData - Original image Float32Array (640x640x3)
 * @param bbox - Resistor bounding box (normalized coordinates 0-1)
 * @returns Cropped and resized image (640x640x3)
 */
function cropAndResizeImage(
  imageData: Float32Array,
  bbox: ResistorDetection
): Float32Array {
  const inputSize = 640;

  // Convert normalized coordinates to pixels
  const centerX = Math.round(bbox.x * inputSize);
  const centerY = Math.round(bbox.y * inputSize);
  const width = Math.round(bbox.w * inputSize);
  const height = Math.round(bbox.h * inputSize);

  // Calculate top-left corner coordinates
  const x1 = Math.max(0, centerX - Math.floor(width / 2));
  const y1 = Math.max(0, centerY - Math.floor(height / 2));
  const x2 = Math.min(inputSize, x1 + width);
  const y2 = Math.min(inputSize, y1 + height);

  const cropWidth = x2 - x1;
  const cropHeight = y2 - y1;

  // Create new 640x640 image
  const croppedImage = new Float32Array(inputSize * inputSize * 3);

  // Scale and copy data
  for (let y = 0; y < inputSize; y++) {
    for (let x = 0; x < inputSize; x++) {
      // Map coordinates from destination image to source
      const srcX = x1 + Math.floor((x / inputSize) * cropWidth);
      const srcY = y1 + Math.floor((y / inputSize) * cropHeight);

      // Copy RGB
      const srcIdx = (srcY * inputSize + srcX) * 3;
      const dstIdx = (y * inputSize + x) * 3;

      croppedImage[dstIdx] = imageData[srcIdx] || 0;
      croppedImage[dstIdx + 1] = imageData[srcIdx + 1] || 0;
      croppedImage[dstIdx + 2] = imageData[srcIdx + 2] || 0;
    }
  }

  return croppedImage;
}

/**
 * Processes camera photo through ML models and returns detected band colors
 * Two-stage process:
 * 1. Detects resistor position (resistor32.tflite)
 * 2. Analyzes band colors in cropped fragment (best_float32.tflite)
 *
 * @param detectionModel - Resistor detection model (resistor32.tflite)
 * @param colorModel - Color classification model (best_float32.tflite)
 * @param imageData - Image data as Float32Array (640x640x3, values 0-1)
 * @param t - Translation function from i18next
 * @returns Detected band colors sorted from left to right
 */
export async function processPhotoWithModel(
  detectionModel: TensorflowModel,
  colorModel: TensorflowModel,
  imageData: Float32Array,
  t: (key: string, options?: any) => string
): Promise<{
  success: boolean;
  colors?: ColorName[];
  message: string;
  detectionCount?: number;
  detections?: Array<{ x: number; y: number; w: number; h: number; confidence: number; color: ColorName }>;
  resistorDetection?: ResistorDetection;
}> {
  try {
    // STAGE 1: Detect resistor position
    const resistorBbox = await detectResistorPosition(detectionModel, imageData);

    if (!resistorBbox) {
      return {
        success: false,
        message: t('vision.resistorNotDetected'),
        detectionCount: 0
      };
    }

    // STAGE 2: Crop resistor area and resize
    const croppedImage = cropAndResizeImage(imageData, resistorBbox);

    // STAGE 3: Detect band colors in cropped fragment
    const outputs = colorModel.runSync([croppedImage]);

    if (!outputs || outputs.length === 0) {
      return {
        success: false,
        message: t('vision.noColorResults'),
        resistorDetection: resistorBbox
      };
    }

    const output = outputs[0];

    const numProposals = 8400;
    const numClasses = 12;

    const classToColorName: ColorName[] = [
      'black', 'blue', 'brown', 'gold', 'green', 'gray',
      'orange', 'violet', 'red', 'silver', 'white', 'yellow'
    ];

    interface Detection {
      x: number;
      y: number;
      w: number;
      h: number;
      confidence: number;
      color: ColorName;
      classId: number;
    }

    const detections: Detection[] = [];

    // Process each proposal
    for (let i = 0; i < numProposals; i++) {
      // Get bbox (x_center, y_center, width, height)
      const xCenter = Number(output[i]) || 0;
      const yCenter = Number(output[i + numProposals]) || 0;
      const w = Number(output[i + 2 * numProposals]) || 0;
      const h = Number(output[i + 3 * numProposals]) || 0;

      // Find class with highest confidence
      let maxConf = 0;
      let maxClassId = 0;

      for (let c = 0; c < numClasses; c++) {
        const conf = Number(output[i + (4 + c) * numProposals]) || 0;
        if (conf > maxConf) {
          maxConf = conf;
          maxClassId = c;
        }
      }

      // Filter detections with low confidence
      if (maxConf > 0.3) { // Confidence threshold 30% - higher threshold for better accuracy
        const colorName = classToColorName[maxClassId] || 'brown';

        detections.push({
          x: xCenter,
          y: yCenter,
          w,
          h,
          confidence: maxConf,
          color: colorName,
          classId: maxClassId
        });
      }
    }

    if (detections.length === 0) {
      return {
        success: false,
        message: t('vision.noBandsDetected'),
        detectionCount: 0,
        resistorDetection: resistorBbox
      };
    }

    // Sort by confidence (best first)
    detections.sort((a, b) => b.confidence - a.confidence);

    const filteredDetections = nonMaxSuppressionWithColor(detections, 0.3);

    const sortedDetections = filteredDetections.sort((a, b) => a.x - b.x);

    if (sortedDetections.length < 3) {
      return {
        success: false,
        message: t('vision.needMoreBands', { count: sortedDetections.length }),
        detectionCount: sortedDetections.length,
        detections: sortedDetections,
        resistorDetection: resistorBbox
      };
    }

    const colors = sortedDetections.map(det => det.color);


    return {
      success: true,
      colors,
      message: t('vision.detectedBandsWithColors', {
        count: sortedDetections.length,
        colors: colors.join(', ')
      }),
      detectionCount: sortedDetections.length,
      detections: sortedDetections,
      resistorDetection: resistorBbox
    };

  } catch (error: any) {
    console.error('[ProcessPhoto] Error:', error);
    return {
      success: false,
      message: t('vision.processingError', { error: error?.message || String(error) }),
    };
  }
}

/**
 * Non-Maximum Suppression - removes overlapping detections
 * Keeps only the best detections (with highest confidence)
 */
function nonMaxSuppressionWithColor<T extends { x: number; y: number; w: number; h: number; confidence: number }>(
  detections: T[],
  iouThreshold: number
): T[] {
  if (detections.length === 0) return [];

  // Sort by confidence (descending)
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
  const result: T[] = [];

  while (sorted.length > 0) {
    const best = sorted.shift()!;
    result.push(best);

    // Remove all that heavily overlap
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (calculateIoU(best, sorted[i]) > iouThreshold) {
        sorted.splice(i, 1);
      }
    }
  }

  return result; // Don't sort here, we'll do it later in calling code
}

/**
 * Calculates Intersection over Union for two bounding boxes
 */
function calculateIoU(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);

  if (x2 < x1 || y2 < y1) return 0;

  const intersection = (x2 - x1) * (y2 - y1);
  const areaA = a.w * a.h;
  const areaB = b.w * b.h;
  const union = areaA + areaB - intersection;

  return intersection / union;
}

