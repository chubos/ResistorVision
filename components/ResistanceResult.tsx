import { Text, View, StyleSheet, useWindowDimensions } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";

interface ResistanceResultProps {
  value: number;
  tolerance: number | null;
  tempCoeff?: number | null;
}

export default function ResistanceResult({ value, tolerance, tempCoeff }: ResistanceResultProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const formatResistance = () => {
    let unit = "Ω";

    // Round to 10 decimal places to avoid floating-point issues before converting units
    let displayValue = Math.round(value * 10000000000) / 10000000000;

    if (displayValue >= 1000000000) {
      displayValue = displayValue / 1000000000;
      unit = "GΩ";
    } else if (displayValue >= 1000000) {
      displayValue = displayValue / 1000000;
      unit = "MΩ";
    } else if (displayValue >= 1000) {
      displayValue = displayValue / 1000;
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

  const styles = StyleSheet.create({
    resultContainer: {
      backgroundColor: colors.cardBackground,
      padding: isLandscape ? 15 : 20,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: isLandscape ? 10 : 25,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultLabel: {
      fontSize: isLandscape ? 14 : 18,
      color: colors.textSecondary,
      marginBottom: isLandscape ? 3 : 5,
    },
    resultValue: {
      fontSize: isLandscape ? 24 : 36,
      fontWeight: "bold",
      color: colors.text,
    },
    resultValueSmall: {
      fontSize: isLandscape ? 20 : 28,
    },
  });

  return (
    <View style={styles.resultContainer}>
      <Text style={styles.resultLabel}>{t('home.resistance')}:</Text>
      <Text style={[
        styles.resultValue,
        hasTempCoeff && styles.resultValueSmall
      ]}>
        {formatResistance()}
      </Text>
    </View>
  );
}
