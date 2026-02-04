import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CameraInstructionsProps {
  step?: number;
}

export default function CameraInstructions({ step = 1 }: CameraInstructionsProps) {
  const instructions = [
    {
      icon: "camera-outline" as const,
      text: "Umieść rezystor w prostokącie",
    },
    {
      icon: "sunny-outline" as const,
      text: "Upewnij się, że jest dobre oświetlenie",
    },
    {
      icon: "eye-outline" as const,
      text: "Trzymaj kamerę stabilnie",
    },
    {
      icon: "scan-outline" as const,
      text: "Kliknij przycisk, aby rozpoznać",
    },
  ];

  return (
    <View style={styles.container}>
      {instructions.map((instruction, index) => (
        <View key={index} style={[styles.instructionRow, index === step - 1 && styles.activeStep]}>
          <Ionicons
            name={instruction.icon}
            size={20}
            color={index === step - 1 ? "#007AFF" : "#666"}
          />
          <Text style={[styles.instructionText, index === step - 1 && styles.activeText]}>
            {instruction.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  activeStep: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 10,
    borderRadius: 5,
    marginHorizontal: -10,
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
  activeText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});

