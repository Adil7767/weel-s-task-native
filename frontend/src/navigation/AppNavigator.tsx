import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import DeliveryPreferenceScreen from "../screens/DeliveryPreferenceScreen";
import SummaryScreen from "../screens/SummaryScreen";

export type RootStackParamList = {
  Login: undefined;
  DeliveryPreference: undefined;
  Summary: { orderId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user, initializing, refreshUser } = useAuth();

  useEffect(() => {
    if (!initializing && user) {
      void refreshUser();
    }
  }, [initializing, user]);

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTitleStyle: { fontFamily: "Satoshi-Regular" } }}>
        {user ? (
          <>
            <Stack.Screen name="DeliveryPreference" component={DeliveryPreferenceScreen} options={{ title: "Delivery Preference" }} />
            <Stack.Screen name="Summary" component={SummaryScreen} options={{ title: "Summary" }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Sign In" }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

