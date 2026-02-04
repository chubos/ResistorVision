import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';
import ResistanceResult from "@/components/ResistanceResult";
import ResistorDisplay from "@/components/ResistorDisplay";
import CameraInstructions from "@/components/CameraInstructions";

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

type ColorName = keyof typeof RESISTOR_COLORS;


export default function Vision() {
  // Zapobiegaj blokowaniu ekranu podczas używania kamery
  useKeepAwake();

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [isActive, setIsActive] = useState(true);
  const [detectedColors, setDetectedColors] = useState<ColorName[] | null>(null);
  const [bandCount, setBandCount] = useState<3 | 4 | 5 | 6>(4);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);


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
        console.log('Error reading instructions state:', error);
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

    console.error('Camera error:', error);
  }, []);

  const handleColorDetection = (colors: ColorName[] | null) => {
    if (colors && colors.length > 0) {
      setDetectedColors(colors);
      setBandCount(colors.length as 3 | 4 | 5 | 6);
    }
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

  const { value, tolerance, tempCoeff } = calculateResistance();

  const handleManualCapture = async () => {
    setIsProcessing(true);

    try {
      await AsyncStorage.setItem('visionInstructionsShown', 'true');
      setShowInstructions(false);
    } catch (error) {
      console.log('Error saving instructions state:', error);
    }

    setTimeout(() => {
      const testColors: ColorName[] = ["brown", "black", "red", "gold"];
      handleColorDetection(testColors);
      setIsProcessing(false);
    }, 1000);
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Brak uprawnień do kamery</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Przyznaj uprawnienia</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Nie znaleziono kamery</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          device={device}
          isActive={isActive}
          onError={handleCameraError}
        />

        <View style={styles.overlay}>
          <View style={styles.guideline} />
          <Text style={styles.instructionText}>
            Skieruj kamerę na rezystor
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
              Oczekiwanie na detekcję rezystora...
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
          onPress={handleManualCapture}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.captureButtonText}>Rozpoznaj rezystor</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
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
    width: "80%",
    height: 200,
    borderWidth: 3,
    borderColor: "#00ff00",
    borderRadius: 10,
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
    backgroundColor: "#f5f5f5",
    padding: 20,
    paddingTop: 30,
  },
  placeholderContainer: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  captureButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  captureButtonDisabled: {
    backgroundColor: "#999",
  },
  captureButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  permissionText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
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

