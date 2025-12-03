// --- DEFAULT TRANSPORT MODES (Can be selected or custom added) ---
export const DEFAULT_TRANSPORT_MODES = [
  { id: "bus", label: "Bus", icon: "bus-outline" },
  { id: "moto", label: "Moto/Bike", icon: "bicycle-outline" },
  { id: "taxi", label: "Taxi", icon: "car-outline" },
  { id: "walk", label: "Walk", icon: "walk-outline" },
  { id: "train", label: "Train", icon: "train-outline" },
  { id: "ferry", label: "Ferry", icon: "boat-outline" },
];

// --- PRIORITY TYPES ---
export const PRIORITY_TYPES = [
  {
    id: "speed",
    label: "Speed First",
    icon: "flash-outline",
    description: "Get there fastest",
  },
  {
    id: "cost",
    label: "Cost Effective",
    icon: "cash-outline",
    description: "Save money",
  },
  {
    id: "balanced",
    label: "Balanced",
    icon: "scale-outline",
    description: "Best overall",
  },
];
