import { Stack } from 'expo-router';

export default function SearchLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Search",
          headerShown: true
        }}
      />
      <Stack.Screen
        name="card-details"
        options={{
          title: "Card Details",
          headerShown: true,
          headerBackVisible: true,
          headerBackButtonDisplayMode: "minimal"
        }}
      />
    </Stack>
  );
} 