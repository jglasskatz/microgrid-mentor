import { ComponentInstance } from "./components";

const GRID_SIZE = 20;

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

export function drawComponents(
  ctx: CanvasRenderingContext2D, 
  components: ComponentInstance[]
) {
  ctx.save();
  components.forEach((component) => {
    const color = getComponentColor(component.type);
    
    // Draw component
    ctx.fillStyle = `${color}33`; // Add transparency to fill
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Draw different shapes based on component type
    switch (component.type) {
      case "solar":
      case "wind":
        // Draw rectangle 80x40
        ctx.beginPath();
        ctx.rect(component.x - 40, component.y - 20, 80, 40);
        ctx.fill();
        ctx.stroke();
        break;
      case "battery":
        // Draw rectangle 60x80
        ctx.beginPath();
        ctx.rect(component.x - 30, component.y - 40, 60, 80);
        ctx.fill();
        ctx.stroke();
        break;
      case "load":
        // Draw square 60x60
        ctx.beginPath();
        ctx.rect(component.x - 30, component.y - 30, 60, 60);
        ctx.fill();
        ctx.stroke();
        break;
    }

    // Draw component label
    ctx.fillStyle = "#000";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(component.type, component.x, component.y);

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
): ComponentInstance | null {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  
  // Calculate position considering DPI scaling
  const x = (e.clientX - rect.left) * dpr;
  const y = (e.clientY - rect.top) * dpr;

  // Snap to grid
  const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
  const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;

  // Create new component
  const newComponent: ComponentInstance = {
    id: Date.now().toString(),
    type: componentType,
    x: snappedX,
    y: snappedY,
    connections: [],
    specs: {},
  };

  return newComponent;
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
