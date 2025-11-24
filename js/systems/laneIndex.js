import { Car } from '../components.js';

export function laneIndexSystem(world) {
  if (!world.lanes) return;
  for (const lane of world.lanes) {
    world.laneCars.set(lane, []);
  }

  let carCount = 0;
  for (let e = 1; e < world.nextEntityId; e++) {
    if (!Car.has[e]) continue;
    carCount++;
    const lane = Car.lane[e];
    const list = world.laneCars.get(lane);
    if (list) list.push(e);
  }

  for (const [lane, list] of world.laneCars.entries()) {
    list.sort((a, b) => Car.offset[a] - Car.offset[b]);
  }
  world.stats.cars = carCount;
}
