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

// Calculate point on quadratic curve at parameter t (0-1)
export function getCurvePoint(sx, sy, cx, cy, ex, ey, t) {
  const mt = 1 - t;
  const x = mt * mt * sx + 2 * mt * t * cx + t * t * ex;
  const y = mt * mt * sy + 2 * mt * t * cy + t * t * ey;
  return [x, y];
}

// Calculate tangent vector on quadratic curve at parameter t
export function getCurveTangent(sx, sy, cx, cy, ex, ey, t) {
  const mt = 1 - t;
  const dx = 2 * mt * (cx - sx) + 2 * t * (ex - cx);
  const dy = 2 * mt * (cy - sy) + 2 * t * (ey - cy);
  const len = Math.hypot(dx, dy) || 1;
  return [dx / len, dy / len];
}

// Calculate normal vector on quadratic curve at parameter t
export function getCurveNormal(sx, sy, cx, cy, ex, ey, t) {
  const [tx, ty] = getCurveTangent(sx, sy, cx, cy, ex, ey, t);
  return [-ty, tx];
}

// Calculate approximate arc length of quadratic curve
export function getCurveLength(sx, sy, cx, cy, ex, ey) {
  // Approximate using chord length + control point deviation
  const chord = Math.hypot(ex - sx, ey - sy);
  const midPoint = getCurvePoint(sx, sy, cx, cy, ex, ey, 0.5);
  const midChord = Math.hypot(midPoint[0] - (sx + ex) / 2, midPoint[1] - (sy + ey) / 2);
  return chord + midChord * 0.5;
}

export function lanePosition(laneId, offset, world = null) {
  const segmentId = Lane.segment[laneId];
  const startNode = RoadSegment.startNode[segmentId];
  const endNode = RoadSegment.endNode[segmentId];
  const dir = Lane.direction[laneId] === LaneDirection.FORWARD ? 1 : -1;
  const sx = Node.x[startNode];
  const sy = Node.y[startNode];
  const ex = Node.x[endNode];
  const ey = Node.y[endNode];
  
  // Check if this segment has a curve
  let hasCurve = false;
  let cx = 0, cy = 0;
  if (world && world.curveControlPoints && world.curveControlPoints.has(segmentId)) {
    [cx, cy] = world.curveControlPoints.get(segmentId);
    hasCurve = true;
  }
  
  const length = RoadSegment.length[segmentId] || 1;
  const t = offset / length;
  
  let nx, ny, normal;
  
  if (hasCurve) {
    // Use curve calculations
    const [px, py] = getCurvePoint(sx, sy, cx, cy, ex, ey, dir === 1 ? t : 1 - t);
    nx = px;
    ny = py;
    normal = getCurveNormal(sx, sy, cx, cy, ex, ey, dir === 1 ? t : 1 - t);
  } else {
    // Straight line (original behavior)
    const dx = (ex - sx) * dir;
    const dy = (ey - sy) * dir;
    nx = dx * t + (dir === 1 ? sx : ex);
    ny = dy * t + (dir === 1 ? sy : ey);
    normal = laneNormal(segmentId);
  }

  const side = Lane.direction[laneId] === LaneDirection.FORWARD ? 1 : -1;
  // Calculate lane offset - center each lane within the road
  const laneOffset = (Lane.index[laneId] - 0.5) * Lane.width[laneId] * side;
  return [nx + normal[0] * laneOffset, ny + normal[1] * laneOffset];
}

export function roadColor(segmentId) {
  const type = RoadSegment.type[segmentId];
  if (type === RoadType.HIGHWAY) return 'rgba(110,213,255,0.6)';
  if (type === RoadType.RAMP) return 'rgba(158,240,182,0.7)';
  return 'rgba(66,244,215,0.7)';
}
