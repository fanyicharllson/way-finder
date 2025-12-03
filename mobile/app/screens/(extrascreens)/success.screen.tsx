import { router } from "expo-router";
import SuccessErrorScreen from "../../components/success.error.screen";

export default function PreferencesSuccessRoute() {
  return (
    <SuccessErrorScreen
      type="success"
      title="Preferences Saved!"
      message="Your journey is now personalized. Get ready for optimized routes tailored just for you."
      animationSource={require("../../../assets/lottie/success.json")}
      autoRedirectSeconds={10}
      onContinue={() => router.replace("/screens/(tabs)")}
      showTimer={true}
    />
  );
}
