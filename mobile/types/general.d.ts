interface Slide {
  id: string;
  title: string;
  description: string;
  lottieFile: string; 
  colors: string[];
}

interface OnboardingScreenProps {
  onComplete: () => void;
}
interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  icon: React.ReactNode;
  rightIcon?: React.ReactNode;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

interface RegisterDTO {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

interface RegisterScreenProps {
  onNavigateToLogin: () => void; // Navigate to login screen
  onRegisterSuccess: () => void; // Navigate to main app after successful registration
}
interface LoginDTO {
  email: string;
  password: string;
}

interface LoginScreenProps {
  onNavigateToRegister: () => void; // Navigate to register screen
  onLoginSuccess: () => void; // Navigate to main app after successful login
  onForgotPassword: () => void; // Navigate to forgot password screen
}