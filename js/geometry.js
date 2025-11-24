import { LaneDirection, RoadType } from './constants.js';
import { Node, RoadSegment, Lane } from './components.js';

export function segmentLength(segmentId) {
  const sx = Node.x[RoadSegment.startNode[segmentId]];
  const sy = Node.y[RoadSegment.startNode[segmentId]];
  const ex = Node.x[RoadSegment.endNode[segmentId]];
  const ey = Node.y[RoadSegment.endNode[segmentId]];
  const dx = ex - sx;
  const dy = ey - sy;
  return Math.hypot(dx, dy);
}

export function laneDirectionVector(segmentId, laneId) {
  const start = RoadSegment.startNode[segmentId];
  const end = RoadSegment.endNode[segmentId];
  const dir = Lane.direction[laneId] === LaneDirection.FORWARD ? 1 : -1;
  const sx = Node.x[start];
  const sy = Node.y[start];
  const ex = Node.x[end];
  const ey = Node.y[end];
  const dx = (ex - sx) * dir;
  const dy = (ey - sy) * dir;
  const len = Math.hypot(dx, dy) || 1;
  return [dx / len, dy / len];
}

export function laneNormal(segmentId) {
  const sx = Node.x[RoadSegment.startNode[segmentId]];
  const sy = Node.y[RoadSegment.startNode[segmentId]];
  const ex = Node.x[RoadSegment.endNode[segmentId]];
  const ey = Node.y[RoadSegment.endNode[segmentId]];
  const dx = ex - sx;
  const dy = ey - sy;
  const len = Math.hypot(dx, dy) || 1;
  return [-dy / len, dx / len];
}

export function lanePosition(laneId, offset) {
  const segmentId = Lane.segment[laneId];
  const startNode = RoadSegment.startNode[segmentId];
  const endNode = RoadSegment.endNode[segmentId];
  const dir = Lane.direction[laneId] === LaneDirection.FORWARD ? 1 : -1;
  const sx = Node.x[startNode];
  const sy = Node.y[startNode];
  const ex = Node.x[endNode];
  const ey = Node.y[endNode];
  const dx = (ex - sx) * dir;
  const dy = (ey - sy) * dir;
  const length = RoadSegment.length[segmentId] || 1;
  const t = offset / length;
  const nx = dx * t + (dir === 1 ? sx : ex);
  const ny = dy * t + (dir === 1 ? sy : ey);

  const normal = laneNormal(segmentId);
  const centerOffset = (Lane.index[laneId] - 0.5) * Lane.width[laneId] * 1.2;
  return [nx + normal[0] * centerOffset, ny + normal[1] * centerOffset];
}

export function roadColor(segmentId) {
  const type = RoadSegment.type[segmentId];
  if (type === RoadType.HIGHWAY) return 'rgba(110,213,255,0.6)';
  if (type === RoadType.RAMP) return 'rgba(158,240,182,0.7)';
  return 'rgba(66,244,215,0.7)';
}
