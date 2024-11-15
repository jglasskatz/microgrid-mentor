import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { drawGrid, drawComponents, handleDrop } from "@/lib/canvas-utils";
import { useToast } from "@/hooks/use-toast";

interface CanvasProps {
  selectedComponent: string | null;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ selectedComponent }, ref) => {
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
        drawComponents(ctx);
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      canvas.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      canvas.addEventListener("drop", (e) => {
        e.preventDefault();
        if (selectedComponent) {
          const success = handleDrop(e, selectedComponent, canvas);
          if (success) {
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
    }, [selectedComponent, toast]);

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
