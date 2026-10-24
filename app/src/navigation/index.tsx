import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import OtpScreen from "../screens/OtpScreen";
import HomeScreen from "../screens/HomeScreen";
import AddEntryScreen from "../screens/AddEntryScreen";

const Stack = createNativeStackNavigator();

// This is the RN equivalent of react-router's "protected route" pattern:
// instead of a <Route> guard component, you swap which whole stack is
// mounted based on auth state. token present -> app stack, absent -> auth
// stack. No manual redirects needed.
export default function RootNavigator() {
  const { token, loading } = useAuth();

  if (loading) return null; // could render a splash/spinner here

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="AddEntry"
              component={AddEntryScreen}
              options={{ headerShown: true, title: "Add Entry", presentation: "modal" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} options={{ headerShown: true, title: "" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
