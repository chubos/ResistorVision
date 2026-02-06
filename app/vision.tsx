import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback, useRef } from "react";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';
import { useTensorflowModel } from 'react-native-fast-tflite';
import * as ImageManipulator from 'expo-image-manipulator';
import * as jpeg from 'jpeg-js';
import { useTranslation } from "react-i18next";
import ResistanceResult from "@/components/ResistanceResult";
import ResistorDisplay from "@/components/ResistorDisplay";
import CameraInstructions from "@/components/CameraInstructions";
import { processPhotoWithModel } from "@/utils/testModel";
import { useTheme } from "@/contexts/ThemeContext";

// Local types
type ColorName = 'black' | 'brown' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'violet' | 'gray' | 'white' | 'gold' | 'silver';

const RESISTOR_COLORS = {
  black: { value: 0, multiplier: 1, tolerance: null, tempCoeff: null, color: "#000000" },
  brown: { value: 1, multiplier: 10, tolerance: 1, tempCoeff: 100, color: "#8B4513" },
  red: { value: 2, multiplier: 100, tolerance: 2, tempCoeff: 50, color: "#FF0000" },
  orange: { value: 3, multiplier: 1000, tolerance: null, tempCoeff: 15, color: "#FFA500" },
  yellow: { value: 4, multiplier: 10000, tolerance: null, tempCoeff: 25, color: "#FFFF00" },
  green: { value: 5, multiplier: 100000, tolerance: 0.5, tempCoeff: 20, color: "#009e00" },
  blue: { value: 6, multiplier: 1000000, tolerance: 0.25, tempCoeff: 10, color: "#0000FF" },
  violet: { value: 7, multiplier: 10000000, tolerance: 0.1, tempCoeff: 5, color: "#8B00FF" },
  gray: { value: 8, multiplier: 100000000, tolerance: 0.05, tempCoeff: 1, color: "#808080" },
  white: { value: 9, multiplier: 1000000000, tolerance: null, tempCoeff: null, color: "#FFFFFF" },
  gold: { value: null, multiplier: 0.1, tolerance: 5, tempCoeff: null, color: "#b59700" },
  silver: { value: null, multiplier: 0.01, tolerance: 10, tempCoeff: null, color: "#C0C0C0" },
};

export default function Vision() {
  useKeepAwake();

  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);

  const [isActive, setIsActive] = useState(true);
  const [detectedColors, setDetectedColors] = useState<ColorName[] | null>(null);
  const [bandCount, setBandCount] = useState<3 | 4 | 5 | 6>(4);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Model 1: Resistor detection
  const detectionPlugin = useTensorflowModel(require('../assets/resistor32.tflite'));
  const detectionModel = detectionPlugin?.state === 'loaded' ? detectionPlugin.model : null;

  // Model 2: Color classification
  const colorPlugin = useTensorflowModel(require('../assets/best_float32.tflite'));
  const colorModel = colorPlugin?.state === 'loaded' ? colorPlugin.model : null;

  useEffect(() => {
    if (detectionPlugin.state === 'error') {
      Alert.alert('Cannot load resistor detection model.');
    }
    if (colorPlugin.state === 'error') {
      Alert.alert('Cannot load color classification model.');
    }
  }, [detectionPlugin.state, colorPlugin.state]);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  useEffect(() => {
    const checkInstructionsShown = async () => {
      try {
        const shown = await AsyncStorage.getItem('visionInstructionsShown');
        if (shown === 'true') {
          setShowInstructions(false);
        }
      } catch (error) {

      }
    };
    checkInstructionsShown();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => {
        setIsActive(false);
      };
    }, [])
  );

  const handleCameraError = useCallback((error: any) => {
    if (error?.code === 'system/camera-is-restricted') {
      return;
    }
    Alert.alert(t('vision.cameraError'), error?.message || '');
  }, []);

  // ML detection
  const handleManualCapture = useCallback(async () => {
    if (!detectionModel || !colorModel) {
      Alert.alert(t('common.loading'), t('vision.processing'));
      return;
    }

    if (!cameraRef.current) {
      Alert.alert(t('vision.cameraPermission'), t('vision.cameraPermissionMessage'));
      return;
    }

    setIsProcessing(true);

    try {
      await AsyncStorage.setItem('visionInstructionsShown', 'true');
      setShowInstructions(false);
    } catch (error) {

    }

    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });

      const photoUri = 'file://' + photo.path;

      const cropSize = Math.round(photo.width * 0.35);
      const cropX = Math.round((photo.width - cropSize) / 2);
      const cropY = Math.round((photo.height - cropSize) / 2);

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photoUri,
        [
          { crop: { originX: cropX, originY: cropY, width: cropSize, height: cropSize } },
          { resize: { width: 640, height: 640 } }
        ],
        {
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
          compress: 0.9
        }
      );

      if (!manipulatedImage.base64) {
        throw new Error('Cannot process captured image');
      }

      const imageData = decodeJpegToFloat32(manipulatedImage.base64);
      const result = await processPhotoWithModel(detectionModel, colorModel, imageData, t);

      if (result.success && result.colors && result.colors.length >= 3) {
        setDetectedColors(result.colors);
        setBandCount(Math.min(Math.max(result.colors.length, 3), 6) as 3 | 4 | 5 | 6);
      } else {
        Alert.alert(t('vision.noResistorDetected'), result.message || t('vision.needMoreBands', { count: result.colors?.length || 0 }));
      }
    } catch (error: any) {
      Alert.alert(t('vision.noResistorDetected'), t('vision.cameraPermissionMessage'));
    } finally {
      setIsProcessing(false);
    }
  }, [detectionModel, colorModel, t]);

  // Decode JPEG base64 to Float32Array RGB (640x640x3)
  const decodeJpegToFloat32 = (base64: string): Float32Array => {
    const binaryString = atob(base64);
    const jpegData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      jpegData[i] = binaryString.charCodeAt(i);
    }

    const rawImageData = jpeg.decode(jpegData, { useTArray: true });
    const { width, height, data } = rawImageData;

    const floatData = new Float32Array(640 * 640 * 3);

    for (let y = 0; y < 640; y++) {
      for (let x = 0; x < 640; x++) {
        const srcX = Math.floor(x * width / 640);
        const srcY = Math.floor(y * height / 640);
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * 640 + x) * 3;

        floatData[dstIdx] = (data[srcIdx] || 0) / 255;
        floatData[dstIdx + 1] = (data[srcIdx + 1] || 0) / 255;
        floatData[dstIdx + 2] = (data[srcIdx + 2] || 0) / 255;
      }
    }

    return floatData;
  };

  const calculateResistance = () => {
    if (!detectedColors || detectedColors.length < 3) {
      return { value: 0, tolerance: null, tempCoeff: null };
    }

    let resistance: number;
    let tolerance: number | null = null;
    let tempCoeff: number | null = null;

    const colors = detectedColors;

    if (bandCount === 3) {
      const digit1 = RESISTOR_COLORS[colors[0]].value ?? 0;
      const digit2 = RESISTOR_COLORS[colors[1]].value ?? 0;
      const multiplier = RESISTOR_COLORS[colors[2]].multiplier ?? 1;
      resistance = (digit1 * 10 + digit2) * multiplier;
    } else if (bandCount === 4) {
      const digit1 = RESISTOR_COLORS[colors[0]].value ?? 0;
      const digit2 = RESISTOR_COLORS[colors[1]].value ?? 0;
      const multiplier = RESISTOR_COLORS[colors[2]].multiplier ?? 1;
      tolerance = RESISTOR_COLORS[colors[3]].tolerance ?? null;
      resistance = (digit1 * 10 + digit2) * multiplier;
    } else if (bandCount === 5) {
      const digit1 = RESISTOR_COLORS[colors[0]].value ?? 0;
      const digit2 = RESISTOR_COLORS[colors[1]].value ?? 0;
      const digit3 = RESISTOR_COLORS[colors[2]].value ?? 0;
      const multiplier = RESISTOR_COLORS[colors[3]].multiplier ?? 1;
      tolerance = RESISTOR_COLORS[colors[4]].tolerance ?? null;
      resistance = (digit1 * 100 + digit2 * 10 + digit3) * multiplier;
    } else {
      const digit1 = RESISTOR_COLORS[colors[0]].value ?? 0;
      const digit2 = RESISTOR_COLORS[colors[1]].value ?? 0;
      const digit3 = RESISTOR_COLORS[colors[2]].value ?? 0;
      const multiplier = RESISTOR_COLORS[colors[3]].multiplier ?? 1;
      tolerance = RESISTOR_COLORS[colors[4]].tolerance ?? null;
      tempCoeff = RESISTOR_COLORS[colors[5]].tempCoeff ?? null;
      resistance = (digit1 * 100 + digit2 * 10 + digit3) * multiplier;
    }

    return { value: resistance, tolerance, tempCoeff };
  };

  // Editing colors in calculator
  const handleEditColors = useCallback(async () => {
    if (!detectedColors) return;

    try {
      await AsyncStorage.setItem('detectedColors', JSON.stringify(detectedColors));
      await AsyncStorage.setItem('bandCount', String(bandCount));
      router.push('/');
    } catch (error) {
      Alert.alert(t('vision.noResistorDetected'), t('vision.cameraPermissionMessage'));
    }
  }, [detectedColors, bandCount, router, t]);

  const { value, tolerance, tempCoeff } = calculateResistance();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    permissionContainer: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      paddingTop: 100,
    },
    cameraContainer: {
      flex: 1,
      position: "relative",
      overflow: "hidden",
    },
    camera: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    guideline: {
      width: "35%",
      height: 80,
      borderWidth: 2,
      borderColor: "#00ff00",
      borderRadius: 8,
      backgroundColor: "transparent",
    },
    instructionText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
      marginTop: 20,
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    resultsContainer: {
      backgroundColor: colors.surface,
      padding: 20,
      paddingTop: 30,
    },
    placeholderContainer: {
      backgroundColor: colors.cardBackground,
      padding: 30,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    placeholderText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
    },
    captureButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 10,
    },
    captureButtonDisabled: {
      backgroundColor: colors.textSecondary,
    },
    captureButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "600",
    },
    editButton: {
      backgroundColor: colors.success,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 12,
    },
    editButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    modelStatusContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 12,
      padding: 8,
    },
    modelStatusText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    permissionText: {
      fontSize: 18,
      color: colors.text,
      textAlign: "center",
      marginBottom: 20,
    },
    permissionButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 10,
    },
    permissionButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "600",
    },
  });


  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar style="light" animated={true} />
        <Text style={styles.permissionText}>{t('vision.cameraPermission')}</Text>
        <Text style={styles.permissionText}>{t('vision.cameraPermissionMessage')}</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>{t('vision.cameraPermissionButton')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar style="light" animated={true} />
        <Text style={styles.permissionText}>{t('vision.cameraRestricted')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} collapsable={false}>
      <StatusBar style="light" animated={true} />
      <View style={[styles.cameraContainer, { backgroundColor: isActive ? "#000" : "transparent" }]} collapsable={false}>
        {isActive && device && (
          <Camera
            ref={cameraRef}
            style={styles.camera}
            device={device}
            isActive={isActive}
            onError={handleCameraError}
            photo={true}
            androidPreviewViewType="texture-view"
          />
        )}

        <View style={styles.overlay}>
          <View style={styles.guideline} />
          <Text style={styles.instructionText}>
            {t('vision.alignResistor')}
          </Text>
        </View>
      </View>

      <View style={styles.resultsContainer}>
        {showInstructions && <CameraInstructions step={detectedColors ? 4 : 1} />}

        {detectedColors ? (
          <>
            <ResistanceResult value={value} tolerance={tolerance} tempCoeff={tempCoeff} />
            <ResistorDisplay colors={detectedColors} bandCount={bandCount} />
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              {t('vision.holdSteady')}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
          onPress={handleManualCapture}
          disabled={isProcessing || !detectionModel || !colorModel}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.captureButtonText}>{t('vision.recognizeResistor')}</Text>
          )}
        </TouchableOpacity>

        {/* Edit button */}
        {detectedColors && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditColors}
          >
            <Text style={styles.editButtonText}>{t('vision.edit')}</Text>
          </TouchableOpacity>
        )}

        {/* ML model status */}
        {(detectionPlugin.state === 'loading' || colorPlugin.state === 'loading') && (
          <View style={styles.modelStatusContainer}>
            <ActivityIndicator color="#4CAF50" size="small" />
            <Text style={styles.modelStatusText}>{t('common.loading')}</Text>
          </View>
        )}
        {(detectionPlugin.state === 'error' || colorPlugin.state === 'error') && (
          <View style={styles.modelStatusContainer}>
            <Text style={[styles.modelStatusText, { color: '#f44336' }]}>
              ⚠️ {t('vision.noResistorDetected')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}


