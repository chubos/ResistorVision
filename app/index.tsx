import { StyleSheet, ScrollView, View } from "react-native";
import { useState } from "react";
import ResistanceResult from "@/components/ResistanceResult";
import ResistorDisplay from "@/components/ResistorDisplay";
import BandCountSelector from "@/components/BandCountSelector";
import ColorSelector from "@/components/ColorSelector";

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

export default function Index() {
  const [bandCount, setBandCount] = useState<3 | 4 | 5 | 6>(4);
  const [selectedColors, setSelectedColors] = useState<ColorName[]>([
    "brown",
    "black",
    "red",
    "gold",
    "brown",
    "brown",
  ]);

  const handleBandCountChange = (count: 3 | 4 | 5 | 6) => {
    setBandCount(count);
    // Reset colors when band count changes
    const defaultColors: ColorName[] = ["brown", "black", "red", "gold", "brown", "brown"];
    setSelectedColors(defaultColors);
  };

  const handleColorSelect = (bandIndex: number, color: ColorName) => {
    const newColors = [...selectedColors];
    newColors[bandIndex] = color;
    setSelectedColors(newColors);
  };

  const calculateResistance = () => {
    let resistance: number;
    let tolerance: number | null;
    let tempCoeff: number | null = null;

    if (bandCount === 3) {
      const digit1 = RESISTOR_COLORS[selectedColors[0]].value ?? 0;
      const digit2 = RESISTOR_COLORS[selectedColors[1]].value ?? 0;
      const multiplier = RESISTOR_COLORS[selectedColors[2]].multiplier ?? 1;
      resistance = (digit1 * 10 + digit2) * multiplier;
      tolerance = null;
    } else if (bandCount === 4) {
      const digit1 = RESISTOR_COLORS[selectedColors[0]].value ?? 0;
      const digit2 = RESISTOR_COLORS[selectedColors[1]].value ?? 0;
      const multiplier = RESISTOR_COLORS[selectedColors[2]].multiplier ?? 1;
      tolerance = RESISTOR_COLORS[selectedColors[3]].tolerance ?? null;
      resistance = (digit1 * 10 + digit2) * multiplier;
    } else if (bandCount === 5) {
      const digit1 = RESISTOR_COLORS[selectedColors[0]].value ?? 0;
      const digit2 = RESISTOR_COLORS[selectedColors[1]].value ?? 0;
      const digit3 = RESISTOR_COLORS[selectedColors[2]].value ?? 0;
      const multiplier = RESISTOR_COLORS[selectedColors[3]].multiplier ?? 1;
      tolerance = RESISTOR_COLORS[selectedColors[4]].tolerance ?? null;
      resistance = (digit1 * 100 + digit2 * 10 + digit3) * multiplier;
    } else {
      const digit1 = RESISTOR_COLORS[selectedColors[0]].value ?? 0;
      const digit2 = RESISTOR_COLORS[selectedColors[1]].value ?? 0;
      const digit3 = RESISTOR_COLORS[selectedColors[2]].value ?? 0;
      const multiplier = RESISTOR_COLORS[selectedColors[3]].multiplier ?? 1;
      tolerance = RESISTOR_COLORS[selectedColors[4]].tolerance ?? null;
      tempCoeff = RESISTOR_COLORS[selectedColors[5]].tempCoeff ?? null;
      resistance = (digit1 * 100 + digit2 * 10 + digit3) * multiplier;
    }


    return { value: resistance, tolerance, tempCoeff };
  };

  const { value, tolerance, tempCoeff } = calculateResistance();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <ResistanceResult value={value} tolerance={tolerance} tempCoeff={tempCoeff} />
        <ResistorDisplay colors={selectedColors} bandCount={bandCount} />
        <BandCountSelector bandCount={bandCount} onBandCountChange={handleBandCountChange} />
        <ColorSelector
          bandCount={bandCount}
          selectedColors={selectedColors}
          onColorSelect={handleColorSelect}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
});
