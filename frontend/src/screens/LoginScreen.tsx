import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

const LoginScreen = () => {
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    register("email");
    register("password");
  }, [register]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
    } catch (error) {
      Alert.alert("Login failed", "Check your credentials and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Delivery</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          testID="email-input"
          style={[styles.input, errors.email && styles.inputError]}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="you@example.com"
          onChangeText={(text) => setValue("email", text, { shouldValidate: true })}
          value={watch("email") ?? ""}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          testID="password-input"
          style={[styles.input, errors.password && styles.inputError]}
          secureTextEntry
          placeholder="••••••••"
          onChangeText={(text) => setValue("password", text, { shouldValidate: true })}
          value={watch("password") ?? ""}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? "Signing in..." : "Sign In"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#f7f7f7",
  },
  title: {
    fontSize: 28,
    fontFamily: "Satoshi-Regular",
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "Satoshi-Regular",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
    fontFamily: "Satoshi-Regular",
  },
  inputError: {
    borderColor: "#ff6b6b",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Satoshi-Regular",
  },
});

export default LoginScreen;

