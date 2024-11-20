export interface PowerFlow {
  input: number;  // Power input in watts
  output: number; // Power output in watts
  efficiency: number; // Component efficiency
}

export interface SystemPower {
  totalGeneration: number;   // Total power generation capacity
  totalConsumption: number;  // Total power consumption
  storageCapacity: number;   // Total energy storage capacity
  netPower: number;         // Net power (generation - consumption)
}

// Calculate power for solar panels based on specs
export function calculateSolarPower(specs: Record<string, number | string>): PowerFlow {
  const power = Number(specs.power) || 0;
  const efficiency = Number(specs.efficiency) || 0.21;
  
  return {
    input: power / efficiency, // Solar irradiance input
    output: power,            // Actual power output
    efficiency
  };
}

// Calculate power for wind turbines based on specs
export function calculateWindPower(specs: Record<string, number | string>): PowerFlow {
  const power = Number(specs.power) || 0;
  const efficiency = 0.35; // Typical wind turbine efficiency
  
  return {
    input: power / efficiency, // Wind power input
    output: power,            // Actual power output
    efficiency
  };
}

// Calculate battery power flow
export function calculateBatteryPower(specs: Record<string, number | string>): PowerFlow {
  const capacity = Number(specs.capacity) || 0;
  const maxChargePower = Number(specs.maxChargePower) || 0;
  const efficiency = 0.95; // Typical battery round-trip efficiency
  
  return {
    input: maxChargePower,
    output: maxChargePower * efficiency,
    efficiency
  };
}

// Calculate load power consumption
export function calculateLoadPower(specs: Record<string, number | string>): PowerFlow {
  const power = Number(specs.power) || 0;
  const efficiency = 1.0; // Loads are considered 100% efficient in power consumption
  
  return {
    input: power,
    output: power,
    efficiency
  };
}

// Calculate component power based on type
export function calculateComponentPower(type: string, specs: Record<string, number | string>): PowerFlow {
  switch (type) {
    case 'solar':
      return calculateSolarPower(specs);
    case 'wind':
      return calculateWindPower(specs);
    case 'battery':
      return calculateBatteryPower(specs);
    case 'load':
      return calculateLoadPower(specs);
    default:
      return { input: 0, output: 0, efficiency: 0 };
  }
}

// Calculate system-wide power metrics
export function calculateSystemPower(components: Array<{
  type: string;
  specs: Record<string, number | string>;
}>): SystemPower {
  let totalGeneration = 0;
  let totalConsumption = 0;
  let storageCapacity = 0;

  components.forEach(component => {
    const power = calculateComponentPower(component.type, component.specs);
    
    switch (component.type) {
      case 'solar':
      case 'wind':
        totalGeneration += power.output;
        break;
      case 'battery':
        storageCapacity += Number(component.specs.capacity) || 0;
        break;
      case 'load':
        totalConsumption += power.input;
        break;
    }
  });

  return {
    totalGeneration,
    totalConsumption,
    storageCapacity,
    netPower: totalGeneration - totalConsumption
  };
}
