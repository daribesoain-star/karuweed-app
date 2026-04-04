import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('CL');
  const [localError, setLocalError] = useState('');

  const handleRegister = async () => {
    setLocalError('');

    if (!email || !password || !confirmPassword || !fullName) {
      setLocalError('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await signUp(email, password, fullName, countryCode);
      Alert.alert('Éxito', 'Cuenta creada. Por favor revisa tu correo para confirmar.', [
        {
          text: 'OK',
          onPress: () => router.push('/(auth)/login'),
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrarse';
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
            Crear Cuenta
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#A0A0A0',
            }}
          >
            Únete a la comunidad KaruWeed
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
            label="Nombre completo"
            placeholder="Tu nombre"
            value={fullName}
            onChangeText={setFullName}
            editable={!isLoading}
            containerStyle={{ marginBottom: 16 }}
          />

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
            containerStyle={{ marginBottom: 16 }}
          />

          <Input
            label="Confirmar contraseña"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isLoading}
            secureTextEntry
            containerStyle={{ marginBottom: 12 }}
          />
        </View>

        <Button
          title={isLoading ? 'Registrando...' : 'Crear cuenta'}
          onPress={handleRegister}
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
            ¿Ya tienes cuenta?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text
              style={{
                color: '#22C55E',
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              Inicia sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
