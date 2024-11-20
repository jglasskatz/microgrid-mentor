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

export function drawComponentPreview(
  ctx: CanvasRenderingContext2D,
  componentType: string,
  position: { x: number; y: number }
) {
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = getComponentColor(componentType);
  ctx.fillStyle = `${getComponentColor(componentType)}33`;
  ctx.lineWidth = 2;

  const snappedX = Math.round(position.x / GRID_SIZE) * GRID_SIZE;
  const snappedY = Math.round(position.y / GRID_SIZE) * GRID_SIZE;

  switch (componentType) {
    case "solar":
    case "wind":
      ctx.beginPath();
      ctx.rect(snappedX - 40, snappedY - 20, 80, 40);
      break;
    case "battery":
      ctx.beginPath();
      ctx.rect(snappedX - 30, snappedY - 40, 60, 80);
      break;
    case "load":
      ctx.beginPath();
      ctx.rect(snappedX - 30, snappedY - 30, 60, 60);
      break;
  }
  
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawComponents(
  ctx: CanvasRenderingContext2D, 
  components: ComponentInstance[],
  selectedComponent: ComponentInstance | null
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
    const isSelected = selectedComponent?.id === component.id;
    const color = getComponentColor(component.type);
    
    if (isSelected) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
    }
    
    ctx.fillStyle = `${color}33`;
    ctx.strokeStyle = color;
    ctx.lineWidth = isSelected ? 3 : 2;
    
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

    ctx.shadowBlur = 0;
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
  // Check in reverse order to select top-most component first
  for (let i = components.length - 1; i >= 0; i--) {
    const component = components[i];
    const bounds = getComponentBounds(component);
    if (
      x >= bounds.x1 &&
      x <= bounds.x2 &&
      y >= bounds.y1 &&
      y <= bounds.y2
    ) {
      return component;
    }
  }
  return null;
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

export function createComponent(
  componentType: string,
  x: number,
  y: number
): ComponentInstance {
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
