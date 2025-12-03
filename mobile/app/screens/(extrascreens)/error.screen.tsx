import { router } from "expo-router";
import SuccessErrorScreen from "../../components/success.error.screen";

export default function PreferencesErrorRoute() {
  return (
    <SuccessErrorScreen
      type="error"
      title="Something Went Wrong"
      message="We couldn't save your preferences. Please check your connection and try again."
      animationSource={require("../../../assets/lottie/error.json")}
      autoRedirectSeconds={7}
      onContinue={() => router.back()}
      onRetry={() => router.back()}
      showTimer={true}
    />
  );
}
