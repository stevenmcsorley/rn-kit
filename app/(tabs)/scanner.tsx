import React, { useState, useEffect } from "react";
import { StyleSheet, View, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { CameraView, Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    router.push({
      pathname: "/food-info",
      params: { barcode: data },
    });
  };

  const handleClose = () => {
    router.back();
  };

  if (hasPermission === null) {
    return <ThemedText>Requesting for camera permission</ThemedText>;
  }
  if (hasPermission === false) {
    return <ThemedText>No access to camera</ThemedText>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean8", "ean13", "qr"],
        }}
      />
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close-circle" size={40} color="white" />
      </TouchableOpacity>
      {scanned && (
        <TouchableOpacity
          style={styles.rescanButton}
          onPress={() => setScanned(false)}
        >
          <ThemedText style={styles.rescanText}>Tap to Scan Again</ThemedText>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  rescanButton: {
    position: "absolute",
    bottom: 50,
    left: 50,
    right: 50,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  rescanText: {
    color: "white",
    fontSize: 16,
  },
});
