export const componentTypes = [
  {
    type: "solar",
    label: "Solar Panel",
    color: "text-green-500",
    specs: {
      power: 400, // Watts
      efficiency: 0.21,
      area: 1.95, // m²
    },
  },
  {
    type: "wind",
    label: "Wind Turbine",
    color: "text-green-500",
    specs: {
      power: 2000, // Watts
      cutInSpeed: 3, // m/s
      ratedSpeed: 12, // m/s
    },
  },
  {
    type: "battery",
    label: "Battery Storage",
    color: "text-blue-500",
    specs: {
      capacity: 5000, // Wh
      voltage: 48, // V
      maxChargePower: 2000, // W
    },
  },
  {
    type: "load",
    label: "Load",
    color: "text-red-500",
    specs: {
      power: 1000, // Watts
      voltage: 230, // V
      phase: "single",
    },
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
