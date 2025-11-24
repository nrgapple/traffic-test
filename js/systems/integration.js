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
  if (Car.offset[carId] <= length) return;
  const overflow = Car.offset[carId] - length;
  const nextNode = Lane.direction[lane] === LaneDirection.FORWARD
    ? RoadSegment.endNode[segment]
    : RoadSegment.startNode[segment];
  const options = world.routes.get(nextNode) || world.lanes;
  const nextLane = options[Math.floor(Math.random() * options.length)];
  Car.lane[carId] = nextLane;
  Car.offset[carId] = overflow;
}
