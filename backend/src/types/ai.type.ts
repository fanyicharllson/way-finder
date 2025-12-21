export interface AIRequest {
  message: string;
  context?: {
    userId?: string;
    currentLocation?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    weather?: string;
    timeOfDay?: string;
    preferences?: any;
  };
}

export interface AIResponse {
  reply: string;
  suggestions?: RouteSuggestion[];
  action?: 'search_route' | 'update_preference' | 'none';
  actionData?: any;
}

export interface RouteSuggestion {
  origin: string;
  destination: string;
  reason: string;
}
