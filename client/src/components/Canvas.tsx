import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { drawGrid, drawComponents, findComponentAtPosition, drawConnectionPreview, createComponent, drawComponentPreview } from "@/lib/canvas-utils";
import { useToast } from "@/hooks/use-toast";
import { ComponentInstance } from "@/lib/components";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { calculateSystemPower } from "@/lib/power-utils";

interface CanvasProps {
  selectedComponent: string | null;
  components: ComponentInstance[];
  onComponentAdd: (component: ComponentInstance) => void;
  onComponentUpdate: (updatedComponent: ComponentInstance) => void;
  onConnectionCreate: (sourceId: string, targetId: string) => void;
  onComponentDelete: (componentId: string) => void;
  isEraserMode: boolean;
  onSelectComponent: (component: ComponentInstance | null) => void;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ selectedComponent, components, onComponentAdd, onComponentUpdate, onConnectionCreate, onComponentDelete, isEraserMode, onSelectComponent }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { toast } = useToast();
    const [isDragging, setIsDragging] = useState(false);
    const [selectedComponentInstance, setSelectedComponentInstance] = useState<ComponentInstance | null>(null);
    const [isConnectionMode, setIsConnectionMode] = useState(false);
    const [connectionStart, setConnectionStart] = useState<ComponentInstance | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    
    useImperativeHandle(ref, () => ({
      ...canvasRef.current!,
      setIsConnectionMode,
      setConnectionStart
    }));

    // Calculate and display system power stats when components change
    useEffect(() => {
      const systemPower = calculateSystemPower(components);
      const netPowerStatus = systemPower.netPower >= 0 ? 'surplus' : 'deficit';
      
      toast({
        title: "System Power Status",
        description: `Generation: ${systemPower.totalGeneration.toFixed(1)}W | Load: ${systemPower.totalConsumption.toFixed(1)}W | Storage: ${systemPower.storageCapacity.toFixed(1)}Wh | Net: ${systemPower.netPower.toFixed(1)}W (${netPowerStatus})`,
      });
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
        drawComponents(ctx, components, selectedComponentInstance);
        
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
        
        if (isEraserMode && clickedComponent) {
          onComponentDelete(clickedComponent.id);
          onSelectComponent(null);
          return;
        }

        if (selectedComponent) {
          const newComponent = createComponent(selectedComponent, x, y);
          onComponentAdd(newComponent);
          return;
        }
        
        if (clickedComponent) {
          if (isConnectionMode) {
            if (!connectionStart) {
              setConnectionStart(clickedComponent);
            } else if (connectionStart.id !== clickedComponent.id) {
              onConnectionCreate(connectionStart.id, clickedComponent.id);
              setConnectionStart(null);
            }
          } else {
            setSelectedComponentInstance(clickedComponent);
            onSelectComponent(clickedComponent);
            setIsDragging(true);
          }
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

    return (
      <div className="relative w-full h-full">
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
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsConnectionMode(!isConnectionMode);
              setConnectionStart(null);
              if (selectedComponent) {
                onSelectComponent(null);
              }
            }}
            className={isConnectionMode ? "bg-primary text-primary-foreground" : ""}
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
