import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";

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

interface ColorSelectorProps {
  bandCount: 3 | 4 | 5 | 6;
  selectedColors: ColorName[];
  onColorSelect: (bandIndex: number, color: ColorName) => void;
}

export default function ColorSelector({ bandCount, selectedColors, onColorSelect }: ColorSelectorProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    colorSelectionContainer: {
      backgroundColor: colors.cardBackground,
      padding: 20,
      borderRadius: 10,
      marginBottom: 20,
      borderColor: colors.border,
      borderWidth: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
      color: colors.text,
    },
    colorColumns: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    colorColumn: {
      flex: 1,
      marginHorizontal: 5,
    },
    columnLabel: {
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 10,
      textAlign: "center",
      color: colors.textSecondary,
    },
    colorButtons: {
      flexDirection: "column",
      gap: 8,
    },
    colorButton: {
      width: "100%",
      height: 40,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    colorButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#fff",
      textAlign: "center",
    },
    darkText: {
      color: "#333",
    },
    selectedColorButton: {
      borderColor: colors.primary,
      borderWidth: 4,
    },
  });

  const getAvailableColors = (bandIndex: number): ColorName[] => {
    const colors = Object.keys(RESISTOR_COLORS) as ColorName[];

    if (bandCount === 3) {
      if (bandIndex < 2) {
        return colors.filter(c => RESISTOR_COLORS[c].value !== null);
      } else {
        return colors.filter(c => RESISTOR_COLORS[c].multiplier !== null);
      }
    } else if (bandCount === 4) {
      if (bandIndex < 2) {
        return colors.filter(c => RESISTOR_COLORS[c].value !== null);
      } else if (bandIndex === 2) {
        return colors.filter(c => RESISTOR_COLORS[c].multiplier !== null);
      } else {
        return colors.filter(c => RESISTOR_COLORS[c].tolerance !== null);
      }
    } else if (bandCount === 5) {
      if (bandIndex < 3) {
        return colors.filter(c => RESISTOR_COLORS[c].value !== null);
      } else if (bandIndex === 3) {
        return colors.filter(c => RESISTOR_COLORS[c].multiplier !== null);
      } else {
        return colors.filter(c => RESISTOR_COLORS[c].tolerance !== null);
      }
    } else {
      if (bandIndex < 3) {
        return colors.filter(c => RESISTOR_COLORS[c].value !== null);
      } else if (bandIndex === 3) {
        return colors.filter(c => RESISTOR_COLORS[c].multiplier !== null);
      } else if (bandIndex === 4) {
        return colors.filter(c => RESISTOR_COLORS[c].tolerance !== null);
      } else {
        return colors.filter(c => RESISTOR_COLORS[c].tempCoeff !== null);
      }
    }
  };

  const getBandLabel = (bandIndex: number): string => {
    if (bandCount === 3) {
      if (bandIndex === 0) return t('home.band') + " 1";
      if (bandIndex === 1) return t('home.band') + " 2";
      return t('home.band') + " 3";
    } else if (bandCount === 4) {
      if (bandIndex === 0) return t('home.band') + " 1";
      if (bandIndex === 1) return t('home.band') + " 2";
      if (bandIndex === 2) return t('home.band') + " 3";
      return t('home.tolerance');
    } else if (bandCount === 5) {
      if (bandIndex === 0) return t('home.band') + " 1";
      if (bandIndex === 1) return t('home.band') + " 2";
      if (bandIndex === 2) return t('home.band') + " 3";
      if (bandIndex === 3) return t('home.band') + " 4";
      return t('home.tolerance');
    } else {
      if (bandIndex === 0) return t('home.band') + " 1";
      if (bandIndex === 1) return t('home.band') + " 2";
      if (bandIndex === 2) return t('home.band') + " 3";
      if (bandIndex === 3) return t('home.band') + " 4";
      if (bandIndex === 4) return t('home.tolerance');
      return t('home.band') + " 6";
    }
  };

  const formatMultiplier = (multiplier: number): string => {
    if (multiplier >= 1000000000) {
      return `×${multiplier / 1000000000}G`;
    } else if (multiplier >= 1000000) {
      return `×${multiplier / 1000000}M`;
    } else if (multiplier >= 1000) {
      return `×${multiplier / 1000}k`;
    } else if (multiplier >= 1) {
      return `×${multiplier}`;
    } else {
      return `×${multiplier}`;
    }
  };

  const getColorLabel = (colorName: ColorName, bandIndex: number): string => {
    const color = RESISTOR_COLORS[colorName];

    if (bandCount === 3) {
      if (bandIndex < 2) {
        return `${color.value}`;
      } else {
        return formatMultiplier(color.multiplier);
      }
    } else if (bandCount === 4) {
      if (bandIndex < 2) {
        return `${color.value}`;
      } else if (bandIndex === 2) {
        return formatMultiplier(color.multiplier);
      } else {
        return `±${color.tolerance}%`;
      }
    } else if (bandCount === 5) {
      if (bandIndex < 3) {
        return `${color.value}`;
      } else if (bandIndex === 3) {
        return formatMultiplier(color.multiplier);
      } else {
        return `±${color.tolerance}%`;
      }
    } else {
      if (bandIndex < 3) {
        return `${color.value}`;
      } else if (bandIndex === 3) {
        return formatMultiplier(color.multiplier);
      } else if (bandIndex === 4) {
        return `±${color.tolerance}%`;
      } else {
        // Temp. Coeff.
        return color.tempCoeff !== null ? `${color.tempCoeff}` : colorName;
      }
    }
  };

  return (
    <View style={styles.colorSelectionContainer}>
      <Text style={styles.sectionTitle}>{t('home.selectColors')}</Text>
      <View style={styles.colorColumns}>
        {Array.from({ length: bandCount }).map((_, bandIndex) => (
          <View key={bandIndex} style={styles.colorColumn}>
            <Text
              style={styles.columnLabel}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {getBandLabel(bandIndex)}
            </Text>
            <View style={styles.colorButtons}>
              {getAvailableColors(bandIndex).map((colorName) => (
                <TouchableOpacity
                  key={colorName}
                  style={[
                    styles.colorButton,
                    { backgroundColor: RESISTOR_COLORS[colorName].color },
                    selectedColors[bandIndex] === colorName && styles.selectedColorButton,
                  ]}
                  onPress={() => onColorSelect(bandIndex, colorName)}
                >
                  <Text style={[
                    styles.colorButtonText,
                    (colorName === "white" || colorName === "yellow") && styles.darkText,
                  ]}>
                    {getColorLabel(colorName, bandIndex)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}


