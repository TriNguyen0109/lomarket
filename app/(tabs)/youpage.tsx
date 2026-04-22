import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { confirmOrder, orders, products, removeProduct } from "@/data";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [refresh, setRefresh] = useState(0);
  const [localProducts, setLocalProducts] = useState(products);
  const [localOrders, setLocalOrders] = useState(orders);

  useEffect(() => {
    const interval = setInterval(() => {
      setLocalProducts([...products]);
      setLocalOrders([...orders]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Dữ liệu sản phẩm chưa bán của người dùng
  const unsoldProducts = localProducts.filter(
    (p) =>
      p.seller === "Bạn" &&
      (p.status === "available" || p.status === "pending"),
  );

  // Dữ liệu sản phẩm đã bán của người dùng
  const soldProducts = localProducts.filter(
    (p) => p.seller === "Bạn" && p.status === "sold",
  );

  // Đơn mua hàng của người dùng (seller)
  const sellerOrders = localOrders.filter((o) => {
    const product = localProducts.find((p) => p.id === o.productId);
    return product && product.seller === "Bạn";
  });

  // Sản phẩm người dùng mua
  const buyerOrders = localOrders.filter((o) => o.buyer === "Bạn");

  const handleDeleteProduct = (id: string) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa sản phẩm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        onPress: () => {
          removeProduct(id);
          setRefresh(refresh + 1);
        },
      },
    ]);
  };

  const renderUnsoldProduct = ({ item }: { item: any }) => {
    return (
      <ThemedView style={styles.unsoldProductItem}>
        <View style={styles.unsoldProductContent}>
          <Image
            source={{ uri: item.image }}
            style={styles.unsoldProductImage}
          />
          <View style={styles.unsoldProductInfo}>
            <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
            <ThemedText>{item.price}</ThemedText>
            <ThemedText style={styles.statusText}>
              {item.status === "pending" ? "Chờ xác nhận" : "Có sẵn"}
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteProduct(item.id)}
          style={styles.deleteXButton}
        >
          <ThemedText style={styles.deleteXText}>X</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  };

  const renderSoldProduct = ({ item }: { item: any }) => {
    const order = localOrders.find(
      (o) => o.productId === item.id && o.status === "sold",
    );
    return (
      <ThemedView style={styles.soldProductItem}>
        <View style={styles.soldProductContent}>
          <Image source={{ uri: item.image }} style={styles.soldProductImage} />
          <View style={styles.soldProductInfo}>
            <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
            <ThemedText>{item.price}</ThemedText>
            <ThemedText>Người mua: {order ? order.buyer : "N/A"}</ThemedText>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteProduct(item.id)}
          style={styles.deleteXButton}
        >
          <ThemedText style={styles.deleteXText}>X</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  };

  const renderSellerOrder = ({ item }: { item: any }) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return null;

    return (
      <ThemedView style={styles.orderItem}>
        <ThemedText type="defaultSemiBold">{product.name}</ThemedText>
        <ThemedText>Người mua: {item.buyer}</ThemedText>
        {item.status === "pending" ? (
          <>
            <ThemedText>Số điện thoại: {item.phone}</ThemedText>
            <ThemedText>Địa chỉ: {item.address}</ThemedText>
            <ThemedText>Zalo/Facebook: {item.zaloFb}</ThemedText>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                Alert.alert("Xác nhận", "Xác nhận bán sản phẩm?", [
                  { text: "Hủy", style: "cancel" },
                  {
                    text: "Xác nhận",
                    onPress: () => {
                      confirmOrder(item.id);
                      setRefresh(refresh + 1);
                    },
                  },
                ]);
              }}
            >
              <ThemedText style={{ color: "#fff" }}>Xác nhận</ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <ThemedText>Đã xác nhận</ThemedText>
        )}
      </ThemedView>
    );
  };

  const renderBuyerOrder = ({ item }: { item: any }) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return null;

    return (
      <ThemedView style={styles.orderItem}>
        <ThemedText type="defaultSemiBold">{product.name}</ThemedText>
        <ThemedText>Người bán: {product.seller}</ThemedText>
        <ThemedText>
          Trạng thái:{" "}
          {item.status === "pending" ? "Chờ xác nhận" : "Đã xác nhận"}
        </ThemedText>
      </ThemedView>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header với avatar và thông tin */}
      <View style={styles.header}>
        <Image
          source={{ uri: "https://via.placeholder.com/150" }}
          style={styles.avatar}
        />
        <ThemedText type="title" style={styles.name}>
          Tên Người Dùng
        </ThemedText>
        <ThemedText style={styles.bio}>Mô tả ngắn về người dùng</ThemedText>
      </View>

      {/* Nút tạo mới sản phẩm */}
      <TouchableOpacity
        style={[
          styles.createButton,
          { backgroundColor: Colors[colorScheme ?? "light"].tint },
        ]}
        onPress={() => router.push("/(tabs)/create-product" as any)} // Giả sử có route này
      >
        <IconSymbol name="plus" size={20} color="#fff" />
        <ThemedText style={{ color: "#fff", marginLeft: 8 }}>
          Tạo mới sản phẩm
        </ThemedText>
      </TouchableOpacity>

      {/* Sản phẩm chưa bán */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Sản phẩm chưa bán ({unsoldProducts.length})
        </ThemedText>
        {unsoldProducts.length > 0 ? (
          <FlatList
            data={unsoldProducts}
            renderItem={renderUnsoldProduct}
            keyExtractor={(item) => item.id}
            extraData={refresh}
            scrollEnabled={false}
          />
        ) : (
          <ThemedText style={styles.emptyText}>
            Không có sản phẩm chưa bán
          </ThemedText>
        )}
      </ThemedView>

      {/* Đơn mua hàng */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Đơn mua hàng
        </ThemedText>
        <FlatList
          data={sellerOrders}
          renderItem={renderSellerOrder}
          keyExtractor={(item) => item.id}
          extraData={refresh}
          scrollEnabled={false}
        />
      </ThemedView>

      {/* Danh sách sản phẩm đã bán */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Sản phẩm đã bán
        </ThemedText>
        {soldProducts.length > 0 ? (
          <FlatList
            data={soldProducts}
            renderItem={renderSoldProduct}
            keyExtractor={(item) => item.id}
            extraData={refresh}
            scrollEnabled={false}
          />
        ) : (
          <ThemedText style={styles.emptyText}>
            Không có sản phẩm đã bán
          </ThemedText>
        )}
      </ThemedView>

      {/* Sản phẩm người dùng mua */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Sản phẩm đã mua
        </ThemedText>
        <FlatList
          data={buyerOrders}
          renderItem={renderBuyerOrder}
          keyExtractor={(item) => item.id}
          extraData={refresh}
          scrollEnabled={false}
        />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#ffffff",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    marginBottom: 5,
  },
  bio: {
    fontSize: 16,
    textAlign: "center",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 5,
    borderRadius: 5,
    alignSelf: "flex-end",
  },
  orderItem: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  soldProductItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  soldProductContent: {
    flexDirection: "row",
    flex: 1,
  },
  soldProductImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  soldProductInfo: {
    flex: 1,
  },
  deleteXButton: {
    padding: 5,
  },
  deleteXText: {
    fontSize: 18,
    color: "#FF3B30",
    fontWeight: "bold",
  },
  unsoldProductItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#fff9e6",
  },
  unsoldProductContent: {
    flexDirection: "row",
    flex: 1,
  },
  unsoldProductImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  unsoldProductInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    color: "#FFA500",
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    padding: 20,
    color: "#999999",
    fontStyle: "italic",
  },
});
