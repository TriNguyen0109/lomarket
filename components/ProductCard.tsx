import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { addOrder } from "@/data";
import ProductModal, { Product } from "./ProductModal";

interface ProductCardProps {
  item: Product;
  height: number;
}

export default function ProductCard({ item, height }: ProductCardProps) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const showReadMore = item.description.length > 120;

  return (
    <View style={[styles.cardPage, { minHeight: height }]}>
      {/* Phần trên: Hiển thị ảnh sản phẩm lớn */}
      <View style={styles.cardTop}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          contentFit="cover"
        />
      </View>
      {/* Phần dưới: Thông tin sản phẩm, giá, mô tả, nút mua, seller */}
      <View style={styles.cardBody}>
        {/* Tên sản phẩm */}
        <ThemedText type="subtitle" style={styles.productName}>
          {item.name}
        </ThemedText>
        {/* Giá sản phẩm (màu vàng nổi bật) */}
        <ThemedText type="defaultSemiBold" style={styles.productPrice}>
          {item.price}
        </ThemedText>
        {/* Mô tả sản phẩm */}
        <ThemedText
          style={styles.productDescription}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {item.description}
        </ThemedText>
        {showReadMore ? (
          <Pressable
            onPress={() => setModalVisible(true)}
            style={({ pressed }) => [
              styles.readMoreButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText style={styles.readMoreText}>Xem thêm</ThemedText>
          </Pressable>
        ) : null}
        {/* Các nút hành động: Mua ngay và Chat với seller */}
        <View style={styles.productActions}>
          <Pressable
            onPress={() => {
              Alert.alert("Xác nhận", "Bạn có chắc muốn mua sản phẩm này?", [
                { text: "Hủy", style: "cancel" },
                {
                  text: "Mua",
                  onPress: () => {
                    const order = {
                      id: Date.now().toString(),
                      productId: item.id,
                      buyer: "Bạn",
                      phone: "0123456789",
                      address: "123 Đường ABC, Quận XYZ",
                      zaloFb: "zalo/fb link",
                      status: "pending",
                    };
                    addOrder(order);
                    Alert.alert("Thành công", "Đã gửi yêu cầu mua!");
                  },
                },
              ]);
            }}
            android_ripple={{ color: "rgba(255,255,255,0.15)" }}
            style={({ pressed }) => [
              styles.buttonBuy,
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText type="defaultSemiBold">Mua ngay</ThemedText>
          </Pressable>
          {/* <Pressable
            onPress={() => {}}
            android_ripple={{ color: "rgba(255,255,255,0.15)" }}
            style={({ pressed }) => [
              styles.buttonChat,
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText type="defaultSemiBold">Chat</ThemedText>
          </Pressable> */}
        </View>
        {/* Thông tin người bán: Avatar hình tròn + Tên shop */}
        <View style={styles.sellerInfo}>
          <Image
            source={{ uri: item.sellerAvatar }}
            style={styles.sellerAvatar}
            contentFit="cover"
          />
          <ThemedText style={styles.productSeller}>{item.seller}</ThemedText>
        </View>
      </View>
      <ProductModal
        item={item}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

// Định nghĩa các style cho component
const styles = StyleSheet.create({
  // ===== STYLE THẺ SẢN PHẨM =====
  cardPage: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    backgroundColor: "#1a1a1a", // Nền đen nhẹ
    marginBottom: 0,
  },

  // ===== STYLE PHẦN ẢNH (TRÊN) =====
  cardTop: {
    minHeight: 365,
    backgroundColor: "#333333",
  },
  productImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
  },

  // ===== STYLE PHẦN THÔNG TIN (DƯỚI) =====
  cardBody: {
    padding: 18,
  },
  readMoreButton: {
    marginTop: -8,
    marginBottom: 8,
  },
  readMoreText: {
    color: "#70bfff",
    textDecorationLine: "underline",
  },
  productName: {
    marginBottom: 12,
    color: "#ffffff",
  },
  productPrice: {
    marginBottom: 12,
    color: "#ffd700",
    fontSize: 24,
  },
  productDescription: {
    marginBottom: 16,
    color: "#cccccc",
    lineHeight: 22,
  },
  productStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  // ===== STYLE CÁC NÚT HÀNH ĐỘNG =====
  productActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  buttonBuy: {
    flex: 1,
    backgroundColor: "#ff6b35",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonChat: {
    flex: 1,
    backgroundColor: "#555555",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  // ===== STYLE THÔNG TIN NGƯỜI BÁN =====
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sellerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#666666",
  },
  productSeller: {
    color: "#cccccc",
    fontSize: 16,
    fontWeight: "600",
  },
});
