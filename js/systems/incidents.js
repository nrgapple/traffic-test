import { createEntity } from '../ecs.js';
import { Incident, Lane, RoadSegment } from '../components.js';
import { IncidentKind, PARAMS } from '../constants.js';

export function incidentSystem(world, dt) {
  let active = 0;
  for (let e = 1; e < world.nextEntityId; e++) {
    if (!Incident.has[e] || !Incident.active[e]) continue;
    Incident.remainingTime[e] -= dt;
    if (Incident.remainingTime[e] <= 0) {
      Incident.active[e] = 0;
    } else {
      active++;
    }
  }

  if (Math.random() < dt * PARAMS.incidentRate * 0.5) {
    spawnIncident(world);
  }
  world.stats.incidents = active;
}

function spawnIncident(world) {
  if (!world.lanes || world.lanes.length === 0) return;
  const lane = world.lanes[Math.floor(Math.random() * world.lanes.length)];
  const id = createEntity(world);
  Incident.has[id] = 1;
  Incident.lane[id] = lane;
  Incident.offset[id] = Math.random() * (RoadSegment.length[Lane.segment[lane]] * 0.85);
  Incident.severity[id] = 0.4 + Math.random() * 0.6;
  Incident.kind[id] = randomIncidentKind();
  Incident.remainingTime[id] = 6 + Math.random() * 10;
  Incident.active[id] = 1;
}

function randomIncidentKind() {
  const roll = Math.random();
  if (roll > 0.7) return IncidentKind.CRASH;
  if (roll > 0.4) return IncidentKind.POLICE_STOP;
  return IncidentKind.BREAKDOWN;
}
