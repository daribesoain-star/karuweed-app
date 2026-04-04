import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>🗺️</Text>
      <Text style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 }}>
        Mapa de tiendas
      </Text>
      <Text style={{ color: '#A0A0A0', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 }}>
        Encuentra tiendas especializadas en cannabis en tu área. Próximamente.
      </Text>
    </SafeAreaView>
  );
}
