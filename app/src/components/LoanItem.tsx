import React from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { API_URL } from "../api/client";

interface Loan {
  id: string;
  friendName: string;
  amount: number;
  dueDate: string;
  repaid: boolean;
  overdue: boolean;
  receiptUrl?: string | null;
}

interface Props {
  loan: Loan;
  onMarkRepaid: (id: string) => void;
  onAddReceipt: (id: string) => void;
}

export default function LoanItem({ loan, onMarkRepaid, onAddReceipt }: Props) {
  const dueDate = new Date(loan.dueDate).toLocaleDateString();

  return (
    <View style={[styles.item, loan.overdue && styles.overdueItem]}>
      {loan.receiptUrl ? (
        <Image source={{ uri: `${API_URL}${loan.receiptUrl}` }} style={styles.thumb} />
      ) : (
        <Pressable style={styles.thumbPlaceholder} onPress={() => onAddReceipt(loan.id)}>
          <Text style={styles.thumbPlaceholderText}>+ receipt</Text>
        </Pressable>
      )}

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>{loan.friendName}</Text>
        <Text style={styles.meta}>
          ₹{loan.amount.toFixed(0)} · due {dueDate}
          {loan.overdue ? " · OVERDUE" : ""}
        </Text>
      </View>

      {loan.repaid ? (
        <Text style={styles.repaidBadge}>Repaid</Text>
      ) : (
        <Pressable style={styles.repayButton} onPress={() => onMarkRepaid(loan.id)}>
          <Text style={styles.repayButtonText}>Mark repaid</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  overdueItem: { backgroundColor: "#ffe8e8", borderWidth: 1, borderColor: "#ffb3b3" },
  thumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: "#ddd" },
  thumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbPlaceholderText: { fontSize: 9, color: "#888", textAlign: "center" },
  name: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 13, color: "#666", marginTop: 2 },
  repaidBadge: { color: "#2e7d32", fontWeight: "600", fontSize: 13 },
  repayButton: { backgroundColor: "#111", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10 },
  repayButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
