import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { drawGrid, drawComponents, handleDrop, findComponentAtPosition, drawConnectionPreview } from "@/lib/canvas-utils";
import { useToast } from "@/hooks/use-toast";
import { ComponentInstance } from "@/lib/components";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

interface CanvasProps {
  selectedComponent: string | null;
  components: ComponentInstance[];
  onComponentAdd: (component: ComponentInstance) => void;
  onComponentUpdate: (updatedComponent: ComponentInstance) => void;
  onConnectionCreate: (sourceId: string, targetId: string) => void;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ selectedComponent, components, onComponentAdd, onComponentUpdate, onConnectionCreate }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { toast } = useToast();
    const [isDragging, setIsDragging] = useState(false);
    const [draggedComponent, setDraggedComponent] = useState<ComponentInstance | null>(null);
    const [isConnectionMode, setIsConnectionMode] = useState(false);
    const [connectionStart, setConnectionStart] = useState<ComponentInstance | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    
    useImperativeHandle(ref, () => canvasRef.current!);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get canvas context");
        return;
      }

      // Handle high DPI displays
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      const resizeCanvas = () => {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        ctx.scale(dpr, dpr);
        
        drawGrid(ctx, rect.width, rect.height);
        drawComponents(ctx, components);
        
        // Draw connection preview if in connection mode
        if (isConnectionMode && connectionStart) {
          drawConnectionPreview(ctx, connectionStart, mousePos);
        }
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      const handleMouseDown = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * dpr;
        const y = (e.clientY - rect.top) * dpr;
        
        const clickedComponent = findComponentAtPosition(x, y, components);
        
        if (clickedComponent) {
          if (isConnectionMode) {
            if (!connectionStart) {
              setConnectionStart(clickedComponent);
            } else if (connectionStart.id !== clickedComponent.id) {
              onConnectionCreate(connectionStart.id, clickedComponent.id);
              setConnectionStart(null);
            }
          } else {
            setIsDragging(true);
            setDraggedComponent(clickedComponent);
          }
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * dpr;
        const y = (e.clientY - rect.top) * dpr;
        
        setMousePos({ x, y });
        
        if (isDragging && draggedComponent) {
          // Snap to grid
          const snappedX = Math.round(x / 20) * 20;
          const snappedY = Math.round(y / 20) * 20;
          
          const updatedComponent = {
            ...draggedComponent,
            x: snappedX,
            y: snappedY,
          };
          
          onComponentUpdate(updatedComponent);
        }
        
        // Redraw canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(ctx, rect.width, rect.height);
        drawComponents(ctx, components);
        
        if (isConnectionMode && connectionStart) {
          drawConnectionPreview(ctx, connectionStart, { x, y });
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        setDraggedComponent(null);
      };

      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("dragover", (e) => e.preventDefault());

      canvas.addEventListener("drop", (e) => {
        e.preventDefault();
        if (selectedComponent) {
          const newComponent = handleDrop(e, selectedComponent, canvas);
          if (newComponent) {
            onComponentAdd(newComponent);
            toast({
              title: "Component Added",
              description: `Added ${selectedComponent} to the canvas`,
            });
          }
        }
      });

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
      };
    }, [selectedComponent, components, isDragging, draggedComponent, isConnectionMode, connectionStart, mousePos, onComponentAdd, onComponentUpdate, onConnectionCreate, toast]);

    return (
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full bg-white"
          style={{ cursor: selectedComponent ? "crosshair" : isDragging ? "grabbing" : "default" }}
        />
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4"
          onClick={() => {
            setIsConnectionMode(!isConnectionMode);
            setConnectionStart(null);
          }}
        >
          <Link2 className={`h-4 w-4 mr-2 ${isConnectionMode ? "text-primary" : ""}`} />
          {isConnectionMode ? "Cancel Connection" : "Create Connection"}
        </Button>
      </div>
    );
  }
);

Canvas.displayName = "Canvas";
export default Canvas;
