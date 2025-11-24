import { Car, CarAI, Incident, Lane, Node, RoadSegment, TrafficLight } from '../components.js';
import { CarAIState, CarType, COLORS, PARAMS, NodeType, RoadType } from '../constants.js';
import { lanePosition, laneNormal, getCurvePoint } from '../geometry.js';

export function render(world, ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawRoads(world, ctx);
  drawNodes(world, ctx);
  drawIncidents(world, ctx);
  drawCars(world, ctx);
  drawSignals(world, ctx);
  drawStopSigns(world, ctx);
}

function drawRoads(world, ctx) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw roads grouped by type for better batching
  const roadsByType = new Map();
  for (let e = 1; e < world.nextEntityId; e++) {
    if (!RoadSegment.has[e]) continue;
    const type = RoadSegment.type[e];
    if (!roadsByType.has(type)) {
      roadsByType.set(type, []);
    }
    roadsByType.get(type).push(e);
  }
  
  // Draw each road type with appropriate styling
  roadsByType.forEach((segments, type) => {
    const { color, width } = getRoadStyle(type);
    
    segments.forEach(segmentId => {
      drawRoadSurface(world, ctx, segmentId, color, width);
    });
  });
  
  // Draw intersection smoothing caps to prevent sharp points
  drawIntersectionCaps(world, ctx);
}

function drawRoadSurface(world, ctx, segmentId, color, baseWidth) {
  // Count lanes for this segment to determine road width
  let laneCount = 0;
  let maxLaneWidth = 0;
  for (let lane = 1; lane < Lane.has.length; lane++) {
    if (!Lane.has[lane] || Lane.segment[lane] !== segmentId) continue;
    laneCount++;
    maxLaneWidth = Math.max(maxLaneWidth, Lane.width[lane]);
  }
  
  // Calculate total road width (lanes + spacing)
  const roadWidth = Math.max(baseWidth, laneCount * maxLaneWidth * 0.8);
  
  const startNode = RoadSegment.startNode[segmentId];
  const endNode = RoadSegment.endNode[segmentId];
  const sx = Node.x[startNode];
  const sy = Node.y[startNode];
  const ex = Node.x[endNode];
  const ey = Node.y[endNode];
  
  // Check if this segment has a curve
  const hasCurve = world.curveControlPoints && world.curveControlPoints.has(segmentId);
  
  // Calculate stop distance from nodes to prevent concave intersections
  const stopDistance = roadWidth * 0.6;
  const dx = ex - sx;
  const dy = ey - sy;
  const length = Math.hypot(dx, dy);
  const unitX = dx / length;
  const unitY = dy / length;
  
  // Adjust start and end points to stop before nodes
  const adjustedSx = sx + unitX * stopDistance;
  const adjustedSy = sy + unitY * stopDistance;
  const adjustedEx = ex - unitX * stopDistance;
  const adjustedEy = ey - unitY * stopDistance;
  
  // Draw road surface as a thick stroke with rounded ends
  ctx.strokeStyle = color;
  ctx.lineWidth = roadWidth;
  ctx.globalAlpha = 0.8;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  if (hasCurve) {
    const [cx, cy] = world.curveControlPoints.get(segmentId);
    ctx.moveTo(adjustedSx, adjustedSy);
    ctx.quadraticCurveTo(cx, cy, adjustedEx, adjustedEy);
  } else {
    ctx.moveTo(adjustedSx, adjustedSy);
    ctx.lineTo(adjustedEx, adjustedEy);
  }
  ctx.stroke();
  
  ctx.globalAlpha = 1.0;
}

function drawIntersectionCaps(world, ctx) {
  if (!world.nodes) return;
  
  // For each node, draw a rounded cap to smooth intersections
  for (let nodeId of world.nodes) {
    if (!Node.has[nodeId]) continue;
    
    const x = Node.x[nodeId];
    const y = Node.y[nodeId];
    
    // Find all road segments connected to this node
    const connectedSegments = [];
    for (let e = 1; e < world.nextEntityId; e++) {
      if (!RoadSegment.has[e]) continue;
      if (RoadSegment.startNode[e] === nodeId || RoadSegment.endNode[e] === nodeId) {
        connectedSegments.push(e);
      }
    }
    
    if (connectedSegments.length === 0) continue;
    
    // Calculate max road width at this intersection
    let maxWidth = 0;
    connectedSegments.forEach(segmentId => {
      let laneCount = 0;
      let maxLaneWidth = 0;
      for (let lane = 1; lane < Lane.has.length; lane++) {
        if (!Lane.has[lane] || Lane.segment[lane] !== segmentId) continue;
        laneCount++;
        maxLaneWidth = Math.max(maxLaneWidth, Lane.width[lane]);
      }
      const roadWidth = Math.max(3, laneCount * maxLaneWidth * 0.8);
      maxWidth = Math.max(maxWidth, roadWidth);
    });
    
    // Draw a rounded intersection cap that blends roads smoothly
    const capRadius = maxWidth * 0.7;
    ctx.fillStyle = '#42f4d7';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, capRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

function getRoadStyle(roadType) {
  switch (roadType) {
    case RoadType.HIGHWAY:
      return { color: '#6ed5ff', width: 5 };
    case RoadType.RAMP:
      return { color: '#9ef0b6', width: 2 };
    case RoadType.CITY:
    default:
      return { color: '#42f4d7', width: 3 };
  }
}


function drawNodes(world, ctx) {
  if (!world.nodes) return;
  
  for (let nodeId of world.nodes) {
    if (!Node.has[nodeId]) continue;
    const x = Node.x[nodeId];
    const y = Node.y[nodeId];
    const type = Node.type[nodeId];
    
    ctx.fillStyle = '#4a5568';
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 2;
    
    let radius = 6;
    if (type === NodeType.SIGNAL) {
      radius = 8;
      ctx.fillStyle = '#5a6578';
    } else if (type === NodeType.STOP_SIGN) {
      radius = 7;
      ctx.fillStyle = '#6a7588';
    }
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawCars(world, ctx) {
  const time = performance.now() * 0.001;
  
  // Batch cars by color for better performance
  const carsByColor = new Map();
  
  for (let e = 1; e < world.nextEntityId; e++) {
    if (!Car.has[e]) continue;
    const lane = Car.lane[e];
    const position = lanePosition(lane, Car.offset[e], world);
    
    // Skip if position is invalid
    if (!position || !isFinite(position[0]) || !isFinite(position[1])) continue;
    
    let color = COLORS.cars[Car.type[e]] || '#b3e1ff';
    if (CarAI.state[e] === CarAIState.SLOWING) {
      color = lighten(color, 0.2);
    } else if (CarAI.state[e] === CarAIState.INCIDENT) {
      color = COLORS.blocked;
    }
    if (Car.type[e] === CarType.POLICE && Math.floor(time * 4) % 2 === 0) {
      color = '#fff';
    }
    
    if (!carsByColor.has(color)) {
      carsByColor.set(color, []);
    }
    carsByColor.get(color).push(position);
  }
  
  // Draw all cars of the same color together
  carsByColor.forEach((positions, color) => {
    ctx.fillStyle = color;
    positions.forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  });
}

function drawIncidents(world, ctx) {
  for (let e = 1; e < world.nextEntityId; e++) {
    if (!Incident.has[e] || !Incident.active[e]) continue;
    const lane = Incident.lane[e];
    const position = lanePosition(lane, Incident.offset[e], world);
    ctx.strokeStyle = COLORS.crash;
    ctx.lineWidth = 4 * Incident.severity[e];
    ctx.beginPath();
    ctx.arc(position[0], position[1], 6 + Incident.severity[e] * 6, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawSignals(world, ctx) {
  for (let e = 1; e < world.nextEntityId; e++) {
    if (!TrafficLight.has[e]) continue;
    const node = TrafficLight.node[e];
    const x = world && world.nodes ? Node.x[node] : 0;
    const y = world && world.nodes ? Node.y[node] : 0;
    
    // Determine light state (green, yellow, red)
    const cycleTime = TrafficLight.cycleTime[e];
    const greenTime = TrafficLight.greenTime[e];
    const timer = TrafficLight.timer[e] % cycleTime;
    
    let lightColor;
    if (timer < greenTime) {
      lightColor = '#44ff44'; // Green
    } else if (timer < greenTime + 1) {
      lightColor = '#ffaa00'; // Yellow/Amber
    } else {
      lightColor = '#ff4444'; // Red
    }
    
    // Draw glow effect
    ctx.shadowBlur = 8;
    ctx.shadowColor = lightColor;
    
    // Draw large circular light
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw outer ring for visibility
    ctx.strokeStyle = lightColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;
  }
}

function drawStopSigns(world, ctx) {
  if (!world.nodes) return;
  
  for (let nodeId of world.nodes) {
    if (!Node.has[nodeId] || Node.type[nodeId] !== NodeType.STOP_SIGN) continue;
    const x = Node.x[nodeId];
    const y = Node.y[nodeId];
    
    // Draw octagonal stop sign
    ctx.fillStyle = '#ff0000';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    const size = 10;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i - Math.PI / 2;
      const px = x + size * Math.cos(angle);
      const py = y + size * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw "STOP" text (simplified as a white dot/line)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 3, y - 1, 6, 2);
  }
}

function lighten(color, amount) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.floor(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.floor(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.floor(255 * amount));
  return `rgb(${r}, ${g}, ${b})`;
}
