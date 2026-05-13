import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, useWindowDimensions } from "react-native";

import ProductCard from "@/components/ProductCard";
import { ThemedView } from "@/components/themed-view";
import {
  getFollowedProductsAPI,
  getMyProductsAPI,
  getOrdersAPI,
  isAuthenticated,
  orders,
} from "@/data";

export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const [products, setProducts] = useState<any[]>([]);
  const cardHeight = Math.max(
    420,
    height - tabBarHeight - styles.screen.paddingTop,
  );

  useEffect(() => {
    const loadProducts = async () => {
      if (!isAuthenticated()) {
        setProducts([]);
        return;
      }

      const [followedResult, myProductsResult] = await Promise.all([
        getFollowedProductsAPI(),
        getMyProductsAPI(),
        getOrdersAPI(),
      ]);

      if (followedResult.success || myProductsResult.success) {
        const myProducts = myProductsResult.success
          ? myProductsResult.data.filter(
              (product: any) => product.status === "available",
            )
          : [];
        const orderedProductIds = new Set(
          orders
            .filter(
              (order) => order.status === "pending" || order.status === "sold",
            )
            .map((order) => order.productId),
        );
        const visibleFollowedProducts = (followedResult.success
          ? followedResult.data
          : []
        ).filter(
          (product: any) =>
            product.status === "available" && !orderedProductIds.has(product.id),
        );
        const uniqueProducts = [
          ...myProducts,
          ...visibleFollowedProducts,
        ].filter(
          (product: any, index: number, items: any[]) =>
            items.findIndex((item) => item.id === product.id) === index,
        );
        setProducts(uniqueProducts);
      }
    };

    loadProducts();
    const interval = setInterval(loadProducts, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ThemedView style={styles.screen}>
      <FlatList
        data={products}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            height={cardHeight}
            onPurchased={(purchasedProduct) => {
              setProducts((currentProducts) =>
                currentProducts.filter(
                  (product) => product.id !== purchasedProduct.id,
                ),
              );
            }}
          />
        )}
        style={styles.list}
        pagingEnabled
        snapToInterval={cardHeight}
        snapToAlignment="start"
        disableIntervalMomentum
        getItemLayout={(_, index) => ({
          length: cardHeight,
          offset: cardHeight * index,
          index,
        })}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 16,
    backgroundColor: "#000000",
  },
  list: {
    flex: 1,
  },
});
