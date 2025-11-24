import { NodeType, RoadType } from './constants.js';

const laneDefaults = {
  [RoadType.CITY]: { speed: 20, laneWidth: 9, lanesForward: 1, lanesReverse: 1 },
  [RoadType.HIGHWAY]: { speed: 36, laneWidth: 12, lanesForward: 2, lanesReverse: 2 },
  [RoadType.RAMP]: { speed: 22, laneWidth: 8, lanesForward: 1, lanesReverse: 1 },
};

// Helper to add curve control point between two nodes
function curveBetween(x1, y1, x2, y2, curvature = 0.3) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const perpX = -(y2 - y1);
  const perpY = x2 - x1;
  const len = Math.hypot(perpX, perpY);
  const offset = len * curvature;
  return {
    cx: midX + (perpX / len) * offset,
    cy: midY + (perpY / len) * offset,
  };
}

export const DEFAULT_ROAD_CONFIG = {
  name: 'Default (Beltway + Grid)',
  description: 'Outer beltway with inner city grid, includes curves and traffic signals',
  nodes: {
    belt_nw: { x: 140, y: 170 },
    belt_n: { x: 620, y: 130 },
    belt_ne: { x: 1100, y: 170 },
    belt_e: { x: 1140, y: 520 },
    belt_se: { x: 1040, y: 890 },
    belt_s: { x: 620, y: 940 },
    belt_sw: { x: 180, y: 890 },
    belt_w: { x: 120, y: 520 },
    a1: { x: 320, y: 280, type: NodeType.SIGNAL },
    a2: { x: 620, y: 260, type: NodeType.SIGNAL },
    a3: { x: 920, y: 300, type: NodeType.SIGNAL },
    b1: { x: 320, y: 520, type: NodeType.SIGNAL },
    b2: { x: 620, y: 520, type: NodeType.SIGNAL },
    b3: { x: 920, y: 520, type: NodeType.SIGNAL },
    c1: { x: 320, y: 760, type: NodeType.SIGNAL },
    c2: { x: 620, y: 780, type: NodeType.SIGNAL },
    c3: { x: 920, y: 760, type: NodeType.SIGNAL },
  },
  roads: [
    // Outer beltway with curves
    { from: 'belt_nw', to: 'belt_n', type: RoadType.HIGHWAY, curve: curveBetween(140, 170, 620, 130, 0.2) },
    { from: 'belt_n', to: 'belt_ne', type: RoadType.HIGHWAY, curve: curveBetween(620, 130, 1100, 170, 0.2) },
    { from: 'belt_ne', to: 'belt_e', type: RoadType.HIGHWAY, curve: curveBetween(1100, 170, 1140, 520, 0.25) },
    { from: 'belt_e', to: 'belt_se', type: RoadType.HIGHWAY, curve: curveBetween(1140, 520, 1040, 890, 0.25) },
    { from: 'belt_se', to: 'belt_s', type: RoadType.HIGHWAY, curve: curveBetween(1040, 890, 620, 940, 0.2) },
    { from: 'belt_s', to: 'belt_sw', type: RoadType.HIGHWAY, curve: curveBetween(620, 940, 180, 890, 0.2) },
    { from: 'belt_sw', to: 'belt_w', type: RoadType.HIGHWAY, curve: curveBetween(180, 890, 120, 520, 0.25) },
    { from: 'belt_w', to: 'belt_nw', type: RoadType.HIGHWAY, curve: curveBetween(120, 520, 140, 170, 0.25) },

    // Main corridors across the city
    { from: 'belt_w', to: 'belt_e', type: RoadType.HIGHWAY, speed: 34 },
    { from: 'belt_n', to: 'belt_s', type: RoadType.HIGHWAY, speed: 34 },

    // Ramps and feeders from the beltway with curves
    { from: 'belt_w', to: 'b1', type: RoadType.RAMP, curve: curveBetween(120, 520, 320, 520, 0.3) },
    { from: 'belt_e', to: 'b3', type: RoadType.RAMP, curve: curveBetween(1140, 520, 920, 520, 0.3) },
    { from: 'belt_n', to: 'a2', type: RoadType.RAMP, curve: curveBetween(620, 130, 620, 260, 0.3) },
    { from: 'belt_s', to: 'c2', type: RoadType.RAMP, curve: curveBetween(620, 940, 620, 780, 0.3) },
    { from: 'belt_sw', to: 'a1', type: RoadType.RAMP, speed: 20, curve: curveBetween(180, 890, 320, 280, 0.4) },
    { from: 'belt_se', to: 'c3', type: RoadType.RAMP, speed: 20, curve: curveBetween(1040, 890, 920, 760, 0.4) },

    // City grid - horizontals
    { from: 'a1', to: 'a2', type: RoadType.CITY },
    { from: 'a2', to: 'a3', type: RoadType.CITY },
    { from: 'b1', to: 'b2', type: RoadType.CITY, lanesForward: 2, lanesReverse: 2 },
    { from: 'b2', to: 'b3', type: RoadType.CITY, lanesForward: 2, lanesReverse: 2 },
    { from: 'c1', to: 'c2', type: RoadType.CITY },
    { from: 'c2', to: 'c3', type: RoadType.CITY },

    // City grid - verticals
    { from: 'a1', to: 'b1', type: RoadType.CITY },
    { from: 'b1', to: 'c1', type: RoadType.CITY },
    { from: 'a2', to: 'b2', type: RoadType.CITY, lanesForward: 2, lanesReverse: 2 },
    { from: 'b2', to: 'c2', type: RoadType.CITY, lanesForward: 2, lanesReverse: 2 },
    { from: 'a3', to: 'b3', type: RoadType.CITY },
    { from: 'b3', to: 'c3', type: RoadType.CITY },

    // Diagonals and connectors with curves
    { from: 'belt_sw', to: 'b1', type: RoadType.CITY, curve: curveBetween(180, 890, 320, 520, 0.35) },
    { from: 'b1', to: 'a2', type: RoadType.CITY, curve: curveBetween(320, 520, 620, 260, 0.3) },
    { from: 'b2', to: 'a3', type: RoadType.CITY, curve: curveBetween(620, 520, 920, 300, 0.3) },
    { from: 'c1', to: 'b2', type: RoadType.CITY, curve: curveBetween(320, 760, 620, 520, 0.3) },
    { from: 'c2', to: 'b3', type: RoadType.CITY, curve: curveBetween(620, 780, 920, 520, 0.3) },
    { from: 'a2', to: 'belt_ne', type: RoadType.CITY, speed: 24, curve: curveBetween(620, 260, 1100, 170, 0.4) },
    { from: 'b3', to: 'belt_ne', type: RoadType.CITY, speed: 24, curve: curveBetween(920, 520, 1100, 170, 0.4) },
    { from: 'c2', to: 'belt_se', type: RoadType.CITY, speed: 22, curve: curveBetween(620, 780, 1040, 890, 0.4) },
  ],
  signals: [
    { at: 'a1', cycle: 12, green: 7, offset: 0.1 },
    { at: 'a2', cycle: 12, green: 7, offset: 0.3 },
    { at: 'a3', cycle: 12, green: 7, offset: 0.5 },
    { at: 'b1', cycle: 14, green: 8, offset: 0.15 },
    { at: 'b2', cycle: 14, green: 8, offset: 0.35 },
    { at: 'b3', cycle: 14, green: 8, offset: 0.55 },
    { at: 'c1', cycle: 12, green: 7, offset: 0.2 },
    { at: 'c2', cycle: 12, green: 7, offset: 0.4 },
    { at: 'c3', cycle: 12, green: 7, offset: 0.6 },
  ],
};

export function defaultsForRoadType(type) {
  return laneDefaults[type] || laneDefaults[RoadType.CITY];
}

// Simple Grid Preset
export const SIMPLE_GRID_CONFIG = {
  name: 'Simple Grid',
  description: 'Straight city blocks in a grid pattern with some curves',
  nodes: {
    n1: { x: 200, y: 200, type: NodeType.SIGNAL },
    n2: { x: 400, y: 200, type: NodeType.SIGNAL },
    n3: { x: 600, y: 200, type: NodeType.SIGNAL },
    n4: { x: 800, y: 200, type: NodeType.SIGNAL },
    n5: { x: 200, y: 400, type: NodeType.SIGNAL },
    n6: { x: 400, y: 400, type: NodeType.SIGNAL },
    n7: { x: 600, y: 400, type: NodeType.SIGNAL },
    n8: { x: 800, y: 400, type: NodeType.SIGNAL },
    n9: { x: 200, y: 600, type: NodeType.SIGNAL },
    n10: { x: 400, y: 600, type: NodeType.SIGNAL },
    n11: { x: 600, y: 600, type: NodeType.SIGNAL },
    n12: { x: 800, y: 600, type: NodeType.SIGNAL },
  },
  roads: [
    // Horizontal roads
    { from: 'n1', to: 'n2', type: RoadType.CITY },
    { from: 'n2', to: 'n3', type: RoadType.CITY },
    { from: 'n3', to: 'n4', type: RoadType.CITY },
    { from: 'n5', to: 'n6', type: RoadType.CITY, lanesForward: 2, lanesReverse: 2 },
    { from: 'n6', to: 'n7', type: RoadType.CITY, lanesForward: 2, lanesReverse: 2 },
    { from: 'n7', to: 'n8', type: RoadType.CITY, lanesForward: 2, lanesReverse: 2 },
    { from: 'n9', to: 'n10', type: RoadType.CITY },
    { from: 'n10', to: 'n11', type: RoadType.CITY },
    { from: 'n11', to: 'n12', type: RoadType.CITY },
    // Vertical roads
    { from: 'n1', to: 'n5', type: RoadType.CITY },
    { from: 'n5', to: 'n9', type: RoadType.CITY },
    { from: 'n2', to: 'n6', type: RoadType.CITY, lanesForward: 2, lanesReverse: 2 },
    { from: 'n6', to: 'n10', type: RoadType.CITY, lanesForward: 2, lanesReverse: 2 },
    { from: 'n3', to: 'n7', type: RoadType.CITY, lanesForward: 2, lanesReverse: 2 },
    { from: 'n7', to: 'n11', type: RoadType.CITY, lanesForward: 2, lanesReverse: 2 },
    { from: 'n4', to: 'n8', type: RoadType.CITY },
    { from: 'n8', to: 'n12', type: RoadType.CITY },
    // Diagonal with curve
    { from: 'n1', to: 'n6', type: RoadType.CITY, curve: curveBetween(200, 200, 400, 400, 0.3) },
    { from: 'n7', to: 'n12', type: RoadType.CITY, curve: curveBetween(600, 400, 800, 600, 0.3) },
  ],
  signals: [
    { at: 'n1', cycle: 12, green: 7, offset: 0 },
    { at: 'n2', cycle: 12, green: 7, offset: 0.25 },
    { at: 'n3', cycle: 12, green: 7, offset: 0.5 },
    { at: 'n4', cycle: 12, green: 7, offset: 0.75 },
    { at: 'n5', cycle: 12, green: 7, offset: 0.1 },
    { at: 'n6', cycle: 12, green: 7, offset: 0.35 },
    { at: 'n7', cycle: 12, green: 7, offset: 0.6 },
    { at: 'n8', cycle: 12, green: 7, offset: 0.85 },
    { at: 'n9', cycle: 12, green: 7, offset: 0.2 },
    { at: 'n10', cycle: 12, green: 7, offset: 0.45 },
    { at: 'n11', cycle: 12, green: 7, offset: 0.7 },
    { at: 'n12', cycle: 12, green: 7, offset: 0.95 },
  ],
};

// Highway Network Preset
export const HIGHWAY_NETWORK_CONFIG = {
  name: 'Highway Network',
  description: 'Major highways with ramps and curved interchanges',
  nodes: {
    h1: { x: 100, y: 300 },
    h2: { x: 300, y: 200 },
    h3: { x: 500, y: 150 },
    h4: { x: 700, y: 200 },
    h5: { x: 900, y: 300 },
    h6: { x: 1000, y: 500 },
    h7: { x: 900, y: 700 },
    h8: { x: 700, y: 800 },
    h9: { x: 500, y: 850 },
    h10: { x: 300, y: 800 },
    h11: { x: 100, y: 700 },
    h12: { x: 50, y: 500 },
    i1: { x: 500, y: 500, type: NodeType.SIGNAL },
    i2: { x: 300, y: 500, type: NodeType.SIGNAL },
    i3: { x: 700, y: 500, type: NodeType.SIGNAL },
  },
  roads: [
    // Main highway loop with curves
    { from: 'h1', to: 'h2', type: RoadType.HIGHWAY, curve: curveBetween(100, 300, 300, 200, 0.3) },
    { from: 'h2', to: 'h3', type: RoadType.HIGHWAY, curve: curveBetween(300, 200, 500, 150, 0.3) },
    { from: 'h3', to: 'h4', type: RoadType.HIGHWAY, curve: curveBetween(500, 150, 700, 200, 0.3) },
    { from: 'h4', to: 'h5', type: RoadType.HIGHWAY, curve: curveBetween(700, 200, 900, 300, 0.3) },
    { from: 'h5', to: 'h6', type: RoadType.HIGHWAY, curve: curveBetween(900, 300, 1000, 500, 0.3) },
    { from: 'h6', to: 'h7', type: RoadType.HIGHWAY, curve: curveBetween(1000, 500, 900, 700, 0.3) },
    { from: 'h7', to: 'h8', type: RoadType.HIGHWAY, curve: curveBetween(900, 700, 700, 800, 0.3) },
    { from: 'h8', to: 'h9', type: RoadType.HIGHWAY, curve: curveBetween(700, 800, 500, 850, 0.3) },
    { from: 'h9', to: 'h10', type: RoadType.HIGHWAY, curve: curveBetween(500, 850, 300, 800, 0.3) },
    { from: 'h10', to: 'h11', type: RoadType.HIGHWAY, curve: curveBetween(300, 800, 100, 700, 0.3) },
    { from: 'h11', to: 'h12', type: RoadType.HIGHWAY, curve: curveBetween(100, 700, 50, 500, 0.3) },
    { from: 'h12', to: 'h1', type: RoadType.HIGHWAY, curve: curveBetween(50, 500, 100, 300, 0.3) },
    // Cross highways
    { from: 'h3', to: 'h9', type: RoadType.HIGHWAY, speed: 34 },
    { from: 'h1', to: 'h7', type: RoadType.HIGHWAY, speed: 34 },
    // Ramps
    { from: 'h2', to: 'i2', type: RoadType.RAMP, curve: curveBetween(300, 200, 300, 500, 0.4) },
    { from: 'h4', to: 'i3', type: RoadType.RAMP, curve: curveBetween(700, 200, 700, 500, 0.4) },
    { from: 'h8', to: 'i3', type: RoadType.RAMP, curve: curveBetween(700, 800, 700, 500, 0.4) },
    { from: 'h10', to: 'i2', type: RoadType.RAMP, curve: curveBetween(300, 800, 300, 500, 0.4) },
    // City streets
    { from: 'i1', to: 'i2', type: RoadType.CITY, lanesForward: 2, lanesReverse: 2 },
    { from: 'i1', to: 'i3', type: RoadType.CITY, lanesForward: 2, lanesReverse: 2 },
  ],
  signals: [
    { at: 'i1', cycle: 14, green: 8, offset: 0 },
    { at: 'i2', cycle: 14, green: 8, offset: 0.3 },
    { at: 'i3', cycle: 14, green: 8, offset: 0.6 },
  ],
};

// Curved Network Preset
export const CURVED_NETWORK_CONFIG = {
  name: 'Curved Network',
  description: 'Emphasizes curves and metro map style with flowing roads',
  nodes: {
    c1: { x: 200, y: 300, type: NodeType.SIGNAL },
    c2: { x: 400, y: 200, type: NodeType.SIGNAL },
    c3: { x: 600, y: 250, type: NodeType.SIGNAL },
    c4: { x: 800, y: 300, type: NodeType.SIGNAL },
    c5: { x: 900, y: 500, type: NodeType.SIGNAL },
    c6: { x: 800, y: 700, type: NodeType.SIGNAL },
    c7: { x: 600, y: 750, type: NodeType.SIGNAL },
    c8: { x: 400, y: 800, type: NodeType.SIGNAL },
    c9: { x: 200, y: 700, type: NodeType.SIGNAL },
    c10: { x: 100, y: 500, type: NodeType.STOP_SIGN },
  },
  roads: [
    // Curved loop
    { from: 'c1', to: 'c2', type: RoadType.CITY, curve: curveBetween(200, 300, 400, 200, 0.4) },
    { from: 'c2', to: 'c3', type: RoadType.CITY, curve: curveBetween(400, 200, 600, 250, 0.4) },
    { from: 'c3', to: 'c4', type: RoadType.CITY, curve: curveBetween(600, 250, 800, 300, 0.4) },
    { from: 'c4', to: 'c5', type: RoadType.CITY, curve: curveBetween(800, 300, 900, 500, 0.4) },
    { from: 'c5', to: 'c6', type: RoadType.CITY, curve: curveBetween(900, 500, 800, 700, 0.4) },
    { from: 'c6', to: 'c7', type: RoadType.CITY, curve: curveBetween(800, 700, 600, 750, 0.4) },
    { from: 'c7', to: 'c8', type: RoadType.CITY, curve: curveBetween(600, 750, 400, 800, 0.4) },
    { from: 'c8', to: 'c9', type: RoadType.CITY, curve: curveBetween(400, 800, 200, 700, 0.4) },
    { from: 'c9', to: 'c10', type: RoadType.CITY, curve: curveBetween(200, 700, 100, 500, 0.4) },
    { from: 'c10', to: 'c1', type: RoadType.CITY, curve: curveBetween(100, 500, 200, 300, 0.4) },
    // Cross connections with curves
    { from: 'c1', to: 'c5', type: RoadType.HIGHWAY, curve: curveBetween(200, 300, 900, 500, 0.5) },
    { from: 'c3', to: 'c7', type: RoadType.HIGHWAY, curve: curveBetween(600, 250, 600, 750, 0.3) },
    { from: 'c2', to: 'c8', type: RoadType.CITY, curve: curveBetween(400, 200, 400, 800, 0.3) },
  ],
  signals: [
    { at: 'c1', cycle: 12, green: 7, offset: 0 },
    { at: 'c2', cycle: 12, green: 7, offset: 0.2 },
    { at: 'c3', cycle: 12, green: 7, offset: 0.4 },
    { at: 'c4', cycle: 12, green: 7, offset: 0.6 },
    { at: 'c5', cycle: 12, green: 7, offset: 0.8 },
    { at: 'c6', cycle: 12, green: 7, offset: 0.1 },
    { at: 'c7', cycle: 12, green: 7, offset: 0.3 },
    { at: 'c8', cycle: 12, green: 7, offset: 0.5 },
    { at: 'c9', cycle: 12, green: 7, offset: 0.7 },
  ],
};

// Complex Intersection Preset
export const COMPLEX_INTERSECTION_CONFIG = {
  name: 'Complex Intersection',
  description: 'Multiple highway interchanges with complex curves',
  nodes: {
    center: { x: 500, y: 500, type: NodeType.SIGNAL },
    n: { x: 500, y: 200 },
    s: { x: 500, y: 800 },
    e: { x: 800, y: 500 },
    w: { x: 200, y: 500 },
    ne: { x: 700, y: 300 },
    se: { x: 700, y: 700 },
    sw: { x: 300, y: 700 },
    nw: { x: 300, y: 300 },
  },
  roads: [
    // Main highways
    { from: 'n', to: 'center', type: RoadType.HIGHWAY, speed: 36 },
    { from: 's', to: 'center', type: RoadType.HIGHWAY, speed: 36 },
    { from: 'e', to: 'center', type: RoadType.HIGHWAY, speed: 36 },
    { from: 'w', to: 'center', type: RoadType.HIGHWAY, speed: 36 },
    // Curved interchanges
    { from: 'n', to: 'ne', type: RoadType.RAMP, curve: curveBetween(500, 200, 700, 300, 0.5) },
    { from: 'ne', to: 'e', type: RoadType.RAMP, curve: curveBetween(700, 300, 800, 500, 0.5) },
    { from: 'e', to: 'se', type: RoadType.RAMP, curve: curveBetween(800, 500, 700, 700, 0.5) },
    { from: 'se', to: 's', type: RoadType.RAMP, curve: curveBetween(700, 700, 500, 800, 0.5) },
    { from: 's', to: 'sw', type: RoadType.RAMP, curve: curveBetween(500, 800, 300, 700, 0.5) },
    { from: 'sw', to: 'w', type: RoadType.RAMP, curve: curveBetween(300, 700, 200, 500, 0.5) },
    { from: 'w', to: 'nw', type: RoadType.RAMP, curve: curveBetween(200, 500, 300, 300, 0.5) },
    { from: 'nw', to: 'n', type: RoadType.RAMP, curve: curveBetween(300, 300, 500, 200, 0.5) },
    // Diagonal connections
    { from: 'ne', to: 'sw', type: RoadType.CITY, curve: curveBetween(700, 300, 300, 700, 0.4) },
    { from: 'nw', to: 'se', type: RoadType.CITY, curve: curveBetween(300, 300, 700, 700, 0.4) },
  ],
  signals: [
    { at: 'center', cycle: 16, green: 10, offset: 0 },
  ],
};

// Dense City Network - Many roads
export const DENSE_CITY_CONFIG = {
  name: 'Dense City Network',
  description: 'Dense grid network with many roads and intersections',
  nodes: (() => {
    const nodes = {};
    const gridSize = 12;
    const spacing = 80;
    const startX = 200;
    const startY = 200;
    
    // Create grid of nodes
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const name = `n${row}_${col}`;
        const x = startX + col * spacing;
        const y = startY + row * spacing;
        const type = (row % 3 === 1 && col % 3 === 1) ? NodeType.SIGNAL : NodeType.JUNCTION;
        nodes[name] = { x, y, type };
      }
    }
    
    // Add some highway nodes around the perimeter
    nodes['hw_nw'] = { x: startX - 100, y: startY - 100 };
    nodes['hw_ne'] = { x: startX + gridSize * spacing + 100, y: startY - 100 };
    nodes['hw_sw'] = { x: startX - 100, y: startY + gridSize * spacing + 100 };
    nodes['hw_se'] = { x: startX + gridSize * spacing + 100, y: startY + gridSize * spacing + 100 };
    
    return nodes;
  })(),
  roads: (() => {
    const roads = [];
    const gridSize = 12;
    
    // Create horizontal roads
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize - 1; col++) {
        const from = `n${row}_${col}`;
        const to = `n${row}_${col + 1}`;
        const lanes = (row % 2 === 0 && col % 2 === 0) ? { lanesForward: 2, lanesReverse: 2 } : {};
        roads.push({ from, to, type: RoadType.CITY, ...lanes });
      }
    }
    
    // Create vertical roads
    for (let col = 0; col < gridSize; col++) {
      for (let row = 0; row < gridSize - 1; row++) {
        const from = `n${row}_${col}`;
        const to = `n${row + 1}_${col}`;
        const lanes = (row % 2 === 0 && col % 2 === 0) ? { lanesForward: 2, lanesReverse: 2 } : {};
        roads.push({ from, to, type: RoadType.CITY, ...lanes });
      }
    }
    
    // Add diagonal connections for variety
    for (let row = 0; row < gridSize - 1; row++) {
      for (let col = 0; col < gridSize - 1; col++) {
        if ((row + col) % 3 === 0) {
          roads.push({
            from: `n${row}_${col}`,
            to: `n${row + 1}_${col + 1}`,
            type: RoadType.CITY,
            curve: curveBetween(
              200 + col * 80, 200 + row * 80,
              200 + (col + 1) * 80, 200 + (row + 1) * 80,
              0.3
            )
          });
        }
      }
    }
    
    // Add perimeter highways
    roads.push({ from: 'hw_nw', to: 'n0_0', type: RoadType.HIGHWAY });
    roads.push({ from: 'hw_ne', to: `n0_${gridSize - 1}`, type: RoadType.HIGHWAY });
    roads.push({ from: 'hw_sw', to: `n${gridSize - 1}_0`, type: RoadType.HIGHWAY });
    roads.push({ from: 'hw_se', to: `n${gridSize - 1}_${gridSize - 1}`, type: RoadType.HIGHWAY });
    roads.push({ from: 'hw_nw', to: 'hw_ne', type: RoadType.HIGHWAY, curve: curveBetween(100, 100, 1100, 100, 0.2) });
    roads.push({ from: 'hw_ne', to: 'hw_se', type: RoadType.HIGHWAY, curve: curveBetween(1100, 100, 1100, 1100, 0.2) });
    roads.push({ from: 'hw_se', to: 'hw_sw', type: RoadType.HIGHWAY, curve: curveBetween(1100, 1100, 100, 1100, 0.2) });
    roads.push({ from: 'hw_sw', to: 'hw_nw', type: RoadType.HIGHWAY, curve: curveBetween(100, 1100, 100, 100, 0.2) });
    
    return roads;
  })(),
  signals: (() => {
    const signals = [];
    const gridSize = 12;
    let offset = 0;
    for (let row = 1; row < gridSize; row += 3) {
      for (let col = 1; col < gridSize; col += 3) {
        signals.push({
          at: `n${row}_${col}`,
          cycle: 12,
          green: 7,
          offset: (offset % 10) / 10
        });
        offset++;
      }
    }
    return signals;
  })(),
};

// Export all presets
export const PRESETS = [
  DEFAULT_ROAD_CONFIG,
  SIMPLE_GRID_CONFIG,
  HIGHWAY_NETWORK_CONFIG,
  CURVED_NETWORK_CONFIG,
  COMPLEX_INTERSECTION_CONFIG,
  DENSE_CITY_CONFIG,
];

export function getPresetByName(name) {
  return PRESETS.find(p => p.name === name) || DEFAULT_ROAD_CONFIG;
}
