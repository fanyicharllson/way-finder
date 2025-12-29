import LoginScreenComponent from "@/components/screens.components/login.component";
import { router } from "expo-router";

export default function LoginScreen() {
  return (
    <LoginScreenComponent
      onNavigateToRegister={() => router.push("/screens/(auth)/signup")}
      onLoginSuccess={() => {
        router.replace("/");
      }}
      onForgotPassword={() => router.push("/screens/(auth)/forget-password")}
    />
  );
}
