import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { drawGrid, drawComponents, findComponentAtPosition, drawConnectionPreview, createComponent, drawComponentPreview } from "@/lib/canvas-utils";
import { useToast } from "@/hooks/use-toast";
import { ComponentInstance } from "@/lib/components";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { calculateSystemPower } from "@/lib/power-utils";
import PowerSummaryPanel from "./PowerSummaryPanel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CanvasProps {
  selectedComponent: string | null;
  components: ComponentInstance[];
  onComponentAdd: (component: ComponentInstance) => void;
  onComponentUpdate: (updatedComponent: ComponentInstance) => void;
  onConnectionCreate: (sourceId: string, targetId: string) => void;
  onComponentDelete: (componentId: string) => void;
  isEraserMode: boolean;
  onSelectComponent: (component: ComponentInstance | null) => void;
  handleComponentSelect: (component: string | null) => void;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ selectedComponent, components, onComponentAdd, onComponentUpdate, onConnectionCreate, onComponentDelete, isEraserMode, onSelectComponent, handleComponentSelect }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { toast } = useToast();
    const [isDragging, setIsDragging] = useState(false);
    const [selectedComponentInstance, setSelectedComponentInstance] = useState<ComponentInstance | null>(null);
    const [isConnectionMode, setIsConnectionMode] = useState(false);
    const [connectionStart, setConnectionStart] = useState<ComponentInstance | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [hoveredComponent, setHoveredComponent] = useState<ComponentInstance | null>(null);
    const [systemPower, setSystemPower] = useState(calculateSystemPower(components));
    
    useImperativeHandle(ref, () => ({
      ...canvasRef.current!,
      setIsConnectionMode,
      setConnectionStart
    }));

    // Update system power when components change
    useEffect(() => {
      const newSystemPower = calculateSystemPower(components);
      setSystemPower(newSystemPower);
    }, [components]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get canvas context");
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      const resizeCanvas = () => {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        ctx.scale(dpr, dpr);
        
        drawGrid(ctx, rect.width, rect.height);
        drawComponents(ctx, components, selectedComponentInstance);
        
        if (isConnectionMode && connectionStart) {
          drawConnectionPreview(ctx, connectionStart, mousePos);
        }

        if (selectedComponent && !isDragging) {
          drawComponentPreview(ctx, selectedComponent, mousePos);
        }
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setMousePos({ x, y });
        
        // Update hovered component
        const component = findComponentAtPosition(x, y, components);
        setHoveredComponent(component);
        
        if (isDragging && selectedComponentInstance) {
          const snappedX = Math.round(x / 20) * 20;
          const snappedY = Math.round(y / 20) * 20;
          
          const updatedComponent = {
            ...selectedComponentInstance,
            x: snappedX,
            y: snappedY,
          };
          
          onComponentUpdate(updatedComponent);
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(ctx, rect.width, rect.height);
        drawComponents(ctx, components, selectedComponentInstance, true); // Added animated parameter
        
        if (isConnectionMode && connectionStart) {
          drawConnectionPreview(ctx, connectionStart, { x, y });
        }

        if (selectedComponent && !isDragging) {
          drawComponentPreview(ctx, selectedComponent, { x, y });
        }
      };

      const handleMouseDown = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const clickedComponent = findComponentAtPosition(x, y, components);

        if (isConnectionMode) {
          if (clickedComponent) {
            if (!connectionStart) {
              setConnectionStart(clickedComponent);
            } else if (connectionStart.id !== clickedComponent.id) {
              onConnectionCreate(connectionStart.id, clickedComponent.id);
              setConnectionStart(null);
            }
          }
          return; // Add this to prevent other handlers from interfering
        }
        
        if (isEraserMode && clickedComponent) {
          onComponentDelete(clickedComponent.id);
          onSelectComponent(null);
          return;
        }

        if (selectedComponent) {
          setIsConnectionMode(false);
          const newComponent = createComponent(selectedComponent, x, y);
          onComponentAdd(newComponent);
          return;
        }
        
        if (clickedComponent) {
          setSelectedComponentInstance(clickedComponent);
          onSelectComponent(clickedComponent);
          setIsDragging(true);
        } else {
          setSelectedComponentInstance(null);
          onSelectComponent(null);
          setConnectionStart(null);
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
      };
    }, [
      selectedComponent,
      components,
      isDragging,
      selectedComponentInstance,
      isConnectionMode,
      connectionStart,
      mousePos,
      isEraserMode,
      onComponentAdd,
      onComponentUpdate,
      onConnectionCreate,
      onComponentDelete,
      onSelectComponent
    ]);
    // Add keyboard event listener for Escape key
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setSelectedComponentInstance(null);
          onSelectComponent(null);
          handleComponentSelect(null);
          setIsConnectionMode(false);
          setConnectionStart(null);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onSelectComponent, handleComponentSelect]);


    return (
      <div className="relative w-full h-full">
        <PowerSummaryPanel systemPower={systemPower} />
        
        <TooltipProvider>
          <Tooltip open={hoveredComponent !== null}>
            <TooltipTrigger asChild>
              <canvas
                ref={canvasRef}
                className="w-full h-full bg-white"
                style={{ 
                  cursor: isEraserMode 
                    ? `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23ff69b4" stroke-width="2"><path d="M18 13L11 20H4L9 15M18 13L22 9L15 2L11 6M18 13L11 6"/></svg>') 0 20, auto`
                    : selectedComponent 
                    ? "crosshair" 
                    : isDragging 
                    ? "grabbing" 
                    : "default" 
                }}
              />
            </TooltipTrigger>
            {hoveredComponent && (
              <TooltipContent>
                {hoveredComponent.type === 'solar' && (
                  <div>
                    <div>Current Output: {hoveredComponent.specs.power}W</div>
                    <div>Panel Capacity: {hoveredComponent.specs.power}W</div>
                    <div>Efficiency: {(Number(hoveredComponent.specs.efficiency) * 100).toFixed(1)}%</div>
                  </div>
                )}
                {hoveredComponent.type === 'battery' && (
                  <div>
                    <div>Capacity: {hoveredComponent.specs.capacity}Wh</div>
                    <div>Max Charge Rate: {hoveredComponent.specs.maxChargePower}W</div>
                    <div>Voltage: {hoveredComponent.specs.voltage}V</div>
                  </div>
                )}
                {hoveredComponent.type === 'load' && (
                  <div>
                    <div>Power Draw: {hoveredComponent.specs.power}W</div>
                    <div>Type: {hoveredComponent.specs.name}</div>
                    <div>Voltage: {hoveredComponent.specs.voltage}V</div>
                  </div>
                )}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (selectedComponent) {
                handleComponentSelect(null);
              }
              setSelectedComponentInstance(null);
              onSelectComponent(null);
              setIsConnectionMode(!isConnectionMode);
              setConnectionStart(null);
            }}
            className={`${isConnectionMode ? "bg-primary text-primary-foreground" : ""}`}
          >
            <Link2 className={`h-4 w-4 mr-2`} />
            {isConnectionMode ? "Cancel" : "Connect"}
          </Button>
        </div>
      </div>
    );
  }
);

Canvas.displayName = "Canvas";
export default Canvas;