import { CameraView, useCameraPermissions } from "expo-camera";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { addProduct } from "@/data";

export default function CreateProductScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const cameraRef = useRef<any>(null);
  const router = useRouter();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>
          Cần quyền truy cập camera để chụp ảnh sản phẩm.
        </ThemedText>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <ThemedText style={styles.buttonText}>Cho phép truy cập</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync();
      setPhoto(photoData.uri);
    }
  };

  const submitProduct = () => {
    if (!photo || !name || !price || !description) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin và chụp ảnh.");
      return;
    }

    Alert.alert("Xác nhận", "Bạn có chắc muốn tạo sản phẩm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Tạo",
        onPress: () => {
          const newProduct = {
            id: Date.now().toString(),
            name,
            price,
            description,
            sold: "0",
            discount: "0%",
            seller: "Bạn",
            sellerAvatar: "https://via.placeholder.com/50",
            image: photo,
            status: "available",
          };

          addProduct(newProduct);

          // Reset form
          setName("");
          setPrice("");
          setDescription("");
          setPhoto(null);

          Alert.alert("Thành công", "Sản phẩm đã được tạo!");
          router.push("/(tabs)");
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Tạo sản phẩm mới
      </ThemedText>

      {!photo ? (
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} ref={cameraRef} />
          <TouchableOpacity onPress={takePhoto} style={styles.captureButton}>
            <IconSymbol name="camera" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.photoContainer}>
          <ExpoImage source={{ uri: photo }} style={styles.capturedImage} />
          <TouchableOpacity
            onPress={() => setPhoto(null)}
            style={styles.retakeButton}
          >
            <ThemedText style={styles.retakeText}>Chụp lại</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Tên sản phẩm"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Giá (VD: 100k)"
          value={price}
          onChangeText={setPrice}
        />
        <TextInput
          style={styles.input}
          placeholder="Mô tả sản phẩm"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity onPress={submitProduct} style={styles.submitButton}>
          <ThemedText style={styles.submitText}>Tạo sản phẩm</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
  },
  cameraContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  camera: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  captureButton: {
    backgroundColor: "#007AFF",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  capturedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  retakeButton: {
    backgroundColor: "#FF3B30",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retakeText: {
    color: "#fff",
  },
  form: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
  },
});
