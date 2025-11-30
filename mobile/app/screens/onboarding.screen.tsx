import { router } from "expo-router";
import OnboardingScreenComponent from "../components/screens.components/onboarding.component";

export default function OnboardingScreen() {
  return (
    <OnboardingScreenComponent
      onComplete={() => {
        // Navigate to register screen
        router.push("/screens/(auth)/signup");
      }}
    />
  );
}
