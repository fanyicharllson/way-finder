import { router } from "expo-router";
import OnboardingScreenComponent from "../components/screens.components/onboarding.component";
import { markOnboardingComplete } from "@/utils/storage";

export default function OnboardingScreen() {
  const handleComplete = async () => {
    // Mark onboarding as completed
    await markOnboardingComplete();

    // Navigate to register screen
    router.replace("/screens/(auth)/signup");
  };

  return <OnboardingScreenComponent onComplete={handleComplete} />;
}
