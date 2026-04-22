import { Image } from "expo-image";
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
import {
    acceptFriendRequest,
    friendRequests,
    getAllFriends,
    getPendingFriendRequests,
    getSentFriendRequests,
    getUserById,
    isUserFriend,
    rejectFriendRequest,
    removeFriend,
    sendFriendRequest,
    users
} from "@/data";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function FriendsScreen() {
  const colorScheme = useColorScheme();
  const [refresh, setRefresh] = useState(0);
  const [localFriends, setLocalFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "add">(
    "friends",
  );

  useEffect(() => {
    const interval = setInterval(() => {
      updateData();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateData = () => {
    const allFriends = getAllFriends();
    setLocalFriends(allFriends);

    const pending = getPendingFriendRequests();
    setPendingRequests(
      pending.map((r) => ({
        ...r,
        user: getUserById(r.fromUserId),
      })),
    );

    const sent = getSentFriendRequests();
    setSentRequests(
      sent.map((r) => ({
        ...r,
        user: getUserById(r.toUserId),
      })),
    );

    // Suggested users: users that are not friends and no pending request
    const suggested = users.filter((user) => {
      if (user.id === "me") return false;
      if (isUserFriend(user.id)) return false;
      const hasPending = friendRequests.some(
        (r) =>
          ((r.fromUserId === "me" && r.toUserId === user.id) ||
            (r.fromUserId === user.id && r.toUserId === "me")) &&
          r.status === "pending",
      );
      return !hasPending;
    });
    setSuggestedUsers(suggested);
  };

  const handleSendRequest = (userId: string) => {
    Alert.alert("Gửi lời mời", `Gửi lời mời kết bạn đến người dùng này?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Gửi",
        onPress: () => {
          sendFriendRequest(userId);
          setRefresh(refresh + 1);
        },
      },
    ]);
  };

  const handleAcceptRequest = (requestId: string) => {
    Alert.alert("Chấp nhận", "Chấp nhận lời mời kết bạn?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Chấp nhận",
        onPress: () => {
          acceptFriendRequest(requestId);
          setRefresh(refresh + 1);
        },
      },
    ]);
  };

  const handleRejectRequest = (requestId: string) => {
    Alert.alert("Từ chối", "Từ chối lời mời kết bạn?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Từ chối",
        onPress: () => {
          rejectFriendRequest(requestId);
          setRefresh(refresh + 1);
        },
      },
    ]);
  };

  const handleRemoveFriend = (userId: string) => {
    const user = getUserById(userId);
    Alert.alert("Xóa bạn", `Xóa ${user?.name} khỏi danh sách bạn bè?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        onPress: () => {
          removeFriend(userId);
          setRefresh(refresh + 1);
        },
      },
    ]);
  };

  const renderFriendItem = ({ item }: { item: any }) => (
    <ThemedView style={styles.friendItem}>
      <View style={styles.friendContent}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.friendInfo}>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          <ThemedText style={styles.emailText}>{item.email}</ThemedText>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveFriend(item.id)}
        style={styles.removeButton}
      >
        <IconSymbol name="xmark.circle.fill" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </ThemedView>
  );

  const renderRequestItem = ({ item }: { item: any }) => (
    <ThemedView style={styles.requestItem}>
      <View style={styles.requestContent}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        <View style={styles.requestInfo}>
          <ThemedText type="defaultSemiBold">{item.user.name}</ThemedText>
          <ThemedText style={styles.emailText}>{item.user.email}</ThemedText>
        </View>
      </View>
      <View style={styles.requestButtons}>
        <TouchableOpacity
          onPress={() => handleAcceptRequest(item.id)}
          style={styles.acceptButton}
        >
          <IconSymbol name="checkmark.circle.fill" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleRejectRequest(item.id)}
          style={styles.rejectButton}
        >
          <IconSymbol name="xmark.circle.fill" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  const renderSentRequestItem = ({ item }: { item: any }) => (
    <ThemedView style={styles.sentRequestItem}>
      <View style={styles.friendContent}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        <View style={styles.friendInfo}>
          <ThemedText type="defaultSemiBold">{item.user.name}</ThemedText>
          <ThemedText style={styles.emailText}>{item.user.email}</ThemedText>
          <ThemedText style={styles.pendingText}>⏳ Chờ phản hồi</ThemedText>
        </View>
      </View>
    </ThemedView>
  );

  const renderSuggestedUser = ({ item }: { item: any }) => (
    <ThemedView style={styles.suggestedItem}>
      <View style={styles.friendContent}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.friendInfo}>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          <ThemedText style={styles.emailText}>{item.email}</ThemedText>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleSendRequest(item.id)}
        style={styles.addButton}
      >
        <IconSymbol name="plus.circle.fill" size={24} color="#007AFF" />
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Bạn bè
        </ThemedText>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "friends" && styles.activeTab]}
          onPress={() => setActiveTab("friends")}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "friends" && styles.activeTabText,
            ]}
          >
            Bạn bè ({localFriends.length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "requests" && styles.activeTab]}
          onPress={() => setActiveTab("requests")}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "requests" && styles.activeTabText,
            ]}
          >
            Lời mời ({pendingRequests.length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "add" && styles.activeTab]}
          onPress={() => setActiveTab("add")}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "add" && styles.activeTabText,
            ]}
          >
            Thêm
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "friends" && (
        <ThemedView style={styles.section}>
          {localFriends.length > 0 ? (
            <FlatList
              data={localFriends}
              renderItem={renderFriendItem}
              keyExtractor={(item) => item.id}
              extraData={refresh}
              scrollEnabled={false}
            />
          ) : (
            <ThemedText style={styles.emptyText}>
              Bạn chưa có bạn bè nào. Hãy thêm bạn bè!
            </ThemedText>
          )}
        </ThemedView>
      )}

      {activeTab === "requests" && (
        <ThemedView style={styles.section}>
          {pendingRequests.length > 0 && (
            <ThemedView>
              <ThemedText type="subtitle" style={styles.subTitle}>
                Lời mời nhận được
              </ThemedText>
              <FlatList
                data={pendingRequests}
                renderItem={renderRequestItem}
                keyExtractor={(item) => item.id}
                extraData={refresh}
                scrollEnabled={false}
              />
            </ThemedView>
          )}
          {sentRequests.length > 0 && (
            <ThemedView style={{ marginTop: 20 }}>
              <ThemedText type="subtitle" style={styles.subTitle}>
                Lời mời đã gửi
              </ThemedText>
              <FlatList
                data={sentRequests}
                renderItem={renderSentRequestItem}
                keyExtractor={(item) => item.id}
                extraData={refresh}
                scrollEnabled={false}
              />
            </ThemedView>
          )}
          {pendingRequests.length === 0 && sentRequests.length === 0 && (
            <ThemedText style={styles.emptyText}>
              Không có lời mời nào
            </ThemedText>
          )}
        </ThemedView>
      )}

      {activeTab === "add" && (
        <ThemedView style={styles.section}>
          {suggestedUsers.length > 0 ? (
            <FlatList
              data={suggestedUsers}
              renderItem={renderSuggestedUser}
              keyExtractor={(item) => item.id}
              extraData={refresh}
              scrollEnabled={false}
            />
          ) : (
            <ThemedText style={styles.emptyText}>
              Không có gợi ý nào khác
            </ThemedText>
          )}
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
  section: {
    padding: 16,
  },
  subTitle: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: "600",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#f0f8ff",
  },
  sentRequestItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#fffbf0",
  },
  suggestedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#f0fff4",
  },
  friendContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  requestContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#e0e0e0",
  },
  friendInfo: {
    flex: 1,
  },
  requestInfo: {
    flex: 1,
  },
  emailText: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  pendingText: {
    fontSize: 11,
    color: "#FFA500",
    marginTop: 4,
    fontWeight: "500",
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  requestButtons: {
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    padding: 8,
  },
  rejectButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: "center",
    padding: 24,
    color: "#999",
    fontStyle: "italic",
  },
});
