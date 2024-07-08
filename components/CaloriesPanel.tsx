import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { ProgressBar } from "react-native-paper";

interface CaloriesPanelProps {
  dailyGoal: number;
  consumed: number;
  setDailyCalorieGoal: (goal: number) => void;
}

export const CaloriesPanel: React.FC<CaloriesPanelProps> = ({
  dailyGoal,
  consumed,
  setDailyCalorieGoal,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputGoal, setInputGoal] = useState(dailyGoal.toString());

  const handleSaveGoal = () => {
    const goal = parseInt(inputGoal, 10);
    if (!isNaN(goal)) {
      setDailyCalorieGoal(goal);
      setIsModalVisible(false);
    }
  };

  const remaining = Math.max(0, dailyGoal - consumed);
  const consumedProgress =
    dailyGoal > 0 ? Math.min(consumed / dailyGoal, 1) : 0;
  const remainingProgress =
    dailyGoal > 0 ? Math.min(remaining / dailyGoal, 1) : 0;

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Calories</ThemedText>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <ThemedText style={styles.subtitle}>Remaining = Goal - Food</ThemedText>
      <View style={styles.circle}>
        <ThemedText style={styles.circleText}>
          {remaining.toFixed(0)}
        </ThemedText>
        <ThemedText style={styles.circleSubtext}>Remaining</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText style={styles.label}>Base Goal</ThemedText>
        <ThemedText style={styles.value}>{dailyGoal}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText style={styles.label}>Food</ThemedText>
        <ThemedText style={styles.value}>{consumed.toFixed(0)}</ThemedText>
      </View>
      <ProgressBar
        progress={consumedProgress}
        color="#ff3366"
        style={styles.progressBar}
      />
      <View style={styles.row}>
        <ThemedText style={styles.label}>Remaining</ThemedText>
        <ThemedText style={styles.value}>{remaining.toFixed(0)}</ThemedText>
      </View>
      <ProgressBar
        progress={remainingProgress}
        color="#4ecdc4"
        style={styles.progressBar}
      />

      <Modal
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <ThemedText style={styles.modalTitle}>
              Set Daily Calorie Goal
            </ThemedText>
            <TextInput
              style={styles.input}
              value={inputGoal}
              onChangeText={setInputGoal}
              keyboardType="numeric"
            />
            <Button title="Save" onPress={handleSaveGoal} />
            <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    width: "100%",
    backgroundColor: "#2D2F34",
    borderRadius: 10,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 14,
    color: "#aaaaaa",
    marginBottom: 20,
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#3f3f3f",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  circleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  circleSubtext: {
    fontSize: 14,
    color: "#aaaaaa",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: "#aaaaaa",
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: 300,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderColor: "#cccccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
});
