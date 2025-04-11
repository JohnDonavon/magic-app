import { initializeDatabase } from '@/database/setup';
import { DowngradeError } from '@/database/SQLiteClient';
import { Stack } from 'expo-router/stack';

export default function Layout() {
  const performDBInitialization = async () => {
    try {
      await initializeDatabase()
    } catch (err) {
      if (err instanceof DowngradeError) {
        console.error('Downgrade error')
      } else {
        console.error(`Unexpected error: ${err}`)
      }
    }
  }
  performDBInitialization()
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
