import { MAX_ENTITIES } from './constants.js';

export function createWorld() {
  return {
    nextEntityId: 1,
    alive: new Uint8Array(MAX_ENTITIES),
    systems: [],
    laneCars: new Map(),
    stats: {
      fps: 0,
      cars: 0,
      incidents: 0,
    },
  };
}

export function addSystem(world, system) {
  world.systems.push(system);
}

export function createEntity(world) {
  if (world.nextEntityId >= MAX_ENTITIES) {
    return 0;
  }
  const id = world.nextEntityId++;
  world.alive[id] = 1;
  return id;
}

export function destroyEntity(world, id, components) {
  if (!world.alive[id]) return;
  world.alive[id] = 0;
  components.forEach((comp) => {
    if (comp.has[id]) comp.has[id] = 0;
  });
}

export function stepWorld(world, dt) {
  for (const system of world.systems) {
    system(world, dt);
  }
}
