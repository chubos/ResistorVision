import { Text, View, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";

interface BandCountSelectorProps {
  bandCount: 3 | 4 | 5 | 6;
  onBandCountChange: (count: 3 | 4 | 5 | 6) => void;
}

export default function BandCountSelector({ bandCount, onBandCountChange }: BandCountSelectorProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const styles = StyleSheet.create({
    bandCountContainer: {
      backgroundColor: colors.cardBackground,
      padding: 20,
      borderRadius: 10,
      marginTop: isLandscape ? 20 : 0,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
      color: colors.text,
    },
    bandCountButtons: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    bandCountButton: {
      paddingHorizontal: 30,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 60,
      alignItems: "center",
    },
    selectedBandCountButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    bandCountButtonText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    selectedBandCountButtonText: {
      color: "#fff",
    },
  });

  return (
    <View style={styles.bandCountContainer}>
      <Text style={styles.sectionTitle}>{t('home.bandCount')}:</Text>
      <View style={styles.bandCountButtons}>
        {[3, 4, 5, 6].map((count) => (
          <TouchableOpacity
            key={count}
            style={[
              styles.bandCountButton,
              bandCount === count && styles.selectedBandCountButton,
            ]}
            onPress={() => onBandCountChange(count as 3 | 4 | 5 | 6)}
          >
            <Text
              style={[
                styles.bandCountButtonText,
                bandCount === count && styles.selectedBandCountButtonText,
              ]}
            >
              {count}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
