import { Stack } from 'expo-router';

export default function TestLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen 
        name="input" 
        options={{ 
          title: 'Log Test',
          headerBackTitle: 'Cancel',
        }} 
      />
      <Stack.Screen 
        name="context" 
        options={{ 
          title: 'Add Context',
        }} 
      />
      <Stack.Screen 
        name="success" 
        options={{ 
          title: 'Test Saved',
          headerBackTitle: 'Done',
        }} 
      />
    </Stack>
  );
}

