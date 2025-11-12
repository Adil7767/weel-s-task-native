import { StatusBar } from "expo-status-bar";
import * as Font from "expo-font";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      await Font.loadAsync({
        "Satoshi-Regular": require("./assets/fonts/Satoshi-Regular.ttf"),
      });
      setFontsLoaded(true);
    })();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
