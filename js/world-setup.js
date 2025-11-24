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

export function setupWorld(world) {
  world.routes = new Map();
  const nodes = createNodes(world);
  const segments = createSegments(world, nodes);
  const lanes = createLanes(world, segments);
  world.lanes = lanes;
  world.segments = segments;
  world.nodes = nodes;
  createSignals(world, nodes);
  spawnCars(world, lanes, PARAMS.carCount);
}

export function addRandomCars(world, count) {
  if (!world.lanes) return;
  spawnCars(world, world.lanes, count);
}

function createNodes(world) {
  const coords = [
    [100, 100, NodeType.JUNCTION],
    [900, 100, NodeType.JUNCTION],
    [900, 900, NodeType.JUNCTION],
    [100, 900, NodeType.JUNCTION],
    [500, 100, NodeType.JUNCTION],
    [900, 500, NodeType.JUNCTION],
    [500, 900, NodeType.JUNCTION],
    [100, 500, NodeType.JUNCTION],
    [500, 500, NodeType.SIGNAL],
  ];
  return coords.map(([x, y, type]) => {
    const id = createEntity(world);
    Node.has[id] = 1;
    Node.x[id] = x;
    Node.y[id] = y;
    Node.type[id] = type;
    return id;
  });
}

function createSegments(world, nodes) {
  const pairs = [
    [nodes[0], nodes[1], RoadType.HIGHWAY, 34],
    [nodes[1], nodes[2], RoadType.HIGHWAY, 34],
    [nodes[2], nodes[3], RoadType.HIGHWAY, 34],
    [nodes[3], nodes[0], RoadType.HIGHWAY, 34],
    [nodes[4], nodes[5], RoadType.CITY, 22],
    [nodes[5], nodes[6], RoadType.CITY, 22],
    [nodes[6], nodes[7], RoadType.CITY, 22],
    [nodes[7], nodes[4], RoadType.CITY, 22],
    [nodes[4], nodes[8], RoadType.CITY, 20],
    [nodes[8], nodes[6], RoadType.CITY, 20],
    [nodes[7], nodes[8], RoadType.CITY, 20],
    [nodes[8], nodes[5], RoadType.CITY, 20],
  ];

  return pairs.map(([start, end, type, speed]) => {
    const id = createEntity(world);
    RoadSegment.has[id] = 1;
    RoadSegment.startNode[id] = start;
    RoadSegment.endNode[id] = end;
    RoadSegment.type[id] = type;
    RoadSegment.speedLimit[id] = speed;
    RoadSegment.length[id] = segmentLengthFromNodes(start, end);
    return id;
  });
}

function createLanes(world, segments) {
  const lanes = [];
  segments.forEach((segmentId) => {
    for (let i = 0; i < 2; i++) {
      lanes.push(makeLane(world, segmentId, i, LaneDirection.FORWARD));
      lanes.push(makeLane(world, segmentId, i, LaneDirection.REVERSE));
    }
  });
  return lanes;
}

function makeLane(world, segmentId, index, direction) {
  const laneId = createEntity(world);
  Lane.has[laneId] = 1;
  Lane.segment[laneId] = segmentId;
  Lane.index[laneId] = index + 1;
  Lane.width[laneId] = 10;
  Lane.direction[laneId] = direction;
  registerRoute(world, laneId);
  return laneId;
}

function createSignals(world, nodes) {
  const signalNode = nodes[8];
  const id = createEntity(world);
  TrafficLight.has[id] = 1;
  TrafficLight.node[id] = signalNode;
  TrafficLight.cycleTime[id] = 12;
  TrafficLight.greenTime[id] = 7;
  TrafficLight.phaseOffset[id] = 0;
  TrafficLight.timer[id] = 0;
  TrafficLight.state[id] = 1;
  return id;
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
