import RegisterScreenComponent from "@/app/components/screens.components/signup.component";
import { router } from "expo-router";

export default function RegisterRoute() {
  return (
    <RegisterScreenComponent
      onNavigateToLogin={() => router.push("/screens/(auth)/login")}
      onRegisterSuccess={() => {
        // After successful registration, go to main app
        router.replace("/");
      }}
    />
  );
}
