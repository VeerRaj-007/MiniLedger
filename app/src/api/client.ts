import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

// Expo Go runs on your physical phone, not on your laptop — so
// "localhost" here means the phone itself, not your dev machine.
// Replace this with your machine's LAN IP (e.g. http://192.168.1.23:4000),
// found via `ipconfig` (Windows) or `ifconfig`/`ipconfig getifaddr en0` (Mac).
// Both devices must be on the same Wi-Fi network.
export const API_URL = "http://192.168.29.184:4000";

const TOKEN_KEY = "miniledger_token";

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// A thin fetch wrapper: attaches the JWT when present, throws on non-2xx
// so callers can just try/catch instead of checking res.ok everywhere.
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

// Multipart upload needs its own path: it can't go through apiFetch's
// JSON helper because the body is FormData, not a JSON string, and the
// browser/RN runtime must set the multipart Content-Type header itself
// (with the boundary) — setting it manually breaks the upload.
export async function uploadReceipt(loanId: string, imageUri: string) {
  const token = await getToken();

  const result = await FileSystem.uploadAsync(
    `${API_URL}/loans/${loanId}/receipt`,
    imageUri,
    {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: "receipt",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );

  let data: any = {};
  try {
    data = JSON.parse(result.body);
  } catch {}

  if (result.status < 200 || result.status >= 300) {
    throw new Error(data.error || `Upload failed (${result.status})`);
  }
  return data;
}
