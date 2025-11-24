export const MAX_ENTITIES = 4096;

export const CarType = {
  CAR: 0,
  TRUCK: 1,
  SEMI: 2,
  POLICE: 3,
  SERVICE: 4,
};

export const CarAIState = {
  DRIVING: 0,
  SLOWING: 1,
  STOPPED: 2,
  INCIDENT: 3,
};

export const NodeType = {
  JUNCTION: 0,
  SIGNAL: 1,
  STOP_SIGN: 2,
  MERGE: 3,
};

export const RoadType = {
  CITY: 0,
  HIGHWAY: 1,
  RAMP: 2,
};

export const LaneDirection = {
  FORWARD: 1,
  REVERSE: -1,
};

export const IncidentKind = {
  POLICE_STOP: 0,
  CRASH: 1,
  BREAKDOWN: 2,
};

export const COLORS = {
  background: '#000',
  city: '#42f4d7',
  highway: '#6ed5ff',
  ramp: '#9ef0b6',
  cars: {
    [CarType.CAR]: '#b3e1ff',
    [CarType.TRUCK]: '#ffd479',
    [CarType.SEMI]: '#ffb347',
    [CarType.POLICE]: '#7fb5ff',
    [CarType.SERVICE]: '#9f8fff',
  },
  crash: '#ff5c5c',
  blocked: '#a64aff',
  signalRed: '#ff5c5c',
  signalGreen: '#7dff7d',
};

export const PARAMS = {
  carCount: 150,
  speedFactor: 1,
  incidentRate: 0.2,
  debug: false,
};
