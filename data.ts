// Shared data for products
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export let authToken: string | null = null;
export let currentUser: any = null;
const API_URL = "http://192.168.1.58:8000"; // Thay bằng IP server Django của bạn (ví dụ: 192.168.1.100)
const TOKEN_KEY = "authToken";
const USER_KEY = "currentUser";

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
    }
    if (user) {
      currentUser = JSON.parse(user);
      console.log("✅ User loaded successfully");
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

export const addOrder = (order: any) => {
  orders.push(order);
  // Update product status to pending
  const product = products.find((p) => p.id === order.productId);
  if (product) product.status = "pending";
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
    const response = await fetch(`${API_URL}/api/auth/login/`, {
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

    if (response.ok) {
      // dj-rest-auth mặc định trả về { key: "token_của_bạn" }
      // Nếu bạn dùng JWT, nó có thể là { access: "...", refresh: "..." }

      // Tìm user trong danh sách local dựa trên username/email đã nhập
      // Trong thực tế, bạn nên lấy thông tin này từ một API endpoint 'user profile' riêng
      currentUser = users.find(
        (u) => u.email === username || u.name === username,
      ) || {
        id: "me",
        name: username,
        avatar: "https://www.svgrepo.com/show/452030/avatar-default.svg",
      };

      authToken = data.key || data.access;
      await saveAuthData();
      return { success: true };
    }

    // Xử lý lỗi trả về từ Django (thường là object chứa thông tin lỗi)
    const errorMessage = data.non_field_errors
      ? data.non_field_errors[0]
      : "Sai thông tin tài khoản hoặc mật khẩu";

    return { success: false, error: errorMessage };
  } catch (error) {
    console.error("Login Error:", error); // Thêm dòng này để debug
    return { success: false, error: "Lỗi kết nối đến server" };
  }
};

export const logoutUser = async () => {
  console.log("🔄 logoutUser() called");
  authToken = null;
  currentUser = null;
  console.log("📥 Calling saveAuthData()...");
  await saveAuthData();
  console.log("✅ logoutUser() completed");
};

export const registerUser = async (
  username: string,
  email: string,
  password1: string,
  password2: string,
) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/registration/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password1: password1,
        password2: password2,
      }),
    });

    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { detail: text };
    }

    if (response.ok) {
      authToken = data.key || data.access || authToken;
      currentUser = {
        id: "me",
        name: username,
        email: email,
        avatar: "https://www.svgrepo.com/show/452030/avatar-default.svg",
      };
      await saveAuthData();
      return { success: true };
    }

    const errorMessage =
      data.username?.[0] ||
      data.email?.[0] ||
      data.password1?.[0] ||
      data.password2?.[0] ||
      data.non_field_errors?.[0] ||
      data.detail ||
      text ||
      "Đăng ký không thành công";

    return { success: false, error: errorMessage };
  } catch (error) {
    console.error("Register Error:", error);
    return { success: false, error: "Lỗi kết nối đến server" };
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
