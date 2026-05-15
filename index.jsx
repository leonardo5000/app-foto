import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getPhotos, deletePhoto } from "../database";
import AddPhotoModal from "../components/AddPhotoModal";

const COL = (Dimensions.get("window").width - 48) / 2;

export default function Galeria() {
  const [photos, setPhotos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  function carregar() {
    setPhotos(getPhotos());
  }

  // Recarrega ao entrar na tela
  useFocusEffect(useCallback(() => { carregar(); }, []));

  function confirmarExclusao(photo) {
    Alert.alert("Excluir", `Excluir "${photo.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => { deletePhoto(photo.id); carregar(); },
      },
    ]);
  }

  return (
    <View style={s.container}>
      {photos.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="images-outline" size={64} color="#444" />
          <Text style={s.emptyText}>Nenhuma foto ainda</Text>
          <Text style={s.emptyHint}>Toque no botão + para adicionar</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={s.list}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onLongPress={() => confirmarExclusao(item)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.image_uri }} style={s.thumb} />
              <View style={s.cardInfo}>
                <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={s.cardDate}>
                  {new Date(item.created_at).toLocaleDateString("pt-BR")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Botão + */}
      <TouchableOpacity style={s.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Modal separado */}
      <AddPhotoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSaved={carregar}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1a" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { color: "#555", fontSize: 18, fontWeight: "600" },
  emptyHint: { color: "#444", fontSize: 13 },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    width: COL,
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  thumb: { width: "100%", height: COL },
  cardInfo: { padding: 8, gap: 2 },
  cardTitle: { color: "#e8e0ff", fontSize: 13, fontWeight: "600" },
  cardDate: { color: "#666", fontSize: 11 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#a78bfa",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#a78bfa",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
