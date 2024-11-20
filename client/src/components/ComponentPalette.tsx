import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { componentTypes } from "@/lib/components";
import PowerSpecsMenu from "./PowerSpecsMenu";
import { 
  Battery, 
  Sun, 
  Wind, 
  PowerSquare,
  Eraser,
} from "lucide-react";

const iconMap = {
  solar: Sun,
  wind: Wind,
  battery: Battery,
  load: PowerSquare,
};

interface ComponentPaletteProps {
  onSelectComponent: (component: string | null) => void;
  selectedComponent: string | null;
  isEraserMode: boolean;
  onEraserModeToggle: () => void;
  onSpecsChange?: (specs: Record<string, number | string>) => void;
}

export default function ComponentPalette({ 
  onSelectComponent, 
  selectedComponent,
  isEraserMode,
  onEraserModeToggle,
  onSpecsChange,
}: ComponentPaletteProps) {
  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Components</h2>
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {componentTypes.map((component) => {
            const Icon = iconMap[component.type];
            const isSelected = selectedComponent === component.type && !isEraserMode;
            return (
              <div key={component.type} className="flex items-center gap-2">
                <Button
                  variant={isSelected ? "default" : "outline"}
                  className={`flex-1 justify-start transition-colors ${
                    isSelected ? "bg-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => {
                    if (isEraserMode) {
                      onEraserModeToggle();
                    }
                    onSelectComponent(isSelected ? null : component.type);
                  }}
                >
                  <Icon className={`mr-2 h-4 w-4 ${isSelected ? "text-primary-foreground" : component.color}`} />
                  {component.label}
                </Button>
                {isSelected && onSpecsChange && (
                  <PowerSpecsMenu
                    componentType={component.type}
                    onSpecsChange={onSpecsChange}
                  />
                )}
              </div>
            );
          })}
          <Button
            variant={isEraserMode ? "destructive" : "outline"}
            className="w-full justify-start transition-colors"
            onClick={() => {
              if (selectedComponent) {
                onSelectComponent(null);
              }
              onEraserModeToggle();
            }}
          >
            <Eraser className="mr-2 h-4 w-4" />
            Eraser
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}
