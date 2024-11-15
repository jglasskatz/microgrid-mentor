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
      if (!ctx) return;

      const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        drawGrid(ctx, canvas.width, canvas.height);
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

      drawGrid(ctx, canvas.width, canvas.height);
      drawComponents(ctx, components);
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
