import { MAX_ENTITIES } from './constants.js';

export const Node = {
  has: new Uint8Array(MAX_ENTITIES),
  x: new Float32Array(MAX_ENTITIES),
  y: new Float32Array(MAX_ENTITIES),
  type: new Uint8Array(MAX_ENTITIES),
};

export const RoadSegment = {
  has: new Uint8Array(MAX_ENTITIES),
  startNode: new Uint16Array(MAX_ENTITIES),
  endNode: new Uint16Array(MAX_ENTITIES),
  length: new Float32Array(MAX_ENTITIES),
  speedLimit: new Float32Array(MAX_ENTITIES),
  type: new Uint8Array(MAX_ENTITIES),
};

export const Lane = {
  has: new Uint8Array(MAX_ENTITIES),
  segment: new Uint16Array(MAX_ENTITIES),
  index: new Uint8Array(MAX_ENTITIES),
  width: new Float32Array(MAX_ENTITIES),
  direction: new Int8Array(MAX_ENTITIES),
};

export const Car = {
  has: new Uint8Array(MAX_ENTITIES),
  lane: new Uint16Array(MAX_ENTITIES),
  offset: new Float32Array(MAX_ENTITIES),
  speed: new Float32Array(MAX_ENTITIES),
  maxAccel: new Float32Array(MAX_ENTITIES),
  maxBrake: new Float32Array(MAX_ENTITIES),
  length: new Float32Array(MAX_ENTITIES),
  type: new Uint8Array(MAX_ENTITIES),
};

export const CarAI = {
  has: new Uint8Array(MAX_ENTITIES),
  desiredSpeed: new Float32Array(MAX_ENTITIES),
  state: new Uint8Array(MAX_ENTITIES),
};

export const TrafficLight = {
  has: new Uint8Array(MAX_ENTITIES),
  node: new Uint16Array(MAX_ENTITIES),
  cycleTime: new Float32Array(MAX_ENTITIES),
  greenTime: new Float32Array(MAX_ENTITIES),
  phaseOffset: new Float32Array(MAX_ENTITIES),
  timer: new Float32Array(MAX_ENTITIES),
  state: new Uint8Array(MAX_ENTITIES),
};

export const Incident = {
  has: new Uint8Array(MAX_ENTITIES),
  lane: new Uint16Array(MAX_ENTITIES),
  offset: new Float32Array(MAX_ENTITIES),
  severity: new Float32Array(MAX_ENTITIES),
  kind: new Uint8Array(MAX_ENTITIES),
  remainingTime: new Float32Array(MAX_ENTITIES),
  active: new Uint8Array(MAX_ENTITIES),
};

export const Components = [
  Node,
  RoadSegment,
  Lane,
  Car,
  CarAI,
  TrafficLight,
  Incident,
];
