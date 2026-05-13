import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { addProduct, createProductAPI, formatPriceVnd } from "@/data";

export default function CreateProductScreen() {
  const [photoUri, setPhotoUri] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [notice, setNotice] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const router = useRouter();

  const handlePriceChange = (value: string) =>
    setPrice(value.replace(/\D/g, ""));

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Quyền camera", "Bạn chưa cấp quyền camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
      setNotice("Đã chụp ảnh thành công.");
    }
  };

  const submitProduct = () => {
    if (!photoUri || !name.trim() || !price.trim() || !description.trim()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin và chụp ảnh.");
      return;
    }

    Alert.alert("Xác nhận", "Bạn có chắc muốn tạo sản phẩm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Tạo",
        onPress: async () => {
          setIsBusy(true);
          const res = await createProductAPI({
            title: name.trim(),
            description: description.trim(),
            price: price.trim(),
            image: photoUri,
          });
          setIsBusy(false);

          if (!res.success || !res.data) {
            console.error("createProductAPI failed", res);
            Alert.alert(
              "Không thể đồng bộ sản phẩm",
              res.error || "Tạo sản phẩm thất bại trên server.",
            );
            return;
          }

          addProduct(res.data);
          setName("");
          setPrice("");
          setDescription("");
          setPhotoUri("");
          setNotice("Bạn có thể chụp ảnh mới.");
          Alert.alert("Thành công", "Sản phẩm đã được tạo và đồng bộ.");
          router.replace("/(tabs)");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <ThemedText type="title" style={styles.title}>
        Tạo sản phẩm mới
      </ThemedText>
      {notice ? (
        <ThemedText style={styles.noticeText}>{notice}</ThemedText>
      ) : null}

      <View style={styles.cameraContainer}>
        <View style={styles.squarePreview}>
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={styles.capturedImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.emptyState}>
              <ThemedText>Chưa có ảnh</ThemedText>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={takePhoto}
          style={styles.captureButton}
          disabled={isBusy}
        >
          <ThemedText style={styles.captureText}>
            {photoUri ? "Chụp lại" : "Chụp ảnh"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Tên sản phẩm"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Giá (VD: 100000)"
          value={price}
          onChangeText={handlePriceChange}
          keyboardType="number-pad"
        />
        {price ? (
          <ThemedText style={styles.pricePreview}>
            Giá hiển thị: {formatPriceVnd(price)}
          </ThemedText>
        ) : null}
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Mô tả sản phẩm"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity
          onPress={submitProduct}
          style={[styles.submitButton, isBusy && { opacity: 0.7 }]}
          disabled={isBusy}
        >
          <ThemedText style={styles.submitText}>
            {isBusy ? "Đang xử lý..." : "Tạo sản phẩm"}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  contentContainer: { paddingBottom: 32 },
  title: { textAlign: "center", marginBottom: 20 },
  noticeText: { marginBottom: 12, textAlign: "center" },
  cameraContainer: { alignItems: "center", marginBottom: 20 },
  squarePreview: {
    width: 300,
    height: 300,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  capturedImage: { width: "100%", height: "100%" },
  captureButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  captureText: { color: "#fff" },
  form: { marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  pricePreview: {
    color: "#555",
    marginBottom: 10,
    marginTop: -4,
  },
  descriptionInput: { minHeight: 96 },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontSize: 16 },
});
