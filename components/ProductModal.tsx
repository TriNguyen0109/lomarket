import { Modal, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

// Định nghĩa type cho sản phẩm
export type Product = {
  id: string;
  name: string;
  price: string;
  description: string;
  sold: string;
  discount: string;
  seller: string;
  sellerAvatar: string;
  image: string;
  status?: string;
  isOwnProduct?: boolean;
};

interface ProductModalProps {
  item: Product;
  visible: boolean;
  onClose: () => void;
}

export default function ProductModal({
  item,
  visible,
  onClose,
}: ProductModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ThemedText type="subtitle" style={styles.modalTitle}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.modalDescription}>
            {item.description}
          </ThemedText>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <ThemedText style={styles.closeButtonText}>Đóng</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    maxHeight: "70%",
  },
  modalTitle: {
    color: "#ffffff",
    marginBottom: 16,
    fontSize: 18,
  },
  modalDescription: {
    color: "#cccccc",
    lineHeight: 22,
    marginBottom: 20,
    fontSize: 12,
  },
  closeButton: {
    backgroundColor: "#ff6b35",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
