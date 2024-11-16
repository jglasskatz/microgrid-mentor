import { useRef, useState } from "react";
import Canvas from "@/components/Canvas";
import ComponentPalette from "@/components/ComponentPalette";
import AICoach from "@/components/AICoach";
import ProductPanel from "@/components/ProductPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ComponentInstance } from "@/lib/components";

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [components, setComponents] = useState<ComponentInstance[]>([]);

  const handleComponentAdd = (component: ComponentInstance) => {
    const isDuplicate = components.some(
      (c) => c.type === component.type && 
             c.x === component.x && 
             c.y === component.y
    );

    if (!isDuplicate) {
      setComponents(prev => [...prev, component]);
    }
  };

  const handleComponentUpdate = (updatedComponent: ComponentInstance) => {
    setComponents(prev =>
      prev.map(component =>
        component.id === updatedComponent.id ? updatedComponent : component
      )
    );
  };

  const handleConnectionCreate = (sourceId: string, targetId: string) => {
    setComponents(prev =>
      prev.map(component => {
        if (component.id === sourceId && !component.connections.includes(targetId)) {
          return {
            ...component,
            connections: [...component.connections, targetId],
          };
        }
        return component;
      })
    );
  };

  const resetCanvas = () => {
    setComponents([]);
    setSelectedComponent(null);
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="p-4 border-b bg-white flex justify-between items-center">
        <h1 className="text-2xl font-bold">Microgrid Designer</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetCanvas}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Reset Canvas
        </Button>
      </div>
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15}>
          <Card className="h-full rounded-none border-r">
            <ComponentPalette onSelectComponent={setSelectedComponent} />
          </Card>
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={55}>
          <Canvas 
            ref={canvasRef} 
            selectedComponent={selectedComponent}
            components={components}
            onComponentAdd={handleComponentAdd}
            onComponentUpdate={handleComponentUpdate}
            onConnectionCreate={handleConnectionCreate}
          />
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={25}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={50}>
              <Card className="h-full rounded-none border-l">
                <AICoach />
              </Card>
            </ResizablePanel>
            
            <ResizableHandle />
            
            <ResizablePanel defaultSize={50}>
              <Card className="h-full rounded-none border-l">
                <ProductPanel />
              </Card>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
