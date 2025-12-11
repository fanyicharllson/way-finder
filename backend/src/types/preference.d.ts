interface UserPreferenceResponse {
  id: string;
  userId: string;
  maxBudget: number;
  preferredModes: string[];
  avoidanceZones: string[];
  priorityType: string;
  isComplete?: boolean; //save later logic(also will determine if the user will see the prefernce ui aside checking if theyhave preference ui saved)
  createdAt: Date;
  updatedAt: Date;
}

interface LocationResponse {
  id: string;
  userId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isFavorite: boolean;
  createdAt: Date;
}

interface CallingPreferenceServicePayload {
  userId: string;
  timestamp: Date;
}
