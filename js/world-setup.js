import { createEntity } from './ecs.js';
import { Node, RoadSegment, Lane, Car, CarAI, TrafficLight } from './components.js';
import {
  CarAIState,
  CarType,
  LaneDirection,
  NodeType,
  PARAMS,
  RoadType,
} from './constants.js';
import { DEFAULT_ROAD_CONFIG, defaultsForRoadType } from './road-config.js';
import { getCurveLength } from './geometry.js';

export function setupWorld(world, config = DEFAULT_ROAD_CONFIG) {
  world.routes = new Map();
  world.curveControlPoints = new Map();
  const { nodes, nodeLookup } = createNodes(world, config.nodes);
  world.nodeIdsByName = nodeLookup;
  const { segments, segmentConfigs } = createSegments(world, config.roads, nodeLookup);
  const lanes = createLanes(world, segmentConfigs);
  world.lanes = lanes;
  world.segments = segments;
  world.nodes = nodes;
  createSignals(world, config.signals, nodeLookup);
  spawnCars(world, lanes, PARAMS.carCount);
}

export function addRandomCars(world, count) {
  if (!world.lanes) return;
  spawnCars(world, world.lanes, count);
}

function createNodes(world, nodeConfig) {
  const ids = [];
  const lookup = new Map();
  Object.entries(nodeConfig || {}).forEach(([name, def]) => {
    const id = createEntity(world);
    Node.has[id] = 1;
    Node.x[id] = def.x;
    Node.y[id] = def.y;
    Node.type[id] = def.type ?? NodeType.JUNCTION;
    ids.push(id);
    lookup.set(name, id);
  });
  return { nodes: ids, nodeLookup: lookup };
}

function createSegments(world, roads, nodeLookup) {
  const segments = [];
  const configs = new Map();
  (roads || []).forEach((road) => {
    if (!nodeLookup.has(road.from) || !nodeLookup.has(road.to)) return;
    const id = createEntity(world);
    const start = nodeLookup.get(road.from);
    const end = nodeLookup.get(road.to);
    const defaults = defaultsForRoadType(road.type);
    const roadType = road.type ?? RoadType.CITY;
    RoadSegment.has[id] = 1;
    RoadSegment.startNode[id] = start;
    RoadSegment.endNode[id] = end;
    RoadSegment.type[id] = roadType;
    RoadSegment.speedLimit[id] = road.speed ?? defaults.speed;
    
    // Handle curve control points
    if (road.curve && road.curve.cx !== undefined && road.curve.cy !== undefined) {
      const sx = Node.x[start];
      const sy = Node.y[start];
      const ex = Node.x[end];
      const ey = Node.y[end];
      const cx = road.curve.cx;
      const cy = road.curve.cy;
      world.curveControlPoints.set(id, [cx, cy]);
      RoadSegment.length[id] = getCurveLength(sx, sy, cx, cy, ex, ey);
    } else {
      RoadSegment.length[id] = segmentLengthFromNodes(start, end);
    }
    
    segments.push(id);
    configs.set(id, {
      lanesForward: road.lanesForward ?? defaults.lanesForward,
      lanesReverse: road.lanesReverse ?? defaults.lanesReverse,
      laneWidth: road.laneWidth ?? defaults.laneWidth,
    });
  });
  return { segments, segmentConfigs: configs };
}

function createLanes(world, segmentConfigs) {
  const lanes = [];
  segmentConfigs.forEach((config, segmentId) => {
    for (let i = 0; i < config.lanesForward; i++) {
      lanes.push(makeLane(world, segmentId, i, LaneDirection.FORWARD, config.laneWidth));
    }
    for (let i = 0; i < config.lanesReverse; i++) {
      lanes.push(makeLane(world, segmentId, i, LaneDirection.REVERSE, config.laneWidth));
    }
  });
  return lanes;
}

function makeLane(world, segmentId, index, direction, width) {
  const laneId = createEntity(world);
  Lane.has[laneId] = 1;
  Lane.segment[laneId] = segmentId;
  Lane.index[laneId] = index + 1;
  Lane.width[laneId] = width;
  Lane.direction[laneId] = direction;
  registerRoute(world, laneId);
  return laneId;
}

function createSignals(world, signalConfig, nodeLookup) {
  (signalConfig || []).forEach((signal) => {
    const node = nodeLookup.get(signal.at);
    if (!node) return;
    Node.type[node] = NodeType.SIGNAL;
    const id = createEntity(world);
    TrafficLight.has[id] = 1;
    TrafficLight.node[id] = node;
    TrafficLight.cycleTime[id] = signal.cycle ?? 12;
    TrafficLight.greenTime[id] = signal.green ?? 7;
    TrafficLight.phaseOffset[id] = signal.offset ?? 0;
    TrafficLight.timer[id] = TrafficLight.cycleTime[id] * (signal.offset ?? 0);
    TrafficLight.state[id] = 1;
  });
}

function spawnCars(world, lanes, count) {
  for (let i = 0; i < count; i++) {
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    createCar(world, lane, Math.random() * 0.9 * segmentFromLaneLength(lane));
  }
}

function createCar(world, laneId, offset) {
  const id = createEntity(world);
  Car.has[id] = 1;
  Car.lane[id] = laneId;
  Car.offset[id] = offset;
  Car.speed[id] = 10 + Math.random() * 10;
  Car.maxAccel[id] = 8 + Math.random() * 4;
  Car.maxBrake[id] = 12 + Math.random() * 6;
  Car.length[id] = 12 + Math.random() * 6;
  Car.type[id] = randomCarType();

  CarAI.has[id] = 1;
  CarAI.desiredSpeed[id] = 24 + Math.random() * 10;
  CarAI.state[id] = CarAIState.DRIVING;
}

function randomCarType() {
  const roll = Math.random();
  if (roll > 0.95) return CarType.POLICE;
  if (roll > 0.85) return CarType.SEMI;
  if (roll > 0.75) return CarType.TRUCK;
  if (roll > 0.7) return CarType.SERVICE;
  return CarType.CAR;
}

function registerRoute(world, laneId) {
  const segmentId = Lane.segment[laneId];
  const origin = Lane.direction[laneId] === LaneDirection.FORWARD
    ? RoadSegment.startNode[segmentId]
    : RoadSegment.endNode[segmentId];
  if (!world.routes.has(origin)) {
    world.routes.set(origin, []);
  }
  world.routes.get(origin).push(laneId);
}

function segmentFromLaneLength(laneId) {
  return RoadSegment.length[Lane.segment[laneId]];
}

function segmentLengthFromNodes(start, end) {
  const dx = Node.x[end] - Node.x[start];
  const dy = Node.y[end] - Node.y[start];
  return Math.hypot(dx, dy);
}
