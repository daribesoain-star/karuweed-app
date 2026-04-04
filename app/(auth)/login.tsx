import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    setLocalError('');

    if (!email || !password) {
      setLocalError('Por favor completa todos los campos');
      return;
    }

    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setLocalError(message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: '700',
              color: '#FFFFFF',
              marginBottom: 8,
            }}
          >
            KaruWeed
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#A0A0A0',
            }}
          >
            Tu compañero de cultivo de cannabis
          </Text>
        </View>

        {(localError || error) && (
          <View
            style={{
              backgroundColor: '#EF4444' + '20',
              borderWidth: 1,
              borderColor: '#EF4444',
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: '#FCA5A5', fontSize: 14 }}>
              {localError || error}
            </Text>
          </View>
        )}

        <View style={{ marginBottom: 24 }}>
          <Input
            label="Correo electrónico"
            placeholder="tu@email.com"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={{ marginBottom: 16 }}
          />

          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
            secureTextEntry
            containerStyle={{ marginBottom: 12 }}
          />
        </View>

        <Button
          title={isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          onPress={handleLogin}
          disabled={isLoading}
          loading={isLoading}
          size="large"
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 24,
          }}
        >
          <Text style={{ color: '#A0A0A0', fontSize: 14 }}>
            ¿No tienes cuenta?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text
              style={{
                color: '#22C55E',
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              Regístrate aquí
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
