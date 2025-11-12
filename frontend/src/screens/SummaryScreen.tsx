import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { RouteProp } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getOrder, updateOrder } from "../api/orders";
import type { RootStackParamList } from "../navigation/AppNavigator";
import type { Order } from "../types/order";
import { saveOrderDraft } from "../storage/orderDraft";
import { getCurrentOrderId, setCurrentOrderId } from "../storage/currentOrder";

type SummaryRouteProp = RouteProp<RootStackParamList, "Summary">;

const SummaryScreen = () => {
  const route = useRoute<SummaryRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrder = useCallback(async () => {
    let orderId = route.params?.orderId;
    if (!orderId) {
      orderId = await getCurrentOrderId();
    }
    if (!orderId) {
      setLoading(false);
      return;
    }
    try {
      const record = await getOrder(orderId);
      setOrder(record);
      await setCurrentOrderId(record.id);
    } catch (error) {
      Alert.alert("Unable to load order");
    } finally {
      setLoading(false);
    }
  }, [route.params?.orderId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadOrder();
    }, [loadOrder])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrder();
    setRefreshing(false);
  };

  const handleEdit = async () => {
    if (!order) {
      return;
    }
    await saveOrderDraft({
      deliveryType: order.deliveryType,
      scheduledTime: order.scheduledTime,
      contactPhone: order.contactPhone,
      deliveryAddress: order.deliveryAddress ?? undefined,
      pickupPerson: order.pickupPerson ?? undefined,
      curbsideVehicleInfo: order.curbsideVehicleInfo ?? undefined,
      notes: order.notes ?? undefined,
    });
    navigation.navigate("DeliveryPreference");
  };

  const renderField = (label: string, value?: string | null) => {
    if (!value) return null;
    return (
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Delivery Summary</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : order ? (
        <View style={styles.card}>
          {renderField("Delivery Type", order.deliveryType.replace("_", " "))}
          {renderField("Scheduled Time", new Date(order.scheduledTime).toLocaleString())}
          {renderField("Contact Phone", order.contactPhone)}
          {renderField("Delivery Address", order.deliveryAddress)}
          {renderField("Pickup Person", order.pickupPerson)}
          {renderField("Vehicle Info", order.curbsideVehicleInfo)}
          {renderField("Notes", order.notes)}
          <Text style={styles.meta}>Last updated: {new Date(order.updatedAt).toLocaleString()}</Text>

          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit Preference</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.emptyState}>No order found. Create one first.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9fafb",
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: "Satoshi-Regular",
  },
  logoutButton: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    fontFamily: "Satoshi-Regular",
  },
  loading: {
    fontFamily: "Satoshi-Regular",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  fieldRow: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontFamily: "Satoshi-Regular",
    color: "#6b7280",
    marginBottom: 4,
  },
  fieldValue: {
    fontFamily: "Satoshi-Regular",
    fontSize: 16,
  },
  meta: {
    fontFamily: "Satoshi-Regular",
    color: "#6b7280",
    marginTop: 12,
    fontSize: 12,
  },
  editButton: {
    marginTop: 16,
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "white",
    fontFamily: "Satoshi-Regular",
  },
  emptyState: {
    fontFamily: "Satoshi-Regular",
  },
});

export default SummaryScreen;

