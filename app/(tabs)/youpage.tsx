import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import {
  confirmOrderAPI,
  currentUser,
  deleteProductAPI,
  formatPriceVnd,
  getMyProductsAPI,
  getOrdersAPI,
  isOwnProduct,
  logoutUser,
  orders,
  products,
  removeProduct,
  resolveMediaUrl,
} from "@/data";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [refresh, setRefresh] = useState(0);
  const [localProducts, setLocalProducts] = useState(products);
  const [localOrders, setLocalOrders] = useState(orders);

  useEffect(() => {
    let isMounted = true;

    const refreshProfileData = async () => {
      const [productsResult, ordersResult] = await Promise.all([
        getMyProductsAPI(),
        getOrdersAPI(),
      ]);
      if (isMounted) {
        setLocalProducts(
          productsResult.success ? productsResult.data : [...products],
        );
        setLocalOrders(ordersResult.success ? ordersResult.data : [...orders]);
      }
    };

    refreshProfileData();
    const interval = setInterval(refreshProfileData, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const unsoldProducts = localProducts.filter(
    (p) =>
      isOwnProduct(p) && (p.status === "available" || p.status === "pending"),
  );

  const soldProducts = localProducts.filter(
    (p) => isOwnProduct(p) && p.status === "sold",
  );

  const getOrderProduct = (order: any) =>
    order.productSnapshot ||
    localProducts.find((p) => String(p.id) === String(order.productId));

  const sellerOrders = localOrders.filter((o) => {
    if (currentUser?.id && o.sellerId) {
      if (String(o.sellerId) === String(currentUser.id)) {
        return true;
      }
    }

    if (currentUser?.name && o.seller) {
      if (String(o.seller).trim() === String(currentUser.name).trim()) {
        return true;
      }
    }

    const product = getOrderProduct(o);
    return Boolean(product && isOwnProduct(product));
  });

  const buyerOrders = localOrders.filter(
    (o) =>
      String(o.buyerId) === String(currentUser?.id) ||
      o.buyer === currentUser?.name ||
      o.buyer === currentUser?.username ||
      o.buyer === "Bạn",
  );

  const handleDeleteProduct = (id: string) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa sản phẩm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        onPress: async () => {
          const product = localProducts.find((p) => p.id === id);
          if (!product) {
            return;
          }

          const result = await deleteProductAPI(product);
          if (!result.success) {
            Alert.alert(
              "Không thể xóa",
              result.error || "Xóa sản phẩm thất bại",
            );
            return;
          }

          removeProduct(id);
          setLocalProducts([...products]);
          setRefresh((prev) => prev + 1);
        },
      },
    ]);
  };

  const renderUnsoldProduct = ({ item }: { item: any }) => (
    <ThemedView style={styles.unsoldProductItem}>
      <View style={styles.unsoldProductContent}>
        <Image
          source={{ uri: resolveMediaUrl(item.image) }}
          style={styles.unsoldProductImage}
        />
        <View style={styles.unsoldProductInfo}>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          <ThemedText>{formatPriceVnd(item.price)}</ThemedText>
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

  const renderSoldProduct = ({ item }: { item: any }) => {
    const order = localOrders.find(
      (o) => o.productId === item.id && o.status === "sold",
    );

    return (
      <ThemedView style={styles.soldProductItem}>
        <View style={styles.soldProductContent}>
          <Image
            source={{ uri: resolveMediaUrl(item.image) }}
            style={styles.soldProductImage}
          />
          <View style={styles.soldProductInfo}>
            <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
            <ThemedText>{formatPriceVnd(item.price)}</ThemedText>
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
    const product = getOrderProduct(item);

    return (
      <ThemedView style={styles.orderItem}>
        <ThemedText type="defaultSemiBold">
          {product?.name || "Sản phẩm đã bị xóa"}
        </ThemedText>
        <ThemedText>{formatPriceVnd(product?.price || 0)}</ThemedText>
        <ThemedText>Người mua: {item.buyer}</ThemedText>
        {item.status === "pending" ? (
          <>
            <ThemedText>Số điện thoại: {item.phone}</ThemedText>
            <ThemedText>Địa chỉ: {item.address}</ThemedText>
            <ThemedText>Email: {item.email || "Chưa cập nhật"}</ThemedText>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                Alert.alert("Xác nhận", "Xác nhận bán sản phẩm?", [
                  { text: "Hủy", style: "cancel" },
                  {
                    text: "Xác nhận",
                    onPress: async () => {
                      const orderId =
                        item.apiId ||
                        item.raw?.id ||
                        String(item.id).replace(/^api-order-/, "");
                      const result = await confirmOrderAPI(orderId);

                      if (!result.success) {
                        Alert.alert(
                          "Không thể xác nhận",
                          result.error || "Xác nhận đơn hàng thất bại",
                        );
                        return;
                      }

                      setLocalProducts([...products]);
                      setLocalOrders([...orders]);
                      setRefresh((prev) => prev + 1);
                    },
                  },
                ]);
              }}
            >
              <ThemedText style={{ color: "#fff" }}>Xác nhận</ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <ThemedText>Đã bán</ThemedText>
        )}
      </ThemedView>
    );
  };

  const renderBuyerOrder = ({ item }: { item: any }) => {
    const product = getOrderProduct(item);
    if (!product) return null;

    return (
      <ThemedView style={styles.orderItem}>
        <View style={styles.orderProductRow}>
          <Image
            source={{ uri: resolveMediaUrl(product.image) }}
            style={styles.orderProductImage}
          />
          <View style={styles.orderProductInfo}>
            <ThemedText type="defaultSemiBold">{product.name}</ThemedText>
            <ThemedText>{formatPriceVnd(product.price)}</ThemedText>
            <ThemedText>Người bán: {product.seller}</ThemedText>
            <ThemedText>
              Trạng thái:{" "}
              {item.status === "pending" ? "Chờ xác nhận" : "Đã mua"}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logoutUser();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Image
          source={{
            uri: currentUser?.avatar || "https://via.placeholder.com/150",
          }}
          style={styles.avatar}
        />
        <ThemedText type="title" style={styles.name}>
          {currentUser?.name || "Người dùng"}
        </ThemedText>
      </View>

      <TouchableOpacity
        style={[
          styles.createButton,
          { backgroundColor: Colors[colorScheme ?? "light"].tint },
        ]}
        onPress={() => router.push("/(tabs)/create-product" as any)}
      >
        <IconSymbol name="plus" size={20} color="#fff" />
        <ThemedText style={{ color: "#fff", marginLeft: 8 }}>
          Tạo mới sản phẩm
        </ThemedText>
      </TouchableOpacity>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Sản phẩm chưa bán ({unsoldProducts.length})
        </ThemedText>
        {unsoldProducts.length > 0 ? (
          <FlatList
            data={unsoldProducts}
            renderItem={renderUnsoldProduct}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            extraData={refresh}
            scrollEnabled={false}
          />
        ) : (
          <ThemedText style={styles.emptyText}>
            Không có sản phẩm chưa bán
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Đơn mua hàng
        </ThemedText>
        <FlatList
          data={sellerOrders}
          renderItem={renderSellerOrder}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          extraData={refresh}
          scrollEnabled={false}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Sản phẩm đã bán
        </ThemedText>
        {soldProducts.length > 0 ? (
          <FlatList
            data={soldProducts}
            renderItem={renderSoldProduct}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            extraData={refresh}
            scrollEnabled={false}
          />
        ) : (
          <ThemedText style={styles.emptyText}>
            Không có sản phẩm đã bán
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Sản phẩm đã mua
        </ThemedText>
        <FlatList
          data={buyerOrders}
          renderItem={renderBuyerOrder}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          extraData={refresh}
          scrollEnabled={false}
        />
      </ThemedView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <IconSymbol
          name="rectangle.portrait.and.arrow.right"
          size={20}
          color="#FF3B30"
        />
        <ThemedText style={styles.logoutText}>Đăng xuất</ThemedText>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#ffffff" },
  header: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 24, marginBottom: 5 },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, marginBottom: 10 },
  orderItem: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  orderProductRow: { flexDirection: "row" },
  orderProductImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 10,
  },
  orderProductInfo: { flex: 1 },
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
  soldProductContent: { flexDirection: "row", flex: 1 },
  soldProductImage: { width: 50, height: 50, borderRadius: 8, marginRight: 10 },
  soldProductInfo: { flex: 1 },
  deleteXButton: { padding: 5 },
  deleteXText: { fontSize: 18, color: "#FF3B30", fontWeight: "bold" },
  unsoldProductItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#fff9e6",
  },
  unsoldProductContent: { flexDirection: "row", flex: 1 },
  unsoldProductImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  unsoldProductInfo: { flex: 1 },
  statusText: { fontSize: 12, color: "#FFA500", fontWeight: "500" },
  emptyText: {
    textAlign: "center",
    padding: 20,
    color: "#999999",
    fontStyle: "italic",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FF3B30",
    borderRadius: 8,
  },
  logoutText: { color: "#FF3B30", marginLeft: 8, fontWeight: "600" },
});
