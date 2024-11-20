export const componentTypes = [
  {
    type: "solar",
    label: "Solar Panel",
    color: "text-green-500",
    defaultSpecs: {
      power: 400, // Watts
      efficiency: 0.21,
      area: 1.95, // m²
    },
    powerOptions: [
      { power: 100, efficiency: 0.20, area: 0.49 },
      { power: 200, efficiency: 0.21, area: 0.98 },
      { power: 400, efficiency: 0.21, area: 1.95 },
    ],
  },
  {
    type: "wind",
    label: "Wind Turbine",
    color: "text-green-500",
    defaultSpecs: {
      power: 2000, // Watts
      cutInSpeed: 3, // m/s
      ratedSpeed: 12, // m/s
    },
  },
  {
    type: "battery",
    label: "Battery Storage",
    color: "text-blue-500",
    defaultSpecs: {
      capacity: 5000, // Wh
      voltage: 12, // V
      maxChargePower: 2000, // W
    },
    batteryOptions: [
      { capacity: 600, voltage: 12, maxChargePower: 300 },  // 50Ah
      { capacity: 1200, voltage: 12, maxChargePower: 600 }, // 100Ah
      { capacity: 2400, voltage: 12, maxChargePower: 1200 }, // 200Ah
    ],
  },
  {
    type: "load",
    label: "Load",
    color: "text-red-500",
    defaultSpecs: {
      power: 1000, // Watts
      voltage: 230, // V
      phase: "single",
    },
    appliancePresets: [
      { name: "Fridge", power: 500, voltage: 230, phase: "single" },
      { name: "Lights", power: 60, voltage: 230, phase: "single" },
      { name: "Speakers", power: 100, voltage: 230, phase: "single" },
    ],
  },
];

export interface ComponentInstance {
  id: string;
  type: string;
  x: number;
  y: number;
  connections: string[];
  specs: Record<string, number | string>;
}

export function getDefaultSpecs(type: string): Record<string, number | string> {
  const componentType = componentTypes.find(c => c.type === type);
  return componentType ? { ...componentType.defaultSpecs } : {};
}
