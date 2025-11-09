import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide tab bar completely
      }}>
      {/* Main Dashboard - Only visible screen */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          href: null, // Still accessible but not in tab bar
        }}
      />
      
      {/* All other screens accessible via navigation only */}
      <Tabs.Screen
        name="track"
        options={{
          title: 'Test History',
          href: null,
        }}
      />
      <Tabs.Screen
        name="protocols"
        options={{
          title: 'Protocols',
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          href: null,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="impact"
        options={{
          title: 'IMPACT™',
          href: null,
        }}
      />
      <Tabs.Screen
        name="ask"
        options={{
          title: 'ASK™',
          href: null,
        }}
      />
    </Tabs>
  );
}
