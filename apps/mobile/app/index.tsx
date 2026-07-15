import { Redirect } from "expo-router";
import { useAuthStore } from "../store";

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(app)/tabs/feed" />;
  }
  return <Redirect href="/auth/welcome" />;
}
