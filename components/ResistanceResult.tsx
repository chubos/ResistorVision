import { Text, View, StyleSheet } from "react-native";

interface ResistanceResultProps {
  value: number;
  tolerance: number | null;
  tempCoeff?: number | null;
}

export default function ResistanceResult({ value, tolerance, tempCoeff }: ResistanceResultProps) {
  const formatResistance = () => {
    let unit = "Ω";
    let displayValue = value;

    if (value >= 1000000000) {
      displayValue = value / 1000000000;
      unit = "GΩ";
    } else if (value >= 1000000) {
      displayValue = value / 1000000;
      unit = "MΩ";
    } else if (value >= 1000) {
      displayValue = value / 1000;
      unit = "kΩ";
    }

    displayValue = Math.round(displayValue * 100) / 100;

    const formattedValue = displayValue % 1 === 0
      ? displayValue.toString()
      : displayValue.toFixed(2).replace(/\.?0+$/, '');

    const toleranceStr = tolerance !== null ? ` ±${tolerance}%` : "";
    const tempCoeffStr = tempCoeff !== null && tempCoeff !== undefined ? ` ${tempCoeff}ppm/°C` : "";
    return `${formattedValue}${unit}${toleranceStr}${tempCoeffStr}`;
  };

  const hasTempCoeff = tempCoeff !== null && tempCoeff !== undefined;

  return (
    <View style={styles.resultContainer}>
      <Text style={styles.resultLabel}>Rezystancja:</Text>
      <Text style={[
        styles.resultValue,
        hasTempCoeff && styles.resultValueSmall
      ]}>
        {formatResistance()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  resultContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
  },
  resultLabel: {
    fontSize: 18,
    color: "#666",
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
  },
  resultValueSmall: {
    fontSize: 28,
  },
});

