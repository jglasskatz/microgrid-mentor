import { ComponentInstance } from "./components";

const GRID_SIZE = 20;
let components: ComponentInstance[] = [];

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 0.5;

  for (let x = 0; x <= width; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

export function drawComponents(ctx: CanvasRenderingContext2D) {
  ctx.save();
  components.forEach((component) => {
    const color = getComponentColor(component.type);
    
    // Draw component
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(component.x, component.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw connections
    ctx.strokeStyle = "#666";
    component.connections.forEach((targetId) => {
      const target = components.find((c) => c.id === targetId);
      if (target) {
        ctx.beginPath();
        ctx.moveTo(component.x, component.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    });
  });
  ctx.restore();
}

export function handleDrop(
  e: DragEvent,
  componentType: string,
  canvas: HTMLCanvasElement
): boolean {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  // Snap to grid
  const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
  const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;

  // Check if position is already occupied
  const isOccupied = components.some(
    (c) => Math.abs(c.x - snappedX) < GRID_SIZE && Math.abs(c.y - snappedY) < GRID_SIZE
  );
  
  if (isOccupied) {
    return false;
  }

  const newComponent: ComponentInstance = {
    id: Date.now().toString(),
    type: componentType,
    x: snappedX,
    y: snappedY,
    connections: [],
    specs: {},
  };

  components = [...components, newComponent];
  
  const ctx = canvas.getContext("2d");
  if (ctx) {
    drawGrid(ctx, canvas.width, canvas.height);
    drawComponents(ctx);
  }

  return true;
}

function getComponentColor(type: string): string {
  switch (type) {
    case "solar":
    case "wind":
      return "#22c55e";
    case "battery":
      return "#3b82f6";
    case "load":
      return "#ef4444";
    default:
      return "#666666";
  }
}
