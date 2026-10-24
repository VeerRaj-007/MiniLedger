import React, { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { apiFetch, uploadReceipt } from "../api/client";
import { useAuth } from "../context/AuthContext";
import SummaryCard from "../components/SummaryCard";
import LoanItem from "../components/LoanItem";

export default function HomeScreen({ navigation }: any) {
  const [loans, setLoans] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalLent: 0, totalRepaid: 0, overdueAmount: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const { signOut } = useAuth();

  async function load() {
    const [loansData, summaryData] = await Promise.all([
      apiFetch("/loans"),
      apiFetch("/summary"),
    ]);
    setLoans(loansData);
    setSummary(summaryData);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleMarkRepaid(id: string) {
    await apiFetch(`/loans/${id}/repay`, { method: "PATCH" });
    load();
  }

  // Ask the user camera vs. library rather than jumping straight to one —
  // a receipt is just as likely to be an existing photo as a fresh one.
  async function handleAddReceipt(loanId: string) {
    Alert.alert("Add receipt", "Choose a source", [
      { text: "Take photo", onPress: () => pickImage(loanId, true) },
      { text: "Choose from library", onPress: () => pickImage(loanId, false) },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  async function pickImage(loanId: string, useCamera: boolean) {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "MiniLedger needs that permission to attach a receipt.");
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.6 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });

    if (result.canceled || !result.assets?.[0]) return;

    try {
      await uploadReceipt(loanId, result.assets[0].uri);
      load();
    } catch (e: any) {
      Alert.alert("Upload failed", e.message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MiniLedger</Text>
        <Pressable onPress={signOut}>
          <Text style={styles.logout}>Log out</Text>
        </Pressable>
      </View>

      <SummaryCard {...summary} />

      <FlatList
        data={loans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LoanItem loan={item} onMarkRepaid={handleMarkRepaid} onAddReceipt={handleAddReceipt} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No entries yet — add one with the + button.</Text>
        }
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate("AddEntry")}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  title: { fontSize: 24, fontWeight: "700" },
  logout: { color: "#888", fontSize: 14 },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  fabText: { color: "#fff", fontSize: 28, lineHeight: 30 },
});
