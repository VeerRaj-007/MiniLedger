import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, Platform } from "react-native";
import { apiFetch } from "../api/client";

export default function AddEntryScreen({ navigation }: any) {
  const [friendName, setFriendName] = useState("");
  const [amount, setAmount] = useState("");
  // Kept as plain text input (YYYY-MM-DD) rather than a native date picker —
  // adding @react-native-community/datetimepicker is a reasonable upgrade
  // but it's one more native dependency to configure, not worth it for
  // this scope. Swap it in later if you want nicer UX.
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!friendName.trim()) return Alert.alert("Enter a friend's name");
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return Alert.alert("Enter a valid amount");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return Alert.alert("Due date must be YYYY-MM-DD");

    setLoading(true);
    try {
      await apiFetch("/loans", {
        method: "POST",
        body: JSON.stringify({ friendName, amount: parsedAmount, dueDate }),
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Entry</Text>

      <Text style={styles.label}>Friend's name</Text>
      <TextInput style={styles.input} value={friendName} onChangeText={setFriendName} placeholder="Rahul" />

      <Text style={styles.label}>Amount (₹)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="1500"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Due date</Text>
      <TextInput
        style={styles.input}
        value={dueDate}
        onChangeText={setDueDate}
        placeholder="2026-11-01"
      />

      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Saving..." : "Save Entry"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: Platform.OS === "ios" ? 60 : 24, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  label: { fontSize: 13, color: "#666", marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 16 },
  button: { backgroundColor: "#111", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 28 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
