// Shared data for products
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export let authToken: string | null = null;
export let currentUser: any = null;
const API_URL = "https://app.lomarket.id.vn"; // Thay bằng IP server Django của bạn (ví dụ: 192.168.1.100)
const TOKEN_KEY = "authToken";
const USER_KEY = "currentUser";

const REQUEST_TIMEOUT_MS = 10000;

const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs = REQUEST_TIMEOUT_MS,
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const getNetworkErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.name === "AbortError") {
    return "Kết nối server quá lâu. Vui lòng kiểm tra IP/port server.";
  }

  return "Lỗi kết nối đến server";
};

const getApiErrorMessage = (data: any, fallback: string) => {
  if (!data) {
    return fallback;
  }

  if (typeof data === "string") {
    return data || fallback;
  }

  const firstError =
    data.username?.[0] ||
    data.email?.[0] ||
    data.phone?.[0] ||
    data.password?.[0] ||
    data.password1?.[0] ||
    data.password2?.[0] ||
    data.non_field_errors?.[0] ||
    data.detail;

  if (firstError) {
    return String(firstError);
  }

  const firstKey = Object.keys(data)[0];
  const firstValue = firstKey ? data[firstKey] : null;

  if (Array.isArray(firstValue) && firstValue[0]) {
    return String(firstValue[0]);
  }

  return fallback;
};

export const resolveMediaUrl = (url?: string | null) => {
  if (!url) {
    return "https://www.svgrepo.com/show/508699/landscape-placeholder.svg";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("file:") ||
    url.startsWith("blob:") ||
    url.startsWith("content:")
  ) {
    return url;
  }

  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const getProductImageUrl = (product: any) =>
  product?.image?.url ||
  product?.image ||
  product?.photo?.url ||
  product?.photo ||
  product?.image_url ||
  product?.photo_url ||
  product?.raw?.image?.url ||
  product?.raw?.image ||
  product?.raw?.photo?.url ||
  product?.raw?.photo ||
  "";

const normalizeApiUser = (user: any) => ({
  ...user,
  id: String(user.id),
  name: user.username || user.email || "Người dùng",
  avatar:
    user.avatar || "https://www.svgrepo.com/show/452030/avatar-default.svg",
});

export const clearAuthData = async () => {
  authToken = null;
  currentUser = null;
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
};

export const fetchCurrentUser = async () => {
  if (!authToken) {
    return null;
  }

  const headers = {
    Accept: "application/json",
    Authorization: `Token ${authToken}`,
  };

  for (const path of ["/api/me/", "/api/auth/user/"]) {
    const response = await fetchWithTimeout(`${API_URL}${path}`, { headers });

    if (response.ok) {
      const user = await response.json();
      return normalizeApiUser(user);
    }
  }

  return null;
};

// Load token and user from storage
export const loadAuthData = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const user = await AsyncStorage.getItem(USER_KEY);
    console.log("📥 Loading auth data from storage...");
    console.log("Loaded token:", token);
    console.log("Loaded user:", user);
    if (token) {
      authToken = token;
      console.log("✅ Token loaded successfully");
    } else {
      authToken = null;
    }
    if (user) {
      currentUser = JSON.parse(user);
      console.log("✅ User loaded successfully");
    } else {
      currentUser = null;
    }
  } catch (error) {
    console.error("Error loading auth data:", error);
  }
};

// Save token and user to storage
export const saveAuthData = async () => {
  try {
    if (authToken) {
      await AsyncStorage.setItem(TOKEN_KEY, authToken);
      console.log("✅ Token saved:", authToken);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
      console.log("❌ Token removed");
    }
    if (currentUser) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      console.log("✅ User saved:", currentUser);
    } else {
      await AsyncStorage.removeItem(USER_KEY);
      console.log("❌ User removed");
    }
  } catch (error) {
    console.error("Error saving auth data:", error);
  }
};

// Debug function to check stored data
export const debugAuthStorage = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const user = await AsyncStorage.getItem(USER_KEY);
    console.log("=== AsyncStorage Debug ===");
    console.log("Stored Token:", token);
    console.log("Stored User:", user);
    console.log("Current authToken:", authToken);
    console.log("Current currentUser:", currentUser);
    console.log("========================");
  } catch (error) {
    console.error("Error reading storage:", error);
  }
};

// Test AsyncStorage functionality
export const testAsyncStorage = async () => {
  try {
    console.log("🧪 Testing AsyncStorage...");
    const testKey = "test_key";
    const testValue = "test_value_" + Date.now();

    // Write
    await AsyncStorage.setItem(testKey, testValue);
    console.log("✅ Write test passed");

    // Read
    const readValue = await AsyncStorage.getItem(testKey);
    if (readValue === testValue) {
      console.log("✅ Read test passed");
    } else {
      console.log(
        "❌ Read test failed - expected:",
        testValue,
        "got:",
        readValue,
      );
    }

    // Clean up
    await AsyncStorage.removeItem(testKey);
    console.log("✅ Cleanup test passed");

    console.log("🎉 AsyncStorage is working!");
  } catch (error) {
    console.error("❌ AsyncStorage test failed:", error);
  }
};

export let products: any[] = [
  {
    id: "1",
    name: "Sản phẩm 1",
    price: "299.000đ",
    description:
      "Cối thủy tinh 450ml, dễ tháo rửa, xay hoa quả và đá nhuyễn nhanh.",
    sold: "1.2k",
    discount: "30%",
    seller: "Người bán 11",
    sellerId: "1",
    sellerAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e0b4?auto=format&fit=crop&w=800&q=80",
    status: "available",
  },
  {
    id: "2",
    name: "Sản phẩm 2",
    price: "499.000đ",
    description:
      "Pin 20 giờ, kết nối nhanh, âm bass mạnh mẽ và thiết kế êm tai.",
    sold: "2.5k",
    discount: "40%",
    seller: "Người bán 2",
    sellerId: "2",
    sellerAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    image:
      "https://images.unsplash.com/photo-1518449075804-1cd0ac117116?auto=format&fit=crop&w=800&q=80",
    status: "available",
  },
  {
    id: "3",
    name: "Sản phẩm 3",
    price: "189.000đ",
    description:
      "Ánh sáng điều chỉnh, tiết kiệm điện và không gây chói mắt khi đọc sách.",
    sold: "3.1k",
    discount: "25%",
    seller: "Người bán 3",
    sellerId: "3",
    sellerAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    status: "available",
  },
  {
    id: "4",
    name: "Sản phẩm 4",
    price: "249.000đ",
    description:
      "Tai nghe không dây, âm thanh rõ ràng, pin trâu và chống nước.",
    sold: "1.8k",
    discount: "25%",
    seller: "Bạn",
    sellerId: "me",
    sellerAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    status: "available",
  },
  {
    id: "5",
    name: "Sản phẩm 5 - Bình nước thủy tinh",
    price: "149.000đ",
    description: "Bình nước thủy tinh cao cấp, giữ nhiệt tốt, không chứa BPA.",
    sold: "500",
    discount: "15%",
    seller: "Bạn",
    sellerId: "me",
    sellerAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
    image:
      "https://images.unsplash.com/photo-1581092162562-40038f5105ff?auto=format&fit=crop&w=800&q=80",
    status: "pending",
  },
];

export let orders: any[] = [];

// Users data
export let users: any[] = [
  {
    id: "me",
    name: "Bạn",
    email: "ban@gmail.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "1",
    name: "Người bán 11",
    email: "nguoiban11@gmail.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "2",
    name: "Người bán 2",
    email: "nguoiban2@gmail.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "3",
    name: "Người bán 3",
    email: "nguoiban3@gmail.com",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "4",
    name: "Người bán 4",
    email: "nguoiban4@gmail.com",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
  },
];

// Friends management
export let friendRequests: any[] = [];
export let friends: any[] = [];

export const addProduct = (product: any) => {
  products.unshift(product);
};

export const removeProduct = (id: string) => {
  products = products.filter((p) => p.id !== id);
};

const replaceApiProducts = (nextProducts: any[], predicate: (p: any) => boolean) => {
  const localProducts = products.filter((product) => !predicate(product));
  products = [...nextProducts, ...localProducts].filter(
    (product, index, items) =>
      items.findIndex((item) => item.id === product.id) === index,
  );
};

export const addOrder = (order: any) => {
  const existingOrder = orders.find(
    (o) => o.productId === order.productId && o.status === "pending",
  );

  if (existingOrder) {
    return false;
  }

  orders.push(order);
  const product = products.find((p) => p.id === order.productId);
  if (product) {
    product.status = "pending";
    return true;
  }

  if (order.productSnapshot) {
    products.unshift({ ...order.productSnapshot, status: "pending" });
  }

  return true;
};

export const confirmOrder = (orderId: string) => {
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = "sold";
    const product = products.find((p) => p.id === order.productId);
    if (product) product.status = "sold";
  }
};

export const getAvailableProducts = () =>
  products.filter((p) => p.status === "available");

const parseVndPrice = (price: string | number) => {
  if (typeof price === "number") {
    return Math.floor(price);
  }

  const cleaned = String(price)
    .trim()
    .toLowerCase()
    .replace(/vnd|vnđ|đ/g, "")
    .replace(/\s/g, "");

  if (!cleaned) {
    return 0;
  }

  const decimalMatch = cleaned.match(/^(\d+)[.,](0{1,2})$/);
  if (decimalMatch) {
    return Number(decimalMatch[1]);
  }

  const digitsOnly = cleaned.replace(/\D/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
};

const normalizePriceForApi = (price: string | number) =>
  String(parseVndPrice(price));

const productPriceOverrides = new Map<string, string>();

export const formatPriceVnd = (price: string | number) => {
  const priceNum = parseVndPrice(price);

  if (priceNum === 0) {
    return "0 vnđ";
  }

  return `${priceNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} vnđ`;
};

export const isOwnProduct = (product: any) => {
  const ownerId =
    product?.sellerId ||
    product?.userId ||
    product?.ownerId ||
    product?.raw?.user?.id ||
    product?.raw?.user_id ||
    product?.raw?.seller_id ||
    product?.user?.id ||
    product?.user;

  if (currentUser?.id && ownerId) {
    if (String(ownerId) === String(currentUser.id)) {
      return true;
    }
  }

  if (currentUser?.name && product?.seller) {
    return String(product.seller).trim() === String(currentUser.name).trim();
  }

  return false;
};

const mapApiProduct = (
  product: any,
  options?: { isOwnProduct?: boolean; priceOverride?: string | number },
) => {
  const apiId = String(product.id);
  const price =
    options?.priceOverride ?? productPriceOverrides.get(apiId) ?? product.price;

  return {
    id: `api-product-${apiId}`,
    apiId,
    sellerId: String(
      product.user?.id || product.user_id || product.seller_id || "",
    ),
    ownerId: String(
      product.user?.id || product.user_id || product.seller_id || "",
    ),
    name: product.title,
    price: normalizePriceForApi(price),
    description: product.description || "",
    sold: "0",
    discount: "0%",
    seller: product.seller || product.user?.username || "Người bán",
    sellerAvatar:
      product.user?.avatar ||
      "https://www.svgrepo.com/show/452030/avatar-default.svg",
    image: resolveMediaUrl(getProductImageUrl(product)),
    status: product.status || "available",
    isOwnProduct:
      Boolean(options?.isOwnProduct) ||
      Boolean(
        currentUser?.id &&
        product.user?.id &&
        String(product.user.id) === String(currentUser.id),
      ),
    raw: product,
  };
};

export const deleteProductAPI = async (product: any) => {
  const apiId = product?.apiId || product?.raw?.id || product?.id;
  if (
    !apiId ||
    (String(apiId).startsWith("api-product-") === false &&
      !String(apiId).match(/^\d+$/))
  ) {
    return { success: false, error: "Không tìm thấy id sản phẩm trên server" };
  }

  const normalizedApiId = String(apiId).replace("api-product-", "");

  try {
    const response = await fetch(
      `${API_URL}/api/products/${normalizedApiId}/`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Token ${authToken}`,
        },
      },
    );

    if (response.ok || response.status === 204) {
      return { success: true };
    }

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    return {
      success: false,
      error: data?.detail || `Xóa sản phẩm thất bại (${response.status})`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};

export const getFollowedProductsAPI = async () => {
  try {
    const response = await fetch(`${API_URL}/api/followed-products/`, {
      headers: {
        Accept: "application/json",
        Authorization: `Token ${authToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const results = Array.isArray(data) ? data : data.results || [];
      const mappedProducts = results.map(mapApiProduct);
      replaceApiProducts(mappedProducts, (product) => !isOwnProduct(product));
      return { success: true, data: mappedProducts };
    }

    return {
      success: false,
      error: `Failed to fetch products (${response.status})`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};

export const getMyProductsAPI = async () => {
  try {
    const response = await fetch(`${API_URL}/api/my-products/`, {
      headers: {
        Accept: "application/json",
        Authorization: `Token ${authToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const results = Array.isArray(data) ? data : data.results || [];
      const mappedProducts = results.map((product: any) =>
        mapApiProduct(product, { isOwnProduct: true }),
      );
      replaceApiProducts(mappedProducts, isOwnProduct);
      return { success: true, data: mappedProducts };
    }

    return {
      success: false,
      error: `Failed to fetch my products (${response.status})`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};

export const createProductAPI = async (product: {
  title: string;
  description: string;
  price: string;
  image: string;
}) => {
  if (!authToken) {
    return {
      success: false,
      error: "Không có token xác thực. Vui lòng đăng nhập lại.",
    };
  }

  try {
    const normalizedPrice = normalizePriceForApi(product.price);
    const imageName = product.image.split("/").pop() || "product.jpg";
    const imageType = imageName.toLowerCase().endsWith(".png")
      ? "image/png"
      : "image/jpeg";
    const formData = new FormData();

    formData.append("title", product.title);
    formData.append("description", product.description);
    formData.append("price", normalizedPrice);
    formData.append("image", {
      uri: product.image,
      name: imageName,
      type: imageType,
    } as any);

    const response = await fetch(`${API_URL}/api/products/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Token ${authToken}`,
      },
      body: formData,
    });

    let data: any = null;
    try {
      data = await response.json();
    } catch (parseError) {
      return {
        success: false,
        error: `Server trả về dữ liệu không hợp lệ (${response.status})`,
      };
    }

    if (response.ok) {
      if (data?.id) {
        productPriceOverrides.set(String(data.id), normalizedPrice);
      }

      return {
        success: true,
        status: response.status,
        data: mapApiProduct(data, {
          isOwnProduct: true,
          priceOverride: normalizedPrice,
        }),
      };
    }

    return {
      success: false,
      status: response.status,
      error:
        data?.detail ||
        data?.error ||
        `Không thể tạo sản phẩm (${response.status})`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};

const mapApiOrder = (order: any) => {
  const product = order.product || order.raw?.product || {};
  const buyer = order.buyer || order.raw?.buyer || {};
  const mappedProduct = mapApiProduct(product, {
    isOwnProduct:
      currentUser?.id && product.user?.id
        ? String(product.user.id) === String(currentUser.id)
        : false,
  });

  return {
    id: `api-order-${order.id}`,
    apiId: String(order.id),
    productId: mappedProduct.id,
    buyer: buyer.username || buyer.email || order.buyer || "Người mua",
    buyerId: String(buyer.id || order.buyer_id || ""),
    seller: mappedProduct.seller,
    sellerId: String(
      order.seller_id ||
        order.sellerId ||
        mappedProduct.sellerId ||
        product.user_id ||
        product.seller_id ||
        product.user?.id ||
        "",
    ),
    phone: order.phone || "",
    address: order.address || "",
    email: order.email || "",
    status: order.status || "pending",
    productSnapshot: mappedProduct,
    raw: order,
  };
};

export const getOrdersAPI = async () => {
  if (!authToken) {
    return { success: false, error: "Token xác thực mất hiệu lực" };
  }

  try {
    const response = await fetch(`${API_URL}/api/orders/`, {
      headers: {
        Accept: "application/json",
        Authorization: `Token ${authToken}`,
      },
    });

    if (!response.ok) {
      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      return {
        success: false,
        error: data?.detail || `Không thể tải đơn hàng (${response.status})`,
      };
    }

    const data = await response.json();
    const results = Array.isArray(data) ? data : data.results || [];
    const mappedOrders = results.map(mapApiOrder);

    orders.length = 0;
    orders.push(...mappedOrders);

    const statusByProductId = new Map<string, string>();
    for (const orderItem of mappedOrders) {
      const currentStatus = statusByProductId.get(orderItem.productId);
      if (!currentStatus || orderItem.status === "sold") {
        statusByProductId.set(orderItem.productId, orderItem.status);
      }
    }

    for (const product of products) {
      const status = statusByProductId.get(product.id);
      product.status = status || "available";
    }

    return { success: true, data: mappedOrders };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};

export const createOrderAPI = async (product: any) => {
  if (!authToken) {
    return {
      success: false,
      error: "Không có token xác thực. Vui lòng đăng nhập lại.",
    };
  }

  try {
    const response = await fetch(`${API_URL}/api/orders/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Token ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: String(
          product.apiId || product.raw?.id || product.id,
        ).replace(/^api-product-/, ""),
        phone: currentUser?.phone || "",
        address: currentUser?.address || "",
        email: currentUser?.email || "",
      }),
    });

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      return {
        success: false,
        error: `Server trả về dữ liệu không hợp lệ (${response.status})`,
      };
    }

    if (response.ok) {
      const mapped = mapApiOrder(data);
      const existingOrder = orders.find(
        (o) => o.productId === mapped.productId && o.status === "pending",
      );
      if (!existingOrder) {
        orders.push(mapped);
      }

      const productItem = products.find(
        (p) => String(p.id) === String(mapped.productId),
      );
      if (productItem) {
        productItem.status = "pending";
      }

      return { success: true, data: mapped };
    }

    return {
      success: false,
      error:
        data?.detail ||
        data?.error ||
        `Không thể đặt hàng (${response.status})`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};

export const confirmOrderAPI = async (orderId: string) => {
  if (!authToken) {
    return {
      success: false,
      error: "Không có token xác thực. Vui lòng đăng nhập lại.",
    };
  }

  try {
    const response = await fetch(`${API_URL}/api/orders/${orderId}/confirm/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Token ${authToken}`,
      },
    });

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.ok) {
      const mapped = mapApiOrder(data);
      const index = orders.findIndex(
        (o) => String(o.apiId) === String(mapped.apiId),
      );
      if (index !== -1) {
        orders[index] = mapped;
      }
      return { success: true, data: mapped };
    }

    return {
      success: false,
      error:
        data?.detail ||
        data?.error ||
        `Không thể xác nhận đơn (${response.status})`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};

// Friends management functions
export const sendFriendRequest = (userId: string) => {
  const existingRequest = friendRequests.find(
    (r) => r.fromUserId === "me" && r.toUserId === userId,
  );
  if (!existingRequest) {
    friendRequests.push({
      id: Date.now().toString(),
      fromUserId: "me",
      toUserId: userId,
      status: "pending",
    });
  }
};

export const acceptFriendRequest = (requestId: string) => {
  const request = friendRequests.find((r) => r.id === requestId);
  if (request) {
    request.status = "accepted";
    friends.push({
      id: Date.now().toString(),
      userId1: request.fromUserId,
      userId2: request.toUserId,
    });
  }
};

export const rejectFriendRequest = (requestId: string) => {
  friendRequests = friendRequests.filter((r) => r.id !== requestId);
};

export const removeFriend = (userId: string) => {
  friends = friends.filter(
    (f) =>
      !(f.userId1 === "me" && f.userId2 === userId) &&
      !(f.userId1 === userId && f.userId2 === "me"),
  );
};

export const getUserById = (userId: string) => {
  return users.find((u) => u.id === userId);
};

export const isUserFriend = (userId: string) => {
  return friends.some(
    (f) =>
      (f.userId1 === "me" && f.userId2 === userId) ||
      (f.userId1 === userId && f.userId2 === "me"),
  );
};

export const getPendingFriendRequests = () => {
  return friendRequests.filter(
    (r) => r.toUserId === "me" && r.status === "pending",
  );
};

export const getSentFriendRequests = () => {
  return friendRequests.filter(
    (r) => r.fromUserId === "me" && r.status === "pending",
  );
};

export const getAllFriends = () => {
  return friends
    .filter((f) => f.userId1 === "me" || f.userId2 === "me")
    .map((f) => {
      const friendId = f.userId1 === "me" ? f.userId2 : f.userId1;
      return getUserById(friendId);
    })
    .filter((u) => u !== undefined);
};

export const loginUser = async (username: string, password: string) => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/api/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.non_field_errors?.[0] || "Sai thông tin tài khoản hoặc mật khẩu";
      await clearAuthData();
      return { success: false, error: errorMessage };
    }

    await clearAuthData();
    authToken = data.key || data.access;
    currentUser = await fetchCurrentUser();

    if (!authToken || !currentUser) {
      await clearAuthData();
      return {
        success: false,
        error: "Không thể lấy thông tin người dùng",
      };
    }

    await saveAuthData();
    return { success: true };
  } catch (error) {
    console.error("Login Error:", error);
    await clearAuthData();
    return { success: false, error: getNetworkErrorMessage(error) };
  }
};

export const logoutUser = async () => {
  const token = authToken;

  if (token) {
    try {
      await fetch(`${API_URL}/api/auth/logout/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Token ${token}`,
        },
      });
    } catch (error) {
      console.log("Logout API error:", error);
    }
  }

  await clearAuthData();
};

export const registerUser = async (
  username: string,
  email: string,
  phone: string,
  password1: string,
  password2: string,
) => {
  try {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    const response = await fetchWithTimeout(
      `${API_URL}/api/auth/registration/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: trimmedUsername,
          email: trimmedEmail,
          phone: trimmedPhone,
          password1,
          password2,
        }),
      },
    );

    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { detail: text };
    }

    if (!response.ok) {
      await clearAuthData();
      return {
        success: false,
        error: getApiErrorMessage(data, "Dang ky khong thanh cong"),
      };
    }

    authToken = data.key || data.access || data.token || authToken;
    currentUser = data.user
      ? normalizeApiUser(data.user)
      : await fetchCurrentUser();

    if (!authToken || !currentUser) {
      const loginResult = await loginUser(trimmedUsername, password1);
      if (loginResult.success) {
        return { success: true };
      }
    }

    if (!authToken || !currentUser) {
      await clearAuthData();
      return {
        success: false,
        error:
          "Dang ky thanh cong nhung chua dang nhap duoc. Vui long dang nhap lai.",
      };
    }

    await saveAuthData();
    return { success: true };
  } catch (error) {
    console.error("Register Error:", error);
    await clearAuthData();
    return { success: false, error: getNetworkErrorMessage(error) };
  }
};

export const isAuthenticated = () => {
  return authToken !== null;
};

// Friend API functions
export const sendFriendRequestAPI = async (receiverId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/friend-requests/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${authToken}`,
      },
      body: JSON.stringify({
        sender_id: currentUser.id,
        receiver_id: receiverId,
      }),
    });
    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      return { success: false, error: data.detail || "Failed to send request" };
    }
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

export const getPendingFriendRequestsAPI = async () => {
  try {
    const response = await fetch(
      `${API_URL}/api/friend-requests/?receiver_id=${currentUser.id}&status=pending`,
      {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      },
    );
    if (response.ok) {
      const data = await response.json();
      return { success: true, data: data.results || data };
    } else {
      return { success: false, error: "Failed to fetch" };
    }
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

export const getSentFriendRequestsAPI = async () => {
  try {
    const response = await fetch(
      `${API_URL}/api/friend-requests/?sender_id=${currentUser.id}&status=pending`,
      {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      },
    );
    if (response.ok) {
      const data = await response.json();
      return { success: true, data: data.results || data };
    } else {
      return { success: false, error: "Failed to fetch" };
    }
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

export const searchUserByEmailAPI = async (email: string) => {
  const trimmedEmail = email.trim().toLowerCase();
  console.log("🔍 Searching user with email:", trimmedEmail);

  if (!authToken) {
    console.log("ℹ️ No auth token available for user search");
    return null;
  }

  try {
    const url = `${API_URL}/api/users/?email=${encodeURIComponent(trimmedEmail)}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Token ${authToken}`,
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    // Xử lý response thành công (status 200-299)
    if (response.ok) {
      if (contentType.includes("application/json")) {
        const data = JSON.parse(text || "{}");

        // Kiểm tra nếu response có error (user not found)
        if (data.error) {
          console.log("ℹ️ User not found with email:", trimmedEmail);
          return null;
        }

        // Xử lý array trực tiếp
        if (Array.isArray(data)) {
          if (data.length === 0) {
            console.log("ℹ️ No users found with email:", trimmedEmail);
            return null;
          }
          console.log("✅ Found user:", data[0]);
          return data[0];
        }

        // Xử lý paginated response (có results)
        if (data?.results && Array.isArray(data.results)) {
          if (data.results.length === 0) {
            console.log("ℹ️ No users found with email:", trimmedEmail);
            return null;
          }
          console.log("✅ Found user:", data.results[0]);
          return data.results[0];
        }

        // Xử lý single object
        if (data.id) {
          console.log("✅ Found user:", data);
          return data;
        }

        // Không tìm thấy user
        console.log("ℹ️ No users found with email:", trimmedEmail);
        return null;
      }

      // Response không phải JSON
      console.log("ℹ️ Unexpected response format");
      return null;
    }

    // Xử lý lỗi 404 - không tìm thấy user (bình thường)
    if (response.status === 404) {
      console.log("ℹ️ User not found with email:", trimmedEmail);
      return null;
    }

    // Các lỗi khác (500, 403, etc.) - chỉ log khi cần thiết
    console.log(`ℹ️ Search failed with status ${response.status}`);
    return null;
  } catch (error) {
    // Lỗi network hoặc parsing
    console.log(
      "ℹ️ Search error:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return null;
  }
};

export const acceptFriendRequestAPI = async (requestId: string) => {
  try {
    const response = await fetch(
      `${API_URL}/api/friend-requests/${requestId}/accept/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${authToken}`,
        },
      },
    );
    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      return { success: false, error: data.detail || "Failed to accept" };
    }
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

export const rejectFriendRequestAPI = async (requestId: string) => {
  try {
    const response = await fetch(
      `${API_URL}/api/friend-requests/${requestId}/reject/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${authToken}`,
        },
      },
    );
    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      return { success: false, error: data.detail || "Failed to reject" };
    }
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

export const getAllFriendsAPI = async () => {
  try {
    const response = await fetch(
      `${API_URL}/api/friend-requests/?status=accepted`,
      {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      },
    );
    if (response.ok) {
      const data = await response.json();
      const requests = data.results || data;
      const friends = requests
        .filter(
          (r: any) =>
            r.sender.id === currentUser.id || r.receiver.id === currentUser.id,
        )
        .map((r: any) =>
          r.sender.id === currentUser.id ? r.receiver : r.sender,
        );
      return { success: true, data: friends };
    } else {
      return { success: false, error: "Failed to fetch" };
    }
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

export const removeFriendAPI = async (friendId: string) => {
  const response = await fetch(
    `${API_URL}/api/friends/${friendId}/?user_id=${currentUser.id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${authToken}`,
      },
    },
  );

  if (response.ok) {
    return { success: true };
  } else {
    const data = await response.json();
    return { success: false, error: data.detail || "Failed to remove friend" };
  }
};

// Follow/Unfollow API functions
export const getFollowedUsersAPI = async () => {
  try {
    const response = await fetch(`${API_URL}/api/followed-users/`, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: Array.isArray(data) ? data : data.results || [],
      };
    } else {
      return { success: false, error: "Failed to fetch followed users" };
    }
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

export const followUserAPI = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/follow/${userId}/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Token ${authToken}`,
      },
    });
    if (response.ok) {
      return { success: true };
    } else {
      try {
        const data = await response.json();
        return {
          success: false,
          error: data.detail || `Failed to follow user (${response.status})`,
        };
      } catch {
        return {
          success: false,
          error: `Failed to follow user (${response.status})`,
        };
      }
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? `Network error: ${error.message}`
          : "Network error",
    };
  }
};

export const unfollowUserAPI = async (userId: string) => {
  try {
    // console.log("🔄 Unfollowing user:", userId);
    // console.log("📍 URL:", `${API_URL}/api/follow/${userId}/`);
    // console.log("🔑 Auth token:", authToken ? "✓ Available" : "✗ Missing");

    if (!authToken) {
      const errorMsg = "No auth token available";
      console.error("❌ " + errorMsg);
      Alert.alert("Debug", errorMsg);
      return { success: false, error: errorMsg };
    }

    const response = await fetch(`${API_URL}/api/follow/${userId}/`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Token ${authToken}`,
      },
    });

    // console.log("📡 Response status:", response.status);
    // console.log("📡 Response ok:", response.ok);

    if (response.ok) {
      // console.log("✅ Unfollow successful");
      return { success: true };
    } else {
      try {
        const data = await response.json();
        // console.log("❌ Response error data:", data);
        const errorMsg =
          data.detail || `Failed to unfollow user (${response.status})`;
        // Alert.alert("Debug", `Response error: ${errorMsg}`);
        return {
          success: false,
          error: errorMsg,
        };
      } catch (parseError) {
        // console.log("❌ Could not parse error response:", parseError);
        const errorMsg = `Failed to unfollow user (${response.status})`;
        // Alert.alert("Debug", `Parse error: ${errorMsg}`);
        return {
          success: false,
          error: errorMsg,
        };
      }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    // console.error("🔴 Error:", msg);
    // Alert.alert("Debug", `Network error: ${msg}`);
    return { success: false, error: `Network error: ${msg}` };
  }
};
