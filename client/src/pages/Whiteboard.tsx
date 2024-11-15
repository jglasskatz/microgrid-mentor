import { useRef, useState } from "react";
import Canvas from "@/components/Canvas";
import ComponentPalette from "@/components/ComponentPalette";
import AICoach from "@/components/AICoach";
import ProductPanel from "@/components/ProductPanel";
import { Card } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="p-4 border-b bg-white">
        <h1 className="text-2xl font-bold">Microgrid Designer</h1>
      </div>
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15}>
          <Card className="h-full rounded-none border-r">
            <ComponentPalette onSelectComponent={setSelectedComponent} />
          </Card>
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={55}>
          <Canvas ref={canvasRef} selectedComponent={selectedComponent} />
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
