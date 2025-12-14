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
//! **************************** HOME TYPES *******************************

interface HomeHeaderProps {
  userName: string;
  temperature?: number;
  onNotificationPress: () => void;
  isDark: boolean;
}
interface RouteSearchCardProps {
  onSearch: (from: string, to: string) => void;
  onChooseFavorite: () => void;
  isDark: boolean;
}

interface Recommendation {
  from: string;
  to: string;
  mode: 'bus' | 'moto' | 'taxi' | 'walk';
  cost: number;
  duration: string;
}

interface RecommendationCardProps {
  recommendation?: Recommendation;
  onViewDetails: () => void;
  isDark: boolean;
}
interface RecentSearch {
  id: string;
  from: string;
  to: string;
}

interface RecentSearchesProps {
  searches: RecentSearch[];
  onSelectSearch: (search: RecentSearch) => void;
  isDark: boolean;
}

interface RouteSearchCardProps {
  onSearch: (from: string, to: string) => void;
  onChooseFavorite: () => void;
  onEditPreferences: () => void;
  isDark: boolean;
}

//! **************************** Routes TYPES *******************************

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
}
 
interface RouteOption {
  id: string;
  mode: 'bus' | 'moto' | 'taxi' | 'walk';
  cost: number;
  duration: number;
  distance: number;
  polyline: string;
  recommendation?: 'best-value' | 'fastest' | 'cheapest';
  steps: RouteStep[];
}
interface LocationInput {
  address?: string;
  lat?: number;
  lng?: number;
}
 
interface RouteSearchRequest {
  from: LocationInput;
  to: LocationInput;
  departureTime?: string;
}

 interface RouteOption {
  id: string;
  mode: "bus" | "moto" | "taxi" | "walking";
  cost: number; // XAF
  duration: number; // minutes
  distance: number; // kilometers
  polyline: string; // For Google Maps rendering
  steps: RouteStep[];
  recommendation?: "best-value" | "fastest" | "cheapest" | "recommended";
}

 interface RouteStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
}

 interface RouteSearchResponse {
  success: boolean;
  routes: RouteOption[];
  origin: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  destination: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  userPreferences?: {
    priorityType: "fastest" | "cheapest" | "balanced";
    maxBudget: number;
    preferredModes: string[];
  };
  message?: string;
}

interface Trip {
  id: string;
  origin: string;
  destination: string;
  transportMode: string;
  actualCost: number;
  actualTime: number;
  distance: number;
  startTime: string;
  endTime?: string;
  rating?: number;
  createdAt: string;
}
interface AddTripModalProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
}

interface AddFavoriteModalProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
}

interface FilterFormData {
  startDate?: string;
  endDate?: string;
  modes: string[];
  minCost?: number;
  maxCost?: number;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterFormData) => void;
  isDark: boolean;
}



