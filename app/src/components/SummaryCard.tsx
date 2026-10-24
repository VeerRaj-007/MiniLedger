import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  totalLent: number;
  totalRepaid: number;
  overdueAmount: number;
}

export default function SummaryCard({ totalLent, totalRepaid, overdueAmount }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Stat label="Lent" value={totalLent} />
        <Stat label="Repaid" value={totalRepaid} />
        <Stat label="Overdue" value={overdueAmount} danger={overdueAmount > 0} />
      </View>
    </View>
  );
}

function Stat({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.value, danger && styles.dangerText]}>₹{value.toFixed(0)}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  stat: { alignItems: "center", flex: 1 },
  value: { color: "#fff", fontSize: 20, fontWeight: "700" },
  dangerText: { color: "#ff6b6b" },
  label: { color: "#aaa", fontSize: 12, marginTop: 2 },
});
