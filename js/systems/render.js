import { Car, CarAI, Incident, Lane, Node, RoadSegment, TrafficLight } from '../components.js';
import { CarAIState, CarType, COLORS, PARAMS } from '../constants.js';
import { lanePosition, laneNormal, roadColor } from '../geometry.js';

export function render(world, ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawRoads(world, ctx);
  drawIncidents(world, ctx);
  drawCars(world, ctx);
  drawSignals(world, ctx);
}

function drawRoads(world, ctx) {
  for (let e = 1; e < world.nextEntityId; e++) {
    if (!RoadSegment.has[e]) continue;
    const color = roadColor(e);
    for (let lane = 1; lane < Lane.has.length; lane++) {
      if (!Lane.has[lane] || Lane.segment[lane] !== e) continue;
      const start = lanePosition(lane, 0);
      const end = lanePosition(lane, RoadSegment.length[e]);
      ctx.strokeStyle = color;
      ctx.lineWidth = Lane.width[lane] * 0.35;
      ctx.beginPath();
      ctx.moveTo(start[0], start[1]);
      ctx.lineTo(end[0], end[1]);
      ctx.stroke();
    }
  }
}

function drawCars(world, ctx) {
  const time = performance.now() * 0.001;
  for (let e = 1; e < world.nextEntityId; e++) {
    if (!Car.has[e]) continue;
    const lane = Car.lane[e];
    const position = lanePosition(lane, Car.offset[e]);
    const normal = laneNormal(Lane.segment[lane]);
    const length = 6;
    const px = position[0];
    const py = position[1];
    const nx = normal[0] * length;
    const ny = normal[1] * length;
    let color = COLORS.cars[Car.type[e]] || '#fff';
    if (CarAI.state[e] === CarAIState.SLOWING) {
      color = lighten(color, 0.2);
    } else if (CarAI.state[e] === CarAIState.INCIDENT) {
      color = COLORS.blocked;
    }
    if (Car.type[e] === CarType.POLICE && Math.floor(time * 4) % 2 === 0) {
      color = '#fff';
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px - nx * 0.5, py - ny * 0.5);
    ctx.lineTo(px + nx * 0.5, py + ny * 0.5);
    ctx.stroke();
  }
}

function drawIncidents(world, ctx) {
  for (let e = 1; e < world.nextEntityId; e++) {
    if (!Incident.has[e] || !Incident.active[e]) continue;
    const lane = Incident.lane[e];
    const position = lanePosition(lane, Incident.offset[e]);
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
    ctx.fillStyle = TrafficLight.state[e] ? COLORS.signalGreen : COLORS.signalRed;
    ctx.fillRect(x - 6, y - 6, 12, 12);
  }
}

function lighten(color, amount) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.floor(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.floor(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.floor(255 * amount));
  return `rgb(${r}, ${g}, ${b})`;
}
