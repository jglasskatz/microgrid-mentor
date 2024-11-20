import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

interface PowerSpecsMenuProps {
  componentType: string;
  onSpecsChange: (specs: Record<string, number | string>) => void;
}

export default function PowerSpecsMenu({ componentType, onSpecsChange }: PowerSpecsMenuProps) {
  const handleSolarPowerSelect = (power: number) => {
    onSpecsChange({
      power,
      efficiency: 0.21,
      area: power / 205, // Approximate area based on 205W/m²
    });
  };

  const handleBatterySelect = (capacity: number, isAh: boolean) => {
    const voltage = 12; // System voltage
    const whCapacity = isAh ? capacity * voltage : capacity;
    onSpecsChange({
      capacity: whCapacity,
      voltage,
      maxChargePower: whCapacity * 0.5, // Max charge rate at 0.5C
    });
  };

  const handleLoadSelect = (power: number, name: string) => {
    onSpecsChange({
      power,
      name,
      voltage: 230,
      phase: "single",
    });
  };

  const renderContent = () => {
    switch (componentType) {
      case "solar":
        return (
          <div className="flex flex-col gap-2">
            <h3 className="font-medium mb-2">Select Panel Power</h3>
            {[100, 200, 400].map((power) => (
              <Button
                key={power}
                variant="outline"
                onClick={() => handleSolarPowerSelect(power)}
                className="w-full justify-between"
              >
                {power}W
              </Button>
            ))}
          </div>
        );

      case "battery":
        return (
          <div className="flex flex-col gap-2">
            <h3 className="font-medium mb-2">Battery Capacity</h3>
            <div className="flex items-center gap-2 mb-2">
              <Toggle
                aria-label="Toggle Ah/Wh"
                onPressedChange={(pressed) => {
                  if (pressed) {
                    handleBatterySelect(50, true); // Default to 50Ah when switching to Ah
                  }
                }}
              >
                Ah Mode
              </Toggle>
            </div>
            {[50, 100, 200].map((capacity) => (
              <Button
                key={capacity}
                variant="outline"
                onClick={() => handleBatterySelect(capacity, true)}
                className="w-full justify-between"
              >
                {capacity}Ah ({capacity * 12}Wh)
              </Button>
            ))}
          </div>
        );

      case "load":
        return (
          <div className="flex flex-col gap-2">
            <h3 className="font-medium mb-2">Select Appliance</h3>
            {[
              { name: "Fridge", power: 500 },
              { name: "Lights", power: 60 },
              { name: "Speakers", power: 100 },
            ].map(({ name, power }) => (
              <Button
                key={name}
                variant="outline"
                onClick={() => handleLoadSelect(power, name)}
                className="w-full justify-between"
              >
                {name} ({power}W)
              </Button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        {renderContent()}
      </PopoverContent>
    </Popover>
  );
}
