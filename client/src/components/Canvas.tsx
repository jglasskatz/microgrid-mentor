import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { drawGrid, drawComponents, handleDrop } from "@/lib/canvas-utils";
import { useToast } from "@/hooks/use-toast";
import { ComponentInstance } from "@/lib/components";

interface CanvasProps {
  selectedComponent: string | null;
  components: ComponentInstance[];
  onComponentAdd: (component: ComponentInstance) => void;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ selectedComponent, components, onComponentAdd }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { toast } = useToast();
    
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
        
        // Scale context for high DPI
        ctx.scale(dpr, dpr);
        
        console.log("Canvas resized:", {
          width: canvas.width,
          height: canvas.height,
          dpr,
          components: components.length
        });
        
        drawGrid(ctx, rect.width, rect.height);
        drawComponents(ctx, components);
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      canvas.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      canvas.addEventListener("drop", (e) => {
        e.preventDefault();
        if (selectedComponent) {
          const newComponent = handleDrop(e, selectedComponent, canvas);
          if (newComponent) {
            console.log("Component dropped:", {
              type: newComponent.type,
              x: newComponent.x,
              y: newComponent.y
            });
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
      };
    }, [selectedComponent, components, onComponentAdd, toast]);

    // Re-render when components change
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      ctx.clearRect(0, 0, rect.width, rect.height);
      drawGrid(ctx, rect.width, rect.height);
      drawComponents(ctx, components);
      
      console.log("Components updated:", {
        count: components.length,
        components: components.map(c => ({
          type: c.type,
          position: { x: c.x, y: c.y }
        }))
      });
    }, [components]);

    return (
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-white"
        style={{ cursor: selectedComponent ? "crosshair" : "default" }}
      />
    );
  }
);

Canvas.displayName = "Canvas";
export default Canvas;
