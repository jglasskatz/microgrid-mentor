import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { componentTypes } from "@/lib/components";
import { 
  Battery, 
  Sun, 
  Wind, 
  PowerSquare,
} from "lucide-react";

const iconMap = {
  solar: Sun,
  wind: Wind,
  battery: Battery,
  load: PowerSquare,
};

interface ComponentPaletteProps {
  onSelectComponent: (component: string) => void;
}

export default function ComponentPalette({ onSelectComponent }: ComponentPaletteProps) {
  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Components</h2>
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {componentTypes.map((component) => {
            const Icon = iconMap[component.type];
            return (
              <Button
                key={component.type}
                variant="outline"
                className="w-full justify-start"
                onClick={() => onSelectComponent(component.type)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("component", component.type);
                }}
              >
                <Icon className={`mr-2 h-4 w-4 ${component.color}`} />
                {component.label}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
