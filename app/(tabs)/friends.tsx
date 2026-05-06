import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import {
  followUserAPI,
  getFollowedUsersAPI,
  isAuthenticated,
  loadAuthData,
  searchUserByEmailAPI,
  unfollowUserAPI,
} from "@/data";
import { useColorScheme } from "@/hooks/use-color-scheme";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function FriendsScreen() {
  const colorScheme = useColorScheme();
  const [refresh, setRefresh] = useState(0);
  const [localFriends, setLocalFriends] = useState<any[]>([]);
  const [emailQuery, setEmailQuery] = useState<string>("");
  const [foundUser, setFoundUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"friends" | "add">("friends");

  const updateData = async () => {
    if (!isAuthenticated()) {
      console.log("User not authenticated, skipping API calls");
      return;
    }

    try {
      const friendsRes = await getFollowedUsersAPI();
      if (friendsRes.success) {
        setLocalFriends(friendsRes.data);
      } else {
        console.log("Failed to fetch followed users:", friendsRes.error);
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await loadAuthData();
      await updateData();
    };
    initialize();
  }, [refresh]);

  const handleSearchByEmail = async () => {
    setActiveTab("add");
    if (emailQuery.trim() === "") {
      setFoundUser(null);
      return;
    }

    const user = await searchUserByEmailAPI(emailQuery.trim());
    setFoundUser(user || null);
  };

  const handleFollow = async (userId: string) => {
    try {
      const res = await followUserAPI(String(userId));
      if (res.success) {
        showAlert("Thành công", "Bạn đang theo dõi người dùng này.");
        if (foundUser) {
          setLocalFriends((prev) => [...prev, foundUser]);
        }
        setRefresh((prev) => prev + 1);
      } else {
        showAlert("Lỗi", res.error || "Không thể theo dõi người dùng");
      }
    } catch (error) {
      showAlert(
        "Error",
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}.`,
      );
    }
  };

  const handleUnfollow = async (userId: string) => {
    console.log("👋 handleUnfollow called with userId:", userId);
    const proceed =
      Platform.OS === "web"
        ? window.confirm("Bạn có chắc muốn hủy theo dõi người này?")
        : await new Promise<boolean>((resolve) => {
            Alert.alert(
              "Hủy theo dõi",
              "Bạn có chắc muốn hủy theo dõi người này?",
              [
                { text: "Hủy", style: "cancel", onPress: () => resolve(false) },
                {
                  text: "Hủy theo dõi",
                  style: "destructive",
                  onPress: () => resolve(true),
                },
              ],
            );
          });

    console.log("✅ User confirmed:", proceed);
    if (!proceed) {
      console.log("❌ Unfollow cancelled by user");
      return;
    }

    try {
      console.log("🔄 Calling unfollowUserAPI...");
      const res = await unfollowUserAPI(String(userId));
      console.log("📦 API Response:", res);

      if (res.success) {
        showAlert("Thành công", "Bạn đã hủy theo dõi người này.");
        setLocalFriends((prev) =>
          prev.filter((friend) => String(friend.id) !== String(userId)),
        );
        setRefresh((prev) => prev + 1);
      } else {
        showAlert("Lỗi", res.error || "Không thể hủy theo dõi");
      }
    } catch (error) {
      console.error("🔴 Caught error in handleUnfollow:", error);
      showAlert(
        "Lỗi",
        `Lỗi mạng: ${error instanceof Error ? error.message : "Unknown error"}.`,
      );
    }
  };

  const renderFriendItem = ({ item }: { item: any }) => {
    const displayName =
      item.first_name && item.last_name
        ? `${item.first_name} ${item.last_name}`.trim()
        : item.username;

    return (
      <ThemedView style={styles.friendItem}>
        <View style={styles.friendContent}>
          <Image
            source={{
              uri:
                item.avatar ||
                "https://www.svgrepo.com/show/452030/avatar-default.svg",
            }}
            style={styles.avatar}
          />
          <View style={styles.friendInfo}>
            <ThemedText type="defaultSemiBold">{displayName}</ThemedText>
            <ThemedText style={styles.emailText}>{item.email}</ThemedText>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleUnfollow(item.id)}
          style={styles.removeButton}
        >
          <IconSymbol name="xmark.circle.fill" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </ThemedView>
    );
  };

  const renderFoundUser = () => {
    if (!foundUser) {
      return null;
    }

    const displayName =
      foundUser.first_name && foundUser.last_name
        ? `${foundUser.first_name} ${foundUser.last_name}`.trim()
        : foundUser.username || foundUser.email || "Người dùng";

    const isFollowing = localFriends.some(
      (friend) => String(friend.id) === String(foundUser.id),
    );

    return (
      <ThemedView style={styles.suggestedItem}>
        <View style={styles.friendContent}>
          <Image
            source={{
              uri:
                foundUser.avatar ||
                "https://www.svgrepo.com/show/452030/avatar-default.svg",
            }}
            style={styles.avatar}
          />
          <View style={styles.friendInfo}>
            <ThemedText type="defaultSemiBold">{displayName}</ThemedText>
            <ThemedText style={styles.emailText}>{foundUser.email}</ThemedText>
          </View>
        </View>
        <TouchableOpacity
          onPress={() =>
            isFollowing
              ? handleUnfollow(foundUser.id)
              : handleFollow(foundUser.id)
          }
          style={styles.addButton}
        >
          <IconSymbol
            name={isFollowing ? "xmark.circle.fill" : "plus.circle.fill"}
            size={24}
            color={isFollowing ? "#FF3B30" : "#d56123"}
          />
          <ThemedText style={styles.addButtonText}>
            {isFollowing ? "Unfollow" : "Follow"}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  };

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
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Theo dõi
        </ThemedText>
      </View>

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
            Đang theo dõi ({localFriends.length})
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

      {activeTab === "friends" && (
        <ThemedView style={styles.section}>
          {localFriends.length > 0 ? (
            <FlatList
              data={localFriends}
              renderItem={renderFriendItem}
              keyExtractor={(item) => String(item.id)}
              extraData={refresh}
              scrollEnabled={false}
            />
          ) : (
            <ThemedText style={styles.emptyText}>
              Bạn chưa theo dõi ai. Hãy tìm và theo dõi người dùng!
            </ThemedText>
          )}
        </ThemedView>
      )}

      {activeTab === "add" && (
        <ThemedView style={styles.section}>
          <View style={styles.searchContainer}>
            <TextInput
              style={[
                styles.emailInput,
                {
                  backgroundColor: Colors[colorScheme ?? "light"].background,
                  color: Colors[colorScheme ?? "light"].text,
                  borderColor: Colors[colorScheme ?? "light"].text,
                },
              ]}
              placeholder="Nhập email để tìm kiếm"
              placeholderTextColor={Colors[colorScheme ?? "light"].text + "80"}
              value={emailQuery}
              onChangeText={setEmailQuery}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={handleSearchByEmail}
              style={styles.searchButton}
            >
              <ThemedText style={styles.searchButtonText}>Tìm kiếm</ThemedText>
            </TouchableOpacity>
          </View>
          {foundUser ? (
            renderFoundUser()
          ) : emailQuery && !foundUser ? (
            <ThemedText style={styles.emptyText}>
              Không tìm thấy người dùng với email này
            </ThemedText>
          ) : null}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  emailInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchButtonText: {
    color: "#fff",
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
  emailText: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  addButtonText: {
    marginLeft: 6,
    color: "#007AFF",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    padding: 24,
    color: "#999",
    fontStyle: "italic",
  },
});
