//! **************************** ONBOARDING TYPES *******************************
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

//! **************************** FORM INPUT TYPES *******************************
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

//! **************************** AUTH-TABS TYPES *******************************
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

//! **************************** USER-PREFERENCES TYPES *******************************
// --- BACKEND INTERFACE ---
interface UserPreferenceDTO {
  maxBudget: number;
  preferredModes: string[];
  avoidanceZones: string[];
  priorityType: "speed" | "cost" | "balanced";
  isComplete: boolean;
}

interface PreferencesScreenProps {
  initialData?: Partial<PreferencesFormData>; // For editing existing preferences
}

// --- TRANSPORT MODE SELECTOR WITH CUSTOM INPUT ---
interface TransportModeSelectorProps {
  selectedModes: string[];
  onToggle: (mode: string) => void;
  onAddCustom: (mode: string) => void;
  isDark: boolean;
}

interface PrioritySelectorProps {
  selectedPriority?: "speed" | "cost" | "balanced";
  onSelect: (priority: "speed" | "cost" | "balanced") => void;
  isDark: boolean;
}

interface ZoneManagerProps {
  zones: string[];
  onAdd: (zone: string) => void;
  onRemove: (zone: string) => void;
  isDark: boolean;
}
//! **************************** SUCCESS - ERROR SCREENS TYPES *******************************
interface ResultScreenProps {
  type: "success" | "error";
  title: string;
  message: string;
  animationSource: any; // require('../../assets/lottie/success.json')
  autoRedirectSeconds?: number; // Auto redirect after X seconds (default: 3)
  onContinue: () => void; // Navigate to next screen
  onRetry?: () => void; // Optional retry button (for errors)
  showTimer?: boolean; // Show countdown timer (default: true)
}
//! **************************** PREFERENCES API INTERFACE TYPES *******************************
 interface UserPreferenceDTO {
  maxBudget: number;
  preferredModes: string[];
  avoidanceZones: string[];
  priorityType: 'speed' | 'cost' | 'balanced';
  isComplete: boolean;
}
 interface UserPreferenceResponse {
  id: string;
  userId: string;
  maxBudget: number;
  preferredModes: string[];
  avoidanceZones: string[];
  priorityType: string;
  isComplete?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
