import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { DesignSystem } from '@/constants/DesignSystem';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: DesignSystem.colors.primary[500],
        tabBarInactiveTintColor: DesignSystem.colors.neutral[400],
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' }, // Allow animated background to show through
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // Semi-transparent tab bar
          borderTopWidth: 1,
          borderTopColor: DesignSystem.colors.oura.cardBorder,
          height: 80,
          paddingBottom: 24,
          paddingTop: 8,
          ...DesignSystem.shadows.sm,
        },
        tabBarLabelStyle: {
          fontSize: DesignSystem.typography.fontSize.xs,
          fontWeight: DesignSystem.typography.fontWeight.medium,
          marginTop: 4,
        },
      }}>
      {/* Main Tabs - Visible in Tab Bar */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <TabBarIcon name="line-chart" color={color} />,
        }}
      />

      <Tabs.Screen
        name="track"
        options={{
          title: 'Track',
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />

      {/* Hidden Screens - Accessible via navigation only */}
      <Tabs.Screen
        name="protocols"
        options={{
          title: 'Protocols',
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
