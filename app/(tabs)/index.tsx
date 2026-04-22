import { useEffect, useState } from "react";
import { FlatList, StyleSheet, useWindowDimensions } from "react-native";

import ProductCard from "@/components/ProductCard";
import { ThemedView } from "@/components/themed-view";
import { getAvailableProducts } from "@/data";

// Component màn hình chính - Hiển thị danh sách sản phẩm scroll theo trang
// Mỗi trang là một sản phẩm (pagingEnabled = true)
export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const [products, setProducts] = useState(getAvailableProducts());

  useEffect(() => {
    const interval = setInterval(() => {
      setProducts(getAvailableProducts());
    }, 1000); // Check every second, not ideal but for demo

    return () => clearInterval(interval);
  }, []);

  return (
    <ThemedView style={styles.screen}>
      {/* FlatList: Danh sách sản phẩm cuộn theo trang (như Shopee) */}
      <FlatList
        data={products} // Dữ liệu sản phẩm
        keyExtractor={(item) => item.id} // Khóa duy nhất cho mỗi item
        renderItem={({ item }) => (
          <ProductCard item={item} height={height - 176} />
        )}
        pagingEnabled // Bật chế độ cuộn theo trang
        showsVerticalScrollIndicator={false} // Ẩn thanh cuộn
        decelerationRate="fast" // Tốc độ cuộn nhanh
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

// Định nghĩa các style cho component
const styles = StyleSheet.create({
  // ===== STYLE MÀN HÌNH CHÍNH =====
  screen: {
    flex: 1,
    paddingTop: 80, // Tăng padding trên để tạo vùng trống như Locket
    paddingHorizontal: 16,
    backgroundColor: "#000000", // Nền đen
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
});
