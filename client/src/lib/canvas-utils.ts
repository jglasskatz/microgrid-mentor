import { ComponentInstance } from "./components";

const GRID_SIZE = 20;
const ARROW_HEAD_SIZE = 10;

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

export function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number }
) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(
    to.x - ARROW_HEAD_SIZE * Math.cos(angle - Math.PI / 6),
    to.y - ARROW_HEAD_SIZE * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    to.x - ARROW_HEAD_SIZE * Math.cos(angle + Math.PI / 6),
    to.y - ARROW_HEAD_SIZE * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

export function drawConnection(
  ctx: CanvasRenderingContext2D,
  from: ComponentInstance,
  to: ComponentInstance | { x: number; y: number }
) {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  
  if ('id' in to) {
    drawArrowhead(ctx, from, to);
  }
}

export function drawConnectionPreview(
  ctx: CanvasRenderingContext2D,
  from: ComponentInstance,
  to: { x: number; y: number }
) {
  ctx.save();
  ctx.strokeStyle = "#666";
  ctx.setLineDash([5, 5]);
  drawConnection(ctx, from, to);
  ctx.restore();
}

export function drawComponents(
  ctx: CanvasRenderingContext2D, 
  components: ComponentInstance[]
) {
  ctx.save();
  
  // Draw connections first
  components.forEach((component) => {
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 2;
    
    component.connections.forEach((targetId) => {
      const target = components.find((c) => c.id === targetId);
      if (target) {
        drawConnection(ctx, component, target);
      }
    });
  });
  
  // Then draw components
  components.forEach((component) => {
    const color = getComponentColor(component.type);
    
    ctx.fillStyle = `${color}33`;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    switch (component.type) {
      case "solar":
      case "wind":
        ctx.beginPath();
        ctx.rect(component.x - 40, component.y - 20, 80, 40);
        ctx.fill();
        ctx.stroke();
        break;
      case "battery":
        ctx.beginPath();
        ctx.rect(component.x - 30, component.y - 40, 60, 80);
        ctx.fill();
        ctx.stroke();
        break;
      case "load":
        ctx.beginPath();
        ctx.rect(component.x - 30, component.y - 30, 60, 60);
        ctx.fill();
        ctx.stroke();
        break;
    }

    ctx.fillStyle = "#000";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(component.type, component.x, component.y);
  });
  
  ctx.restore();
}

export function findComponentAtPosition(
  x: number,
  y: number,
  components: ComponentInstance[]
): ComponentInstance | null {
  return components.find((component) => {
    const bounds = getComponentBounds(component);
    return (
      x >= bounds.x1 &&
      x <= bounds.x2 &&
      y >= bounds.y1 &&
      y <= bounds.y2
    );
  }) || null;
}

function getComponentBounds(component: ComponentInstance) {
  switch (component.type) {
    case "solar":
    case "wind":
      return {
        x1: component.x - 40,
        y1: component.y - 20,
        x2: component.x + 40,
        y2: component.y + 20,
      };
    case "battery":
      return {
        x1: component.x - 30,
        y1: component.y - 40,
        x2: component.x + 30,
        y2: component.y + 40,
      };
    case "load":
      return {
        x1: component.x - 30,
        y1: component.y - 30,
        x2: component.x + 30,
        y2: component.y + 30,
      };
  }
}

export function handleDrop(
  e: DragEvent,
  componentType: string,
  canvas: HTMLCanvasElement
): ComponentInstance | null {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left);
  const y = (e.clientY - rect.top);

  const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
  const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;

  return {
    id: Date.now().toString(),
    type: componentType,
    x: snappedX,
    y: snappedY,
    connections: [],
    specs: {},
  };
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
