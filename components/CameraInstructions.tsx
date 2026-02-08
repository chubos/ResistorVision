import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";

interface CameraInstructionsProps {
  step?: number;
}

export default function CameraInstructions({ step = 1 }: CameraInstructionsProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const instructions = [
    {
      icon: "camera-outline" as const,
      text: t('vision.instructions.step1'),
    },
    {
      icon: "sunny-outline" as const,
      text: t('vision.instructions.step2'),
    },
    {
      icon: "eye-outline" as const,
      text: t('vision.instructions.step3'),
    },
    {
      icon: "scan-outline" as const,
      text: t('vision.instructions.step4'),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.cardBackground,
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    instructionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
    },
    activeStep: {
      backgroundColor: colors.primary + '15',
      paddingHorizontal: 10,
      borderRadius: 5,
      marginHorizontal: -10,
    },
    instructionText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 10,
    },
    activeText: {
      color: colors.primary,
      fontWeight: "600",
    },
  });

  return (
    <View style={styles.container}>
      {instructions.map((instruction, index) => (
        <View key={index} style={[styles.instructionRow, index === step - 1 && styles.activeStep]}>
          <Ionicons
            name={instruction.icon}
            size={20}
            color={index === step - 1 ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.instructionText, index === step - 1 && styles.activeText]}>
            {instruction.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

