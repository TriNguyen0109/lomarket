import { Image } from "expo-image";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import {
  createOrderAPI,
  formatPriceVnd,
  getOrdersAPI,
  isOwnProduct,
  resolveMediaUrl,
} from "@/data";
import ProductModal, { Product } from "./ProductModal";

interface ProductCardProps {
  item: Product;
  height: number;
  onPurchased?: (product: Product) => void;
}

export default function ProductCard({
  item,
  height,
  onPurchased,
}: ProductCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const showReadMore = item.description.length > 120;

  return (
    <View style={[styles.cardPage, { height }]}>
      <View style={styles.cardTop}>
        <Image
          source={{ uri: resolveMediaUrl(item.image) }}
          style={styles.productImage}
          contentFit="cover"
        />
      </View>

      <View style={styles.cardBody}>
        <ThemedText type="subtitle" style={styles.productName}>
          {item.name}
        </ThemedText>

        <ThemedText type="defaultSemiBold" style={styles.productPrice}>
          {formatPriceVnd(item.price)}
        </ThemedText>

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

        <View style={styles.productActions}>
          <Pressable
            onPress={() => {
              if (isOwnProduct(item)) {
                Alert.alert(
                  "Không thể mua",
                  "Bạn không thể mua sản phẩm của chính mình.",
                );
                return;
              }

              if (item.status && item.status !== "available") {
                Alert.alert(
                  "Không thể mua",
                  "Sản phẩm này đang chờ xác nhận hoặc đã bán.",
                );
                return;
              }

              Alert.alert("Xác nhận", "Bạn có chắc muốn mua sản phẩm này?", [
                { text: "Hủy", style: "cancel" },
                {
                  text: "Mua",
                  onPress: async () => {
                    const result = await createOrderAPI(item);
                    if (!result.success) {
                      Alert.alert(
                        "Không thể mua",
                        result.error ||
                          "Sản phẩm này đang chờ xác nhận hoặc đã có đơn.",
                      );
                      return;
                    }

                    await getOrdersAPI();
                    onPurchased?.(item);
                    Alert.alert(
                      "Thành công",
                      "Đã gửi yêu cầu mua. Sản phẩm sẽ xuất hiện trong mục Sản phẩm đã mua với trạng thái chờ xác nhận.",
                    );
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
        </View>

        <View style={styles.sellerInfo}>
          <Image
            source={{ uri: resolveMediaUrl(item.sellerAvatar) }}
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

const styles = StyleSheet.create({
  cardPage: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    flexDirection: "column",
    marginBottom: 0,
  },
  cardTop: {
    flex: 1,
    minHeight: 180,
    backgroundColor: "#333333",
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
  },
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
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
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
