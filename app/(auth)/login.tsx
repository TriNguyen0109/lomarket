import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { loginUser } from "@/data";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tài khoản và mật khẩu");
      return;
    }

    setLoading(true);
    const result = await loginUser(username, password);
    setLoading(false);

    if (result.success) {
      // Đảm bảo điều hướng vào đúng group tabs đã định nghĩa ở Root Layout
      router.replace("/(tabs)");
    } else {
      Alert.alert("Thất bại", result.error || "Đăng nhập không thành công");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Lomarket
        </ThemedText>
        <ThemedText style={styles.subtitle}>Đăng nhập để tiếp tục</ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập / Email"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <ThemedText style={styles.buttonText}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/signup")}>
          <ThemedText style={styles.linkText}>
            Chưa có tài khoản? Đăng ký ngay
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000",
  },
  content: {
    width: "100%",
  },
  title: {
    fontSize: 40,
    textAlign: "center",
    marginBottom: 10,
    color: "#fff",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 40,
    color: "#ccc",
  },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  button: {
    backgroundColor: "#ff6b35",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkText: {
    color: "#ff6b35",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
});
