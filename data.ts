// Shared data for products
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
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "1",
    name: "Người bán 11",
    email: "nguoiban11@gmail.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "2",
    name: "Người bán 2",
    email: "nguoiban2@gmail.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "3",
    name: "Người bán 3",
    email: "nguoiban3@gmail.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "4",
    name: "Người bán 4",
    email: "nguoiban4@gmail.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
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
    (r) => r.fromUserId === "me" && r.toUserId === userId
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
    (f) => !(f.userId1 === "me" && f.userId2 === userId) && 
           !(f.userId1 === userId && f.userId2 === "me")
  );
};

export const getUserById = (userId: string) => {
  return users.find((u) => u.id === userId);
};

export const isUserFriend = (userId: string) => {
  return friends.some(
    (f) => (f.userId1 === "me" && f.userId2 === userId) ||
           (f.userId1 === userId && f.userId2 === "me")
  );
};

export const getPendingFriendRequests = () => {
  return friendRequests.filter(
    (r) => r.toUserId === "me" && r.status === "pending"
  );
};

export const getSentFriendRequests = () => {
  return friendRequests.filter(
    (r) => r.fromUserId === "me" && r.status === "pending"
  );
};

export const getAllFriends = () => {
  return friends
    .filter(
      (f) => f.userId1 === "me" || f.userId2 === "me"
    )
    .map((f) => {
      const friendId = f.userId1 === "me" ? f.userId2 : f.userId1;
      return getUserById(friendId);
    })
    .filter((u) => u !== undefined);
};
