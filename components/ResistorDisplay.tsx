import { View, StyleSheet, useWindowDimensions } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

const RESISTOR_COLORS = {
  black: { color: "#000000" },
  brown: { color: "#8B4513" },
  red: { color: "#FF0000" },
  orange: { color: "#FFA500" },
  yellow: { color: "#FFFF00" },
  green: { color: "#009e00" },
  blue: { color: "#0000FF" },
  violet: { color: "#8B00FF" },
  gray: { color: "#808080" },
  white: { color: "#FFFFFF" },
  gold: { color: "#b59700" },
  silver: { color: "#C0C0C0" },
};

type ColorName = keyof typeof RESISTOR_COLORS;

interface ResistorDisplayProps {
  colors: ColorName[];
  bandCount: number;
}

export default function ResistorDisplay({ colors, bandCount }: ResistorDisplayProps) {
  const { colors: themeColors } = useTheme();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const styles = StyleSheet.create({
    resistorContainer: {
      backgroundColor: themeColors.cardBackground,
      padding: isLandscape ? 15 : 30,
      borderRadius: 10,
      marginBottom: isLandscape ? 0 : 25,
      alignItems: "center",
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    resistor: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      maxWidth: 340,
    },
    resistorLead: {
      width: 38,
      height: 3,
      backgroundColor: "#C0C0C0",
      borderRadius: 2,
    },
    resistorBody: {
      flex: 1,
      height: 38,
      backgroundColor: "#E6D7C0",
      borderRadius: 12,
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
      paddingHorizontal: 12,
      borderTopWidth: 1,
      borderTopColor: "#F2EBDF",
      borderBottomWidth: 1,
      borderBottomColor: "#CCB895",
    },
    resistorBand: {
      width: 8,
      height: "100%",
      borderRadius: 2,
    },
    whiteBandBorder: {
      borderWidth: 1,
      borderColor: "#ccc",
    },
  });

  return (
    <View style={styles.resistorContainer}>
      <View style={styles.resistor}>
        <View style={styles.resistorLead} />
        <View style={styles.resistorBody}>
          {colors.slice(0, bandCount).map((color, index) => (
            <View
              key={index}
              style={[
                styles.resistorBand,
                { backgroundColor: RESISTOR_COLORS[color].color },
                color === "white" && styles.whiteBandBorder,
              ]}
            />
          ))}
        </View>
        <View style={styles.resistorLead} />
      </View>
    </View>
  );
}
