import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

function TabBarIcon(props: {
  name: string;
  color: string;
  focused: boolean;
}) {
  const iconMap: Record<string, string> = {
    home: '🏠',
    plants: '🌱',
    map: '🗺️',
    profile: '👤',
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24 }}>{iconMap[props.name]}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A1A2E',
          borderTopColor: '#3A3A4E',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#A0A0A0',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: (props) => <TabBarIcon {...props} name="home" />,
        }}
      />
      <Tabs.Screen
        name="plants"
        options={{
          title: 'Plantas',
          tabBarIcon: (props) => <TabBarIcon {...props} name="plants" />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Tiendas',
          tabBarIcon: (props) => <TabBarIcon {...props} name="map" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: (props) => <TabBarIcon {...props} name="profile" />,
        }}
      />
    </Tabs>
  );
}
