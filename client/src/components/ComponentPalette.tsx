import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { componentTypes } from "@/lib/components";
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
}

export default function ComponentPalette({ 
  onSelectComponent, 
  selectedComponent,
  isEraserMode,
  onEraserModeToggle,
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
              <Button
                key={component.type}
                variant={isSelected ? "default" : "outline"}
                className={`w-full justify-start transition-colors ${
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