import { useEffect, useMemo, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { createOrder, getOrder, updateOrder } from "../api/orders";
import type { DeliveryType } from "../types/order";
import type { RootStackParamList } from "../navigation/AppNavigator";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { clearOrderDraft, loadOrderDraft, saveOrderDraft } from "../storage/orderDraft";
import { getCurrentOrderId, setCurrentOrderId } from "../storage/currentOrder";

const deliveryTypes: DeliveryType[] = ["IN_STORE", "DELIVERY", "CURBSIDE"];

const schema = z
  .object({
    deliveryType: z.enum(deliveryTypes),
    scheduledTime: z.date({
      required_error: "Please select a pickup time",
    }),
    contactPhone: z.string().min(10, "Enter a valid phone number"),
    deliveryAddress: z.string().optional(),
    pickupPerson: z.string().optional(),
    curbsideVehicleInfo: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.scheduledTime.getTime() <= Date.now()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledTime"],
        message: "Pickup time must be in the future",
      });
    }
    if (data.deliveryType === "DELIVERY" && !data.deliveryAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryAddress"],
        message: "Delivery address is required",
      });
    }
    if (data.deliveryType === "CURBSIDE" && !data.curbsideVehicleInfo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["curbsideVehicleInfo"],
        message: "Vehicle details are required",
      });
    }
    if (data.deliveryType === "IN_STORE" && !data.pickupPerson) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pickupPerson"],
        message: "Pickup person name is required",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

const DeliveryPreferenceScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isSubmitting, setSubmitting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
    register,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      deliveryType: "IN_STORE",
      scheduledTime: new Date(Date.now() + 60 * 60 * 1000),
      contactPhone: "",
      deliveryAddress: "",
      pickupPerson: "",
      curbsideVehicleInfo: "",
      notes: "",
    },
  });

  useEffect(() => {
    register("deliveryType");
    register("scheduledTime");
    register("contactPhone");
    register("deliveryAddress");
    register("pickupPerson");
    register("curbsideVehicleInfo");
    register("notes");
  }, [register]);

  const deliveryType = watch("deliveryType") ?? "IN_STORE";
  const scheduledTime = watch("scheduledTime") ?? new Date(Date.now() + 60 * 60 * 1000);

  useEffect(() => {
    void (async () => {
      const existingOrderId = await getCurrentOrderId();
      const stored = await loadOrderDraft();
      if (stored) {
        reset({
          deliveryType: (stored.deliveryType as DeliveryType) ?? "IN_STORE",
          scheduledTime: stored.scheduledTime ? new Date(stored.scheduledTime) : new Date(Date.now() + 60 * 60 * 1000),
          contactPhone: stored.contactPhone ?? "",
          deliveryAddress: stored.deliveryAddress ?? "",
          pickupPerson: stored.pickupPerson ?? "",
          curbsideVehicleInfo: stored.curbsideVehicleInfo ?? "",
          notes: stored.notes ?? "",
        });
      } else if (existingOrderId) {
        try {
          const existing = await getOrder(existingOrderId);
          reset({
            deliveryType: existing.deliveryType,
            scheduledTime: new Date(existing.scheduledTime),
            contactPhone: existing.contactPhone,
            deliveryAddress: existing.deliveryAddress ?? "",
            pickupPerson: existing.pickupPerson ?? "",
            curbsideVehicleInfo: existing.curbsideVehicleInfo ?? "",
            notes: existing.notes ?? "",
          });
        } catch {
          // ignore fetch failure
        }
      }
    })();
  }, [reset]);

  useEffect(() => {
    const subscription = watch((value) => {
      void saveOrderDraft({
        ...value,
        scheduledTime: value.scheduledTime?.toISOString(),
      });
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onChangeDate = (_event: DateTimePickerEvent, date?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (date) {
      setValue("scheduledTime", date, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        deliveryType: values.deliveryType,
        scheduledTime: values.scheduledTime.toISOString(),
        contactPhone: values.contactPhone,
        deliveryAddress: values.deliveryAddress,
        pickupPerson: values.pickupPerson,
        curbsideVehicleInfo: values.curbsideVehicleInfo,
        notes: values.notes,
      };
      let orderId = await getCurrentOrderId();
      let orderResponse;
      if (orderId) {
        orderResponse = await updateOrder(orderId, payload);
      } else {
        orderResponse = await createOrder(payload);
      }
      const finalOrderId = orderResponse.id;
      await setCurrentOrderId(finalOrderId);
      await clearOrderDraft();
      navigation.navigate("Summary", { orderId: finalOrderId });
    } catch (error) {
      Alert.alert("Unable to save order", "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isFieldVisible = useMemo(() => {
    return {
      deliveryAddress: deliveryType === "DELIVERY",
      pickupPerson: deliveryType === "IN_STORE",
      curbsideVehicleInfo: deliveryType === "CURBSIDE",
    };
  }, [deliveryType]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose your delivery preference</Text>
      <View style={styles.segmentContainer}>
        {deliveryTypes.map((type, index) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.segment,
              index < deliveryTypes.length - 1 && styles.segmentSpacing,
              deliveryType === type && styles.segmentActive,
            ]}
            onPress={() => setValue("deliveryType", type, { shouldValidate: true })}
          >
            <Text style={[styles.segmentLabel, deliveryType === type && styles.segmentLabelActive]}>{type.replace("_", " ")}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pickup Time</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)} testID="scheduledTime-button">
          <Text style={styles.inputText}>{scheduledTime.toLocaleString()}</Text>
        </TouchableOpacity>
        {errors.scheduledTime && <Text style={styles.error}>{errors.scheduledTime.message}</Text>}
      </View>
      {showPicker && (
        <DateTimePicker
          value={scheduledTime}
          mode="datetime"
          display={Platform.OS === "ios" ? "inline" : "default"}
          minimumDate={new Date()}
          onChange={onChangeDate}
        />
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contact Phone</Text>
        <TextInput
          style={[styles.input, errors.contactPhone && styles.inputError]}
          keyboardType="phone-pad"
          onChangeText={(text) => setValue("contactPhone", text, { shouldValidate: true })}
          value={watch("contactPhone") ?? ""}
        />
        {errors.contactPhone && <Text style={styles.error}>{errors.contactPhone.message}</Text>}
      </View>

      {isFieldVisible.deliveryAddress && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Delivery Address</Text>
          <TextInput
            style={[styles.input, errors.deliveryAddress && styles.inputError]}
            onChangeText={(text) => setValue("deliveryAddress", text, { shouldValidate: true })}
            value={watch("deliveryAddress") ?? ""}
          />
          {errors.deliveryAddress && <Text style={styles.error}>{errors.deliveryAddress.message}</Text>}
        </View>
      )}

      {isFieldVisible.pickupPerson && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Pickup Person</Text>
          <TextInput
            style={[styles.input, errors.pickupPerson && styles.inputError]}
            onChangeText={(text) => setValue("pickupPerson", text, { shouldValidate: true })}
            value={watch("pickupPerson") ?? ""}
          />
          {errors.pickupPerson && <Text style={styles.error}>{errors.pickupPerson.message}</Text>}
        </View>
      )}

      {isFieldVisible.curbsideVehicleInfo && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Vehicle Details</Text>
          <TextInput
            style={[styles.input, errors.curbsideVehicleInfo && styles.inputError]}
            onChangeText={(text) => setValue("curbsideVehicleInfo", text, { shouldValidate: true })}
            value={watch("curbsideVehicleInfo") ?? ""}
          />
          {errors.curbsideVehicleInfo && <Text style={styles.error}>{errors.curbsideVehicleInfo.message}</Text>}
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          multiline
          numberOfLines={3}
          onChangeText={(text) => setValue("notes", text)}
          value={watch("notes") ?? ""}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        <Text style={styles.submitButtonText}>{isSubmitting ? "Saving..." : "Save Preference"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontFamily: "Satoshi-Regular",
    marginBottom: 16,
  },
  segmentContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    backgroundColor: "white",
  },
  segmentActive: {
    backgroundColor: "#111827",
  },
  segmentSpacing: {
    marginRight: 8,
  },
  segmentLabel: {
    fontFamily: "Satoshi-Regular",
    color: "#111827",
  },
  segmentLabelActive: {
    color: "white",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: "Satoshi-Regular",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
    fontFamily: "Satoshi-Regular",
  },
  inputText: {
    fontFamily: "Satoshi-Regular",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  error: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: "#111827",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontFamily: "Satoshi-Regular",
    fontSize: 16,
  },
});

export default DeliveryPreferenceScreen;

