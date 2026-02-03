import { Text, View, StyleSheet, TouchableOpacity } from "react-native";

interface BandCountSelectorProps {
  bandCount: 3 | 4 | 5 | 6;
  onBandCountChange: (count: 3 | 4 | 5 | 6) => void;
}

export default function BandCountSelector({ bandCount, onBandCountChange }: BandCountSelectorProps) {
  return (
    <View style={styles.bandCountContainer}>
      <Text style={styles.sectionTitle}>Liczba pasków:</Text>
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

const styles = StyleSheet.create({
  bandCountContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  bandCountButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  bandCountButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    minWidth: 60,
    alignItems: "center",
  },
  selectedBandCountButton: {
    backgroundColor: "#007AFF",
  },
  bandCountButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  selectedBandCountButtonText: {
    color: "#fff",
  },
});

