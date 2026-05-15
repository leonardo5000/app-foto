import { useState, useCallback, useRef } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getPhotos } from "../database";

export default function Mapa() {
  const [photos, setPhotos] = useState([]);
  const mapRef = useRef(null);

  // Recarrega ao entrar na tela
  useFocusEffect(
    useCallback(() => {
      const data = getPhotos().filter((p) => p.latitude != null);
      setPhotos(data);
    }, [])
  );

  // Centraliza todos os pontos no mapa
  function fitAll() {
    if (photos.length === 0 || !mapRef.current) return;
    mapRef.current.fitToCoordinates(
      photos.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
      { edgePadding: { top: 80, right: 60, bottom: 80, left: 60 }, animated: true }
    );
  }

  if (photos.length === 0) {
    return (
      <View style={s.empty}>
        <Ionicons name="map-outline" size={64} color="#444" />
        <Text style={s.emptyText}>Sem pontos no mapa</Text>
        <Text style={s.emptyHint}>Adicione fotos com localização na aba Galeria</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: photos[0].latitude,
          longitude: photos[0].longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onMapReady={fitAll}
      >
        {photos.map((photo) => (
          <Marker
            key={photo.id}
            coordinate={{ latitude: photo.latitude, longitude: photo.longitude }}
          >
            <Callout>
              <View style={s.callout}>
                <Image source={{ uri: photo.image_uri }} style={s.calloutImage} />
                <Text style={s.calloutTitle} numberOfLines={2}>{photo.title}</Text>
                <Text style={s.calloutDate}>
                  {new Date(photo.created_at).toLocaleDateString("pt-BR")}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Botão centralizar */}
      <TouchableOpacity style={s.fitBtn} onPress={fitAll}>
        <Ionicons name="contract-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  empty: { flex: 1, backgroundColor: "#0f0f1a", alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  emptyText: { color: "#555", fontSize: 18, fontWeight: "600" },
  emptyHint: { color: "#444", fontSize: 13, textAlign: "center" },

  callout: { width: 180, gap: 6, padding: 4 },
  calloutImage: { width: "100%", height: 110, borderRadius: 8 },
  calloutTitle: { fontSize: 13, fontWeight: "700", color: "#111" },
  calloutDate: { fontSize: 11, color: "#666" },

  fitBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 10,
  },
});
