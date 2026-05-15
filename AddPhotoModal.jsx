import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { savePhoto } from "../database";

export default function AddPhotoModal({ visible, onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  function fechar() {
    setTitle("");
    setImageUri(null);
    onClose();
  }

  async function escolherFoto() {
    Alert.alert("Adicionar foto", "De onde?", [
      {
        text: "Câmera",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") return Alert.alert("Permissão negada");
          const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
          if (!res.canceled) setImageUri(res.assets[0].uri);
        },
      },
      {
        text: "Galeria",
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") return Alert.alert("Permissão negada");
          const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
          if (!res.canceled) setImageUri(res.assets[0].uri);
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  async function salvar() {
    if (!title.trim()) return Alert.alert("Digite um título");
    if (!imageUri) return Alert.alert("Escolha uma foto");

    setLoading(true);

    let lat = null;
    let lon = null;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({});
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
      }
    } catch (_) {}

    savePhoto(title.trim(), imageUri, lat, lon);
    setLoading(false);
    fechar();
    onSaved(); // avisa a Galeria para recarregar
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={s.container}>

        {/* Cabeçalho */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Nova Foto</Text>
          <TouchableOpacity onPress={fechar}>
            <Ionicons name="close" size={26} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Título */}
        <Text style={s.label}>Título</Text>
        <TextInput
          style={s.input}
          placeholder="Ex: Vista do parque..."
          placeholderTextColor="#555"
          value={title}
          onChangeText={setTitle}
        />

        {/* Foto */}
        <TouchableOpacity style={s.imageArea} onPress={escolherFoto}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />
          ) : (
            <View style={s.placeholder}>
              <Ionicons name="camera-outline" size={48} color="#555" />
              <Text style={s.placeholderText}>Toque para escolher foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Botão salvar */}
        <TouchableOpacity
          style={[s.saveBtn, loading && { opacity: 0.5 }]}
          onPress={salvar}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.saveBtnText}>Salvar</Text>
          }
        </TouchableOpacity>

      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1a", padding: 20, gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  headerTitle: { color: "#e8e0ff", fontSize: 18, fontWeight: "700" },
  label: { color: "#888", fontSize: 12, fontWeight: "600", letterSpacing: 1 },
  input: {
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    color: "#fff",
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#2a2a3e",
  },
  imageArea: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2a2a3e",
    minHeight: 180,
  },
  preview: { width: "100%", height: "100%" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  placeholderText: { color: "#555", fontSize: 14 },
  saveBtn: {
    backgroundColor: "#a78bfa",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
