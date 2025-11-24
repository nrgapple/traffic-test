import { Car, Lane, RoadSegment } from '../components.js';
import { LaneDirection } from '../constants.js';

export function integrationSystem(world, dt) {
  for (let e = 1; e < world.nextEntityId; e++) {
    if (!Car.has[e]) continue;
    Car.offset[e] += Car.speed[e] * dt;
    wrapIfNeeded(world, e);
  }
}

function wrapIfNeeded(world, carId) {
  const lane = Car.lane[carId];
  const segment = Lane.segment[lane];
  const length = RoadSegment.length[segment];
  if (Car.offset[carId] < length) return; // Fixed: should be < not <=
  
  const overflow = Car.offset[carId] - length;
  const nextNode = Lane.direction[lane] === LaneDirection.FORWARD
    ? RoadSegment.endNode[segment]
    : RoadSegment.startNode[segment];
  
  // Only get valid routes from this node (forward progress only)
  const options = world.routes.get(nextNode);
  if (!options || options.length === 0) {
    // If no valid route, wrap to start of current lane (loop back)
    Car.offset[carId] = overflow;
    return;
  }
  
  // Pick a random valid route (all routes from a node are forward progress)
  const nextLane = options[Math.floor(Math.random() * options.length)];
  Car.lane[carId] = nextLane;
  Car.offset[carId] = overflow;
}
